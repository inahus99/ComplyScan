import React from "react";
import { Container, Group, Anchor, Button, Paper, Text, ActionIcon } from "@mantine/core";
import { Link } from "react-router-dom";
import { IconBrandGithub, IconBrandLinkedin } from "@tabler/icons-react";

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
        borderBottom: "1px solid rgba(0,0,0,0.05)",
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
              fw={500}
              style={{ textDecoration: "none", transition: "color 0.2s" }}
            >
              Home
            </Anchor>

            <Anchor
              href="/docs"
              c="gray.7"
              fw={500}
              style={{ textDecoration: "none", transition: "color 0.2s" }}
            >
              Docs
            </Anchor>

            {/* Social Icons */}
            <Group gap="xs" ml="sm" mr="sm">
              <ActionIcon
                component="a"
                href="https://github.com/inahus99"
                target="_blank"
                rel="noopener noreferrer"
                variant="subtle"
                color="gray"
                size="lg"
                radius="xl"
              >
                <IconBrandGithub size={20} stroke={1.5} />
              </ActionIcon>
              <ActionIcon
                component="a"
                href="https://linkedin.com/in/inahus99" // Updated to generic placeholder or standard mapping
                target="_blank"
                rel="noopener noreferrer"
                variant="subtle"
                color="gray"
                size="lg"
                radius="xl"
              >
                <IconBrandLinkedin size={20} stroke={1.5} />
              </ActionIcon>
            </Group>

            <Button
              component={Link}
              to="/scan"
              radius="xl"
              size="sm"
              variant="gradient"
              gradient={{ from: "#14f1d9", to: "#0b8a8f" }}
              style={{
                boxShadow: "0 4px 14px rgba(20, 241, 217, 0.4)",
              }}
            >
              Run a Free Scan
            </Button>
          </Group>
        </Group>
      </Container>
    </Paper>
  );
}