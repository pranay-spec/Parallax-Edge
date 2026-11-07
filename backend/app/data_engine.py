"""
Fault-Tolerant Hybrid Data Engine
Seamlessly switches between live scraping, cached data, and synthetic fallbacks.
Ensures the demo ALWAYS shows results — even when Amazon blocks scrapers mid-presentation.

Architecture:
  ┌──────────────┐
  │  User Query   │
  └──────┬───────┘
         ▼
  ┌──────────────────────────────────────────┐
  │          HybridDataEngine                │
  │  ┌─────────────┐  ┌──────────────────┐   │
  │  │ LiveScraper  │  │  PriceCache      │   │
  │  │ (Primary)    │──│  (Redis-like)    │   │
  │  └──────┬───────┘  └───────┬──────────┘   │
  │         │                  │              │
  │  ┌──────▼──────────────────▼──────────┐   │
  │  │        CircuitBreaker              │   │
  │  │  (tracks failures per platform)    │   │
  │  └──────┬─────────────────────────────┘   │
  │         │                                 │
  │  ┌──────▼───────┐                         │
  │  │ SyntheticFB  │  (last resort)          │
  │  └──────────────┘                         │
  └──────────────────────────────────────────┘
"""

import time
import hashlib
import json
import asyncio
from datetime import datetime
from typing import Dict, List, Any, Optional
from collections import defaultdict

from .models import ProductResult, PlatformType


# ============================================================
# IN-MEMORY PRICE CACHE (simulates Redis)
# ============================================================

class PriceCache:
    """
    In-memory price store that simulates Redis for hackathon demos.
    Stores historical prices per product for trend analysis.
    TTL-based expiry ensures freshness.
    """

    def __init__(self, ttl_seconds: int = 300):
        self._store: Dict[str, Dict] = {}
        self._history: Dict[str, List[Dict]] = defaultdict(list)
        self._ttl = ttl_seconds

    def _make_key(self, query: str, pincode: str) -> str:
        raw = f"{query.lower().strip()}:{pincode.strip()}"
        return hashlib.md5(raw.encode()).hexdigest()

    def get(self, query: str, pincode: str) -> Optional[List[Dict]]:
        """Retrieve cached results if still fresh."""
        key = self._make_key(query, pincode)
        entry = self._store.get(key)
        if entry and (time.time() - entry["timestamp"]) < self._ttl:
            return entry["data"]
        return None

    def put(self, query: str, pincode: str, products: List[ProductResult]):
        """Cache search results and track price history."""
        key = self._make_key(query, pincode)

        product_dicts = [{
            "id": p.id,
            "platform": p.platform.value if hasattr(p.platform, 'value') else str(p.platform),
            "title": p.title,
            "price": p.price_breakdown.total_landed_cost,
            "eta_minutes": p.eta_minutes,
        } for p in products]

        self._store[key] = {
            "data": product_dicts,
            "timestamp": time.time(),
            "query": query,
        }

        # Record price history for trend analysis
        for p in products:
            product_key = p.id
            self._history[product_key].append({
                "price": p.price_breakdown.total_landed_cost,
                "timestamp": time.time(),
                "platform": p.platform.value if hasattr(p.platform, 'value') else str(p.platform),
            })
            # Keep last 50 data points per product
            self._history[product_key] = self._history[product_key][-50:]

    def get_price_history(self, product_id: str) -> List[Dict]:
        """Get historical prices for a product (for ML predictions)."""
        return self._history.get(product_id, [])

    def get_all_history(self) -> Dict[str, List[Dict]]:
        """Get all price history for ML training."""
        return dict(self._history)

    def get_stats(self) -> Dict:
        """Cache health metrics."""
        now = time.time()
        active = sum(1 for v in self._store.values() if (now - v["timestamp"]) < self._ttl)
        total_history_points = sum(len(v) for v in self._history.values())
        return {
            "cached_queries": len(self._store),
            "active_entries": active,
            "expired_entries": len(self._store) - active,
            "tracked_products": len(self._history),
            "total_price_points": total_history_points,
            "ttl_seconds": self._ttl,
        }


# ============================================================
# CIRCUIT BREAKER — Prevents cascade failures
# ============================================================

class CircuitBreaker:
    """
    Tracks failure rates per platform. When a platform fails repeatedly,
    the circuit opens (trips) to prevent wasting time on dead endpoints.
    After a cooldown, it enters half-open state to test recovery.
    """

    def __init__(self, failure_threshold: int = 3, cooldown_seconds: int = 120):
        self._failures: Dict[str, int] = defaultdict(int)
        self._last_failure: Dict[str, float] = {}
        self._state: Dict[str, str] = defaultdict(lambda: "closed")  # closed, open, half-open
        self._threshold = failure_threshold
        self._cooldown = cooldown_seconds

    def can_proceed(self, platform: str) -> bool:
        """Check if requests to this platform should proceed."""
        state = self._state[platform]

        if state == "closed":
            return True

        if state == "open":
            # Check if cooldown has passed
            elapsed = time.time() - self._last_failure.get(platform, 0)
            if elapsed >= self._cooldown:
                self._state[platform] = "half-open"
                return True
            return False

        # half-open: allow one attempt
        return True

    def record_success(self, platform: str):
        """Record a successful request — resets the circuit."""
        self._failures[platform] = 0
        self._state[platform] = "closed"

    def record_failure(self, platform: str):
        """Record a failure — may trip the circuit."""
        self._failures[platform] += 1
        self._last_failure[platform] = time.time()

        if self._failures[platform] >= self._threshold:
            self._state[platform] = "open"

    def get_status(self) -> Dict[str, Any]:
        """Get circuit breaker status for all tracked platforms."""
        platforms = set(list(self._failures.keys()) + list(self._state.keys()))
        return {
            p: {
                "state": self._state[p],
                "failures": self._failures[p],
                "last_failure": datetime.fromtimestamp(
                    self._last_failure[p]
                ).isoformat() if p in self._last_failure else None,
            }
            for p in platforms
            if self._failures[p] > 0 or self._state[p] != "closed"
        }


# ============================================================
# SYSTEM HEALTH MONITOR
# ============================================================

class SystemHealthMonitor:
    """
    Tracks overall system health — a UI-facing component that shows
    judges the reliability of the platform.
    """

    def __init__(self):
        self._platform_status: Dict[str, Dict] = {}
        self._last_search_time_ms: Optional[float] = None
        self._total_searches: int = 0
        self._live_hits: int = 0
        self._cache_hits: int = 0
        self._synthetic_hits: int = 0
        self._uptime_start = time.time()

    def record_search(self, duration_ms: float, live: int, cached: int, synthetic: int):
        """Record search metrics."""
        self._total_searches += 1
        self._last_search_time_ms = duration_ms
        self._live_hits += live
        self._cache_hits += cached
        self._synthetic_hits += synthetic

    def record_platform_status(self, platform: str, status: str, source: str):
        """Record individual platform status."""
        self._platform_status[platform] = {
            "status": status,
            "source": source,
            "last_checked": datetime.now().isoformat(),
        }

    def get_health(self) -> Dict:
        """Get the system health report."""
        total_sources = self._live_hits + self._cache_hits + self._synthetic_hits
        live_pct = (self._live_hits / total_sources * 100) if total_sources > 0 else 100

        if live_pct >= 60:
            pulse = "healthy"
            pulse_color = "#22c55e"
            pulse_label = "All Systems Operational"
        elif live_pct >= 30:
            pulse = "degraded"
            pulse_color = "#f59e0b"
            pulse_label = "Using Optimized Cache"
        else:
            pulse = "synthetic"
            pulse_color = "#ef4444"
            pulse_label = "Running on AI Predictions"

        return {
            "pulse": pulse,
            "pulse_color": pulse_color,
            "pulse_label": pulse_label,
            "uptime_seconds": round(time.time() - self._uptime_start, 1),
            "total_searches": self._total_searches,
            "avg_response_ms": self._last_search_time_ms,
            "data_sources": {
                "live": self._live_hits,
                "cached": self._cache_hits,
                "synthetic": self._synthetic_hits,
                "live_percentage": round(live_pct, 1),
            },
            "platforms": self._platform_status,
        }


# ============================================================
# SINGLETON INSTANCES
# ============================================================

# Global instances — imported by main.py
price_cache = PriceCache(ttl_seconds=300)
circuit_breaker = CircuitBreaker(failure_threshold=3, cooldown_seconds=120)
health_monitor = SystemHealthMonitor()
