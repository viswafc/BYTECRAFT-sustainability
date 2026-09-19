<div align="center">
  <h1>AquaRisk AI</h1>
  <p><b>Predictive Water Loss Timeline & Counterfactual Simulation Engine</b></p>
</div>

## Overview

**AquaRisk AI** is an industrial water-risk intelligence platform that goes beyond static leak detection. It analyzes live telemetry (water flow, pressure, production context, and historical behavior) to distinguish abnormal production changes from probable leaks, locate affected network segments, estimate severity and water loss, predict escalation, quantify financial impact, explain its decisions, and simulate the consequences of different operator responses.

View your app in AI Studio: https://ai.studio/apps/a134d185-5f12-4dde-b3a4-902c833dc9bc

**Project Presentation:** [View on Prezi](https://prezi.com/craft/room/5k22kcUJCVDviUYJkKiTfp?referral_token=rXpG-GlnB3FN)

**Live Deployed Solution Video:** [Watch on Google Drive](https://drive.google.com/file/d/1u9kKLr0OWJmV-Id9hKhZ9dK4TelALNW8/view?usp=sharing)
---

## 🎯 The Problem (SU-03)
Industrial water networks suffer massive losses due to undetected leaks, faulty sensors, and unoptimized production schedules. Traditional systems use static thresholds, triggering false alarms every time a production line ramps up. When a real leak occurs, operators lack the localization tools, financial impact analysis, and explainability required to confidently shut down a pipe without halting critical production.

## 🚀 The Solution
AquaRisk AI introduces a full 11-stage intelligence pipeline:
**DETECT → DIAGNOSE → LOCATE → QUANTIFY → PREDICT → ACT → SIMULATE**

1. **Production-Aware Baseline**: ML models adjust expected flow based on active machine states, eliminating false alarms during production surges.
2. **AI Intelligence**: Classifies events accurately (`LEAK` vs `SENSOR_FAULT`).
3. **Network Localization**: Uses graph theory to isolate the exact bursting pipe (`P-104`).
4. **Predictive Risk & Financial Impact**: Quantifies the volumetric loss (m³) and the financial exposure (₹), explicitly calculating the **Cost of Waiting** if action is delayed.
5. **Decision Engine & AI Copilot**: Provides a deterministic, RAG-based conversational UI that recommends actions and proves its reasoning using live sensor evidence.

---

## 💻 Core Application Features

- **Command Center:** Live dashboard with real-time active leak tracking, WebSocket telemetry streaming, and automated AI insight generation.
- **Incident Center:** Comprehensive historical log of all detected leaks and anomalies, featuring dynamic filtering and root-cause breakdowns.
- **3D Digital Twin (SVG):** Interactive visualization of the physical plant layout. Click on pipe segments and nodes to reveal localized sensor data.
- **What-If Lab:** Counterfactual engine allowing users to simulate leak severities and response delays, projecting exact financial bleed and infrastructure erosion risks.
- **Analytics & Trends:** Time-series volumetric data tracking Expected vs. Actual water usage, isolating water loss by industrial zone.
- **Settings & Config:** Dynamic safety threshold rules, emergency automation protocols (like auto-isolation), and system health diagnostics.

---

## 🏗 Architecture
- **Frontend**: React + TypeScript + Vite + Custom SVG Digital Twin.
- **Backend**: FastAPI (Python) + SQLAlchemy. *(Includes alternative Node.js/Express bootstrap support)*
- **Database**: Native MySQL (via local XAMPP) / SQLite fallback.
- **ML / AI**: Scikit-Learn (Random Forest) + NetworkX (Topology) + Deterministic RAG (Copilot).
- **Design System**: Custom Glassmorphism UI (`.glass-panel`), staggered micro-animations (`.hover-lift`), and Google Material Symbols.

### Project Structure
The repository is neatly organized into separated domains:
```text
BYTECRAFT-sustainability/
├── frontend/               # React + Vite frontend source code
│   ├── components/         # Reusable UI components
│   ├── pages/              # Core application views
│   ├── data/               # Static mock data and types
│   ├── index.css           # Global stylesheet & Tailwind directives
│   └── main.tsx            # Application entry point
├── backend/                # API and Server logic
│   ├── app/                # ML Pipeline & Core Application
│   ├── routes/             # API routing
│   ├── websocket/          # Real-time telemetry streaming
│   └── server.ts           # Backend entry point
├── scripts/                # Database initialization and boot scripts
└── package.json            # Unified dependencies and scripts
```

---

## 🛠 Setup & Deployment (Windows)

Because we migrated to a fully native Windows stack, setup is incredibly simple:

1. **Database Setup**:
   - Open **XAMPP Control Panel** and start **Apache** and **MySQL**.
   - Open your browser to `http://localhost/phpmyadmin` and create a database named `aquarisk`.
   - Run the initialization script to seed the schema:
     ```powershell
     python scripts\init_database.py
     ```

2. **Run the Application**:
   - Simply execute the centralized boot script:
     ```powershell
     .\scripts\start_all.ps1
     ```
   - The backend (and background telemetry simulator) will launch on port `8000`.
   - The React UI will launch on port `5173`.

---

## 🎬 Hackathon Demo Steps
1. Navigate to `http://localhost:5173`.
2. Present the **Command Center**. Explain how the AI Baseline prevents false alarms during production surges.
3. Observe the background simulator trigger a leak. Watch the SVG Digital Twin's pipe `P-104` pulse Red.
4. Highlight the **Cost of Waiting** metric as the financial loss climbs in real-time.
5. Open the **AI Copilot** and click *"Why do you think it's a leak?"* to prove the AI's reasoning.
6. Click **SIMULATE INTERVENTION** to recover the plant and calculate the avoided financial loss.

---

## ⚠️ Known Limitations
- The current AI Copilot utilizes a highly sophisticated **Deterministic RAG engine** to ensure 100% uptime, zero hallucinations, and zero API costs during the live hackathon pitch. A true generative LLM client (Groq/OpenAI) can be swapped into `backend/app/ml/copilot/agent.py` for deployment.
- Simulated E2E telemetry assumes a static predefined network topology matching the Phase 6 constraints. Real industrial SCADA integration will require dynamic OPC-UA binding.

## 🔮 Future Work
- **Live SCADA Integration**: Direct ingestion from physical PLCs.
- **Automated Actuation**: Upgrading the `DecisionEngine` from "Decision Support" to physical valve actuation.
- **Municipal Scaling**: Implementing WebGL / Deck.gl rendering for massive 10,000+ node city topologies.

---

## 🏆 Team Details

**Team Name:** BYTE CRAFT 
**Institution Name:** V.S.B Engineering College  
**Problem Statement:** SU-03 — Industrial Water Network Leak & Loss Detection  
**Project Name:** AQUARISK AI

**Team Members:**
- VISWA AG - Team Lead
- PRAVEENKUMAR S
- SANJEEV S
