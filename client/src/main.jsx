import React from "react";
import ReactDOM from "react-dom/client";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import App from "./App";

// Mantine v7 styles
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <MantineProvider defaultColorScheme="light" theme={{ fontFamily: "Inter, system-ui, Arial" }}>
      <Notifications />
      <App />
    </MantineProvider>
  </React.StrictMode>
);
