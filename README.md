# ⚡ Parallax Edge

### The Hyper-Local, AI-Powered Price Intelligence Engine.

**Parallax Edge** is a next-generation price aggregation platform designed to solve the fragmentation in modern e-commerce. Built for the era of **Quick Commerce**, it bridges the gap between global giants and local dark stores.

![Live Status](https://img.shields.io/badge/Status-Operational-brightgreen?style=for-the-badge)
![Deployment](https://img.shields.io/badge/Deployment-Vercel%20%2B%20Render-blue?style=for-the-badge)

---

## 🚀 Key Innovation: Total Cost Transparency

Unlike traditional comparison tools that only scrape Amazon, Parallax Edge integrates **Quick Commerce** (Blinkit, Zepto, Instamart) alongside national platforms (Flipkart, Amazon, JioMart) to give users a true **"Total Landed Cost"** comparison.

### 🧠 Core Features

*   **📍 Hyper-Local Intelligence**: Automatically detects your pincode to show real-time stock availability and "Last-Mile" delivery speeds from local dark stores.
*   **🤖 Smart Cart Optimization (AI)**: An AI-driven orchestrator that analyzes your multi-item cart and splits it optimally across platforms. *(e.g., "Get Milk from Zepto for speed, buy iPhone from Amazon for price")*.
*   **⚡ Community Flash Pools**: Join neighbors in real-time "Flash Pools" to unlock higher-tier bulk discounts for items trending in your specific locality.
*   **🌉 P2P Resale Bridge**: Integrated marketplace to list your items or buy pre-owned tech directly from verified neighbors.
*   **🌌 Cyberpunk UI**: A premium, visual-first terminal interface with glassmorphism, real-time "heartbeat" status, and interactive data visualization.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14, TypeScript, Tailwind CSS, Lucide React, Framer Motion |
| **Backend** | Python FastAPI, BeautifulSoup4, Pydantic, httpx |
| **Data Engine** | Fuzzy String Matching (`thefuzz`), Real-time Scrapers, Price Prediction Models |
| **Deployment** | Docker, Vercel (Frontend), Render (Backend) |

---

## 📦 Quick Start (Local Development)

### Prerequisites
- Python 3.9+
- Node.js 18+

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# Windows: venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🐳 Docker Deployment

Run the entire stack with a single command:
```bash
docker-compose up --build
```

---

## 🌎 Supported Countries
- 🇮🇳 India (Full Support: Amazon, Flipkart, Blinkit, Zepto, Swiggy)
- 🇬🇧 UK (Beta)
- 🇺🇸 USA (Beta)
- 🇦🇪 UAE (Beta)

---

## 📜 License
MIT © Pranay Spec
