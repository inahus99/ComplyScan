const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, 'client/src/ScannerPage.jsx');
let content = fs.readFileSync(targetPath, 'utf8');

// Color constants
content = content.replace(/const GREEN = "#059669";/g, 'const GREEN = "#818cf8";');
content = content.replace(/const GREEN_L = "#f0fdf4";/g, 'const GREEN_L = "rgba(99, 102, 241, 0.1)";');
content = content.replace(/const GREEN_B = "#bbf7d0";/g, 'const GREEN_B = "rgba(99, 102, 241, 0.2)";');

// Backgrounds
content = content.replace(/background: "#f9fafb"/g, 'background: "#020617"');
content = content.replace(/background: "rgba\\(255,255,255,0.98\\)"/g, 'background: "rgba(2, 6, 23, 0.85)"');
content = content.replace(/background: "#ffffff"/g, 'background: "#0f172a"');
content = content.replace(/background: "#fff"/g, 'background: "#0f172a"');
content = content.replace(/bg="gray.0"/g, 'bg="#0f172a"');
content = content.replace(/background: "#f0fdf4"/g, 'background: "rgba(99, 102, 241, 0.1)"');
content = content.replace(/background: "#dcfce7"/g, 'background: "rgba(99, 102, 241, 0.15)"');

// Borders
content = content.replace(/borderColor: "#e5e7eb"/g, 'borderColor: "rgba(255,255,255,0.08)"');
content = content.replace(/borderBottom: "1px solid #e5e7eb"/g, 'borderBottom: "1px solid rgba(255, 255, 255, 0.08)"');
content = content.replace(/border: "1px solid #e5e7eb"/g, 'border: "1px solid rgba(255,255,255,0.08)"');
content = content.replace(/border: "1px solid #bbf7d0"/g, 'border: "1px solid rgba(99, 102, 241, 0.2)"');
content = content.replace(/border: "2px dashed #bbf7d0"/g, 'border: "2px dashed rgba(99, 102, 241, 0.2)"');
content = content.replace(/border: "1px solid #86efac"/g, 'border: "1px solid rgba(99,102,241,0.3)"');
content = content.replace(/borderColor: "#bbf7d0"/g, 'borderColor: "rgba(99, 102, 241, 0.2)"');
content = content.replace(/border: "(1(?:\\.5)?px) solid #f3f4f6"/g, 'border: "$1 solid rgba(255,255,255,0.05)"');

// Gradients
content = content.replace(/background: "linear-gradient\\(135deg, #059669, #10b981\\)"/g, 'background: "linear-gradient(135deg, #6366f1, #8b5cf6)"');
content = content.replace(/background: "linear-gradient\\(135deg, #059669 0%, #10b981 100%\\)"/g, 'background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)"');

// Text Colors
content = content.replace(/color: "#111827"/g, 'color: "#f8fafc"');
content = content.replace(/color: "#374151"/g, 'color: "#e2e8f0"');
content = content.replace(/c="#111827"/g, 'c="#f8fafc"');
content = content.replace(/c="#374151"/g, 'c="#e2e8f0"');
content = content.replace(/color: "#6b7280"/g, 'color: "#94a3b8"');
content = content.replace(/c="#6b7280"/g, 'c="#94a3b8"');
content = content.replace(/color: "#059669"/g, 'color: "#818cf8"');
content = content.replace(/c="#059669"/g, 'c="#818cf8"');

// Specifically replacing c="dimmed" with c="#94a3b8"
content = content.replace(/c="dimmed"/g, 'c="#94a3b8"');

// Box Shadows
content = content.replace(/boxShadow: "0 4px 24px rgba\\(0,0,0,0.06\\)"/g, 'boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)"');
content = content.replace(/boxShadow: "0 2px 8px rgba\\(5,150,105,0.3\\)"/g, 'boxShadow: "0 2px 10px rgba(99, 102, 241, 0.4)"');
content = content.replace(/boxShadow: "0 2px 10px rgba\\(5,150,105,0.3\\)"/g, 'boxShadow: "0 2px 12px rgba(99, 102, 241, 0.4)"');
content = content.replace(/boxShadow: "0 4px 14px rgba\\(5,150,105,0.35\\)"/g, 'boxShadow: "0 4px 16px rgba(99, 102, 241, 0.4)"');
content = content.replace(/boxShadow: "0 2px 12px rgba\\(0,0,0,0.04\\)"/g, 'boxShadow: "0 8px 32px rgba(0,0,0,0.3)"');

// Fix specific violations backgrounds
content = content.replace(/background: "#fff9f9"/g, 'background: "rgba(220, 38, 38, 0.05)"');
content = content.replace(/background: "#fee2e2"/g, 'background: "rgba(220, 38, 38, 0.15)"');
content = content.replace(/background: "#fff1f2"/g, 'background: "rgba(220, 38, 38, 0.1)"');
content = content.replace(/border: "1px solid #fecaca"/g, 'border: "1px solid rgba(220, 38, 38, 0.3)"');
content = content.replace(/borderColor: "#fecaca"/g, 'borderColor: "rgba(220, 38, 38, 0.3)"');
content = content.replace(/color: "#dc2626"/g, 'color: "#ef4444"');

// Import framer-motion if not there
if (content.indexOf('framer-motion') === -1) {
    content = content.replace(/import {\\s*Container,/, 'import { motion } from "framer-motion";\nimport {\n  Container,');
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('ScannerPage updated successfully.');
