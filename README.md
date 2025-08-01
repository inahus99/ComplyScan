# ComplyScan

**ComplyScan** is a full-stack, real-time GDPR/CCPA compliance auditing tool that enables users to scan any public-facing website for privacy violations such as missing cookie consent banners, unauthorized third-party tracking scripts, absence of privacy policy links, and the use of long-lived cookies. The system provides an interactive interface, live logs, heuristic-based scoring, and actionable recommendations to improve data privacy practices.

---

##  Key Features

*  **Real-time Website Scanning** using headless Chromium with Puppeteer
*  **Cookie Analysis**: detects and evaluates all cookies set by the site
*  **Consent Banner Detection**: checks presence and visibility of cookie/consent prompts
*  **Privacy Policy Verification**: identifies presence of policy links in DOM
*  **Third-party Tracker Detection**: logs all external requests made
*  **Heuristic-based Compliance Scoring** (0–100)
*  **Improvement Suggestions** for each violation
*  **Live Scanning Logs** using WebSockets via Socket.io
*  **Region Simulation**: Spoofs EU user agent and IP to trigger geo-specific consent banners

---

##  Compliance Standards Checked

###  **GDPR (General Data Protection Regulation – EU)**

* Explicit consent before setting analytics/advertising cookies
* Visibility and functionality of consent banner
* Presence of privacy policy and contact info
* Use of short-lived and essential cookies only

###  **CCPA (California Consumer Privacy Act)**

* Prior notice before data collection
* Detection of third-party data sharing or selling mechanisms
* Clear opt-out mechanisms and privacy statements

---

##  Tech Stack Overview

| Layer       | Technology                              |
| ----------- | --------------------------------------- |
| Frontend    | React, Vite, Tailwind CSS               |
| Realtime    | WebSockets (Socket.io)                  |
| Backend     | Node.js, Express                        |
| Browser Bot | Puppeteer (Headless Chromium)           |
| Analysis    | Custom Heuristic Engine, DOM Inspection |

---

## Folder Structure

```
gdpr-checker/
├── client/             # React frontend
│   ├── index.html
│   └── src/
│       ├── App.jsx     # Core UI logic
│       └── main.jsx    # Entry point
├── server/             # Express + Socket.io backend
│   ├── index.js        # Main server file
│   └── scanner.js      # Puppeteer logic + heuristic engine
└── README.md
```

---

##  Local Development Setup

### 1. Clone the Repo

```bash
git clone https://github.com/yourusername/complyscan.git
cd complyscan
```

### 2. Start Backend Server

```bash
cd server
npm install
npm run start
```

### 3. Start Frontend (Vite Dev Server)

```bash
cd ../client
npm install
npm run dev
```

Open your browser at: `http://localhost:5173`

---

## Sample Output (JSON Response)

```json
{
  "site": "https://reddit.com",
  "score": 40,
  "consentBannerDetected": false,
  "privacyPolicyFound": false,
  "cookies": [
    {"name": "edgebucket", "domain": ".reddit.com", "expires": 1788589575}
  ],
  "thirdPartyRequests": ["facebook.net", "google-analytics.com"],
  "violations": [
    "No visible cookie/consent banner, yet tracking detected.",
    "No privacy policy link detected.",
    "Found 2 long-lived cookies (> 1 year)."
  ],
  "tips": [
    "Implement a visible cookie banner.",
    "Add a privacy policy to your site.",
    "Avoid long-lived tracking cookies."
  ]
}
```








##  License

MIT License — you are free to use, distribute, and modify this project.

---





> *“ComplyScan is built for developers, auditors, and teams who care about user privacy and legal compliance.”*
