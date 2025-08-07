const puppeteer = require("puppeteer");
const { URL } = require("url");

function pct(n, d) {
  return Math.round((n / Math.max(d, 1)) * 100);
}

async function scanSite({ url, socket, options = {} }) {
  const {
    maxPages = 4,
    navigationTimeoutMs = 30000
  } = options;

  const fs = require("fs");
  const tryPaths = [
    process.env.PUPPETEER_EXECUTABLE_PATH,
    process.env.CHROME_PATH,
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
    "/usr/bin/google-chrome"
  ].filter(Boolean);
  const executablePath = tryPaths.find(p => fs.existsSync(p));

  const browser = await puppeteer.launch({
    headless: true,
    executablePath,           // undefined → Puppeteer default
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    timeout: navigationTimeoutMs
  });

  socket.emit("scan_started", { url });

  /* -------------------------------------------------------------------- */
  const originHost = new URL(url).host;
  const visited = new Set();
  const queue   = [url];
  const result  = {
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

  try {
    let pageCount = 0;

    while (queue.length && pageCount < maxPages) {
      const target = queue.shift();
      if (visited.has(target)) continue;
      visited.add(target);
      pageCount++;

      socket.emit("progress", {
        step: "navigating",
        page: target,
        progress: pct(pageCount, maxPages)
      });

      const page = await browser.newPage();
      page.setDefaultNavigationTimeout(navigationTimeoutMs);

      // Track third‑party hosts during navigation
      const pageThirdParty = new Set();
      page.on("request", req => {
        try {
          const h = new URL(req.url()).host;
          if (h !== originHost) pageThirdParty.add(h);
        } catch {}
      });

      /* ---------- Go to the URL ---------- */
      try {
        await page.goto(target, { waitUntil: "networkidle2" });
      } catch (e) {
        socket.emit("warning", { page: target, message: e.message });
        await page.close();
        continue;
      }

      /* ---------- Heuristics ---------- */
      // Consent banner present?
      const bannerInfo = await page.evaluate(() => {
        const nodes = Array.from(
          document.querySelectorAll("[id*='cookie'],[class*='cookie'],[id*='consent'],[class*='consent']")
        );
        let any = false, visible = false;
        for (const el of nodes) {
          any = true;
          const s = window.getComputedStyle(el);
          const r = el.getBoundingClientRect();
          if (s.display !== 'none' && s.visibility !== 'hidden' && r.width && r.height) {
            visible = true;
            break;
          }
        }
        return { any, visible };
      });
      if (bannerInfo.any) {
        socket.emit("banner_detected", { page: target, visible: bannerInfo.visible });
        if (bannerInfo.visible) result.consentBannerDetected = true;
      }

      // Privacy policy link?
      const privacyFound = await page.evaluate(() => {
        const linkTextRx = /privacy|data\s+protection|gdpr/i;
        const links = Array.from(document.querySelectorAll("a"));
        return links.some(a => linkTextRx.test(a.textContent)) || !!document.querySelector("a[href*='privacy']");
      });
      if (privacyFound) result.privacyPolicyFound = true;

      // Cookies set so far
      const cookies = await page.cookies();
      cookies.forEach(c => result.cookies.push(c));

      // Store third‑party hosts
      pageThirdParty.forEach(h => result.thirdPartyRequests.add(h));
      socket.emit("page_done", {
        page: target,
        cookiesFound: cookies.length,
        thirdPartiesFound: pageThirdParty.size
      });

      /* ---------- Discover same‑origin links ---------- */
      if (pageCount < maxPages) {
        try {
          const links = await page.evaluate(origin => {
            return Array.from(new Set(
              Array.from(document.querySelectorAll("a[href]"))
                .map(a => {
                  try {
                    const u = new URL(a.href, location.href);
                    u.hash = "";
                    return (u.host === origin && (u.protocol === 'http:' || u.protocol === 'https:'))
                      ? u.toString()
                      : null;
                  } catch { return null; }
                })
                .filter(Boolean)
            )).slice(0, 30);
          }, originHost);
          links.forEach(l => {
            if (!visited.has(l) && queue.length < maxPages) queue.push(l);
          });
        } catch {}
      }

      result.scannedPages.push(target);
      await page.close();
      socket.emit("progress", {
        step: "scanned",
        page: target,
        progress: pct(pageCount, maxPages)
      });
    }

    /* ---------- Final scoring ---------- */
    const thirdPartyArr = Array.from(result.thirdPartyRequests);
    const cookieSet = new Set(result.cookies.map(c => c.name.toLowerCase()));
    const analyticsCookies = [
      "_ga","_gid","_gat","_gcl_au","_fbp","cid",
      "amplitude_id","mixpanel","ajs_anonymous_id"
    ];
    const hasAnalytics = analyticsCookies.some(n => cookieSet.has(n));

    if (!result.consentBannerDetected && (thirdPartyArr.length || hasAnalytics)) {
      result.violations.push("No visible consent banner despite third‑party activity.");
      result.tips.push("Show a cookie/consent banner before loading analytics or ads.");
      result.score -= 30;
    }
    if (!result.privacyPolicyFound) {
      result.violations.push("No privacy policy link detected.");
      result.tips.push("Add a clearly visible Privacy Policy link.");
      result.score -= 20;
    }

    const longLived = result.cookies.filter(c => c.expires && (c.expires*1000 - Date.now()) > 365*24*3600*1000);
    if (longLived.length) {
      result.violations.push(`Found ${longLived.length} cookie(s) lasting > 1 year.`);
      result.tips.push("Shorten lifetimes of non‑essential cookies.");
      result.score -= 10;
    }
    if (result.score < 0) result.score = 0;

    result.thirdPartyRequests = thirdPartyArr;
    socket.emit('scan_complete', result);

  } catch (err) {
    // Surface any fatal error to the client
    socket.emit('scan_error', { message: err.message });
    throw err;
  } finally {
    await browser.close().catch(() => {});
  }
}

module.exports = { scanSite };
