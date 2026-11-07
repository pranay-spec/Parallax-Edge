"""
Agentic Orchestration Engine — Multi-Agent System for Parallax Edge
Inspired by LangGraph/LangChain agent coordination patterns.

Architecture:
  ┌─────────────────────────────────────────┐
  │           OrchestratorAgent             │
  │  (receives query, dispatches agents)    │
  └──────┬──────┬──────┬──────┬─────────────┘
         │      │      │      │
    ┌────▼─┐ ┌──▼──┐ ┌─▼──┐ ┌▼────┐
    │Amazon│ │Zepto│ │Blin│ │Flip │  ... SourcingAgents
    │Agent │ │Agent│ │kit │ │kart │
    └──┬───┘ └──┬──┘ └─┬──┘ └┬────┘
       │        │      │     │
    ┌──▼────────▼──────▼─────▼──┐
    │     NormalizerAgent       │
    │  (NLP matching, unit      │
    │   price calculation)      │
    └───────────────────────────┘
"""

import asyncio
import time
import re
import hashlib
from datetime import datetime
from difflib import SequenceMatcher
from typing import List, Dict, Any, Optional, Tuple
from enum import Enum

from .models import ProductResult, PlatformType


# ============================================================
# AGENT STATUS TRACKING
# ============================================================

class AgentStatus(str, Enum):
    IDLE = "idle"
    RUNNING = "running"
    SUCCESS = "success"
    FAILED = "failed"
    CACHED = "cached"


class AgentLog:
    """Tracks the lifecycle of each agent invocation."""

    def __init__(self, agent_name: str, platform: str):
        self.agent_name = agent_name
        self.platform = platform
        self.status: AgentStatus = AgentStatus.IDLE
        self.started_at: Optional[float] = None
        self.finished_at: Optional[float] = None
        self.products_found: int = 0
        self.error: Optional[str] = None
        self.data_source: str = "live"  # "live", "cache", "synthetic"

    def start(self):
        self.status = AgentStatus.RUNNING
        self.started_at = time.time()

    def succeed(self, count: int, source: str = "live"):
        self.status = AgentStatus.SUCCESS
        self.finished_at = time.time()
        self.products_found = count
        self.data_source = source

    def fail(self, error: str):
        self.status = AgentStatus.FAILED
        self.finished_at = time.time()
        self.error = error

    @property
    def duration_ms(self) -> Optional[float]:
        if self.started_at and self.finished_at:
            return round((self.finished_at - self.started_at) * 1000, 1)
        return None

    def to_dict(self) -> dict:
        return {
            "agent": self.agent_name,
            "platform": self.platform,
            "status": self.status.value,
            "duration_ms": self.duration_ms,
            "products_found": self.products_found,
            "data_source": self.data_source,
            "error": self.error,
        }


# ============================================================
# NORMALIZER AGENT — NLP-based product matching
# ============================================================

# Common unit patterns for extraction
UNIT_PATTERNS = [
    (r'(\d+(?:\.\d+)?)\s*(?:ml|ML|mL)', 'ml'),
    (r'(\d+(?:\.\d+)?)\s*(?:l|L|ltr|litre|liter)', 'l'),
    (r'(\d+(?:\.\d+)?)\s*(?:kg|KG|Kg)', 'kg'),
    (r'(\d+(?:\.\d+)?)\s*(?:g|gm|gms|gram|grm)\b', 'g'),
    (r'(\d+(?:\.\d+)?)\s*(?:pcs?|pieces?|units?|count|pack)\b', 'pcs'),
    (r'(\d+(?:\.\d+)?)\s*(?:tablet|tabs?|capsules?)\b', 'pcs'),
]

# Normalise units to a base (ml, g, pcs)
UNIT_CONVERSION = {
    'l': ('ml', 1000),
    'kg': ('g', 1000),
}


def extract_quantity(title: str) -> Optional[Tuple[float, str]]:
    """Extract quantity and unit from a product title using NLP regex patterns."""
    for pattern, unit in UNIT_PATTERNS:
        match = re.search(pattern, title, re.IGNORECASE)
        if match:
            value = float(match.group(1))
            # Normalize to base unit
            if unit in UNIT_CONVERSION:
                base_unit, factor = UNIT_CONVERSION[unit]
                value *= factor
                unit = base_unit
            return (value, unit)
    return None


def clean_title_for_matching(title: str) -> str:
    """Normalize a title for NLP matching — lowercase, remove noise."""
    title = title.lower()
    # Remove common noise words
    noise = ['pack of', 'combo', 'set of', 'buy', 'get', 'free', 'offer',
             'limited', 'edition', 'new', 'launch', 'sale', '(', ')', '[', ']']
    for w in noise:
        title = title.replace(w, ' ')
    # Remove special chars except alphanumeric and spaces
    title = re.sub(r'[^a-z0-9\s]', ' ', title)
    # Collapse whitespace
    title = re.sub(r'\s+', ' ', title).strip()
    return title


def compute_semantic_similarity(title_a: str, title_b: str) -> float:
    """Compute semantic similarity between two product titles."""
    clean_a = clean_title_for_matching(title_a)
    clean_b = clean_title_for_matching(title_b)

    # Sequence matching (character-level)
    seq_score = SequenceMatcher(None, clean_a, clean_b).ratio()

    # Word overlap (Jaccard similarity)
    words_a = set(clean_a.split())
    words_b = set(clean_b.split())
    if not words_a or not words_b:
        return seq_score
    jaccard = len(words_a & words_b) / len(words_a | words_b)

    # Weighted combination
    return 0.4 * seq_score + 0.6 * jaccard


def compute_unit_price(product: ProductResult) -> Optional[Dict[str, Any]]:
    """Compute price-per-unit for fair comparison across platforms."""
    qty = extract_quantity(product.title)
    if not qty:
        return None
    value, unit = qty
    if value <= 0:
        return None

    price = product.price_breakdown.total_landed_cost
    unit_price = price / value
    symbol = product.price_breakdown.currency_symbol

    # Format display
    if unit == 'ml':
        if value >= 1000:
            display = f"{symbol}{unit_price * 1000:.1f}/L"
        else:
            display = f"{symbol}{unit_price:.2f}/ml"
    elif unit == 'g':
        if value >= 1000:
            display = f"{symbol}{unit_price * 1000:.1f}/kg"
        else:
            display = f"{symbol}{unit_price:.2f}/g"
    elif unit == 'pcs':
        display = f"{symbol}{unit_price:.1f}/pc"
    else:
        display = f"{symbol}{unit_price:.2f}/{unit}"

    return {
        "unit_price": round(unit_price, 4),
        "unit": unit,
        "quantity": value,
        "display": display,
    }


def sanitize_data(obj):
    """Recursively strip surrogate characters."""
    if isinstance(obj, str):
        return "".join(c for c in obj if not (0xD800 <= ord(c) <= 0xDFFF))
    elif isinstance(obj, dict):
        return {k: sanitize_data(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_data(x) for x in obj]
    return obj

class NormalizerAgent:
    """
    NLP Agent that normalizes product data across platforms.
    Handles: title matching, unit price calculation, cross-platform dedup.
    """

    def __init__(self):
        self.log = AgentLog("NormalizerAgent", "all")
        self.match_pairs: List[Dict] = []

    def normalize(self, products: List[ProductResult]) -> List[ProductResult]:
        """Run NLP normalization on all products."""
        self.log.start()
        try:
            # 0. Sanitize all incoming product data strings
            for product in products:
                product.title = sanitize_data(product.title)
                product.url = sanitize_data(product.url)
                product.image_url = sanitize_data(product.image_url)
                if product.description:
                    product.description = sanitize_data(product.description)

            # 1. Calculate unit prices
            for product in products:
                unit_data = compute_unit_price(product)
                if unit_data:
                    product.unit_price_display = unit_data["display"]

            # 2. Find cross-platform matches
            self._find_matches(products)

            self.log.succeed(len(products))
            return products
        except Exception as e:
            self.log.fail(str(e))
            return products

    def _find_matches(self, products: List[ProductResult]):
        """Find same-product matches across different platforms."""
        seen = []
        for i, p in enumerate(products):
            for j in range(i + 1, len(products)):
                q = products[j]
                if p.platform == q.platform:
                    continue
                sim = compute_semantic_similarity(p.title, q.title)
                if sim > 0.45:
                    self.match_pairs.append({
                        "product_a": p.title[:50],
                        "platform_a": p.platform,
                        "product_b": q.title[:50],
                        "platform_b": q.platform,
                        "similarity": round(sim * 100, 1),
                    })

    def get_match_report(self) -> Dict:
        return {
            "total_matches": len(self.match_pairs),
            "top_matches": sorted(
                self.match_pairs, key=lambda x: x["similarity"], reverse=True
            )[:5],
        }


# ============================================================
# ORCHESTRATOR AGENT — Master coordinator
# ============================================================

# Global state for last orchestration run (for /agents/status endpoint)
_last_orchestration: Optional[Dict] = None


def get_last_orchestration() -> Optional[Dict]:
    return _last_orchestration


class OrchestratorAgent:
    """
    Master agent that coordinates all sourcing agents, runs them in parallel,
    and passes results through the normalizer for NLP matching.
    """

    def __init__(self, query: str, pincode: str, country: str):
        self.query = query
        self.pincode = pincode
        self.country = country
        self.agent_logs: List[AgentLog] = []
        self.normalizer = NormalizerAgent()
        self.started_at = time.time()
        self.total_products = 0

    async def orchestrate(
        self,
        scrape_fn,
        quick_commerce_fn,
        country_enum,
    ) -> Tuple[List[ProductResult], Dict]:
        """
        Run the full multi-agent pipeline:
        1. Dispatch sourcing agents in parallel
        2. Collect & merge results
        3. Run NormalizerAgent for NLP matching
        4. Return products + agent telemetry
        """
        global _last_orchestration

        # --- Phase 1: Sourcing Agents (parallel) ---
        scrape_log = AgentLog("ScrapingOrchestrator", "primary")
        scrape_log.start()

        try:
            products = await scrape_fn(self.query, self.pincode, country_enum)
            scrape_log.succeed(len(products), "live")
        except Exception as e:
            products = []
            scrape_log.fail(str(e))

        self.agent_logs.append(scrape_log)

        # --- Phase 2: Quick Commerce Agents ---
        qc_log = AgentLog("QuickCommerceAgent", "qcommerce")
        qc_log.start()

        try:
            # Calculate reference price
            reference_price = None
            if products:
                prices = sorted([
                    p.price_breakdown.total_landed_cost for p in products
                    if p.price_breakdown.total_landed_cost > 0
                ])
                if prices:
                    mid = len(prices) // 2
                    reference_price = prices[mid] if len(prices) % 2 == 1 else (prices[mid - 1] + prices[mid]) / 2

            qc_products = quick_commerce_fn(
                self.query, self.pincode, country_enum, reference_price=reference_price
            )
            products.extend(qc_products)
            qc_log.succeed(len(qc_products), "synthetic")
        except Exception as e:
            qc_log.fail(str(e))

        self.agent_logs.append(qc_log)

        # --- Phase 3: Deduplication ---
        products = list({p.id: p for p in products}.values())
        self.total_products = len(products)

        # --- Phase 4: NormalizerAgent ---
        products = self.normalizer.normalize(products)
        self.agent_logs.append(self.normalizer.log)

        # --- Build telemetry report ---
        telemetry = self._build_telemetry()
        _last_orchestration = telemetry

        return products, telemetry

    def _build_telemetry(self) -> Dict:
        """Build the agent telemetry report."""
        total_time = round((time.time() - self.started_at) * 1000, 1)
        agents = [log.to_dict() for log in self.agent_logs]

        # Count statuses
        live_count = sum(1 for a in agents if a["data_source"] == "live")
        cached_count = sum(1 for a in agents if a["data_source"] == "cache")
        synthetic_count = sum(1 for a in agents if a["data_source"] == "synthetic")

        return {
            "orchestrator": {
                "query": self.query,
                "pincode": self.pincode,
                "country": self.country,
                "total_products": self.total_products,
                "total_time_ms": total_time,
                "timestamp": datetime.now().isoformat(),
            },
            "agents": agents,
            "normalizer": self.normalizer.get_match_report(),
            "data_health": {
                "live_sources": live_count,
                "cached_sources": cached_count,
                "synthetic_sources": synthetic_count,
                "overall_status": "healthy" if live_count > 0 else (
                    "degraded" if cached_count > 0 else "synthetic"
                ),
            },
        }
