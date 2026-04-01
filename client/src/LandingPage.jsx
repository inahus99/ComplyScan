import React, { useEffect } from "react";
import { Box, Text, Group, SimpleGrid } from "@mantine/core";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Eye, Link2, Cookie, FileText, BarChart3,
  Globe, Activity, Code2,
} from "lucide-react";
import LandingNav from "./components/LandingNav";

const Div = motion.div;
const serif = "'Instrument Serif', Georgia, serif";

/* ─── Feature pill ──────────────────────────────────────────────────────── */
function Pill({ icon: Icon, label }) {
  return (
    <Group
      gap={7}
      style={{
        border: "1px solid var(--cs-border-med)",
        padding: "6px 16px",
        cursor: "default",
        transition: "border-color 0.2s, background 0.2s",
        userSelect: "none",
        background: "var(--cs-bg-card)",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = "var(--cs-fg)";
        e.currentTarget.style.background = "var(--cs-hover-bg)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = "var(--cs-border-med)";
        e.currentTarget.style.background = "var(--cs-bg-card)";
      }}
    >
      <Icon size={12} color="var(--cs-fg-muted)" strokeWidth={2} />
      <Text style={{ fontSize: 12, fontWeight: 500, color: "var(--cs-fg-muted)", letterSpacing: "0.01em" }}>
        {label}
      </Text>
    </Group>
  );
}

/* ─── How-it-works card ─────────────────────────────────────────────────── */
function StepCard({ step, icon: Icon, title, desc, delay }) {
  return (
    <Div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.55, delay, ease: "easeOut" }}
      style={{ height: "100%" }}
    >
      <Box
        style={{
          padding: "36px 32px",
          height: "100%",
          transition: "box-shadow 0.2s",
          background: "var(--cs-bg-card)",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = `4px 4px 0 var(--cs-fg)`;
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <Text
          style={{
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.35em",
            color: "var(--cs-fg-dim)",
            textTransform: "uppercase",
            marginBottom: 20,
          }}
        >
          Step 0{step}
        </Text>
        <Box
          style={{
            width: 40,
            height: 40,
            border: "1px solid var(--cs-border-med)",
            display: "grid",
            placeItems: "center",
            marginBottom: 24,
          }}
        >
          <Icon size={18} strokeWidth={1.5} color="var(--cs-fg)" />
        </Box>
        <Text
          style={{
            fontFamily: serif,
            fontStyle: "italic",
            fontSize: 22,
            fontWeight: 400,
            color: "var(--cs-fg)",
            marginBottom: 12,
            lineHeight: 1.3,
          }}
        >
          {title}
        </Text>
        <Text style={{ fontSize: 14, color: "var(--cs-fg-muted)", lineHeight: 1.8, fontWeight: 300 }}>
          {desc}
        </Text>
      </Box>
    </Div>
  );
}

/* ─── Main page ─────────────────────────────────────────────────────────── */
export default function LandingPage() {
  useEffect(() => { document.title = "ComplyScan — Privacy Compliance Scanner"; }, []);

  return (
    <Box style={{ background: "var(--cs-bg)", minHeight: "100vh", color: "var(--cs-fg)" }}>
      <LandingNav />

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <Box
        style={{
          borderBottom: "1px solid var(--cs-border)",
          paddingTop: 80,
          paddingBottom: 96,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Subtle grid background */}
        <Box
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "linear-gradient(var(--cs-grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--cs-grid-line) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            pointerEvents: "none",
          }}
        />

        <Box style={{ maxWidth: 800, margin: "0 auto", padding: "0 32px", position: "relative" }}>
          <Div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <Text
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: 18,
                fontWeight: 400,
                color: "var(--cs-fg-muted)",
                marginBottom: 28,
              }}
            >
              The #1 Privacy Compliance Scanner
            </Text>
          </Div>

          <Div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
            <Text
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(48px, 8vw, 88px)",
                fontWeight: 400,
                color: "var(--cs-fg)",
                lineHeight: 1.0,
                letterSpacing: "-0.02em",
                marginBottom: 36,
              }}
            >
              Audit GDPR &amp; CCPA
              <br />
              Compliance in Minutes
            </Text>
          </Div>

          <Div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.25 }}>
            <Text
              style={{
                fontSize: 16,
                color: "var(--cs-fg-muted)",
                lineHeight: 1.75,
                fontWeight: 300,
                maxWidth: 520,
                margin: "0 auto 48px",
              }}
            >
              Automate your privacy forensics with an editorial eye for detail.
              ComplyScan dissects data flows, identifies vulnerabilities, and
              generates boardroom-ready documentation without the noise.
            </Text>
          </Div>

          <Div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
            <Group justify="center" gap={16} align="center" wrap="wrap">
              <motion.div whileTap={{ scale: 0.97 }}>
                <Link
                  to="/scan"
                  style={{
                    background: "var(--cs-fg)",
                    color: "var(--cs-bg)",
                    padding: "16px 36px",
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.25em",
                    textTransform: "uppercase",
                    textDecoration: "none",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    transition: "opacity 0.15s",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                  onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                >
                  Start Scanning
                  <ArrowRight size={14} />
                </Link>
              </motion.div>

              <Group gap={10}>
                {["GDPR Ready", "CCPA Verified"].map((b) => (
                  <Box
                    key={b}
                    style={{
                      border: "1px solid var(--cs-border-strong)",
                      padding: "6px 14px",
                    }}
                  >
                    <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "var(--cs-fg-muted)" }}>
                      {b}
                    </Text>
                  </Box>
                ))}
              </Group>
            </Group>
          </Div>
        </Box>
      </Box>

      {/* ── Feature strip ───────────────────────────────────────────────── */}
      <Box style={{ borderBottom: "1px solid var(--cs-border)", padding: "18px 0", background: "var(--cs-bg-alt)" }}>
        <Box style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <Group justify="center" gap={10} wrap="wrap">
            <Pill icon={Eye} label="Banner Detection" />
            <Pill icon={Link2} label="Tracker Mapping" />
            <Pill icon={Cookie} label="Cookie Lifetimes" />
            <Pill icon={FileText} label="Policy Checks" />
            <Pill icon={BarChart3} label="Live Scoring" />
          </Group>
        </Box>
      </Box>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <Box style={{ padding: "100px 0", background: "var(--cs-bg)" }}>
        <Box style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <Box style={{ marginBottom: 72 }}>
            <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.4em", color: "var(--cs-fg-dim)", textTransform: "uppercase", marginBottom: 16 }}>
              Workflow
            </Text>
            <Text
              style={{
                fontFamily: serif,
                fontStyle: "italic",
                fontSize: "clamp(36px, 5vw, 56px)",
                fontWeight: 400,
                color: "var(--cs-fg)",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                marginBottom: 16,
              }}
            >
              Radically simple auditing.
            </Text>
            <Text style={{ fontSize: 16, color: "var(--cs-fg-muted)", fontWeight: 300, lineHeight: 1.7, maxWidth: 480 }}>
              Zero configuration required. Input your URL and our engine maps your entire privacy footprint.
            </Text>
          </Box>

          <SimpleGrid cols={{ base: 1, md: 3 }} spacing={0}>
            <Box style={{ border: "1px solid var(--cs-fg)", height: "100%", display: "flex", flexDirection: "column" }}>
              <StepCard step={1} delay={0} icon={Globe} title="Global Scanning" desc="Enter any web property. Our headless browser navigates through your site just like a real user, collecting data across every route." />
            </Box>
            <Box style={{ border: "1px solid var(--cs-fg)", marginLeft: -1, height: "100%", display: "flex", flexDirection: "column" }}>
              <StepCard step={2} delay={0.1} icon={Activity} title="Deep Analysis" desc="We parse raw traffic, identifying hidden HTTP requests, iframe injections, and shadow third-party dependencies." />
            </Box>
            <Box style={{ border: "1px solid var(--cs-fg)", marginLeft: -1, height: "100%", display: "flex", flexDirection: "column" }}>
              <StepCard step={3} delay={0.2} icon={Code2} title="Actionable Reports" desc="Get an exact breakdown of non-compliant scripts, complete with remediation snippets and full legal context." />
            </Box>
          </SimpleGrid>
        </Box>
      </Box>

      {/* ── Stats row ───────────────────────────────────────────────────── */}
      <Box style={{ borderTop: "1px solid var(--cs-border)", borderBottom: "1px solid var(--cs-border)", background: "var(--cs-bg)" }}>
        <Box style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <SimpleGrid cols={{ base: 2, md: 4 }} spacing={0}>
            {[
              { val: "4+",   label: "Frameworks Covered" },
              { val: "100ms",label: "Avg Scan Time" },
              { val: "GDPR", label: "EU Compliant" },
              { val: "Free", label: "No Credit Card" },
            ].map(({ val, label }, i) => (
              <Box
                key={label}
                style={{
                  padding: "52px 32px",
                  borderLeft: i > 0 ? "1px solid var(--cs-border)" : undefined,
                  textAlign: "center",
                }}
              >
                <Text style={{ fontFamily: serif, fontStyle: "italic", fontSize: 44, fontWeight: 400, color: "var(--cs-fg)", lineHeight: 1, marginBottom: 10, letterSpacing: "-0.02em" }}>
                  {val}
                </Text>
                <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--cs-fg-dim)" }}>
                  {label}
                </Text>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Box>

      {/* ── Light CTA ────────────────────────────────────────────────────── */}
      <Box style={{ background: "var(--cs-bg-alt)", padding: "100px 0", borderTop: "1px solid var(--cs-border)" }}>
        <Box style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <Div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, ease: "easeOut" }}>
            <Group justify="space-between" align="flex-end" wrap="wrap" gap={48}>
              <Box>
                <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.35em", color: "var(--cs-fg-dim)", textTransform: "uppercase", marginBottom: 20 }}>
                  Get Started
                </Text>
                <Text style={{ fontFamily: serif, fontStyle: "italic", fontSize: "clamp(40px, 6vw, 72px)", fontWeight: 400, color: "var(--cs-fg)", lineHeight: 1.0, letterSpacing: "-0.025em", marginBottom: 20 }}>
                  Secure your site
                  <br />today.
                </Text>
                <Text style={{ fontSize: 15, color: "var(--cs-fg-muted)", lineHeight: 1.75, fontWeight: 300, maxWidth: 440 }}>
                  Don't wait for auditors to find gaps in your privacy compliance.
                  Scan your platform for free in under two minutes.
                </Text>
              </Box>
              <Box>
                <motion.div whileTap={{ scale: 0.97 }}>
                  <Link
                    to="/scan"
                    style={{
                      background: "var(--cs-fg)",
                      color: "var(--cs-bg)",
                      padding: "18px 44px",
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.25em",
                      textTransform: "uppercase",
                      textDecoration: "none",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 12,
                      transition: "opacity 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.opacity = "0.9")}
                    onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
                  >
                    Run Compliance Scan <ArrowRight size={15} />
                  </Link>
                </motion.div>
                <Text style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "var(--cs-fg-dim)", marginTop: 16, textAlign: "center" }}>
                  Free · No credit card · Instant results
                </Text>
              </Box>
            </Group>
          </Div>
        </Box>
      </Box>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <Box style={{ borderTop: "1px solid var(--cs-border)", padding: "28px 0", background: "var(--cs-bg)" }}>
        <Box style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <Text style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--cs-fg)" }}>
            ComplyScan
          </Text>
          <Text style={{ fontSize: 11, fontWeight: 500, color: "var(--cs-fg-dim)", letterSpacing: "0.08em" }}>
            © {new Date().getFullYear()} Suhani Tyagi · Enterprise Privacy Tools
          </Text>
        </Box>
      </Box>
    </Box>
  );
}
