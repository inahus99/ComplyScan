import React, { useState, useEffect } from "react";
import { Box, Text, Group, Stack } from "@mantine/core";
import { Link } from "react-router-dom";
import { Trash2, ExternalLink, ArrowRight, Clock, AlertCircle, Network } from "lucide-react";
import LandingNav from "./components/LandingNav";

const serif = "'Instrument Serif', Georgia, serif";
export const ARCHIVE_KEY = "cs-scan-history";

export function saveToArchive(result) {
  try {
    const history = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]");
    history.unshift({
      id: Date.now(),
      site: result.site,
      score: result.score ?? 0,
      date: new Date().toISOString(),
      violations: result.violations?.length ?? 0,
      trackers: result.categorizedTrackers?.length ?? 0,
      cookies: Array.isArray(result.cookieReport) ? result.cookieReport.length : 0,
      consentBanner: result.consentBannerDetected ?? false,
    });
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(history.slice(0, 30)));
  } catch {}
}

function scoreColor(s) {
  return s >= 80 ? "#16a34a" : s >= 50 ? "#d97706" : "#dc2626";
}

function ScoreRing({ score, size = 48 }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const color = scoreColor(score);
  return (
    <Box style={{ position: "relative", width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--cs-border)" strokeWidth={size * 0.08} />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          fill="none" stroke={color} strokeWidth={size * 0.08} strokeLinecap="round"
          strokeDasharray={`${(score / 100) * circ} ${circ}`}
        />
      </svg>
      <Box style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: size * 0.28, fontWeight: 800, color, lineHeight: 1 }}>{score}</Text>
      </Box>
    </Box>
  );
}

export default function ArchivePage() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    document.title = "Archive — ComplyScan";
    try {
      setHistory(JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]"));
    } catch { setHistory([]); }
  }, []);

  function deleteEntry(id) {
    const next = history.filter((h) => h.id !== id);
    setHistory(next);
    localStorage.setItem(ARCHIVE_KEY, JSON.stringify(next));
  }

  function clearAll() {
    setHistory([]);
    localStorage.removeItem(ARCHIVE_KEY);
  }

  return (
    <Box style={{ background: "var(--cs-bg)", minHeight: "100vh", color: "var(--cs-fg)" }}>
      <LandingNav />

      {/* Page header */}
      <Box style={{ borderBottom: "1px solid var(--cs-border)", padding: "56px 0 40px", background: "var(--cs-bg)" }}>
        <Box style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--cs-fg-dim)", marginBottom: 16 }}>
            Scan History
          </Text>
          <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <Text style={{ fontFamily: serif, fontStyle: "italic", fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 400, color: "var(--cs-fg)", lineHeight: 1, letterSpacing: "-0.02em" }}>
              Archive
            </Text>
            {history.length > 0 && (
              <button
                onClick={clearAll}
                style={{
                  background: "transparent",
                  border: "1px solid var(--cs-border-med)",
                  color: "var(--cs-fg-muted)",
                  padding: "8px 18px",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontFamily: "Inter, system-ui, sans-serif",
                  transition: "all 0.15s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.color = "#dc2626"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--cs-border-med)"; e.currentTarget.style.color = "var(--cs-fg-muted)"; }}
              >
                <Trash2 size={12} /> Clear All
              </button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px" }}>
        {history.length === 0 ? (
          /* Empty state */
          <Box style={{ display: "grid", placeItems: "center", minHeight: 400 }}>
            <Box style={{ textAlign: "center" }}>
              <Box
                style={{
                  width: 72,
                  height: 72,
                  border: "1px solid var(--cs-border-med)",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 28px",
                }}
              >
                <Clock size={28} color="var(--cs-fg-dim)" strokeWidth={1.5} />
              </Box>
              <Text style={{ fontFamily: serif, fontStyle: "italic", fontSize: 28, color: "var(--cs-fg)", marginBottom: 12 }}>
                No scans yet.
              </Text>
              <Text style={{ fontSize: 14, color: "var(--cs-fg-muted)", marginBottom: 28, lineHeight: 1.7 }}>
                Your scan history will appear here after you run your first audit.
              </Text>
              <Link
                to="/scan"
                style={{
                  background: "var(--cs-fg)",
                  color: "var(--cs-bg)",
                  padding: "14px 28px",
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: "0.2em",
                  textTransform: "uppercase",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                Start Scanning <ArrowRight size={14} />
              </Link>
            </Box>
          </Box>
        ) : (
          <Stack gap={0}>
            {/* Table header */}
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 80px 100px 120px 100px 48px",
                gap: 16,
                padding: "10px 20px",
                borderBottom: "1px solid var(--cs-border)",
              }}
            >
              {["Site", "Score", "Violations", "Trackers", "Date", ""].map((h) => (
                <Text key={h} style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--cs-fg-dim)" }}>
                  {h}
                </Text>
              ))}
            </Box>

            {/* Rows */}
            {history.map((entry, idx) => {
              const sc = scoreColor(entry.score);
              const dateStr = new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
              return (
                <Box
                  key={entry.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "2fr 80px 100px 120px 100px 48px",
                    gap: 16,
                    padding: "20px 20px",
                    borderBottom: "1px solid var(--cs-border)",
                    alignItems: "center",
                    transition: "background 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--cs-hover-bg)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Site */}
                  <Box style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <Text style={{ fontSize: 11, fontWeight: 700, color: "var(--cs-fg-dim)", minWidth: 22 }}>
                      {String(idx + 1).padStart(2, "0")}.
                    </Text>
                    <Box>
                      <Text style={{ fontSize: 14, fontWeight: 600, color: "var(--cs-fg)", marginBottom: 2 }}>
                        {(() => { try { return new URL(entry.site).hostname; } catch { return entry.site; } })()}
                      </Text>
                      <Box style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Text style={{ fontSize: 11, color: "var(--cs-fg-muted)" }}>{entry.site}</Text>
                        <a href={entry.site} target="_blank" rel="noopener noreferrer" style={{ color: "var(--cs-fg-muted)", display: "flex" }}>
                          <ExternalLink size={10} />
                        </a>
                      </Box>
                    </Box>
                  </Box>

                  {/* Score */}
                  <Box style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <ScoreRing score={entry.score} size={40} />
                  </Box>

                  {/* Violations */}
                  <Box style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    {entry.violations > 0 && <AlertCircle size={13} color="#dc2626" />}
                    <Text style={{ fontSize: 14, fontWeight: 600, color: entry.violations > 0 ? "#dc2626" : "#16a34a" }}>
                      {entry.violations}
                    </Text>
                    <Text style={{ fontSize: 11, color: "var(--cs-fg-muted)" }}>issue{entry.violations !== 1 ? "s" : ""}</Text>
                  </Box>

                  {/* Trackers */}
                  <Box style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    <Network size={12} color="var(--cs-fg-muted)" />
                    <Text style={{ fontSize: 14, fontWeight: 600, color: "var(--cs-fg)" }}>{entry.trackers}</Text>
                    <Text style={{ fontSize: 11, color: "var(--cs-fg-muted)" }}>host{entry.trackers !== 1 ? "s" : ""}</Text>
                  </Box>

                  {/* Date */}
                  <Text style={{ fontSize: 12, color: "var(--cs-fg-muted)" }}>{dateStr}</Text>

                  {/* Delete */}
                  <Box
                    onClick={() => deleteEntry(entry.id)}
                    style={{ cursor: "pointer", color: "var(--cs-fg-dim)", display: "flex", justifyContent: "center", transition: "color 0.15s" }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#dc2626")}
                    onMouseLeave={e => (e.currentTarget.style.color = "var(--cs-fg-dim)")}
                  >
                    <Trash2 size={14} />
                  </Box>
                </Box>
              );
            })}

            {/* Footer row */}
            <Box style={{ padding: "16px 20px" }}>
              <Text style={{ fontSize: 11, color: "var(--cs-fg-dim)" }}>
                {history.length} scan{history.length !== 1 ? "s" : ""} · Stored locally in your browser
              </Text>
            </Box>
          </Stack>
        )}
      </Box>
    </Box>
  );
}
