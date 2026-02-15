# Parallax Edge

A Hyper-Local & Cross-Platform Price Aggregator that compares the "Total Landed Cost" and "ETA" of products across Amazon, Flipkart, Blinkit, and Zepto.

## Features

- **Location Intelligence**: Pincode-based Q-Commerce data fetching
- **True Landed Cost**: Total = Base Price + Delivery + Platform Fees
- **Speed vs Savings**: Trade-off analysis highlighting best options
- **Fuzzy Product Matching**: Groups identical products with different titles

## Tech Stack

### Backend
- **FastAPI** - Async Python API framework
- **thefuzz** - Fuzzy string matching for product grouping
- **Playwright** - Browser automation for scraping (future)
- **httpx** - Async HTTP client

### Frontend
- **Next.js 15** - React framework with App Router
- **Tailwind CSS** - Utility-first styling
- **Lucide Icons** - Modern icon library
- **TypeScript** - Type safety

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

### 3. Open the App

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## API Endpoints

### GET /search
Search products across platforms.

**Parameters:**
- `query` (string) - Product search term
- `pincode` (string) - 6-digit Indian pincode

**Example:**
```
GET /search?query=milk&pincode=110001
```

## Project Structure

```
Parallax Edge/
├── backend/
│   ├── app/
│   │   ├── main.py         # FastAPI app & routes
│   │   ├── models.py       # Pydantic data models
│   │   ├── matcher.py      # Fuzzy matching utility
│   │   └── mock_data.py    # Mock product data
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── app/            # Next.js pages
    │   ├── components/     # React components
    │   ├── lib/            # API client
    │   └── types/          # TypeScript types
    └── package.json
```

## Design

- **Dark Mode**: Cyber aesthetic with high-contrast accents
- **Colors**: Electric Cyan (#00f0ff), Cyber Green (#00ff88)
- **Effects**: Glassmorphism, glow effects, smooth animations

## License

MIT
