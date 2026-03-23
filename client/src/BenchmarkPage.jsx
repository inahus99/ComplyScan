import React, { useEffect } from "react";
import { Box, Text, Group, SimpleGrid } from "@mantine/core";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import LandingNav from "./components/LandingNav";

const serif = "'Instrument Serif', Georgia, serif";

const SECTORS = [
  {
    name: "Finance & Banking",
    avg: 89,
    desc: "Heavily regulated. GDPR Article 6(1)(b) often invoked for contract basis. Consent banners nearly universal.",
    trend: "up",
    trackers: 3,
    cookies: 18,
    top: ["HSBC", "Barclays", "Monzo"],
  },
  {
    name: "SaaS & Tech",
    avg: 81,
    desc: "Generally strong on policy documentation. Common gaps: analytics consent and third-party SDK disclosures.",
    trend: "up",
    trackers: 8,
    cookies: 24,
    top: ["Notion", "Linear", "Vercel"],
  },
  {
    name: "E-commerce",
    avg: 72,
    desc: "High tracker density from ad networks. Consent banners often dark-patterned or missing on sub-pages.",
    trend: "stable",
    trackers: 14,
    cookies: 42,
    top: ["ASOS", "Zalando", "Shopify"],
  },
  {
    name: "Media & Publishing",
    avg: 68,
    desc: "Highest tracker count across sectors. Ad revenue dependency leads to frequent ePrivacy non-compliance.",
    trend: "down",
    trackers: 22,
    cookies: 67,
    top: ["Guardian", "Forbes", "Daily Mail"],
  },
  {
    name: "Healthcare",
    avg: 85,
    desc: "HIPAA plus GDPR Article 9 (special category data). Minimal analytics usage, strong default privacy posture.",
    trend: "up",
    trackers: 2,
    cookies: 9,
    top: ["NHS", "Bupa", "Babylon"],
  },
  {
    name: "Travel & Hospitality",
    avg: 64,
    desc: "Global audiences create jurisdiction complexity. Retargeting pixels common, consent often missing or non-compliant.",
    trend: "down",
    trackers: 18,
    cookies: 55,
    top: ["Booking.com", "Airbnb", "BA"],
  },
];

const FRAMEWORKS = [
  { name: "GDPR",     region: "European Union",     year: 2018, fine: "€20M / 4% revenue",    color: "#2563eb" },
  { name: "CCPA",     region: "California, USA",     year: 2020, fine: "$7,500 / intentional",  color: "#7c3aed" },
  { name: "ePrivacy", region: "European Union",     year: 2002, fine: "Varies by member state", color: "#059669" },
  { name: "PECR",     region: "United Kingdom",     year: 2003, fine: "£500K ICO",              color: "#dc2626" },
  { name: "PIPEDA",   region: "Canada",             year: 2001, fine: "$100K CAD",              color: "#d97706" },
  { name: "LGPD",     region: "Brazil",             year: 2020, fine: "2% revenue / R$50M",     color: "#0891b2" },
];

function scoreColor(s) {
  return s >= 80 ? "#16a34a" : s >= 50 ? "#d97706" : "#dc2626";
}

function ScoreBar({ score, animated = true }) {
  const color = scoreColor(score);
  return (
    <Box style={{ position: "relative", height: 6, background: "var(--cs-border)", overflow: "hidden", marginTop: 10 }}>
      <Box
        style={{
          position: "absolute",
          left: 0, top: 0, bottom: 0,
          width: `${score}%`,
          background: color,
          transition: "width 1s cubic-bezier(0.16,1,0.3,1)",
        }}
      />
    </Box>
  );
}

function TrendIcon({ trend }) {
  if (trend === "up")     return <TrendingUp size={13}  color="#16a34a" />;
  if (trend === "down")   return <TrendingDown size={13} color="#dc2626" />;
  return <Minus size={13} color="#d97706" />;
}

export default function BenchmarkPage() {
  useEffect(() => { document.title = "Benchmarks — ComplyScan"; }, []);

  return (
    <Box style={{ background: "var(--cs-bg)", minHeight: "100vh", color: "var(--cs-fg)" }}>
      <LandingNav />

      {/* Header */}
      <Box style={{ borderBottom: "1px solid var(--cs-border)", padding: "56px 0 40px" }}>
        <Box style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", textTransform: "uppercase", color: "var(--cs-fg-dim)", marginBottom: 16 }}>
            Industry Data
          </Text>
          <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
            <Text style={{ fontFamily: serif, fontStyle: "italic", fontSize: "clamp(40px, 6vw, 64px)", fontWeight: 400, color: "var(--cs-fg)", lineHeight: 1, letterSpacing: "-0.02em" }}>
              Benchmarks
            </Text>
            <Text style={{ fontSize: 14, color: "var(--cs-fg-muted)", maxWidth: 400, lineHeight: 1.7, fontWeight: 300 }}>
              How privacy compliance scores compare across sectors, based on aggregated audit data.
            </Text>
          </Box>
        </Box>
      </Box>

      <Box style={{ maxWidth: 1280, margin: "0 auto", padding: "48px 40px 80px" }}>

        {/* ── Sector benchmarks ── */}
        <Box style={{ marginBottom: 72 }}>
          <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--cs-fg-dim)", marginBottom: 32 }}>
            By Sector
          </Text>
          <SimpleGrid cols={{ base: 1, md: 2, lg: 3 }} spacing={0} style={{ border: "1px solid var(--cs-border)" }}>
            {SECTORS.map((s, i) => {
              const color = scoreColor(s.avg);
              const col = i % 3;
              const row = Math.floor(i / 3);
              return (
                <Box
                  key={s.name}
                  style={{
                    padding: "32px 28px",
                    borderRight: col < 2 ? "1px solid var(--cs-border)" : undefined,
                    borderBottom: row < Math.floor((SECTORS.length - 1) / 3) ? "1px solid var(--cs-border)" : undefined,
                    transition: "background 0.15s",
                    background: "var(--cs-bg-card)",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = "var(--cs-hover-bg)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "var(--cs-bg-card)")}
                >
                  <Box style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                    <Text style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--cs-fg-muted)" }}>
                      {s.name}
                    </Text>
                    <TrendIcon trend={s.trend} />
                  </Box>

                  <Box style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 4 }}>
                    <Text style={{ fontFamily: serif, fontStyle: "italic", fontSize: 52, fontWeight: 400, color, lineHeight: 1 }}>
                      {s.avg}
                    </Text>
                    <Text style={{ fontSize: 13, color: "var(--cs-fg-muted)", fontWeight: 400 }}>/100</Text>
                  </Box>

                  <ScoreBar score={s.avg} />

                  <Text style={{ fontSize: 12, color: "var(--cs-fg-muted)", lineHeight: 1.7, marginTop: 16, marginBottom: 16, fontWeight: 300 }}>
                    {s.desc}
                  </Text>

                  <Box style={{ display: "flex", gap: 16, borderTop: "1px solid var(--cs-border)", paddingTop: 14 }}>
                    <Box>
                      <Text style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--cs-fg-dim)", marginBottom: 2 }}>Avg Trackers</Text>
                      <Text style={{ fontSize: 16, fontWeight: 700, color: "var(--cs-fg)" }}>{s.trackers}</Text>
                    </Box>
                    <Box>
                      <Text style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--cs-fg-dim)", marginBottom: 2 }}>Avg Cookies</Text>
                      <Text style={{ fontSize: 16, fontWeight: 700, color: "var(--cs-fg)" }}>{s.cookies}</Text>
                    </Box>
                  </Box>
                </Box>
              );
            })}
          </SimpleGrid>
        </Box>

        {/* ── Overall industry average ── */}
        <Box style={{ border: "1px solid var(--cs-border)", marginBottom: 72, padding: "40px 40px", display: "flex", gap: 48, alignItems: "center", flexWrap: "wrap", background: "var(--cs-bg-card)" }}>
          <Box>
            <Text style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--cs-fg-dim)", marginBottom: 8 }}>
              Global Average Score
            </Text>
            <Text style={{ fontFamily: serif, fontStyle: "italic", fontSize: 80, fontWeight: 400, color: "var(--cs-fg)", lineHeight: 1, letterSpacing: "-0.03em" }}>
              76
            </Text>
          </Box>
          <Box style={{ flex: 1, minWidth: 260 }}>
            <Text style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--cs-fg-dim)", marginBottom: 16 }}>
              Score Distribution
            </Text>
            {[
              { label: "80–100 Compliant",  pct: 38, color: "#16a34a" },
              { label: "50–79  Needs Work", pct: 44, color: "#d97706" },
              { label: "0–49   At Risk",    pct: 18, color: "#dc2626" },
            ].map(({ label, pct, color }) => (
              <Box key={label} style={{ marginBottom: 10 }}>
                <Box style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                  <Text style={{ fontSize: 11, fontFamily: "monospace", color: "var(--cs-fg-muted)" }}>{label}</Text>
                  <Text style={{ fontSize: 11, fontWeight: 700, color }}>{pct}%</Text>
                </Box>
                <Box style={{ height: 4, background: "var(--cs-border)", overflow: "hidden" }}>
                  <Box style={{ height: "100%", width: `${pct}%`, background: color }} />
                </Box>
              </Box>
            ))}
          </Box>
          <Box style={{ borderLeft: "1px solid var(--cs-border)", paddingLeft: 40, minWidth: 200 }}>
            <Text style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--cs-fg-dim)", marginBottom: 16 }}>
              Common Failures
            </Text>
            {[
              { label: "Missing consent banner", pct: 61 },
              { label: "Undisclosed trackers",   pct: 54 },
              { label: "Excessive cookie lifetime", pct: 43 },
              { label: "Incomplete privacy policy", pct: 37 },
            ].map(({ label, pct }) => (
              <Box key={label} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, gap: 12 }}>
                <Text style={{ fontSize: 12, color: "var(--cs-fg-muted)" }}>{label}</Text>
                <Text style={{ fontSize: 12, fontWeight: 700, color: "var(--cs-fg)", flexShrink: 0 }}>{pct}%</Text>
              </Box>
            ))}
          </Box>
        </Box>

        {/* ── Frameworks ── */}
        <Box>
          <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.3em", textTransform: "uppercase", color: "var(--cs-fg-dim)", marginBottom: 32 }}>
            Regulatory Frameworks
          </Text>
          <Box style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 0, border: "1px solid var(--cs-border)" }}>
            {FRAMEWORKS.map((f, i) => (
              <Box
                key={f.name}
                style={{
                  padding: "28px 24px",
                  borderRight: (i % 3 !== 2) ? "1px solid var(--cs-border)" : undefined,
                  borderBottom: i < FRAMEWORKS.length - (FRAMEWORKS.length % 3 || 3) ? "1px solid var(--cs-border)" : undefined,
                  background: "var(--cs-bg-card)",
                  transition: "background 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--cs-hover-bg)")}
                onMouseLeave={e => (e.currentTarget.style.background = "var(--cs-bg-card)")}
              >
                <Box style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
                  <Box style={{ width: 4, height: 28, background: f.color, flexShrink: 0 }} />
                  <Text style={{ fontFamily: serif, fontStyle: "italic", fontSize: 26, fontWeight: 400, color: "var(--cs-fg)", lineHeight: 1 }}>
                    {f.name}
                  </Text>
                </Box>
                <Text style={{ fontSize: 11, color: "var(--cs-fg-muted)", marginBottom: 14 }}>{f.region} · Since {f.year}</Text>
                <Box style={{ background: "var(--cs-hover-bg)", border: "1px solid var(--cs-border)", padding: "8px 12px" }}>
                  <Text style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--cs-fg-dim)", marginBottom: 3 }}>Max Penalty</Text>
                  <Text style={{ fontSize: 12, fontWeight: 600, color: "var(--cs-fg)" }}>{f.fine}</Text>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
