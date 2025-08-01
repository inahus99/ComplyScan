const puppeteer = require("puppeteer");
const { URL } = require("url");

function pct(n, d) { return Math.round((n / Math.max(d, 1)) * 100); }

async function scanSite({ url, socket, options }) {
  const {
    maxPages = 4,
    navigationTimeoutMs = 30000
  } = options;

  socket.emit("scan_started", { url });

  const originHost = new URL(url).host;
  const visited = new Set();
  const queue = [url];

  const result = {
    site: url,
    scannedPages: [],
    thirdPartyRequests: new Set(),
    cookies: [],
    consentBannerDetected: false,
    privacyPolicyFound: false,
    violations: [],
    score: 100,
    tips: []
  };

  const launchOpts = {
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  };
  if (process.env.PUPPETEER_EXECUTABLE_PATH) {
    launchOpts.executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;
  }

  const browser = await puppeteer.launch(launchOpts);

  try {
    let pageCount = 0;

    while (queue.length && pageCount < maxPages) {
      const target = queue.shift();
      if (visited.has(target)) continue;
      visited.add(target);
      pageCount++;

      socket.emit("progress", { step: "navigating", page: target, progress: pct(pageCount, maxPages) });

      const page = await browser.newPage();
      await page.setDefaultNavigationTimeout(navigationTimeoutMs);

      // Track network requests to find third-party domains
      const pageThirdParty = new Set();
      page.on("request", (req) => {
        try {
          const reqURL = new URL(req.url());
          if (reqURL.host !== originHost) pageThirdParty.add(reqURL.host);
        } catch { /* ignore */ }
      });

      // Navigate
      try {
        await page.goto(target, { waitUntil: "networkidle2" });
      } catch (e) {
        socket.emit("warning", { page: target, message: `Navigation failed: ${e.message}` });
        await page.close();
        continue;
      }

      // Consent banner detection 
      const bannerInfo = await page.evaluate(() => {
        const candidates = Array.from(document.querySelectorAll("[id*='cookie'],[class*='cookie'],[id*='consent'],[class*='consent']"));
        let visible = false;
        let any = false;
        for (const el of candidates) {
          any = true;
          const style = window.getComputedStyle(el);
          const rect = el.getBoundingClientRect();
          const isVisible = style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
          if (isVisible) { visible = true; break; }
        }
        return { any, visible };
      });

      if (bannerInfo.any) {
        socket.emit("banner_detected", { page: target, visible: bannerInfo.visible });
        if (bannerInfo.visible) result.consentBannerDetected = true;
      }

      // Find privacy policy link 
      const privacyFound = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll("a"));
        const textMatch = (t) => /privacy|data\s+protection|gdpr/i.test(t || "");
        return links.some(a => textMatch(a.textContent)) || !!document.querySelector("a[href*='privacy']");
      });
      if (privacyFound) result.privacyPolicyFound = true;

      // Gather cookies set after initial load
      const pageCookies = await page.cookies();
      pageCookies.forEach(c => result.cookies.push({ name: c.name, domain: c.domain, expires: c.expires, httpOnly: c.httpOnly, secure: c.secure, sameSite: c.sameSite }));

      // Collect third-parties
      pageThirdParty.forEach(h => result.thirdPartyRequests.add(h));
      socket.emit("page_done", {
        page: target,
        cookiesFound: pageCookies.length,
        thirdPartiesFound: pageThirdParty.size
      });

      // Collect internal links for shallow crawl
      if (pageCount < maxPages) {
        try {
          const newLinks = await page.evaluate((originHost) => {
            const anchors = Array.from(document.querySelectorAll("a[href]"));
            const out = [];
            for (const a of anchors) {
              try {
                const u = new URL(a.href, location.href);
                if (u.host === originHost && (u.protocol === "http:" || u.protocol === "https:")) {
                  //  path/query only
                  u.hash = "";
                  out.push(u.toString());
                }
              } catch {}
            }
            return Array.from(new Set(out)).slice(0, 30); // cap per page
          }, originHost);

          for (const l of newLinks) {
            if (!visited.has(l) && queue.length < maxPages) queue.push(l);
          }
        } catch {}
      }

      result.scannedPages.push(target);
      await page.close();
      socket.emit("progress", { step: "scanned", page: target, progress: pct(pageCount, maxPages) });
    }

    // Heuristic violations
    const thirdParties = Array.from(result.thirdPartyRequests);
    const cookieNames = new Set(result.cookies.map(c => c.name.toLowerCase()));

    // Known analytics/ad cookies 
    const analyticsCookies = ["_ga", "_gid", "_gat", "_gcl_au", "_fbp", "cid", "amplitude_id", "mixpanel", "ajs_anonymous_id"];
    const hasAnalyticsCookie = analyticsCookies.some(name => cookieNames.has(name.toLowerCase()));

    if (!result.consentBannerDetected && (thirdParties.length > 0 || hasAnalyticsCookie)) {
      result.violations.push("No visible cookie/consent banner, yet third-party/analytics activity detected.");
      result.tips.push("Show a consent banner before setting non-essential cookies or loading analytics.");
      result.score -= 30;
    }

    if (!result.privacyPolicyFound) {
      result.violations.push("No privacy policy link detected.");
      result.tips.push("Add a clearly visible Privacy Policy link in the footer/header.");
      result.score -= 20;
    }

    // Cookies with long expiry (> 365 days)
    const longLived = result.cookies.filter(c => c.expires && c.expires > 0 && (c.expires * 1000 - Date.now()) > 365 * 24 * 3600 * 1000);
    if (longLived.length > 0) {
      result.violations.push(`Found ${longLived.length} long-lived cookies ( > 1 year ).`);
      result.tips.push("Reduce cookie lifetimes for non-essential cookies.");
      result.score -= 10;
    }

    if (result.score < 0) result.score = 0;

    // Convert sets to arrays for JSON
    result.thirdPartyRequests = Array.from(result.thirdPartyRequests);

    socket.emit("scan_complete", result);
  } finally {
    await browser.close();
  }
}

module.exports = { scanSite };
