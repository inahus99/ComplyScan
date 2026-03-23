import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import LandingPage from "./LandingPage";
import ScannerPage from "./ScannerPage";
import ArchivePage from "./ArchivePage";
import BenchmarkPage from "./BenchmarkPage";
import SettingsPage from "./SettingsPage";

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/"           element={<LandingPage />} />
          <Route path="/scan"       element={<ScannerPage />} />
          <Route path="/archive"    element={<ArchivePage />} />
          <Route path="/benchmarks" element={<BenchmarkPage />} />
          <Route path="/settings"   element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}
