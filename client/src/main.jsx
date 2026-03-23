import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider, createTheme } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import App from "./App";

import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "./theme.css";

const theme = createTheme({
  primaryColor: "green",
  fontFamily: "Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', 'Fira Code', monospace",
  headings: {
    fontFamily: "Inter, system-ui, sans-serif",
    fontWeight: "800",
  },
  defaultRadius: "md",
  colors: {
    green: [
      "#f0fdf4",
      "#dcfce7",
      "#bbf7d0",
      "#86efac",
      "#4ade80",
      "#22c55e",
      "#16a34a",
      "#059669",
      "#047857",
      "#065f46",
    ],
  },
  components: {
    Button: { defaultProps: { radius: "md" } },
    Card:   { defaultProps: { radius: "lg" } },
    TextInput: { defaultProps: { radius: "md" } },
    Badge: { defaultProps: { radius: "md" } },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light" theme={theme}>
      <Notifications position="top-right" />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
