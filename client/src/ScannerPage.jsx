import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { socket, on } from "./lib/socket.js";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  Container, Text, Button, Group, Stack,
  Box, Alert, Modal, Code, Table,
} from "@mantine/core";
import {
  Download, AlertCircle, Check,
  ChevronUp, ChevronDown, ChevronsUpDown, Save, Code2,
  ShieldCheck, Globe, ShieldX, Eye,
  Cookie, Network, ExternalLink, AlertTriangle, CheckCircle2,
  Info, FileText, Activity, Lock,
  ClipboardCheck,
} from "lucide-react";
import LandingNav from "./components/LandingNav";
import { saveToArchive } from "./ArchivePage";

const serif = "'Instrument Serif', Georgia, serif";

/* ─── Semantic palette ───────────────────────────────────────────────────── */
const C = {
  red:    "#dc2626",
  redBg:  "#fef2f2",
  redBdr: "#fecaca",
  green:  "#16a34a",
  greenBg:"#f0fdf4",
  greenBdr:"#bbf7d0",
  amber:  "#d97706",
  amberBg:"#fffbeb",
  amberBdr:"#fde68a",
  purple: "#7c3aed",
  purpleBg:"#f5f3ff",
  purpleBdr:"#ddd6fe",
};

const CATEGORY_COLORS = {
  Analytics:   { badge: "#2563eb", light: "#eff6ff", border: "#bfdbfe" },
  Advertising: { badge: "#ea580c", light: "#fff7ed", border: "#fed7aa" },
  Marketing:   { badge: "#db2777", light: "#fdf2f8", border: "#fbcfe8" },
  Social:      { badge: "#7c3aed", light: "#f5f3ff", border: "#ddd6fe" },
  Essential:   { badge: "#16a34a", light: "#f0fdf4", border: "#bbf7d0" },
  Media:       { badge: "#0891b2", light: "#ecfeff", border: "#a5f3fc" },
};
const UNKNOWN_CAT = { badge: "#6b7280", light: "#f9fafb", border: "#e5e7eb" };
const getCat = (cat) => CATEGORY_COLORS[cat] ?? UNKNOWN_CAT;

/* ─── Log line ───────────────────────────────────────────────────────────── */
const TAG_COLORS = {
  INIT: { bg: "rgba(37,99,235,0.07)", color: "#2563eb" },
  GET:  { bg: "rgba(0,0,0,0.04)",     color: "rgba(0,0,0,0.45)" },
  WARN: { bg: "rgba(217,119,6,0.08)", color: "#d97706" },
  AUTH: { bg: "rgba(124,58,237,0.08)",color: "#7c3aed" },
  SCAN: { bg: "rgba(22,163,74,0.07)", color: "#16a34a" },
  INFO: { bg: "rgba(0,0,0,0.04)",     color: "rgba(0,0,0,0.45)" },
  ERR:  { bg: "rgba(220,38,38,0.08)", color: "#dc2626" },
};

function LogLine({ line }) {
  const timeMatch = line.match(/^\[(\d{1,2}:\d{2}:\d{2}(?:\s[AP]M)?)\]\s+(.*)$/i);
  const time = timeMatch ? timeMatch[1] : null;
  const msg  = timeMatch ? timeMatch[2] : line;
  const tagMatch = msg.match(/^\[([A-Z]+)\]\s+(.*)/);
  const tag = tagMatch ? tagMatch[1] : null;
  const content = tagMatch ? tagMatch[2] : msg;
  const tagStyle = tag ? (TAG_COLORS[tag] || TAG_COLORS.INFO) : null;

  return (
    <Box style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "4px 0", borderBottom: "1px solid rgba(0,0,0,0.04)" }}>
      {time && (
        <Text style={{ fontSize: 10, color: "rgba(0,0,0,0.28)", fontFamily: "monospace", flexShrink: 0, paddingTop: 1, minWidth: 68 }}>
          {time}
        </Text>
      )}
      {tag && tagStyle && (
        <Box style={{ background: tagStyle.bg, padding: "1px 6px", flexShrink: 0, marginTop: 1, borderRadius: 2 }}>
          <Text style={{ fontSize: 9, fontWeight: 700, color: tagStyle.color, letterSpacing: "0.08em", fontFamily: "monospace" }}>
            {tag}
          </Text>
        </Box>
      )}
      <Text style={{ fontSize: 11, color: "rgba(0,0,0,0.6)", fontFamily: "monospace", lineHeight: 1.6, wordBreak: "break-all" }}>
        {content}
      </Text>
    </Box>
  );
}

/* ─── Pre-scan placeholder ───────────────────────────────────────────────── */
function CompliancePlaceholder({ running }) {
  const checks = [
    { icon: Lock,     label: "Network Security Protocols" },
    { icon: Globe,    label: "Regulatory Alignment (GDPR / CCPA)" },
    { icon: Activity, label: "Data Encryption Standards" },
  ];
  return (
    <Box style={{ border: "1px solid var(--cs-border-med)", background: "var(--cs-bg-card)", height: "100%" }}>
      <Box style={{ padding: "28px 32px", borderBottom: "1px solid var(--cs-border)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Stack gap={6}>
          <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cs-fg-dim)" }}>
            Compliance Report
          </Text>
          <Text style={{ fontSize: 12, color: "var(--cs-fg-dim)", maxWidth: 260, lineHeight: 1.6 }}>
            {running ? "Scanning in progress…" : "Enter a URL above to begin the audit."}
          </Text>
        </Stack>
        <Text style={{ fontFamily: serif, fontStyle: "italic", fontSize: 80, fontWeight: 400, color: "rgba(0,0,0,0.05)", lineHeight: 1, letterSpacing: "-0.03em", userSelect: "none" }}>
          —
        </Text>
      </Box>
      <Box style={{ padding: "8px 0" }}>
        {checks.map(({ icon: Icon, label }) => (
          <Box key={label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 32px", borderBottom: "1px solid var(--cs-border)" }}>
            <Box style={{ width: 30, height: 30, border: "1px solid var(--cs-border-med)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Icon size={13} color="var(--cs-fg-dim)" strokeWidth={1.5} />
            </Box>
            <Text style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--cs-fg-dim)" }}>
              {label}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN SCANNER PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function ScannerPage() {
  const [url, setUrl]               = useState("");
  const [running, setRunning]       = useState(false);
  const [progress, setProgress]     = useState(0);
  const [logs, setLogs]             = useState([]);
  const [result, setResult]         = useState(null);
  const [error, setError]           = useState("");
  const [hasScanned, setHasScanned] = useState(false);
  const [clipSuggest, setClipSuggest] = useState(null);
  const [connected, setConnected]   = useState(socket.connected);
  const mounted = useRef(false);

  const pushLog = useCallback((line) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${line}`, ...prev].slice(0, 500));
  }, []);

  useEffect(() => {
    mounted.current = true;
    const onConnect    = () => { if (mounted.current) setConnected(true); };
    const onDisconnect = () => { if (mounted.current) { setConnected(false); setRunning(false); } };
    socket.on("connect",    onConnect);
    socket.on("disconnect", onDisconnect);
    const offs = [
      on("scan_started",    (d) => { if (!mounted.current) return; pushLog(`[INIT] Scan started: ${d.url}`); setRunning(true); setProgress(5); setResult(null); setError(""); setHasScanned(true); }),
      on("log",             (l) => { if (!mounted.current) return; pushLog(typeof l === "string" ? l : JSON.stringify(l)); }),
      on("page_done",       (d) => { if (!mounted.current) return; pushLog(`[SCAN] Page done: ${d.page} | cookies=${d.cookiesFound}, thirdParties=${d.thirdPartiesFound}`); }),
      on("progress",        (p) => { if (!mounted.current) return; setProgress(Math.max(5, Math.min(100, Number(p.progress) || 0))); }),
      on("banner_detected", (b) => { if (!mounted.current) return; pushLog(`[AUTH] Banner detected on ${b.page} (visible=${b.visible ? "yes" : "no"})`); }),
      on("scan_result",     (r) => { if (!mounted.current) return; setResult(r); setRunning(false); setProgress(100); pushLog("[INFO] Scan complete."); saveToArchive(r); }),
      on("scan_error",      (e) => { if (!mounted.current) return; setError(e?.message || "Unknown error"); setRunning(false); pushLog("[ERR] " + (e?.message || "Unknown error")); }),
      on("scan_done",       ()  => { if (!mounted.current) return; setProgress((p) => (p < 95 ? 95 : p)); pushLog("[INFO] Processing complete."); }),
    ];
    return () => {
      mounted.current = false;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      offs.forEach((f) => f());
    };
  }, [pushLog]);

  function startScan() {
    if (!socket.connected) { setError("Backend server is not running. Start it with: cd server && node index.js"); return; }
    setLogs([]); setResult(null); setError(""); setProgress(0); setRunning(true); setHasScanned(true); setClipSuggest(null);
    socket.emit("start_scan", { url }, (ack) => {
      if (!ack || ack.ok !== true) { setRunning(false); setError("Failed to start scan — server did not acknowledge."); }
    });
  }

  async function handleInputFocus() {
    try {
      const text = await navigator.clipboard.readText();
      if (/^https?:\/\//i.test(text) && text !== url) setClipSuggest(text.trim());
    } catch {}
  }

  function downloadJson() {
    if (!result) return;
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `scan-${new URL(result.site).host}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const exportPDF = useCallback(() => {
    if (!result) return;
    try {
      const host = new URL(result.site).host;
      const doc = new jsPDF("p", "mm", "a4");
      const W = doc.internal.pageSize.getWidth();
      const H = doc.internal.pageSize.getHeight();
      const M = 16;
      const CW = W - M * 2;
      const TEAL  = [5, 150, 105];
      const TEAL2 = [16, 185, 129];
      const DARK  = [17, 24, 39];
      const GRAY  = [107, 114, 128];
      const LGRAY = [249, 250, 251];
      const WHITE = [255, 255, 255];
      const RED   = [220, 38, 38];
      const GREEN = [5, 150, 105];
      const YELL  = [217, 119, 6];
      const scoreCol = result.score >= 80 ? GREEN : result.score >= 50 ? YELL : RED;
      const sf = (sz, st = "normal", col = DARK) => { doc.setFontSize(sz); doc.setFont("helvetica", st); doc.setTextColor(...col); };
      const fr = (x, y, w, h, col, r = 0) => { doc.setFillColor(...col); r > 0 ? doc.roundedRect(x, y, w, h, r, r, "F") : doc.rect(x, y, w, h, "F"); };
      doc.setFillColor(...TEAL); doc.rect(0, 0, W, 36, "F");
      doc.setFillColor(...TEAL2); doc.rect(W - 60, 0, 60, 36, "F");
      sf(18, "bold", WHITE); doc.text("ComplyScan", M, 15);
      sf(8, "normal", [180, 240, 210]); doc.text("Privacy Compliance Audit Report", M, 22);
      sf(7, "normal", [180, 240, 210]); doc.text(`Generated: ${new Date().toLocaleString()}`, M, 28);
      sf(7, "normal", [180, 240, 210]); doc.text(`Site: ${result.site}`, M, 33);
      sf(22, "bold", WHITE); doc.text(String(result.score), W - 38, 20);
      sf(8, "normal", [180, 240, 210]); doc.text("/100", W - 20, 20);
      let y = 44;
      const cards = [
        { l: "Score", v: `${result.score}/100`, s: result.score >= 80 ? "Compliant" : result.score >= 50 ? "Needs Work" : "At Risk", c: scoreCol },
        { l: "Pages", v: String(result.scannedPages?.length ?? 0), s: "pages scanned", c: [37, 99, 235] },
        { l: "Banner", v: result.consentBannerDetected ? "Found" : "Missing", s: result.consentBannerDetected ? "Compliant" : "Action Required", c: result.consentBannerDetected ? GREEN : RED },
        { l: "Trackers", v: String(result.categorizedTrackers?.length ?? 0), s: "3rd-party hosts", c: (result.categorizedTrackers?.length ?? 0) > 0 ? YELL : GREEN },
        { l: "Cookies", v: String(Array.isArray(result.cookieReport) ? result.cookieReport.length : 0), s: "total cookies", c: TEAL },
        { l: "Violations", v: String(result.violations?.length ?? 0), s: "issues found", c: (result.violations?.length ?? 0) > 0 ? RED : GREEN },
      ];
      const cw = (CW - 5 * 3) / 3;
      cards.forEach((c, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        const cx = M + col * (cw + 3), cy = y + row * 22;
        fr(cx, cy, cw, 19, LGRAY, 2);
        doc.setDrawColor(...[226, 232, 240]); doc.setLineWidth(0.3); doc.rect(cx, cy, cw, 19, "S");
        doc.setFillColor(...c.c); doc.roundedRect(cx, cy, 2.5, 19, 1, 1, "F");
        sf(14, "bold", c.c); doc.text(c.v, cx + 6, cy + 11);
        sf(7, "normal", GRAY); doc.text(c.l, cx + 6, cy + 6); doc.text(c.s, cx + 6, cy + 16);
      });
      y += 46;
      if (result.violations?.length) {
        if (y > H - 30) { doc.addPage(); y = 20; }
        fr(M, y, CW, 7, [254, 242, 242], 2);
        sf(9, "bold", RED); doc.text(`Violations (${result.violations.length})`, M + 3, y + 5); y += 9;
        result.violations.forEach((v) => {
          if (y > H - 30) { doc.addPage(); y = 20; }
          fr(M, y, CW, 8, [255, 249, 249], 1);
          doc.setDrawColor(254, 202, 202); doc.setLineWidth(0.3); doc.rect(M, y, CW, 8, "S");
          doc.setFillColor(...RED); doc.circle(M + 3.5, y + 4, 1.2, "F");
          sf(8, "normal", [55, 20, 20]);
          const ls = doc.splitTextToSize(v, CW - 12); doc.text(ls, M + 7, y + 5);
          y += ls.length > 1 ? 5 * ls.length + 3 : 10;
        }); y += 3;
      }
      if (result.tips?.length) {
        if (y > H - 30) { doc.addPage(); y = 20; }
        fr(M, y, CW, 7, [240, 253, 250], 2);
        sf(9, "bold", GREEN); doc.text(`Recommendations (${result.tips.length})`, M + 3, y + 5); y += 9;
        result.tips.forEach((t) => {
          if (y > H - 30) { doc.addPage(); y = 20; }
          fr(M, y, CW, 8, [240, 253, 250], 1);
          doc.setDrawColor(153, 246, 228); doc.setLineWidth(0.3); doc.rect(M, y, CW, 8, "S");
          doc.setFillColor(...GREEN); doc.circle(M + 3.5, y + 4, 1.2, "F");
          sf(8, "normal", [5, 50, 30]);
          const ls = doc.splitTextToSize(t, CW - 12); doc.text(ls, M + 7, y + 5);
          y += ls.length > 1 ? 5 * ls.length + 3 : 10;
        }); y += 3;
      }
      const trackers = result.categorizedTrackers ?? [];
      if (trackers.length) {
        if (y > H - 40) { doc.addPage(); y = 20; }
        fr(M, y, CW, 7, [239, 246, 255], 2);
        sf(9, "bold", [37, 99, 235]); doc.text(`3rd-Party Trackers (${trackers.length})`, M + 3, y + 5); y += 10;
        const byC = {};
        trackers.forEach((t) => { if (!byC[t.category]) byC[t.category] = []; byC[t.category].push(t.name); });
        Object.entries(byC).forEach(([cat, names]) => {
          if (y > H - 25) { doc.addPage(); y = 20; }
          sf(8, "bold", [37, 99, 235]); doc.text(`${cat}:`, M + 2, y + 4);
          sf(8, "normal", GRAY);
          const ls = doc.splitTextToSize(names.join("  •  "), CW - 30); doc.text(ls, M + 22, y + 4);
          y += ls.length > 1 ? 5 * ls.length + 2 : 8;
        }); y += 4;
      }
      const cookies = Array.isArray(result.cookieReport) ? result.cookieReport : [];
      if (cookies.length) {
        if (y > H - 40) { doc.addPage(); y = 20; }
        fr(M, y, CW, 7, LGRAY, 2);
        sf(9, "bold", DARK); doc.text(`Cookie Report (${cookies.length})`, M + 3, y + 5); y += 10;
        autoTable(doc, {
          startY: y, margin: { left: M, right: M },
          head: [["Name", "Domain", "Type", "Purpose", "Lifetime (d)", "Secure"]],
          body: cookies.slice(0, 50).map((c) => [c.name ?? "", c.domain ?? "", c.firstParty ? "1st-Party" : "3rd-Party", c.purpose ?? "Unknown", c.lifetimeDays != null ? String(c.lifetimeDays) : "Session", c.secure ? "Yes" : "No"]),
          headStyles: { fillColor: TEAL, textColor: WHITE, fontSize: 7.5, fontStyle: "bold", cellPadding: 2.5 },
          bodyStyles: { fontSize: 7, cellPadding: 2 },
          alternateRowStyles: { fillColor: [248, 250, 252] },
          columnStyles: { 0: { fontStyle: "bold", cellWidth: 36 }, 1: { cellWidth: 38 }, 2: { cellWidth: 20, halign: "center" }, 3: { cellWidth: 28 }, 4: { cellWidth: 24, halign: "center" }, 5: { cellWidth: 16, halign: "center" } },
          didParseCell: (d) => {
            if (d.column.index === 2 && d.section === "body") d.cell.styles.textColor = d.cell.raw === "3rd-Party" ? RED : GREEN;
            if (d.column.index === 4 && d.section === "body" && parseInt(d.cell.raw, 10) > 365) d.cell.styles.textColor = RED;
            if (d.column.index === 5 && d.section === "body") d.cell.styles.textColor = d.cell.raw === "Yes" ? GREEN : RED;
          },
        });
      }
      const pc = doc.getNumberOfPages();
      for (let i = 1; i <= pc; i++) {
        doc.setPage(i);
        doc.setFillColor(...TEAL); doc.rect(0, H - 10, W, 10, "F");
        sf(7, "normal", [180, 240, 210]);
        doc.text("ComplyScan — Privacy Compliance Audit", M, H - 4);
        doc.text(`Page ${i} of ${pc}`, W - M - 18, H - 4);
      }
      doc.save(`ComplyScan-${host}-${new Date().toISOString().slice(0, 10)}.pdf`);
      pushLog("[INFO] PDF downloaded successfully.");
    } catch (e) {
      pushLog("[ERR] PDF generation failed: " + e.message);
    }
  }, [result, pushLog]);

  return (
    <Box style={{ background: "var(--cs-bg-scanner)", minHeight: "100vh" }}>
      <LandingNav showSearch />

      {/* ── Page Header ───────────────────────────────────────────────── */}
      <Box style={{ background: "var(--cs-bg)", borderBottom: "1px solid var(--cs-border)", padding: "48px 0 40px", textAlign: "center" }}>
        <Box style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <Text style={{ fontFamily: serif, fontStyle: "italic", fontSize: "clamp(38px, 5.5vw, 64px)", fontWeight: 400, color: "var(--cs-fg)", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 32 }}>
            New Investigation
          </Text>

          {/* URL Input */}
          <Box style={{ maxWidth: 680, margin: "0 auto" }}>
            <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--cs-fg-dim)", textAlign: "left", marginBottom: 8 }}>
              Target URL
            </Text>
            <Box style={{ display: "flex", gap: 0 }}>
              <input
                type="text"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => { setUrl(e.target.value); setClipSuggest(null); }}
                onKeyDown={(e) => e.key === "Enter" && !running && /^https?:\/\//i.test(url) && startScan()}
                style={{
                  flex: 1, border: "1px solid var(--cs-border-med)", borderRight: "none",
                  padding: "14px 18px", fontSize: 14, color: "var(--cs-fg)",
                  background: "var(--cs-bg-card)", outline: "none",
                  fontFamily: "Inter, system-ui, sans-serif",
                }}
                onFocus={async (e) => { e.target.style.borderColor = "var(--cs-fg)"; await handleInputFocus(); }}
                onBlur={e => { e.target.style.borderColor = "var(--cs-border-med)"; }}
              />
              <button
                onClick={startScan}
                disabled={running || !/^https?:\/\//i.test(url)}
                style={{
                  background: "var(--cs-fg)", color: "var(--cs-bg)",
                  border: "1px solid var(--cs-fg)", padding: "14px 28px",
                  fontSize: 11, fontWeight: 700, letterSpacing: "0.2em",
                  textTransform: "uppercase", cursor: running || !/^https?:\/\//i.test(url) ? "not-allowed" : "pointer",
                  opacity: (running || !/^https?:\/\//i.test(url)) ? 0.45 : 1,
                  fontFamily: "Inter, system-ui, sans-serif", flexShrink: 0, transition: "opacity 0.15s",
                }}
                onMouseEnter={e => { if (!running) e.currentTarget.style.opacity = "0.82"; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = (running || !/^https?:\/\//i.test(url)) ? "0.45" : "1"; }}
              >
                {running ? "Scanning…" : "Scan"}
              </button>
            </Box>

            {clipSuggest && (
              <Box
                style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8, padding: "8px 12px", border: "1px solid var(--cs-border)", background: "var(--cs-hover-bg)", cursor: "pointer" }}
                onClick={() => { setUrl(clipSuggest); setClipSuggest(null); }}
              >
                <ClipboardCheck size={13} color="var(--cs-fg-muted)" />
                <Text style={{ fontSize: 12, color: "var(--cs-fg-muted)", flex: 1 }}>
                  Use clipboard: <strong style={{ color: "var(--cs-fg)" }}>{clipSuggest}</strong>
                </Text>
                <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--cs-fg-muted)" }}>Use →</Text>
              </Box>
            )}

            {hasScanned && (
              <Box style={{ marginTop: 14 }}>
                <Box style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <Text style={{ fontSize: 11, color: "var(--cs-fg-muted)" }}>
                    {running ? "Scanning…" : progress === 100 ? "Complete" : "Initializing…"}
                  </Text>
                  <Text style={{ fontSize: 11, fontWeight: 700, color: "var(--cs-fg)" }}>{progress}%</Text>
                </Box>
                <Box style={{ height: 2, background: "var(--cs-border-med)", overflow: "hidden" }}>
                  <Box style={{ height: "100%", width: `${progress}%`, background: "var(--cs-fg)", transition: "width 0.4s ease" }} />
                </Box>
              </Box>
            )}
          </Box>

          {result && (
            <Group justify="center" gap={8} mt={20}>
              <button
                onClick={downloadJson}
                style={{ background: "transparent", border: "1px solid var(--cs-border-med)", color: "var(--cs-fg-muted)", padding: "7px 18px", fontSize: 11, fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "Inter, system-ui, sans-serif", transition: "all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cs-fg)"; e.currentTarget.style.color = "var(--cs-fg)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--cs-border-med)"; e.currentTarget.style.color = "var(--cs-fg-muted)"; }}
              >
                <Save size={12} /> JSON
              </button>
              <button
                onClick={exportPDF}
                style={{ background: "var(--cs-fg)", color: "var(--cs-bg)", border: "1px solid var(--cs-fg)", padding: "7px 18px", fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "Inter, system-ui, sans-serif", transition: "opacity 0.15s" }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <Download size={12} /> Export PDF
              </button>
            </Group>
          )}
        </Box>
      </Box>

      {/* Server offline */}
      {!connected && (
        <Box style={{ maxWidth: 1280, margin: "16px auto 0", padding: "0 40px" }}>
          <Box style={{ background: C.redBg, border: `1px solid ${C.redBdr}`, padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
            <Box style={{ width: 7, height: 7, borderRadius: "50%", background: C.red, flexShrink: 0 }} />
            <Text style={{ fontSize: 12, color: C.red, fontWeight: 600 }}>Backend server offline —</Text>
            <Box style={{ background: "rgba(220,38,38,0.08)", border: `1px solid ${C.redBdr}`, padding: "2px 10px", fontFamily: "monospace", fontSize: 12, color: "#b91c1c" }}>
              cd server &amp;&amp; node index.js
            </Box>
          </Box>
        </Box>
      )}

      {error && (
        <Box style={{ maxWidth: 1280, margin: "16px auto 0", padding: "0 40px" }}>
          <Alert icon={<AlertCircle size={15} />} title="Scan Failed" color="red" radius={0} variant="light">{error}</Alert>
        </Box>
      )}

      {/* ── Main grid ─────────────────────────────────────────────────── */}
      <Box style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 40px 64px" }}>
        <Box style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: 24, alignItems: "flex-start" }} className="scanner-grid">

          {/* Live Logs */}
          <Box style={{ background: "var(--cs-bg-card)", border: "1px solid var(--cs-border-med)", position: "sticky", top: 72 }}>
            <Box style={{ padding: "14px 18px", borderBottom: "1px solid var(--cs-border)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <Box style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <Box style={{ width: 7, height: 7, borderRadius: "50%", background: running ? C.green : connected ? "rgba(0,0,0,0.25)" : C.red, boxShadow: running ? `0 0 0 3px ${C.greenBg}` : "none", flexShrink: 0 }} />
                <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--cs-fg)" }}>Live Logs</Text>
              </Box>
              <Text style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: running ? C.green : "var(--cs-fg-dim)" }}>
                {running ? "Active" : connected ? "Awaiting" : "Offline"}
              </Text>
            </Box>
            <Box style={{ height: result ? 540 : 360, overflowY: "auto", background: "#fafaf8", padding: "12px 14px" }}>
              {logs.length > 0 ? (
                <Stack gap={0}>
                  {logs.map((l, i) => <LogLine key={i} line={l} />)}
                </Stack>
              ) : (
                <Text style={{ fontSize: 11, color: "var(--cs-fg-dim)", fontFamily: "monospace", fontStyle: "italic", textAlign: "center", marginTop: 40 }}>
                  Logs appear here during scan
                </Text>
              )}
            </Box>
            <Box style={{ padding: "9px 14px", borderTop: "1px solid var(--cs-border)", background: "#fafaf8" }}>
              <Text style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cs-fg-dim)" }}>
                {running ? "● Executing" : "○ Awaiting"}
              </Text>
            </Box>
          </Box>

          {/* Results */}
          <Box>
            {!result ? (
              <CompliancePlaceholder running={running} />
            ) : (
              <Stack gap={20}>
                <ScoreBanner result={result} />
                <TrackersSection trackers={result.categorizedTrackers ?? []} />
                <ViolationTips result={result} />
                <CookiesSection cookies={Array.isArray(result.cookieReport) ? result.cookieReport : []} />
              </Stack>
            )}
          </Box>
        </Box>
      </Box>

      <style>{`@media (max-width: 900px) { .scanner-grid { grid-template-columns: 1fr !important; } }`}</style>
    </Box>
  );
}

/* ─── Score Banner ──────────────────────────────────────────────────────── */
function ScoreBanner({ result }) {
  const score       = result.score ?? 0;
  const scoreColor  = score >= 80 ? C.green : score >= 50 ? C.amber : C.red;
  const scoreLabel  = score >= 80 ? "Compliant" : score >= 50 ? "Needs Work" : "At Risk";
  const scoreLabelColor = score >= 80 ? C.green : score >= 50 ? "#92400e" : "#991b1b";
  const scoreLabelBg    = score >= 80 ? C.greenBg : score >= 50 ? C.amberBg : C.redBg;
  const scoreLabelBorder = score >= 80 ? C.greenBdr : score >= 50 ? C.amberBdr : C.redBdr;
  const consentOk  = result.consentBannerDetected;
  const policyOk   = result.privacyPolicyFound && result.policyRealityCheck?.passed;
  const violCount  = result.violations?.length ?? 0;
  const trackerCount = result.categorizedTrackers?.length ?? 0;

  return (
    <Box style={{ border: "1px solid var(--cs-border-med)", background: "var(--cs-bg-card)", overflow: "hidden" }}>
      {/* Header bar */}
      <Box style={{ background: "#fff", padding: "16px 24px", borderBottom: "1px solid var(--cs-border)" }}>
        <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Stack gap={2}>
            <Text style={{ fontSize: 9, fontWeight: 700, color: "var(--cs-fg-dim)", letterSpacing: "0.25em", textTransform: "uppercase" }}>
              Compliance Audit Report
            </Text>
            <Text
              component="a" href={result.site} target="_blank"
              style={{ fontSize: 13, fontWeight: 600, color: "var(--cs-fg)", wordBreak: "break-all", textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}
            >
              {result.site} <ExternalLink size={11} />
            </Text>
          </Stack>
          <Box style={{ background: scoreLabelBg, border: `1px solid ${scoreLabelBorder}`, padding: "5px 14px" }}>
            <Text style={{ fontSize: 11, fontWeight: 700, color: scoreLabelColor, letterSpacing: "0.06em" }}>{scoreLabel}</Text>
          </Box>
        </Box>
      </Box>

      <Box style={{ padding: "22px 24px", background: "var(--cs-bg-card)" }}>
        <Box style={{ display: "flex", gap: 24, alignItems: "center" }}>
          {/* Score ring */}
          <Box style={{ position: "relative", width: 110, height: 110, flexShrink: 0 }}>
            <svg width={110} height={110} viewBox="0 0 110 110" style={{ transform: "rotate(-90deg)" }}>
              <circle cx={55} cy={55} r={46} fill="none" stroke="rgba(0,0,0,0.06)" strokeWidth={8} />
              <circle cx={55} cy={55} r={46} fill="none" stroke={scoreColor} strokeWidth={8} strokeLinecap="round"
                strokeDasharray={`${(score / 100) * 289} 289`} style={{ transition: "stroke-dasharray 0.9s ease" }} />
            </svg>
            <Box style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
              <Text style={{ fontSize: 30, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>{score}</Text>
              <Text style={{ fontSize: 9, color: "var(--cs-fg-dim)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Score</Text>
            </Box>
          </Box>

          {/* Metrics grid */}
          <Box style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            <MetricCard icon={Eye}          label="Pages Scanned"  value={result.scannedPages?.length ?? 0}  color="var(--cs-accent)" />
            <MetricCard icon={consentOk ? CheckCircle2 : ShieldX}  label="Consent Banner" value={consentOk ? "Detected" : "Missing"}  color={consentOk ? C.green : C.red} />
            <MetricCard icon={result.privacyPolicyFound ? FileText : AlertTriangle} label="Privacy Policy" value={!result.privacyPolicyFound ? "Not Found" : policyOk ? "Complete" : "Incomplete"} color={!result.privacyPolicyFound ? C.red : policyOk ? C.green : C.amber} />
            <MetricCard icon={Network}      label="3rd-Party Hosts" value={trackerCount}                      color={trackerCount > 0 ? C.amber : C.green} />
            <MetricCard icon={Cookie}       label="Total Cookies"   value={Array.isArray(result.cookieReport) ? result.cookieReport.length : 0} color={C.purple} />
            <MetricCard icon={AlertCircle}  label="Violations"      value={violCount}                          color={violCount > 0 ? C.red : C.green} />
          </Box>
        </Box>

        {result.scannedPages?.length > 0 && (
          <>
            <Box style={{ borderTop: "1px solid var(--cs-border)", margin: "20px 0" }} />
            <Text style={{ fontSize: 9, fontWeight: 700, color: "var(--cs-fg-dim)", textTransform: "uppercase", letterSpacing: "0.22em", marginBottom: 10 }}>
              Pages Audited
            </Text>
            <Group gap={8} wrap="wrap">
              {result.scannedPages.map((p, i) => (
                <Box key={i} style={{ background: "var(--cs-bg-alt)", border: "1px solid var(--cs-border-med)", padding: "3px 10px", display: "flex", alignItems: "center", gap: 6 }}>
                  <Globe size={10} color="var(--cs-fg-dim)" />
                  <Text style={{ fontSize: 11, color: "var(--cs-fg-muted)", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p}</Text>
                </Box>
              ))}
            </Group>
          </>
        )}
      </Box>
    </Box>
  );
}

function MetricCard({ icon: Icon, label, value, color }) {
  return (
    <Box style={{ background: "#fff", border: "1px solid var(--cs-border-med)", padding: "12px 14px" }}>
      <Box style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
        <Icon size={13} color={color} strokeWidth={2} />
        <Text style={{ fontSize: 11, color: "var(--cs-fg-muted)", fontWeight: 500 }}>{label}</Text>
      </Box>
      <Text style={{ fontSize: 20, fontWeight: 800, color, lineHeight: 1, letterSpacing: "-0.01em" }}>{value}</Text>
    </Box>
  );
}

/* ─── Trackers Section ──────────────────────────────────────────────────── */
function TrackersSection({ trackers }) {
  if (trackers.length === 0) {
    return (
      <Box style={{ border: "1px solid var(--cs-border-med)", background: "var(--cs-bg-card)", padding: "20px 24px" }}>
        <Group gap="sm">
          <CheckCircle2 size={18} color={C.green} strokeWidth={2} />
          <Stack gap={0}>
            <Text style={{ fontSize: 14, fontWeight: 700, color: "var(--cs-fg)" }}>No 3rd-Party Trackers</Text>
            <Text style={{ fontSize: 12, color: "var(--cs-fg-muted)" }}>Your site doesn't load any external tracking services.</Text>
          </Stack>
        </Group>
      </Box>
    );
  }

  const grouped = trackers.reduce((acc, t) => { if (!acc[t.category]) acc[t.category] = []; acc[t.category].push(t); return acc; }, {});
  const ORDER   = ["Analytics", "Advertising", "Marketing", "Social", "Media", "Essential"];
  const sorted  = [...ORDER.filter((c) => grouped[c]), ...Object.keys(grouped).filter((c) => !ORDER.includes(c))];

  return (
    <Box style={{ border: "1px solid var(--cs-border-med)", background: "var(--cs-bg-card)", padding: "24px" }}>
      <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Group gap={10}>
          <Network size={16} color="var(--cs-fg)" strokeWidth={2} />
          <Stack gap={0}>
            <Text style={{ fontSize: 14, fontWeight: 700, color: "var(--cs-fg)" }}>3rd-Party Trackers</Text>
            <Text style={{ fontSize: 12, color: "var(--cs-fg-muted)" }}>{trackers.length} external hosts detected</Text>
          </Stack>
        </Group>
        <Box style={{ background: C.amberBg, border: `1px solid ${C.amberBdr}`, padding: "4px 12px" }}>
          <Text style={{ fontSize: 12, fontWeight: 700, color: C.amber }}>{trackers.length} hosts</Text>
        </Box>
      </Box>

      <Stack gap={16}>
        {sorted.map((cat) => {
          const items = grouped[cat];
          const s = getCat(cat);
          return (
            <Box key={cat}>
              <Box style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <Box style={{ background: s.light, border: `1px solid ${s.border}`, padding: "2px 10px" }}>
                  <Text style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: s.badge }}>{cat}</Text>
                </Box>
                <Text style={{ fontSize: 12, color: "var(--cs-fg-dim)" }}>{items.length} service{items.length !== 1 ? "s" : ""}</Text>
              </Box>
              <Group gap={6} wrap="wrap">
                {items.map((t, i) => (
                  <Box key={i} style={{ background: "#fff", border: `1px solid ${s.border}`, padding: "4px 12px" }}>
                    <Text style={{ fontSize: 12, fontWeight: 600, color: s.badge }}>{t.name}</Text>
                  </Box>
                ))}
              </Group>
            </Box>
          );
        })}
      </Stack>
    </Box>
  );
}

/* ─── Violations + Recommendations ─────────────────────────────────────── */
const CHECKLIST_KEY = "cs-remediation";

function ViolationTips({ result }) {
  const [cmpOpen, setCmpOpen] = useState(false);
  const needsBanner = !result.consentBannerDetected && ((result.categorizedTrackers?.length ?? 0) > 0 || (result.cookies?.length ?? 0) > 0);
  const [checked, setChecked] = useState(() => {
    try { return JSON.parse(localStorage.getItem(CHECKLIST_KEY) || "{}"); } catch { return {}; }
  });

  function toggleCheck(key) {
    setChecked((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
      return next;
    });
  }

  const hasViolations = (result.violations?.length ?? 0) > 0;

  return (
    <>
      <Box style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="vt-grid">
        {/* Violations */}
        <Box style={{ border: "1px solid var(--cs-border-med)", background: hasViolations ? C.redBg : "var(--cs-bg-card)", padding: "24px" }}>
          <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Group gap={8}>
              {hasViolations
                ? <ShieldX size={16} color={C.red} strokeWidth={2} />
                : <CheckCircle2 size={16} color={C.green} strokeWidth={2} />}
              <Stack gap={0}>
                <Text style={{ fontSize: 14, fontWeight: 700, color: hasViolations ? C.red : "var(--cs-fg)" }}>Violations</Text>
                <Text style={{ fontSize: 12, color: "var(--cs-fg-muted)" }}>
                  {hasViolations ? `${result.violations.length} issue${result.violations.length !== 1 ? "s" : ""} found` : "All clear"}
                </Text>
              </Stack>
            </Group>
            {hasViolations && (
              <Box style={{ background: C.red, padding: "2px 10px" }}>
                <Text style={{ fontSize: 13, fontWeight: 800, color: "#fff" }}>{result.violations.length}</Text>
              </Box>
            )}
          </Box>
          <Stack gap={6}>
            {hasViolations ? (
              result.violations.map((v, i) => {
                const key = `${result.site}::v${i}`;
                const done = !!checked[key];
                return (
                  <Box
                    key={i}
                    style={{ background: done ? "rgba(0,0,0,0.02)" : "#fff", border: `1px solid ${C.redBdr}`, padding: "10px 12px", opacity: done ? 0.5 : 1, transition: "opacity 0.2s" }}
                  >
                    <Group gap={8} align="flex-start" wrap="nowrap">
                      <Box
                        onClick={() => toggleCheck(key)}
                        style={{ width: 15, height: 15, flexShrink: 0, marginTop: 2, border: `1.5px solid ${C.red}`, background: done ? C.red : "transparent", display: "grid", placeItems: "center", cursor: "pointer", transition: "all 0.15s" }}
                      >
                        {done && <Check size={9} color="#fff" strokeWidth={3} />}
                      </Box>
                      <Text style={{ fontSize: 13, color: "var(--cs-fg)", lineHeight: 1.6, textDecoration: done ? "line-through" : "none" }}>{v}</Text>
                    </Group>
                  </Box>
                );
              })
            ) : (
              <Box style={{ background: C.greenBg, border: `1px solid ${C.greenBdr}`, padding: "12px 14px" }}>
                <Group gap={8}>
                  <CheckCircle2 size={13} color={C.green} strokeWidth={2.5} />
                  <Text style={{ fontSize: 13, color: C.green, fontWeight: 600 }}>No violations detected</Text>
                </Group>
              </Box>
            )}
          </Stack>
        </Box>

        {/* Recommendations */}
        <Box style={{ border: "1px solid var(--cs-border-med)", background: "var(--cs-bg-card)", padding: "24px" }}>
          <Box style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <Group gap={8}>
              <Info size={16} color="var(--cs-fg)" strokeWidth={1.5} />
              <Stack gap={0}>
                <Text style={{ fontSize: 14, fontWeight: 700, color: "var(--cs-fg)" }}>Recommendations</Text>
                <Text style={{ fontSize: 12, color: "var(--cs-fg-muted)" }}>
                  {(result.tips?.length ?? 0) > 0 ? `${result.tips.length} action${result.tips.length !== 1 ? "s" : ""} suggested` : "No actions needed"}
                </Text>
              </Stack>
            </Group>
            {(result.tips?.length ?? 0) > 0 && (
              <Box style={{ background: "var(--cs-bg-alt)", border: "1px solid var(--cs-border-med)", padding: "2px 10px" }}>
                <Text style={{ fontSize: 13, fontWeight: 800, color: "var(--cs-fg)" }}>{result.tips.length}</Text>
              </Box>
            )}
          </Box>
          <Stack gap={6}>
            {result.tips?.length ? (
              result.tips.map((t, i) => (
                <Box key={i} style={{ background: C.greenBg, border: `1px solid ${C.greenBdr}`, padding: "10px 12px" }}>
                  <Group gap={8} align="flex-start" wrap="nowrap">
                    <CheckCircle2 size={12} color={C.green} style={{ flexShrink: 0, marginTop: 2 }} />
                    <Text style={{ fontSize: 13, color: "var(--cs-fg)", lineHeight: 1.6 }}>{t}</Text>
                  </Group>
                </Box>
              ))
            ) : (
              <Text style={{ fontSize: 13, color: "var(--cs-fg-dim)" }}>No specific recommendations at this time.</Text>
            )}
            {needsBanner && (
              <button
                onClick={() => setCmpOpen(true)}
                style={{ marginTop: 6, background: "transparent", border: "1px solid var(--cs-border-med)", color: "var(--cs-fg)", padding: "9px 14px", fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 8, fontFamily: "Inter, system-ui, sans-serif", transition: "all 0.15s" }}
                onMouseEnter={e => e.currentTarget.style.borderColor = "var(--cs-fg)"}
                onMouseLeave={e => e.currentTarget.style.borderColor = "var(--cs-border-med)"}
              >
                <Code2 size={13} /> View Banner Code Snippets
              </button>
            )}
          </Stack>
        </Box>
      </Box>

      <Modal opened={cmpOpen} onClose={() => setCmpOpen(false)}
        title={<Group gap="xs"><Code2 size={16} /><Text fw={700} fz="md">Consent Banner Code Snippets</Text></Group>}
        size="lg" centered radius={0}
      >
        <Alert color="orange" variant="light" radius={0} mb="md" icon={<AlertTriangle size={14} />}>
          Your site loads trackers before obtaining user consent. Implement a CMP to fix this.
        </Alert>
        <Text fw={700} fz="sm" mb={4}>Option 1: Klaro (Free &amp; Open Source)</Text>
        <Text fz="xs" c="dimmed" mb="xs">Add inside your &lt;head&gt; tag:</Text>
        <Code block fz="xs">{`<!-- Klaro Consent Manager -->\n<script defer type="text/javascript"\n  src="https://cdn.kiprotect.com/klaro/v0.7/klaro.js"></script>`}</Code>
        <Text fw={700} fz="sm" mt="lg" mb={4}>Option 2: Cookiebot (Enterprise)</Text>
        <Text fz="xs" c="dimmed" mb="xs">Replace data-cbid with your account ID:</Text>
        <Code block fz="xs">{`<!-- Cookiebot CMP -->\n<script id="Cookiebot"\n  src="https://consent.cookiebot.com/uc.js"\n  data-cbid="YOUR-ACCOUNT-ID"\n  type="text/javascript" async></script>`}</Code>
        <Alert title="Next Step" color="green" mt="lg" radius={0} variant="light">
          After adding the banner, update your analytics scripts to load only after user consent.
        </Alert>
      </Modal>

      <style>{`@media (max-width: 700px) { .vt-grid { grid-template-columns: 1fr !important; } }`}</style>
    </>
  );
}

/* ─── Cookie Table ──────────────────────────────────────────────────────── */
function CookiesSection({ cookies }) {
  const [q, setQ]     = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: "lifetimeDays", dir: "desc" });
  const pageSize = 10;

  function downloadCsv() {
    const headers = ["Name", "Domain", "Type", "Purpose", "Expires", "Lifetime (days)", "Secure", "HTTP Only"];
    const rows = cookies.map((c) => [
      c.name ?? "", c.domain ?? "", c.firstParty ? "1st-Party" : "3rd-Party", c.purpose ?? "Unknown",
      c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Session",
      c.lifetimeDays ?? "", c.secure ? "Yes" : "No", c.httpOnly ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cookies-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = query ? cookies.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(query))) : cookies;
    const { key, dir } = sort;
    const sgn = dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const A = a[key], B = b[key];
      if (typeof A === "number" && typeof B === "number") return sgn * (A - B);
      return sgn * String(A ?? "").localeCompare(String(B ?? ""));
    });
  }, [cookies, q, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIdx   = (page - 1) * pageSize;
  const pageRows   = filtered.slice(startIdx, startIdx + pageSize);
  useEffect(() => { setPage(1); }, [q, sort.key, sort.dir]);

  const handleSort = (k) => setSort((s) => s.key === k ? { key: k, dir: s.dir === "asc" ? "desc" : "asc" } : { key: k, dir: "asc" });

  const SortIcon = ({ k }) => sort.key !== k
    ? <ChevronsUpDown size={10} style={{ opacity: 0.25 }} />
    : sort.dir === "asc" ? <ChevronUp size={10} /> : <ChevronDown size={10} />;

  const Th = ({ label, k }) => (
    <Table.Th onClick={() => handleSort(k)} style={{ cursor: "pointer", userSelect: "none", whiteSpace: "nowrap", background: "var(--cs-bg-alt)" }}>
      <Group gap={4}>
        <Text fw={700} fz="xs" tt="uppercase" style={{ letterSpacing: "0.06em", color: "var(--cs-fg-muted)" }}>{label}</Text>
        <SortIcon k={k} />
      </Group>
    </Table.Th>
  );

  if (cookies.length === 0) return null;

  return (
    <Box style={{ border: "1px solid var(--cs-border-med)", background: "var(--cs-bg-card)", padding: "24px" }}>
      <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18, flexWrap: "wrap", gap: 12 }}>
        <Group gap={10}>
          <Cookie size={15} color={C.purple} strokeWidth={2} />
          <Stack gap={0}>
            <Text style={{ fontSize: 14, fontWeight: 700, color: "var(--cs-fg)" }}>Cookie Report</Text>
            <Text style={{ fontSize: 12, color: "var(--cs-fg-muted)" }}>{cookies.length} cookies found across all pages</Text>
          </Stack>
          <Box style={{ background: C.purpleBg, border: `1px solid ${C.purpleBdr}`, padding: "3px 12px" }}>
            <Text style={{ fontSize: 12, fontWeight: 700, color: C.purple }}>{cookies.length} total</Text>
          </Box>
        </Group>
        <Box style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            placeholder="Search cookies…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{ border: "1px solid var(--cs-border-med)", padding: "7px 12px", fontSize: 13, color: "var(--cs-fg)", background: "#fff", outline: "none", width: 190, fontFamily: "Inter, system-ui, sans-serif" }}
          />
          <button
            onClick={downloadCsv}
            title="Export as CSV"
            style={{ background: "transparent", border: "1px solid var(--cs-border-med)", color: "var(--cs-fg-muted)", padding: "7px 12px", fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "Inter, system-ui, sans-serif", transition: "all 0.15s", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cs-fg)"; e.currentTarget.style.color = "var(--cs-fg)"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--cs-border-med)"; e.currentTarget.style.color = "var(--cs-fg-muted)"; }}
          >
            <Download size={12} /> CSV
          </button>
        </Box>
      </Box>

      <Table.ScrollContainer minWidth={780}>
        <Table highlightOnHover verticalSpacing="sm" withTableBorder withColumnBorders styles={{ thead: { background: "var(--cs-bg-alt)" } }}>
          <Table.Thead>
            <Table.Tr>
              <Th label="Name"        k="name" />
              <Th label="Domain"      k="domain" />
              <Th label="Type"        k="firstParty" />
              <Th label="Purpose"     k="purpose" />
              <Th label="Expires"     k="expiresAt" />
              <Th label="Lifetime (d)" k="lifetimeDays" />
              <Th label="Secure"      k="secure" />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {pageRows.length === 0 ? (
              <Table.Tr><Table.Td colSpan={7} ta="center" py="xl" c="var(--cs-fg-dim)">No cookies match your search.</Table.Td></Table.Tr>
            ) : (
              pageRows.map((c, i) => (
                <Table.Tr key={i}>
                  <Table.Td><Text fz="xs" ff="monospace" fw={700} c="var(--cs-fg)">{c.name}</Text></Table.Td>
                  <Table.Td><Text fz="xs" c="var(--cs-fg-muted)">{c.domain}</Text></Table.Td>
                  <Table.Td>
                    <Box style={{ display: "inline-block", background: c.firstParty ? C.greenBg : C.redBg, border: `1px solid ${c.firstParty ? C.greenBdr : C.redBdr}`, padding: "2px 8px" }}>
                      <Text style={{ fontSize: 11, fontWeight: 700, color: c.firstParty ? C.green : C.red }}>
                        {c.firstParty ? "1st-Party" : "3rd-Party"}
                      </Text>
                    </Box>
                  </Table.Td>
                  <Table.Td>
                    {c.purpose
                      ? <Box style={{ display: "inline-block", background: "var(--cs-bg-alt)", border: "1px solid var(--cs-border)", padding: "2px 8px" }}><Text style={{ fontSize: 11, color: "var(--cs-fg-muted)" }}>{c.purpose}</Text></Box>
                      : <Text fz="xs" c="var(--cs-fg-dim)">—</Text>}
                  </Table.Td>
                  <Table.Td><Text fz="xs" c="var(--cs-fg-muted)">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : "Session"}</Text></Table.Td>
                  <Table.Td>
                    <Group gap={4} wrap="nowrap">
                      {c.lifetimeDays > 365 && <AlertTriangle size={11} color={C.amber} strokeWidth={2} />}
                      <Text fz="xs" fw={c.lifetimeDays > 365 ? 700 : 400} style={{ color: c.lifetimeDays > 365 ? C.amber : "var(--cs-fg-muted)" }}>
                        {c.lifetimeDays ?? "—"}
                      </Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>
                    <Box style={{ display: "inline-block", background: c.secure ? C.greenBg : C.redBg, border: `1px solid ${c.secure ? C.greenBdr : C.redBdr}`, padding: "2px 8px" }}>
                      <Text style={{ fontSize: 11, fontWeight: 700, color: c.secure ? C.green : C.red }}>{c.secure ? "Yes" : "No"}</Text>
                    </Box>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {totalPages > 1 && (
        <Group justify="space-between" mt="md">
          <Text fz="xs" c="var(--cs-fg-dim)">Showing {startIdx + 1}–{Math.min(startIdx + pageSize, filtered.length)} of {filtered.length}</Text>
          <Group gap={6}>
            <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1}
              style={{ border: "1px solid var(--cs-border-med)", background: "transparent", padding: "5px 14px", cursor: page <= 1 ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 12, opacity: page <= 1 ? 0.4 : 1 }}>
              ← Prev
            </button>
            <Box style={{ background: "var(--cs-bg-alt)", border: "1px solid var(--cs-border-med)", padding: "5px 16px" }}>
              <Text fz="xs" fw={600} c="var(--cs-fg-muted)">{page} / {totalPages}</Text>
            </Box>
            <button onClick={() => setPage((p) => p + 1)} disabled={page >= totalPages}
              style={{ border: "1px solid var(--cs-border-med)", background: "transparent", padding: "5px 14px", cursor: page >= totalPages ? "not-allowed" : "pointer", fontFamily: "inherit", fontSize: 12, opacity: page >= totalPages ? 0.4 : 1 }}>
              Next →
            </button>
          </Group>
        </Group>
      )}
    </Box>
  );
}
