import React, { useState, useEffect } from "react";
import { Box, Text, Group } from "@mantine/core";
import { Link, useLocation } from "react-router-dom";
import { Search, Sun, Moon } from "lucide-react";
import { useTheme } from "../context/ThemeContext";

const NAV_LINKS = [
  { label: "Reports",    to: "/scan" },
  { label: "Archive",    to: "/archive" },
  { label: "Benchmarks", to: "/benchmarks" },
  { label: "Settings",   to: "/settings" },
];

export default function LandingNav({ showSearch = false }) {
  const [scrolled, setScrolled] = useState(false);
  const { dark, toggle } = useTheme();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navBg = scrolled
    ? "var(--cs-nav-blur)"
    : "var(--cs-bg)";

  return (
    <Box
      component="nav"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 200,
        background: navBg,
        backdropFilter: scrolled ? "blur(10px)" : "none",
        borderBottom: "1px solid var(--cs-border)",
        transition: "background 0.25s ease, border-color 0.2s ease",
      }}
    >
      <Box
        style={{
          maxWidth: 1280,
          margin: "0 auto",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 56,
        }}
      >
        {/* Logo */}
        <Link to="/" style={{ textDecoration: "none" }}>
          <Text
            style={{
              fontFamily: "Inter, system-ui, sans-serif",
              fontWeight: 800,
              fontSize: 14,
              letterSpacing: "0.2em",
              color: "var(--cs-fg)",
              textTransform: "uppercase",
              transition: "color 0.15s",
            }}
          >
            ComplyScan
          </Text>
        </Link>

        {/* Center nav links */}
        <Group gap={36}>
          {NAV_LINKS.map(({ label, to }) => {
            const active = location.pathname === to;
            return (
              <Link key={label} to={to} style={{ textDecoration: "none" }}>
                <Text
                  style={{
                    fontSize: 13,
                    fontWeight: active ? 600 : 400,
                    color: active ? "var(--cs-fg)" : "var(--cs-fg-muted)",
                    letterSpacing: "0.01em",
                    transition: "color 0.15s",
                    cursor: "pointer",
                    borderBottom: active ? "1px solid var(--cs-fg)" : "1px solid transparent",
                    paddingBottom: 1,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--cs-fg)")}
                  onMouseLeave={e => (e.currentTarget.style.color = active ? "var(--cs-fg)" : "var(--cs-fg-muted)")}
                >
                  {label}
                </Text>
              </Link>
            );
          })}
        </Group>

        {/* Right actions */}
        <Group gap={18} align="center">
          {showSearch && (
            <Box
              style={{ cursor: "pointer", color: "var(--cs-fg-muted)", display: "flex", alignItems: "center", transition: "color 0.15s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "var(--cs-fg)")}
              onMouseLeave={e => (e.currentTarget.style.color = "var(--cs-fg-muted)")}
            >
              <Search size={16} />
            </Box>
          )}

          {/* Dark mode toggle */}
          <Box
            onClick={toggle}
            style={{
              cursor: "pointer",
              color: "var(--cs-fg-muted)",
              display: "flex",
              alignItems: "center",
              transition: "color 0.15s",
              padding: "4px",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--cs-fg)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--cs-fg-muted)")}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={16} /> : <Moon size={16} />}
          </Box>

          <Link
            to="/scan"
            style={{
              background: "var(--cs-fg)",
              color: "var(--cs-bg)",
              padding: "8px 22px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              textDecoration: "none",
              transition: "opacity 0.15s",
              display: "inline-block",
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.82")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            Monitor
          </Link>
        </Group>
      </Box>
    </Box>
  );
}
