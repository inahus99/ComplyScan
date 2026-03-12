const puppeteer = require("puppeteer");
const { URL } = require("url");

const MS_PER_DAY = 24 * 3600 * 1000;

function pct(n, d) {
  return Math.round((n / Math.max(d, 1)) * 100);
}

// Feature 6: Tracker Categorization
const TRACKER_CATEGORIES = {
  "google-analytics.com": { name: "Google Analytics", category: "Analytics" },
  "googletagmanager.com": { name: "Google Tag Manager", category: "Essential" },
  "googleadservices.com": { name: "Google Ads", category: "Advertising" },
  "doubleclick.net": { name: "Google DoubleClick", category: "Advertising" },
  "facebook.net": { name: "Facebook Pixel", category: "Advertising" },
  "facebook.com": { name: "Facebook Plugin", category: "Social" },
  "connect.facebook.net": { name: "Facebook Connect", category: "Social" },
  "twitter.com": { name: "Twitter Plugin", category: "Social" },
  "t.co": { name: "Twitter Ads", category: "Advertising" },
  "linkedin.com": { name: "LinkedIn Insight", category: "Advertising" },
  "hotjar.com": { name: "Hotjar", category: "Analytics" },
  "segment.com": { name: "Segment", category: "Analytics" },
  "amplitude.com": { name: "Amplitude", category: "Analytics" },
  "mixpanel.com": { name: "Mixpanel", category: "Analytics" },
  "stripe.com": { name: "Stripe", category: "Essential" },
  "paypal.com": { name: "PayPal", category: "Essential" },
  "cloudflare.com": { name: "Cloudflare", category: "Essential" },
  "fonts.googleapis.com": { name: "Google Fonts", category: "Essential" },
  "youtube.com": { name: "YouTube Embedded", category: "Media" },
  "vimeo.com": { name: "Vimeo Embedded", category: "Media" },
  "sentry.io": { name: "Sentry", category: "Analytics" },
  "intercom.io": { name: "Intercom", category: "Essential" },
  "drift.com": { name: "Drift", category: "Marketing" },
  "hubspot.com": { name: "HubSpot", category: "Marketing" },
  "marketo.com": { name: "Marketo", category: "Marketing" },
  "tiktok.com": { name: "TikTok Pixel", category: "Advertising" },
  "snapchat.com": { name: "Snapchat Pixel", category: "Advertising" },
  "pinterest.com": { name: "Pinterest Tag", category: "Advertising" },
  "criteo.com": { name: "Criteo", category: "Advertising" },
  "clarity.ms": { name: "Microsoft Clarity", category: "Analytics" },
  "bing.com": { name: "Bing Ads", category: "Advertising" },
};

function categorizeDomain(hostname) {
  const parts = hostname.toLowerCase().split('.');
  
  // Try exact match first
  if (TRACKER_CATEGORIES[hostname]) return { url: hostname, ...TRACKER_CATEGORIES[hostname] };
  
  // Try matching root domains
  if (parts.length > 2) {
    const root1 = parts.slice(-2).join('.');
    if (TRACKER_CATEGORIES[root1]) return { url: hostname, ...TRACKER_CATEGORIES[root1] };
    const root2 = parts.slice(-3).join('.');
    if (TRACKER_CATEGORIES[root2]) return { url: hostname, ...TRACKER_CATEGORIES[root2] };
  }
  
  return { url: hostname, name: hostname, category: "Unknown" };
}

function guessPurpose(name, domain) {
  const n = (name || "").toLowerCase();
  const d = (domain || "").toLowerCase();
  const rules = [
    { rx: /^_ga(_.*)?$|^_gid$|^_gat$/, purpose: "Analytics (Google Analytics)" },
    { rx: /^_gcl_au$/,                 purpose: "Ads/Attribution (Google Ads)" },
    { rx: /^_fbp$|^fr$/,               purpose: "Ads/Retargeting (Facebook)" },
    { rx: /^ajs_/,                     purpose: "Analytics (Segment)" },
    { rx: /^amplitude_/,               purpose: "Analytics (Amplitude)" },
    { rx: /^mp_.*_mixpanel$|^mixpanel$/, purpose: "Analytics (Mixpanel)" },
    { rx: /^_hj/,                      purpose: "Analytics (Hotjar)" },
    { rx: /^_clck$|^_clsk$/,           purpose: "Analytics (Microsoft Clarity)" },
    { rx: /^cid$|^scid$/,              purpose: "Analytics/Attribution" },
    { rx: /^session$|^sid$|^ssid$|^sessionid$|^connect\.sid$/, purpose: "Session / Auth" },
    { rx: /^__stripe/,                 purpose: "Payments (Stripe)" },
    { rx: /^twid$|^guest_id$|^ct0$/,   purpose: "Platform (Twitter/X)" },
  ];
  for (const r of rules) if (r.rx.test(n)) return r.purpose;
  if (d.includes("doubleclick.net")) return "Ads (DoubleClick)";
  if (d.includes("google"))          return "Google Services";
  if (d.includes("facebook"))        return "Facebook Services";
  if (d.includes("twitter") || d.includes("t.co")) return "Twitter Services";
  return "Unclassified / Unknown";
}

function toCookieRow(c, originHost) {
  const now = Date.now();
  const expiresAt = c.expires ? c.expires * 1000 : null;
  const lifetimeDays = expiresAt ? Math.max(0, Math.round((expiresAt - now) / MS_PER_DAY)) : null;
  const firstParty = !c.domain || c.domain.replace(/^\./, "") === originHost;
  return {
    name: c.name,
    domain: c.domain || originHost,
    path: c.path || "/",
    sameSite: c.sameSite || "unspecified",
    secure: !!c.secure,
    httpOnly: !!c.httpOnly,
    firstParty,
    purpose: guessPurpose(c.name, c.domain),
    expiresAt,
    lifetimeDays
  };
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
    executablePath,           
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
    timeout: navigationTimeoutMs
  });

  socket.emit("scan_started", { url });

  /* -------------------------------------------------------------------- */
  const originHost = new URL(url).host;
  const visited = new Set();
  const queue   = [url];
  
  let privacyPolicyUrl = null;
  let privacyPolicyText = "";

  const result  = {
    site: url,
    scannedPages: [],
    thirdPartyRequests: new Set(),
    categorizedTrackers: [], // Feature 6
    cookies: [],
    cookieReport: [],   
    consentBannerDetected: false,
    privacyPolicyFound: false,
    policyRealityCheck: { passed: false, unmentionedTrackers: [] }, // Feature 2
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

      // Track third-party hosts during navigation
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

      // Consent banner present
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

      // Privacy policy link search & extraction
      if (!result.privacyPolicyFound) {
        const policyData = await page.evaluate(() => {
          const linkTextRx = /privacy|data\s+protection|gdpr/i;
          const links = Array.from(document.querySelectorAll("a"));
          const policyLink = links.find(a => linkTextRx.test(a.textContent) || (a.href && a.href.includes("privacy")));
          
          if (policyLink) {
            return {
              found: true,
              href: policyLink.href
            };
          }
          return { found: false, href: null };
        });

        if (policyData.found) {
          result.privacyPolicyFound = true;
          privacyPolicyUrl = policyData.href;
          
          // Scrape the text from the privacy policy if we haven't already
          if (privacyPolicyUrl && privacyPolicyUrl !== target && !visited.has(privacyPolicyUrl)) {
             try {
                // Peek at the policy
                const policyPage = await browser.newPage();
                await policyPage.goto(privacyPolicyUrl, { waitUntil: "networkidle2", timeout: 15000 });
                privacyPolicyText = await policyPage.evaluate(() => document.body.innerText.toLowerCase());
                await policyPage.close();
                visited.add(privacyPolicyUrl); // Avoid re-scanning
             } catch(e) {
                console.error("Failed to scrape privacy policy:", e);
             }
          } else if (privacyPolicyUrl === target) {
             privacyPolicyText = await page.evaluate(() => document.body.innerText.toLowerCase());
          }
        }
      }

      // --- All cookies (whole browser session) ---
      const cdp = await page.target().createCDPSession();
      await cdp.send("Network.enable");
      const { cookies: allCookies } = await cdp.send("Network.getAllCookies");

 
      allCookies.forEach(c => result.cookies.push(c));

      // normalized rows for the UI table
      const rows = allCookies.map(c => toCookieRow(c, originHost));
      result.cookieReport.push(...rows);

      // Store third-party hosts
      pageThirdParty.forEach(h => result.thirdPartyRequests.add(h));
      socket.emit("page_done", {
        page: target,
        cookiesFound: allCookies.length,
        thirdPartiesFound: pageThirdParty.size
      });

      /* ---------- Discover same-origin links ---------- */
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

    /* ----------  Scoring & Categorization ---------- */
    const thirdPartyArr = Array.from(result.thirdPartyRequests);
    
    // Feature 6: Map to structured categories
    result.categorizedTrackers = thirdPartyArr.map(categorizeDomain);

    const cookieSet = new Set(result.cookies.map(c => c.name.toLowerCase()));
    const analyticsCookies = [
      "_ga","_gid","_gat","_gcl_au","_fbp","cid",
      "amplitude_id","mixpanel","ajs_anonymous_id"
    ];
    const hasAnalytics = analyticsCookies.some(n => cookieSet.has(n));

    // Feature 2: Privacy Policy Reality Check
    if (result.privacyPolicyFound && privacyPolicyText.length > 0) {
       result.policyRealityCheck.passed = true;
       // Filter non-essential trackers
       const trackingServices = result.categorizedTrackers.filter(t => t.category === "Analytics" || t.category === "Advertising");
       
       for (const tracker of trackingServices) {
          // Check if the service name (e.g. "Google Analytics" or "Facebook") is in the policy text
          const searchNames = [];
          
          if (tracker.name !== tracker.url) {
             searchNames.push(tracker.name.toLowerCase());
             // Extract base company (e.g. "Google Analytics" -> "Google")
             const baseName = tracker.name.split(" ")[0].toLowerCase();
             if (baseName.length > 3) searchNames.push(baseName);
          } else {
             // fallback to base domain name (e.g. mixpanel.com -> mixpanel)
             const baseDomain = tracker.url.split('.')[0].toLowerCase();
             if (baseDomain.length > 3) searchNames.push(baseDomain);
          }

          const isMentioned = searchNames.some(sn => privacyPolicyText.includes(sn));
          
          if (!isMentioned) {
             result.policyRealityCheck.unmentionedTrackers.push(tracker.name);
             result.policyRealityCheck.passed = false;
          }
       }
    }

    if (!result.consentBannerDetected && (thirdPartyArr.length || hasAnalytics)) {
      result.violations.push("No visible consent banner despite third-party activity.");
      result.tips.push("Show a cookie/consent banner before loading analytics or ads. (E.g. Use an open-source CMP snippet)");
      result.score -= 30;
    }
    if (!result.privacyPolicyFound) {
      result.violations.push("No privacy policy link detected.");
      result.tips.push("Add a clearly visible Privacy Policy link.");
      result.score -= 20;
    } else if (!result.policyRealityCheck.passed) {
      const misses = result.policyRealityCheck.unmentionedTrackers.join(", ");
      result.violations.push(`Privacy Policy exists but omits active trackers: ${misses}.`);
      result.tips.push("Update your Privacy Policy to disclose all third-party services.");
      result.score -= 15;
    }

    const longLived = result.cookieReport.filter(r => (r.lifetimeDays ?? 0) > 365);
    if (longLived.length) {
      result.violations.push(`Found ${longLived.length} cookie(s) lasting > 1 year.`);
      result.tips.push("Shorten lifetimes of non-essential cookies.");
      result.score -= 10;
    }
    
    if (result.score < 0) result.score = 0;

    result.thirdPartyRequests = thirdPartyArr; // Kept for backwards compatibility

    socket.emit('scan_result', result);
    socket.emit('scan_complete', result);

  } catch (err) {
    socket.emit('scan_error', { message: err.message });
    throw err;
  } finally {
    try { await browser.close(); } catch {}
    socket.emit('scan_done');
  }
}

module.exports = { scanSite };
