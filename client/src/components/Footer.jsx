
import React from "react";
import { Container, Center, Text, Anchor } from "@mantine/core";

export default function Footer({ fixed = false, blend = false }) {
  return (
    <footer
      style={{
        position: fixed ? "fixed" : "static",
        left: 0,
        right: 0,
        bottom: fixed ? 0 : "auto",
        background: blend ? "transparent" : "#fff", 
        borderTop: blend ? "none" : "1px solid #eef0f3",
        zIndex: 20,
     
        paddingBottom: fixed ? "env(safe-area-inset-bottom)" : undefined,
      }}
    >
     <Container size="lg">
  <Center py="md">
    <Text c="dimmed" fz="sm">
      © 2025 <Anchor href="https://github.com/inahus99/ComplyScan" target="_blank">Suhani Tyagi</Anchor>. All Rights Reserved.
    </Text>
  </Center>
</Container>
    </footer>
  );
}
