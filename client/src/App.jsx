import React, { useEffect, useMemo, useRef, useState } from "react";
import { io } from "socket.io-client";

export default function App() {
  const [url, setUrl] = useState("https://example.com");
  const [connected, setConnected] = useState(false);
  const [logs, setLogs] = useState([]);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState(null);
  const socketRef = useRef(null);
const isLocal = import.meta.env.DEV;
const serverURL = isLocal
  ? "http://localhost:8080"
  : import.meta.env.VITE_API_URL;

console.log("Connecting socket to:", serverURL);
const socket = io(serverURL);
// const serverURL = useMemo(() => "http://localhost:8080", []);



  useEffect(() => {
    const socket = io(serverURL, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("connect", () => setConnected(true));
    socket.on("disconnect", () => setConnected(false));

    socket.on("scan_started", ({ url }) => {
      setLogs((l) => [...l, `Scan started: ${url}`]);
      setResult(null);
      setProgress(0);
    });

    socket.on("progress", (p) => {
      if (p.page) setLogs((l) => [...l, `Progress: ${p.step} -> ${p.page} (${p.progress}%)`]);
      setProgress(p.progress ?? 0);
    });

    socket.on("page_done", (info) => {
      setLogs((l) => [...l, `Scanned: ${info.page} | cookies=${info.cookiesFound}, 3P=${info.thirdPartiesFound}`]);
    });

    socket.on("banner_detected", ({ page, visible }) => {
      setLogs((l) => [...l, `Consent banner detected on ${page} (visible=${visible})`]);
    });

    socket.on("warning", ({ page, message }) => {
      setLogs((l) => [...l, `⚠️ ${page}: ${message}`]);
    });

    socket.on("scan_error", ({ message }) => {
      setLogs((l) => [...l, `Error: ${message}`]);
    });

    socket.on("scan_complete", (res) => {
      setLogs((l) => [...l, `Scan complete. Score=${res.score}`]);
      setResult(res);
      setProgress(100);
    });

    return () => socket.disconnect();
  }, [serverURL]);

  const startScan = (e) => {
    e.preventDefault();
    setLogs([]);
    setResult(null);
    setProgress(0);
    socketRef.current?.emit("start_scan", { url, options: { maxPages: 4 } });
  };

  return (
   <div style={{ fontFamily: "Inter, system-ui, Arial", padding: 16, maxWidth: 960, margin: "0 auto" }}>
  <h1>Compliance Checker</h1>
  
  <p style={{ fontSize: "1rem", color: "#444", marginTop: 4, marginBottom: 12 }}>
    Scan any public website for cookie banners, third-party trackers, and privacy policy violations in real-time.
  </p>
  
  <p style={{ color: connected ? "green" : "red" }}>
    Socket: {connected ? "connected" : "disconnected"}
  </p>


      <form onSubmit={startScan} style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://your-site.com"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit" style={{ padding: "8px 16px", cursor: "pointer" }}>Scan</button>
      </form>

      <div style={{ background: "#eee", height: 8, borderRadius: 4, marginBottom: 12 }}>
        <div style={{
          width: `${progress}%`,
          background: "#4caf50",
          height: "100%",
          borderRadius: 4,
          transition: "width 0.3s ease"
        }} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <h3>Live Logs</h3>
          <div style={{ maxHeight: 320, overflow: "auto", fontFamily: "ui-monospace, Menlo, monospace", fontSize: 13 }}>
            {logs.map((line, i) => (
              <div key={i}>{line}</div>
            ))}
          </div>
        </section>

        <section style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8 }}>
          <h3>Result</h3>
          {!result ? (
            <p>Run a scan to see results.</p>
          ) : (
            <div>
              <p><b>Site:</b> {result.site}</p>
              <p><b>Score:</b> {result.score}/100</p>
              <p><b>Consent Banner:</b> {result.consentBannerDetected ? "Yes" : "No"}</p>
              <p><b>Privacy Policy:</b> {result.privacyPolicyFound ? "Found" : "Not found"}</p>
              <p><b>Pages Scanned:</b> {result.scannedPages.length}</p>
              <p><b>Third-party Domains ({result.thirdPartyRequests.length}):</b></p>
              <ul>
                {result.thirdPartyRequests.map((d) => <li key={d}>{d}</li>)}
              </ul>
              <p><b>Violations ({result.violations.length}):</b></p>
              <ul>
                {result.violations.map((v, idx) => <li key={idx}>{v}</li>)}
              </ul>
              <p><b>Tips:</b></p>
              <ul>
                {result.tips.map((t, idx) => <li key={idx}>{t}</li>)}
              </ul>
              <details>
                <summary>Cookies ({result.cookies.length})</summary>
                <pre style={{ whiteSpace: "pre-wrap" }}>
                  {JSON.stringify(result.cookies, null, 2)}
                </pre>
              </details>
            </div>
          )}
        </section>
      </div>

      <p style={{ marginTop: 16, fontSize: 12, color: "#666" }}>
        ⚠️ This is a heuristic tool for education, not legal advice.
      </p>
    </div>
  );
}
