import React, { useEffect } from "react";
import {
  Container,
  Title,
  Text,
  Button,
  Group,
  Badge,
  Card,
  Box,
  Flex,
  SimpleGrid,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import LandingNav from "./components/LandingNav";

const MotionDiv = motion.div;
const MotionCard = motion(Card);

/* ---------- Hoverable feature chip ---------- */
function FeatureChip({ children, color = "teal" }) {
  return (
    <motion.div whileHover={{ scale: 1.05, y: -1 }} whileTap={{ scale: 0.98 }}>
      <Badge
        radius="xl"
        variant="outline"
        color={color}
        styles={{
          root: {
            background: "#fff",
            borderWidth: 2,
            paddingInline: 14,
            fontWeight: 600,
            boxShadow:
              "0 0 0 1px rgba(20,184,166,.08), 0 4px 12px rgba(2,132,199,.08)",
          },
        }}
      >
        {children}
      </Badge>
    </motion.div>
  );
}

/* ---------- “How it works” card ---------- */
function HowCard({ emoji, title, desc, gradient }) {
  return (
    <MotionCard
      withBorder
      radius="xl"
      p="lg"
      shadow="sm"
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      styles={{
        root: {
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(8px)",
          borderColor: "rgba(2,132,199,.15)",
        },
      }}
    >
      <Box
        style={{
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "grid",
          placeItems: "center",
          color: "#fff",
          fontSize: 24,
          background:
            gradient ||
            "linear-gradient(135deg, rgba(34,197,94,1) 0%, rgba(20,184,166,1) 100%)",
          boxShadow: "0 8px 18px rgba(20,184,166,.25)",
          marginBottom: 12,
        }}
      >
        {emoji}
      </Box>

      <Text fw={700} mb={4}>
        {title}
      </Text>
      <Text c="dimmed" fz="sm">{desc}</Text>
    </MotionCard>
  );
}

export default function LandingPage() {
  useEffect(() => {
    document.title = "ComplyScan — GDPR/CCPA Compliance in Minutes";
  }, []);

  return (
    <Flex
      direction="column"
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
        background:
          "linear-gradient(180deg, #ffffff 0%, #f9fbff 55%, #f1f5ff 100%)",
      }}
    >
      {/* top nav */}
      <LandingNav />

      <Box component="main" style={{ flex: 1 }}>
        <Container size="lg" pt={{ base: 28, sm: 56 }} pb={{ base: 36, sm: 72 }}>
          {/* Hero */}
          <MotionDiv initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Title
              order={1}
              ta="center"
              fw={900}
              fz={{ base: 36, sm: 60 }}
              style={{ letterSpacing: "-0.03em", lineHeight: 1.12 }}
            >
              Audit GDPR/CCPA Compliance
              <br />
              <Text component="span" variant="gradient" gradient={{ from: "teal", to: "cyan" }} inherit>
                in Minutes with ComplyScan
              </Text>
            </Title>

            <Text c="dimmed" ta="center" fz="lg" maw={800} mx="auto" mt="md">
              Detect missing consent banners, unauthorized trackers, and privacy policy gaps.
              Get a clear score and actionable fixes fast.
            </Text>

            <Group justify="center" mt="lg">
              <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.98 }}>
                <Button
                  component={Link}
                  to="/scan"
                  radius="xl"
                  size="lg"
                  px={30}
                  styles={{
                    root: {
                      background: "linear-gradient(90deg, #22c55e 0%, #14b8a6 100%)",
                      boxShadow: "0 8px 20px rgba(20,184,166,.25), 0 2px 6px rgba(34,197,94,.18)",
                    },
                  }}
                >
                  Run Your Free Scan
                </Button>
              </motion.div>
            </Group>

            {/* Hoverable chips */}
            <Group justify="center" gap="sm" mt="lg" p="xs">
              <FeatureChip color="teal">Consent Banner Detection</FeatureChip>
              <FeatureChip color="cyan">3rd-Party Tracker Mapping</FeatureChip>
              <FeatureChip color="indigo">Cookie Lifetime Checks</FeatureChip>
            </Group>
          </MotionDiv>

      
          <MotionDiv
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            style={{ marginTop: 36 }}
          >
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <HowCard
                emoji="🔗"
                title="1. Paste a URL"
                desc="Enter any public site. No install needed. We crawl a few pages automatically."
                gradient="linear-gradient(135deg,#22c55e,#14b8a6)"
              />
              <HowCard
                emoji="🛡️"
                title="2. We detect issues"
                desc="Consent banners, third-party trackers, cookie lifetimes, and policy links are all checked."
                gradient="linear-gradient(135deg,#06b6d4,#6366f1)"
              />
              <HowCard
                emoji="⚡"
                title="3. Get quick fixes"
                desc="A simple score and prioritized tips to ship compliance fast."
                gradient="linear-gradient(135deg,#f59e0b,#ef4444)"
              />
            </SimpleGrid>
          </MotionDiv>
        </Container>
      </Box>
    </Flex>
  );
}
