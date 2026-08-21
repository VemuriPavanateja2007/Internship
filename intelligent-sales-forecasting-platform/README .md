# 🎯 Vectra AI: Intelligent Sales Forecasting & Revenue Intelligence Platform

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38BDF8?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-22-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.2+-F7931E?logo=scikit-learn&logoColor=white)](https://scikit-learn.org/)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Gemini_2.5_Flash-AI-blue?logo=google&logoColor=white)](https://ai.google.dev/)

Vectra AI is an enterprise-grade **Predictive Sales Forecasting and Revenue Intelligence Platform**. It merges statistical machine learning, parametric sensitivity simulations, and Large Language Model (LLM) orchestration to provide sales leaders, finance executives, and Revenue Operations (RevOps) teams with highly accurate, data-grounded strategic foresight.

The platform combines a highly responsive **TypeScript/React 19** frontend, an **Express/Node.js** API gateway, a robust **Python Scikit-Learn** ML microservice, and **Gemini 2.5 Flash** to analyze time-series sales histories, evaluate open pipeline risks, simulate growth levers, and generate automated CRO-level strategic reports.

---

## 🚀 Key Capabilities

### 1. Multi-Model Sales Forecasting (Ensemble Machine Learning)
The core forecasting engine utilizes time-series feature engineering combined with a scikit-learn regressor ensemble to project forward-looking revenue over customizable horizons (3, 6, or 12 months).
*   **Mathematical Models:** Random Forest Regressor, Gradient Boosting Regressor, Ridge Polynomial Regression, and Linear Ridge Regression.
*   **Ensemble Blending:** Computes a weighted average of individual model predictions (`40%` Random Forest, `35%` Gradient Boosting, `15%` Polynomial Ridge, `10%` Linear Ridge) to minimise variance and protect against overfitting.
*   **Seasonality Decomposition:** Built-in multiplicative Holt-Winters style time-series decomposition to isolate underlying **Trends**, **Cyclical Seasonality** (monthly/quarterly), and **Residual Noise**.
*   **Autoregressive Lagging:** Features include `t` (time index), month-of-year, quarter-index, `lag_1`, `lag_2`, and 3-month moving momentum.
*   **Confidence Intervals:** Generates $80\%$ and $95\%$ confidence boundaries that expand dynamically over time using historical residual standard deviation scaled by $\sqrt{h}$ (where $h$ is the forecast horizon month).

### 2. Deal Radar & Pipeline Classifier (Win Probability Scoring)
Evaluates active, open opportunities within the sales pipeline to identify slip risks, margin compression, and high-velocity conversions.
*   **Classification Engine:** Uses a Random Forest Classifier trained on historical enterprise sales datasets, supported by a deterministic logistic fallback heuristic.
*   **Evaluated Feature Vectors:** Opportunity amount, representative close rate, cycle age (days in pipeline), stakeholder touchpoint frequency, commercial discount rate, and C-suite/VP decision-maker engagement.
*   **Prescriptive Close Plans:** Synthesizes pipeline data into specific, actionable instructions for account executives (e.g., "Schedule VP sponsor alignment call," "Fast-track legal/MSA review").

### 3. What-If Scenario Simulator (Parametric Sensitivity Modeling)
An interactive simulation matrix that enables strategic planners to project how operational, hiring, or marketing changes impact the baseline forecast over a 12-month horizon.
*   **Elasticity Multipliers:** Lead Volume ($e = 0.75$), Deal Size ($e = 1.0$), Conversion Rate Lift ($e = 1.0$), Rep Capacity ($e = 0.60$), and Contract Churn ($e = -0.25$).
*   **Compounding Growth Curves:** Simulates a compounding monthly curve (representing compounding expansion/decay) against baseline projections to calculate cumulative revenue impact, net impact percentage, and annualized run-rate variations.

### 4. AI Executive Summaries & Narrative Reports
Orchestrates **Gemini 2.5 Flash** to act as a dual Chief Revenue Officer (CRO) and Lead Data Scientist, translating raw predictive statistics into boardroom-ready strategic narratives.
*   **Dynamic Report Generation:** Instantly outputs concise Strategic Executive Summaries, Key Predictive Drivers (ranking feature importances), Strategic Pipeline Risks, and Recommended Operational Actions.
*   **Deterministic Fallbacks:** Provides robust, local fallback narrative handlers in the absence of a configured Gemini API key, ensuring uninterrupted platform operations.

### 5. Conversational Revenue Copilot
An interactive conversational chat interface allowing RevOps teams to query their predictive pipeline, run ad-hoc calculations, audit specific deal risks, and get tactical advice grounded in active forecast metrics.

---

## 📐 System Architecture & Data Flow

Vectra AI is built on a decoupled, three-tier architecture optimized for fast local execution and seamless model retraining.

```
                  ┌────────────────────────────────────────┐
                  │          React 19 SPA (Vite)           │
                  │   (Tailwind CSS v4 + Recharts + Motion)│
                  └───────────────────┬────────────────────┘
                                      │
                         HTTPS POST / GET (JSON)
                                      │
                  ┌───────────────────▼────────────────────┐
                  │       Node.js / Express Gateway        │
                  │       - Orchestrates API Endpoints     │
                  │       - Directs Gemini SDK Actions     │
                  │       - Spawns Flask Backend Daemon    │
                  └───────────────────┬────────────────────┘
                                      │
                     Child Process (stdin/stdout JSON API)
                                      │
                  ┌───────────────────▼────────────────────┐
                  │    Python ML Engine (Flask Daemon)     │
                  │    - Scikit-Learn Ensemble Regressors  │
                  │    - NumPy & SciPy Seasonality Math    │
                  │    - Random Forest Classifier Models   │
                  └────────────────────────────────────────┘
```

### Dual-Bridging Microservice Architecture
To guarantee absolute runtime reliability, the platform implements a **dual-bridge backend**:
1.  **Flask Daemon Service (Default):** Runs an active Flask microservice on Port `5001` to process API requests asynchronously.
2.  **Child Process CLI Bridge (Fallback):** If the Flask daemon is unavailable or port binding fails, the Node.js server automatically falls back to invoking the Python engine directly using `child_process.spawn('python3', ['app.py', command])` over a stdin/stdout JSON pipe. This ensures zero operational downtime.

---

## 📁 Repository Directory Structure

```
intelligent-sales-forecasting-platform/
├── python_service/                # Python ML Microservice Engine
│   ├── app.py                     # Flask Server Entrypoint & Direct CLI Bridge
│   └── ml_engine.py               # Time-Series Regressors & Deal Win Probability Classifiers
├── src/                           # Frontend React SPA
│   ├── components/                # React Dashboard Views
│   │   ├── Header.tsx             # System Telemetry & Tab Controllers
│   │   ├── ForecastHub.tsx        # Forecasting Visualizer & Control Levers
│   │   ├── ModelStudio.tsx        # Cross-Model Benchmarking & Retraining
│   │   ├── DealRadar.tsx          # Pipeline Deal Scoring & Prescriptive Actions
│   │   ├── ScenarioSimulatorView.tsx # What-If Levers & Projected Trajectories
│   │   ├── AiCopilotView.tsx      # Interactive Revenue Strategy Chat UI
│   │   ├── DatasetManager.tsx     # CSV Ingestion & Historical Dataset Manager
│   │   └── DealModal.tsx          # Audit Inspector for Individual Opportunities
│   ├── data/                      # Preset Datasets
│   │   └── sampleDatasets.ts      # B2B SaaS, FinTech, & HealthTech presets
│   ├── types/                     # TypeScript Interfaces & API Schema definitions
│   │   └── index.ts               
│   └── App.tsx                    # Main Layout, Tab Context & API Handlers
├── package.json                   # Node.js Dependencies & Build Scripts
├── metadata.json                  # Application Capabilities Metadata
├── tsconfig.json                  # TypeScript Compiler Options
├── vite.config.ts                 # Vite Compilation Rules
└── server.ts                      # Express Orchestration Server (Node.js Gateway)
```

---

## 🛠️ Installation & Setup Runbook

Follow these instructions to configure and run the entire platform locally on your machine.

### Prerequisites
*   **Node.js:** v18.0 or higher (v22+ recommended)
*   **Python:** v3.10 or higher (v3.12 recommended)
*   **Bun (Optional):** Supported package manager for accelerated builds.

### Step 1: Clone the Repository
```bash
git clone https://github.com/VemuriPavanateja2007/Internship.git
cd Internship/intelligent-sales-forecasting-platform
```

### Step 2: Install Node.js Dependencies
```bash
npm install
```

### Step 3: Set Up Python Virtual Environment & Install Libraries
Ensure you have the required machine learning and server libraries installed. It is recommended to use a virtual environment:

```bash
# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate # On Windows: venv\Scripts\activate

# Install required Python dependencies
pip install numpy pandas scikit-learn scipy flask werkzeug
```

### Step 4: Configure Environment Variables
Create a `.env.local` file in the root directory of the `intelligent-sales-forecasting-platform` folder:

```env
# Server Port Configuration
PORT=3000
FLASK_PORT=5001

# Gemini API Key (Required for AI Executive Insights & Copilot Chat)
# Obtain a key from: https://aistudio.google.com/
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### Step 5: Start the Development Server
This command builds the frontend assets and boots up both the Express Gateway and the Python Flask daemon.

```bash
npm run dev
```

*   The Express API and frontend application will be served at: **`http://localhost:3000`**
*   The Python ML Engine daemon will start in the background on: **`http://localhost:5001`**

---

## 🔌 REST API Endpoints

The Node.js Express server acts as a unified API gateway. All endpoints are prefixed with `/api`.

### ML Core & Health
*   **`GET /api/ml/health`**
    *   *Purpose:* Verifies the status of the Express server, the Python Flask daemon, library availability (Scikit-Learn), and Gemini API key status.

### Predictive Models
*   **`POST /api/ml/forecast`**
    *   *Payload Structure:* `{ historicalData: [{date: "YYYY-MM-DD", revenue: float}], horizonMonths: int, modelType: str, confidenceLevel: float }`
    *   *Response:* Complete ensemble time-series predictions, including $80\%$ and $95\%$ upper/lower confidence bounds, in-sample fitting metrics, and RF feature importances.
*   **`POST /api/ml/score-deals`**
    *   *Payload Structure:* `{ deals: [{ id: str, dealName: str, amount: float, repWinRate: float, ageDays: int, touchpoints: int, discountPct: float, decisionMakerEngaged: bool }] }`
    *   *Response:* Pipeline win-probability scores, weighted pipeline value, and prescriptive AE close recommendations.
*   **`POST /api/ml/simulate-scenarios`**
    *   *Payload Structure:* `{ baselineRevenue: float, horizonMonths: int, leadVolumeChangePct: float, dealSizeChangePct: float, conversionRateLiftPct: float, salesRepsDelta: int, churnRatePct: float, macroMultiplier: float }`
    *   *Response:* Simulated monthly revenue trajectories, cumulative variances, and projected annualized run-rates.

### Gemini Orchestration
*   **`POST /api/ai/forecast-analysis`**
    *   *Purpose:* Submits the forecast output and feature importances to Gemini 2.5 Flash to generate a structured Strategic CRO Report.
*   **`POST /api/ai/copilot`**
    *   *Purpose:* Serves as a pipeline-grounded Q&A chatbot to address strategic queries from executives.

---

## 🛡️ License and Attribution
This software is developed as part of an advanced AI and predictive analytics internship project. All rights reserved. Built with precision, performance, and geometric visual balance.
