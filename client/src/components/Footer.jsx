import React from "react";
import { Container, Group, Text, Box } from "@mantine/core";

export default function Footer({ fixed = false }) {
  return (
    <Box
      component="footer"
      style={{
        position: fixed ? "fixed" : "static",
        left: 0, right: 0,
        bottom: fixed ? 0 : "auto",
        background: "var(--cs-bg-card)",
        borderTop: "1px solid var(--cs-border)",
        zIndex: 20,
      }}
    >
      <Container size="xl">
        <Group justify="space-between" align="center" py="md" wrap="wrap" gap="xs">
          <Group gap={8}>
            <Box style={{ width: 18, height: 18, background: "var(--cs-invert-bg)", display: "grid", placeItems: "center" }}>
              <Box style={{ width: 7, height: 7, background: "var(--cs-invert-fg)" }} />
            </Box>
            <Text fz="xs" fw={700} c="var(--cs-fg)" style={{ letterSpacing: "0.15em", textTransform: "uppercase" }}>
              ComplyScan
            </Text>
          </Group>
          <Text c="var(--cs-fg-dim)" fz={11} fw={700} style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}>
            © {new Date().getFullYear()} Suhani Tyagi · All rights reserved
          </Text>
        </Group>
      </Container>
    </Box>
  );
}
