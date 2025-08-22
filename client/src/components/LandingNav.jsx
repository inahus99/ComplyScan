import React from "react";
import { Container, Group, Anchor, Button, Paper, Text } from "@mantine/core";
import { Link } from "react-router-dom";

export default function LandingNav() {
  return (
    <Paper
      withBorder={false}
      shadow="xs"
      radius={0}
      style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(8px)",
      }}
    >
      <Container size="lg" py="sm">
        <Group justify="space-between" align="center">
          <Anchor
            component={Link}
            to="/"
            underline="never"
            style={{ textDecoration: "none" }}
          >
            {/* Gradient updated to match  image */}
            <Text
              size="xl"
              fw={900}
              variant="gradient"
              gradient={{ from: "#14f1d9", to: "#0b8a8f", deg: 45 }}
            >
              ComplyScan
            </Text>
          </Anchor>

          <Group gap="lg" align="center">
            <Anchor
              component={Link}
              to="/"
              c="gray.7"
              style={{ textDecoration: "none" }}
            >
              Home
            </Anchor>

            <Anchor
              href="/docs"
              c="gray.7"
              style={{ textDecoration: "none" }}
            >
              Docs
            </Anchor>

            <Button
              component={Link}
              to="/scan"
              radius="xl"
              size="sm"
              variant="gradient"
              gradient={{ from: "#14f1d9", to: "#0b8a8f" }}
            >
              Run a Free Scan
            </Button>
          </Group>
        </Group>
      </Container>
    </Paper>
  );
}