import React, { useEffect, useState } from "react";
import { Box, Text, Stack } from "@mantine/core";
import { Moon, Sun, Trash2, Download, Check } from "lucide-react";
import { useTheme } from "./context/ThemeContext";
import { ARCHIVE_KEY } from "./ArchivePage";
import LandingNav from "./components/LandingNav";

const serif = "'Instrument Serif', Georgia, serif";

function SettingRow({ label, description, children }) {
  return (
    <Box
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "22px 0",
        borderBottom: "1px solid var(--cs-border)",
        gap: 24,
        flexWrap: "wrap",
      }}
    >
      <Box>
        <Text style={{ fontSize: 14, fontWeight: 600, color: "var(--cs-fg)", marginBottom: 3 }}>{label}</Text>
        <Text style={{ fontSize: 12, color: "var(--cs-fg-muted)", fontWeight: 300, lineHeight: 1.6 }}>{description}</Text>
      </Box>
      <Box style={{ flexShrink: 0 }}>{children}</Box>
    </Box>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <Box
      onClick={onChange}
      style={{
        width: 48,
        height: 26,
        borderRadius: 13,
        background: checked ? "var(--cs-fg)" : "var(--cs-border-med)",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s ease",
        flexShrink: 0,
        border: "1px solid var(--cs-border-med)",
      }}
    >
      <Box
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 24 : 3,
          width: 18,
          height: 18,
          borderRadius: "50%",
          background: checked ? "var(--cs-bg)" : "var(--cs-fg-muted)",
          transition: "left 0.2s ease, background 0.2s ease",
        }}
      />
    </Box>
  );
}

function Section({ title, children }) {
  return (
    <Box style={{ marginBottom: 48 }}>
      <Text style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--cs-fg-dim)", marginBottom: 4, paddingBottom: 12, borderBottom: "1px solid var(--cs-border)" }}>
        {title}
      </Text>
      {children}
    </Box>
  );
}

export default function SettingsPage() {
  const { dark, toggle } = useTheme();
  const [historyCount, setHistoryCount] = useState(0);
  const [cleared, setCleared] = useState(false);
  const [exported, setExported] = useState(false);

  useEffect(() => {
    document.title = "Settings — ComplyScan";
    try {
      const h = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]");
      setHistoryCount(h.length);
    } catch { setHistoryCount(0); }
  }, []);

  function clearHistory() {
    localStorage.removeItem(ARCHIVE_KEY);
    setHistoryCount(0);
    setCleared(true);
    setTimeout(() => setCleared(false), 2000);
  }

  function exportHistory() {
    try {
      const h = JSON.parse(localStorage.getItem(ARCHIVE_KEY) || "[]");
      const blob = new Blob([JSON.stringify(h, null, 2)], { type: "application/json" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `complyscan-history-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(a.href);
      setExported(true);
      setTimeout(() => setExported(false), 2000);
    } catch {}
  }

  return (
    <Box style={{ background: "var(--cs-bg)", minHeight: "100vh", color: "var(--cs-fg)" }}>
      <LandingNav />

      {/* Header */}
      <Box style={{ borderBottom: "1px solid var(--cs-border)", padding: "56px 0 40px" }}>
        <Box style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--cs-fg-dim)", marginBottom: 16 }}>
            Preferences
          </Text>
          <Text style={{ fontFamily: serif, fontStyle: "italic", fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 400, color: "var(--cs-fg)", lineHeight: 1, letterSpacing: "-0.02em" }}>
            Settings
          </Text>
        </Box>
      </Box>

      <Box style={{ maxWidth: 800, margin: "0 auto", padding: "48px 40px 80px" }}>

        {/* Appearance */}
        <Section title="Appearance">
          <SettingRow
            label="Dark Mode"
            description="Toggle between light and dark themes. Your preference is saved locally."
          >
            <Box style={{ display: "flex", alignItems: "center", gap: 10 }}>
              {dark ? <Moon size={15} color="var(--cs-fg-muted)" /> : <Sun size={15} color="var(--cs-fg-muted)" />}
              <Toggle checked={dark} onChange={toggle} />
            </Box>
          </SettingRow>
        </Section>

        {/* Data */}
        <Section title="Data & Privacy">
          <SettingRow
            label="Scan History"
            description={`${historyCount} scan${historyCount !== 1 ? "s" : ""} stored locally in your browser. No data is sent to any server.`}
          >
            <Box style={{ display: "flex", gap: 8 }}>
              <button
                onClick={exportHistory}
                style={{
                  background: "transparent",
                  border: "1px solid var(--cs-border-med)",
                  color: "var(--cs-fg-muted)",
                  padding: "8px 16px",
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
                  minWidth: 110,
                  justifyContent: "center",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "var(--cs-fg)"; e.currentTarget.style.color = "var(--cs-fg)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--cs-border-med)"; e.currentTarget.style.color = "var(--cs-fg-muted)"; }}
              >
                {exported ? <><Check size={12} /> Exported</> : <><Download size={12} /> Export</>}
              </button>
              <button
                onClick={clearHistory}
                disabled={historyCount === 0}
                style={{
                  background: "transparent",
                  border: "1px solid var(--cs-border-med)",
                  color: "var(--cs-fg-muted)",
                  padding: "8px 16px",
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  cursor: historyCount === 0 ? "not-allowed" : "pointer",
                  opacity: historyCount === 0 ? 0.4 : 1,
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  fontFamily: "Inter, system-ui, sans-serif",
                  transition: "all 0.15s",
                  minWidth: 100,
                  justifyContent: "center",
                }}
                onMouseEnter={e => { if (historyCount > 0) { e.currentTarget.style.borderColor = "#dc2626"; e.currentTarget.style.color = "#dc2626"; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "var(--cs-border-med)"; e.currentTarget.style.color = "var(--cs-fg-muted)"; }}
              >
                {cleared ? <><Check size={12} /> Cleared</> : <><Trash2 size={12} /> Clear</>}
              </button>
            </Box>
          </SettingRow>
        </Section>

        {/* About */}
        <Section title="About">
          <SettingRow label="Version" description="Current build of the ComplyScan client.">
            <Box style={{ border: "1px solid var(--cs-border)", padding: "5px 14px" }}>
              <Text style={{ fontSize: 12, fontWeight: 600, color: "var(--cs-fg-muted)", fontFamily: "monospace" }}>v2.0.0</Text>
            </Box>
          </SettingRow>
          <SettingRow label="Frameworks" description="Privacy regulations currently covered by ComplyScan.">
            <Box style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" }}>
              {["GDPR", "CCPA", "ePrivacy", "PECR"].map((f) => (
                <Box key={f} style={{ border: "1px solid var(--cs-border)", padding: "3px 10px" }}>
                  <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", color: "var(--cs-fg-muted)" }}>{f}</Text>
                </Box>
              ))}
            </Box>
          </SettingRow>
          <SettingRow label="Storage" description="All scan data stays on your device. Nothing is uploaded or tracked.">
            <Box style={{ background: "rgba(22,163,74,0.08)", border: "1px solid rgba(22,163,74,0.2)", padding: "5px 14px" }}>
              <Text style={{ fontSize: 11, fontWeight: 700, color: "#16a34a" }}>Local Only</Text>
            </Box>
          </SettingRow>
          <SettingRow label="Author" description="Built by Suhani Tyagi as an enterprise privacy tooling project.">
            <Text style={{ fontSize: 13, color: "var(--cs-fg-muted)" }}>Suhani Tyagi</Text>
          </SettingRow>
        </Section>
      </Box>
    </Box>
  );
}
