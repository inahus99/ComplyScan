// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./LandingPage";
import ScannerPage from "./ScannerPage";
import Footer from "./components/Footer";

function AppShell() {
  const location = useLocation();
  const isLanding = location.pathname === "/";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <div style={{ flex: 1, minHeight: 0 }}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/scan" element={<ScannerPage />} />
        </Routes>
      </div>
    
      <Footer fixed={isLanding} blend={isLanding} />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
