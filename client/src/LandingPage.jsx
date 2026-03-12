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
  ThemeIcon,
} from "@mantine/core";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { IconArrowRight, IconShieldCheck, IconLink, IconBolt, IconCheck } from "@tabler/icons-react";
import LandingNav from "./components/LandingNav";

const MotionDiv = motion.div;
const MotionCard = motion(Card);

/* ---------- Hoverable feature chip ---------- */
function FeatureChip({ children, color = "teal" }) {
  return (
    <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
      <Badge
        radius="xl"
        variant="outline"
        color={color}
        size="lg"
        leftSection={<IconCheck size={14} />}
        styles={{
          root: {
            background: "rgba(255, 255, 255, 0.9)",
            borderWidth: 1.5,
            paddingInline: 18,
            paddingBlock: 16,
            fontWeight: 600,
            textTransform: "none",
            boxShadow:
              "0 4px 12px rgba(20,184,166,.08), 0 2px 4px rgba(2,132,199,.04)",
            cursor: "default",
          },
        }}
      >
        {children}
      </Badge>
    </motion.div>
  );
}

/* ---------- “How it works” card ---------- */
function HowCard({ icon, title, desc, gradient }) {
  return (
    <MotionCard
      withBorder
      radius="xl"
      p="xl"
      shadow="sm"
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      styles={{
        root: {
          background: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(12px)",
          borderColor: "rgba(11, 138, 143, 0.15)",
        },
      }}
    >
      <Box
        style={{
          width: 56,
          height: 56,
          borderRadius: "16px",
          display: "grid",
          placeItems: "center",
          color: "#fff",
          background:
            gradient ||
            "linear-gradient(135deg, rgba(34,197,94,1) 0%, rgba(20,184,166,1) 100%)",
          boxShadow: "0 8px 18px rgba(20,184,166,.25)",
          marginBottom: 20,
        }}
      >
        {icon}
      </Box>

      <Text fw={800} fz="lg" mb={8} style={{ color: "#1e293b" }}>
        {title}
      </Text>
      <Text c="dimmed" fz="sm" lh={1.6}>{desc}</Text>
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
          "radial-gradient(circle at top right, #e0f2fe 0%, #ffffff 40%, #f8fafc 100%)",
      }}
    >
      {/* top nav */}
      <LandingNav />

      <Box component="main" style={{ flex: 1 }}>
        <Container size="lg" pt={{ base: 40, sm: 80 }} pb={{ base: 40, sm: 80 }}>
          {/* Hero */}
          <MotionDiv initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
            <Badge 
              variant="light" 
              color="teal" 
              size="lg" 
              radius="xl" 
              mb="xl" 
              style={{ display: "flex", margin: "0 auto", width: "fit-content", textTransform: "none", fontWeight: 600 }}
            >
              🚀 The #1 Privacy Compliance Scanner
            </Badge>

            <Title
              order={1}
              ta="center"
              fw={900}
              fz={{ base: 40, sm: 68 }}
              style={{ letterSpacing: "-0.03em", lineHeight: 1.1, color: "#0f172a" }}
            >
              Audit GDPR & CCPA Compliance
              <br />
              <Text component="span" variant="gradient" gradient={{ from: "#14f1d9", to: "#0b8a8f" }} inherit>
                in Minutes with ComplyScan
              </Text>
            </Title>

            <Text ta="center" fz="xl" maw={700} mx="auto" mt="xl" style={{ color: "#475569", lineHeight: 1.6 }}>
              Instantly detect missing consent banners, unauthorized trackers, and privacy policy gaps.
              Get a clear compliance score and actionable fixes fast.
            </Text>

            <Group justify="center" mt={40}>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  component={Link}
                  to="/scan"
                  radius="xl"
                  size="xl"
                  rightSection={<IconArrowRight size={20} />}
                  styles={{
                    root: {
                      background: "linear-gradient(90deg, #14f1d9 0%, #0b8a8f 100%)",
                      boxShadow: "0 10px 25px rgba(20, 241, 217, 0.3)",
                      border: "none",
                      color: "#fff",
                      fontWeight: 700,
                    },
                  }}
                >
                  Start Scanning Free
                </Button>
              </motion.div>
            </Group>

            {/* Hoverable chips */}
            <Group justify="center" gap="md" mt={48} p="xs">
              <FeatureChip color="teal">Consent Banner Detection</FeatureChip>
              <FeatureChip color="cyan">3rd-Party Tracker Mapping</FeatureChip>
              <FeatureChip color="indigo">Cookie Lifetime Checks</FeatureChip>
            </Group>
          </MotionDiv>

      
          <MotionDiv
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            style={{ marginTop: 80 }}
          >
            <Title order={2} ta="center" fw={800} mb={40} style={{ color: "#1e293b", fontSize: "2rem" }}>
              How It Works
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="xl">
              <HowCard
                icon={<IconLink size={28} stroke={2} />}
                title="1. Paste a URL"
                desc="Enter any public site. No installation needed. Our crawler automatically navigates through several pages of your site."
                gradient="linear-gradient(135deg, #14f1d9, #0b8a8f)"
              />
              <HowCard
                icon={<IconShieldCheck size={28} stroke={2} />}
                title="2. Automated Auditing"
                desc="We rigorously check for consent banners, third-party trackers, cookie lifespans, and standard privacy policy links."
                gradient="linear-gradient(135deg, #3b82f6, #4f46e5)"
              />
              <HowCard
                icon={<IconBolt size={28} stroke={2} />}
                title="3. Actionable Fixes"
                desc="Receive a simple compliance score along with prioritized, developer-friendly tips to secure your site quickly."
                gradient="linear-gradient(135deg, #f59e0b, #ef4444)"
              />
            </SimpleGrid>
          </MotionDiv>
        </Container>
      </Box>
    </Flex>
  );
}
