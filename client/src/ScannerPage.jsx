import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { socket, on } from "./lib/socket.js";
import { Link } from "react-router-dom";
/* ====== Style Constants & Helpers ====== */
const colors = {
  primary: "#007aff",
  green: "#34c759",
  red: "#ff3b30",
  blue: "#007aff",
  dark: "#1c1c1e",
  lightGray: "#f2f2f7",
  border: "#e5e5ea",
  text: "#333",
  textSecondary: "#6b7280",
};

const btn = (disabled, accent = colors.primary) => ({
  padding: "10px 18px",
  borderRadius: "8px",
  color: "#fff",
  background: disabled ? "#9aa3a9" : accent,
  cursor: disabled ? "not-allowed" : "pointer",
  border: "none",
  fontWeight: 600,
  fontSize: "15px",
  transition: "background 0.2s ease, transform 0.1s ease",
  outline: "none",
});

const card = {
  border: `1px solid ${colors.border}`,
  borderRadius: "12px",
  padding: "16px",
  background: "#fff",
  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)",
};

const td = { padding: "12px 14px", borderBottom: `1px solid ${colors.border}`, verticalAlign: "top", fontSize: "13px" };
const th = { ...td, fontWeight: 600, position: "sticky", top: 0, background: colors.lightGray, zIndex: 1 };

const Watermark = () => (
  <div style={{
    position: 'absolute',
    bottom: '10px',
    right: '16px',
    fontSize: '12px',
    color: '#000000',
    opacity: '0.15',
    fontWeight: '600',
    pointerEvents: 'none',
  }}>
ComplyScan
  </div>
);

export default function ScannerPage() {
  const [url, setUrl] = useState(""); 
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const mounted = useRef(false);

  const pushLog = useCallback((line) => {
    setLogs((prev) => [`[${new Date().toLocaleTimeString()}] ${line}`, ...prev].slice(0, 500));
  }, []);

  useEffect(() => {
    mounted.current = true;
    const eventListeners = [
      on("scan_started", (d) => {
        if (!mounted.current) return;
        pushLog(`Scan started: ${d.url}`);
        setRunning(true);
        setProgress(5);
        setResult(null);
        setError("");
      }),
      on("log", (line) => {
        if (!mounted.current) return;
        pushLog(typeof line === "string" ? line : JSON.stringify(line));
      }),
      on("page_done", (d) => {
        if (!mounted.current) return;
        pushLog(`Page done: ${d.page} | cookies=${d.cookiesFound}, thirdParties=${d.thirdPartiesFound}`);
      }),
      on("progress", (p) => {
        if (!mounted.current) return;
        setProgress(Math.max(5, Math.min(100, Number(p.progress) || 0)));
      }),
      on("banner_detected", (b) => {
        if (!mounted.current) return;
        pushLog(`Banner detected on ${b.page} (visible=${b.visible ? "yes" : "no"})`);
      }),
      on("scan_result", (r) => {
        if (!mounted.current) return;
        setResult(r);
        setRunning(false);
        setProgress(100);
        pushLog("Scan finished.");
      }),
      on("scan_error", (e) => {
        if (!mounted.current) return;
        setError(e?.message || "Unknown error");
        setRunning(false);
        pushLog("Scan error: " + (e?.message || "Unknown error"));
      }),
      on("scan_done", () => {
        if (!mounted.current) return;
        setProgress((p) => (p < 95 ? 95 : p));
        pushLog("Scan processing complete.");
      }),
    ];
    return () => {
      mounted.current = false;
      eventListeners.forEach(off => off());
    };
  }, [pushLog]);

  function startScan() {
    setLogs([]);
    setResult(null);
    setError("");
    setProgress(0);
    setRunning(true);
    socket.emit("start_scan", { url }, (ack) => {
      if (!ack || ack.ok !== true) {
        setRunning(false);
        setError("Failed to start scan.");
      }
    });
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

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif", background: colors.lightGray, minHeight: '100vh', position: 'relative' }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "24px 16px" }}>
        <Watermark />
        <header style={{ textAlign: "center", marginBottom: "24px" }}>
          <div style={{ marginBottom: 12 }}>
  <Link
    to="/"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: 6,
      fontSize: 14,
      color: "#2563eb",
      textDecoration: "none",
      fontWeight: 600,
    }}
  >
    ← Back to Home
  </Link>
</div>

            <h1 style={{ fontSize: "36px", fontWeight: 800, color: colors.dark, margin: 0 }}>ComplyScan</h1>
            <p style={{ color: colors.textSecondary, marginTop: '4px' }}>Enter a URL to analyze its privacy compliance.</p>
        </header>

        <div style={{ display: "flex", gap: "8px", marginBottom: "16px", ...card, padding: '16px' }}>
          <input
            style={{
              flex: 1,
              padding: "12px 14px",
              border: `1px solid ${colors.border}`,
              borderRadius: "8px",
              outline: "none",
              fontSize: "16px",
              transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
            }}
            onFocus={(e) => { e.target.style.borderColor = colors.primary; e.target.style.boxShadow = `0 0 0 2px ${colors.primary}40` }}
            onBlur={(e) => { e.target.style.borderColor = colors.border; e.target.style.boxShadow = 'none' }}
            placeholder="e.g., https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button onClick={startScan} disabled={running || !/^https?:\/\//i.test(url)} style={btn(running, colors.green)}>
            {running ? "Scanning…" : "Scan"}
          </button>
          <button onClick={downloadJson} disabled={!result} style={btn(!result, colors.blue)}>
            Download JSON
          </button>
        </div>

        <div style={{ height: "8px", background: colors.border, borderRadius: "999px", overflow: "hidden", marginBottom: "20px" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: `linear-gradient(90deg, ${colors.green}, ${colors.primary})`, transition: "width .3s ease-out" }}/>
        </div>

        {error && (
          <div style={{ marginBottom: "20px", padding: "12px", border: `1px solid ${colors.red}80`, background: `${colors.red}20`, color: colors.red, borderRadius: "10px", fontWeight: 500 }}>
            {error}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "20px", alignItems: "start" }}>
          <div style={card}>
            <h2 style={{ fontWeight: 700, margin: '0 0 12px 0', fontSize: '18px' }}>Live Logs</h2>
            <div style={{ height: "400px", overflow: "auto", background: "#fafafa", padding: "10px", fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: "12px", borderRadius: "8px", border: `1px solid ${colors.border}` }}>
              {logs.length ? logs.map((l, i) => <div key={i} style={{ padding: '2px 0' }}>{l}</div>) : <span style={{color: colors.textSecondary}}>Logs will appear here...</span>}
            </div>
          </div>
          
          <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
            {!result ? (
               <div style={{ ...card, textAlign: 'center', padding: '40px', color: colors.textSecondary }}>
                 {running ? "Analyzing site..." : "Run a scan to see the compliance report."}
               </div>
            ) : (
              <ResultCard result={result} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ScoreCircle = ({ score }) => {
    const size = 80;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (score / 100) * circumference;
    const color = score > 80 ? colors.green : score > 50 ? '#ffcc00' : colors.red;

    return (
        <div style={{ position: 'relative', width: size, height: size, gridRow: 'span 2' }}>
            <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
                <circle cx={size/2} cy={size/2} r={radius} stroke={colors.border} strokeWidth={strokeWidth} fill="transparent" />
                <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={strokeWidth} fill="transparent" strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
            </svg>
            <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', fontWeight: 700, color: colors.dark }}>
                {score}
            </div>
        </div>
    );
};

function ResultCard({ result }) {
  const cookies = Array.isArray(result.cookieReport) ? result.cookieReport : [];

  return (
    <>
    <div style={{ ...card, fontSize: "14px" }}>
        <h2 style={{ fontWeight: 700, margin: '0 0 16px 0', fontSize: '18px' }}>Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '10px 20px', alignItems: 'center' }}>
            <ScoreCircle score={result.score} />
            <b>Site:</b> <a href={result.site} target="_blank" rel="noopener noreferrer" style={{color: colors.primary}}>{result.site}</a>
            <b>Pages scanned:</b> <span>{result.scannedPages?.length ?? 0}</span>
            <b style={{alignSelf: 'start'}}>Third-party hosts:</b> 
            <p style={{ margin: 0, color: colors.textSecondary, maxHeight: '60px', overflow: 'auto' }}>
                {result.thirdPartyRequests?.length ? result.thirdPartyRequests.join(", ") : "none"}
            </p>
        </div>
    </div>
    <div style={card}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
                <h3 style={{ fontWeight: 600, margin: '0 0 12px 0', fontSize: '16px', color: colors.red }}>Violations</h3>
                <ul style={{ margin: 0, paddingLeft: "20px", color: colors.text }}>
                    {result.violations?.length
                        ? result.violations.map((v, i) => <li key={i} style={{marginBottom: '6px'}}>{v}</li>)
                        : <li>None detected</li>}
                </ul>
            </div>
            <div>
                <h3 style={{ fontWeight: 600, margin: '0 0 12px 0', fontSize: '16px', color: colors.green }}>Tips</h3>
                <ul style={{ margin: 0, paddingLeft: "20px", color: colors.text }}>
                    {result.tips?.length
                        ? result.tips.map((t, i) => <li key={i} style={{marginBottom: '6px'}}>{t}</li>)
                        : <li>No specific tips.</li>}
                </ul>
            </div>
        </div>
    </div>
    <div style={card}>
      <CookiesTable rows={cookies} />
    </div>
    </>
  );
}

function CookiesTable({ rows }) {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState({ key: "lifetimeDays", dir: "desc" });
  const pageSize = 10;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    let list = rows;
    if (query) {
      list = rows.filter((r) =>
        Object.values(r).some(val => String(val).toLowerCase().includes(query))
      );
    }
    const { key, dir } = sort;
    const sgn = dir === "asc" ? 1 : -1;
    return [...list].sort((a, b) => {
      const A = a[key]; const B = b[key];
      if (typeof A === "number" && typeof B === "number") return sgn * (A - B);
      return sgn * String(A ?? "").localeCompare(String(B ?? ""));
    });
  }, [rows, q, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const startIdx = (page - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);

  useEffect(() => { setPage(1); }, [q, sort.key, sort.dir]);

  const header = (label, key, width) => (
    <th onClick={() => setSort(s => (s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))}
      style={{ ...th, width, cursor: "pointer", userSelect: "none" }} title="Click to sort">
      {label}
      <span style={{ opacity: sort.key === key ? 1 : 0.3, marginLeft: 6, fontSize: 12 }}>
        {sort.key === key ? (sort.dir === "asc" ? "▲" : "▼") : "↕"}
      </span>
    </th>
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: "12px" }}>
        <h2 style={{ fontWeight: 700, margin: 0, fontSize: '18px' }}>Cookies ({rows.length})</h2>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search all fields..."
          style={{ padding: "8px 12px", border: `1px solid ${colors.border}`, borderRadius: "8px", minWidth: "280px", marginLeft: 'auto' }}
        />
      </div>
      <div style={{ overflowX: "auto", border: `1px solid ${colors.border}`, borderRadius: "12px" }}>
        <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0, textAlign: 'left' }}>
          <thead>
            <tr>
              {header("Name", "name", '220px')}
              {header("Domain", "domain", '180px')}
              {header("Type", "firstParty", '100px')}
              {header("Purpose", "purpose", '200px')}
              {header("Expires", "expiresAt", '170px')}
              {header("Lifetime", "lifetimeDays", '100px')}
              {header("Secure", "secure", '80px')}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr><td colSpan={7} style={{ ...td, color: colors.textSecondary, textAlign: "center", padding: '24px' }}>No cookies found.</td></tr>
            ) : (
              pageRows.map((c, i) => (
                <tr key={i} style={{ background: i % 2 ? colors.lightGray : "#fff" }}>
                  <td style={td}><code>{c.name}</code></td>
                  <td style={td}>{c.domain}</td>
                  <td style={td}>{c.firstParty ? "First-Party" : "Third-Party"}</td>
                  <td style={td}>{c.purpose || <span style={{color: colors.textSecondary}}>Unknown</span>}</td>
                  <td style={td}>{c.expiresAt ? new Date(c.expiresAt).toLocaleString() : "Session"}</td>
                  <td style={td}>{c.lifetimeDays ?? "-"}</td>
                  <td style={td}><span style={{fontWeight: 500, color: c.secure ? colors.green : colors.red}}>{c.secure ? "Yes" : "No"}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 12, fontSize: '14px' }}>
          <span style={{ color: colors.textSecondary }}>
            Page {page} of {totalPages}
          </span>
          <div style={{ marginLeft: "auto" }} />
          <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} style={btn(page <= 1, colors.dark)}>Prev</button>
          <button onClick={() => setPage(p => p + 1)} disabled={page >= totalPages} style={btn(page >= totalPages, colors.dark)}>Next</button>
        </div>
      )}
    </div>
  );
}