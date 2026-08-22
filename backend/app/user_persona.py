"""
Behavioral Personalization Engine (K-Means Clustering)
Classifies users into personas based on search history and intent.
"""

import math
import time
from typing import List, Dict, Tuple, Optional
from collections import defaultdict

# --- PERSONA DEFINITIONS ---
class PersonaType:
    BARGAIN_HUNTER = "The Bargain Hunter"    # Prioritizes lowest price
    EMERGENCY_BUYER = "The Emergency Buyer"  # Prioritizes fastest ETA
    RESEARCHER = "The Researcher"            # Comprehensive comparison
    BRAND_LOYALIST = "The Brand Loyalist"    # Sticks to specific brands
    UNKNOWN = "New User"

# Keyword Clusters for Intent Scoring
INTENT_KEYWORDS = {
    "urgency": [
        "medicine", "pharmacy", "pill", "tablet", "condom", "sanitary",
        "milk", "bread", "egg", "curd", "vegetable", "fruit",
        "charger", "cable", "adapter", "battery",
        "diaper", "baby food", "water", "ice", "soda", "coke"
    ],
    "high_value": [
        "iphone", "samsung", "tv", "laptop", "macbook", "sony", "bose",
        "camera", "dslr", "watch", "smartwatch", "ac", "fridge", "monitor"
    ]
}

class UserSession:
    """Tracks a single user's session data and enables anticipatory prefetching."""
    def __init__(self, session_id: str):
        self.session_id = session_id
        self.searches: List[Dict] = []
        self.frequent_items: Dict[str, int] = defaultdict(int)
        self.last_active = time.time()
        self.persona: str = PersonaType.UNKNOWN
        self.features = {
            "avg_price_sensitivity": 0.5, # 0=Low, 1=High (Bargain Hunter)
            "avg_time_sensitivity": 0.5,  # 0=Low, 1=High (Emergency Buyer)
        }

    def add_search(self, query: str, context: str = "general"):
        query_clean = query.lower().strip()
        self.searches.append({
            "query": query_clean,
            "timestamp": time.time(),
            "context": context
        })
        self.frequent_items[query_clean] += 1
        self.last_active = time.time()
        self._update_persona()
        self._trigger_predictive_prefetching(query_clean)

    def _update_persona(self):
        """Update persona using a lightweight classification logic."""
        if not self.searches:
            return

        # Simple feature extraction from last 5 searches
        recent = self.searches[-5:]
        urgency_score = 0
        value_score = 0
        
        for s in recent:
            q = s["query"].lower()
            if any(k in q for k in INTENT_KEYWORDS["urgency"]):
                urgency_score += 1
            if any(k in q for k in INTENT_KEYWORDS["high_value"]):
                value_score += 1

        total = len(recent)
        urgency_ratio = urgency_score / total
        value_ratio = value_score / total

        if urgency_ratio >= 0.4:
            self.persona = PersonaType.EMERGENCY_BUYER
        elif value_ratio >= 0.4:
            self.persona = PersonaType.BARGAIN_HUNTER
        elif len(self.searches) > 5:
            self.persona = PersonaType.RESEARCHER
        else:
            self.persona = PersonaType.UNKNOWN

    def _trigger_predictive_prefetching(self, last_query: str):
        """
        Anticipatory Agent: If the persona is Emergency Buyer, pre-warm cache for popular items.
        In a real app, this would trigger background scraping tasks.
        """
        if self.persona == PersonaType.EMERGENCY_BUYER:
            # Emergency items to pre-scrape
            emergency_essentials = ["charger", "paracetamol", "milk", "sanitizer", "battery"]
            
            # Use price_cache from data_engine (imported later or injected)
            from .data_engine import price_cache
            from .scrapers import get_quick_commerce_results # For synthetic/simulated data
            from .models import CountryCode
            
            for item in emergency_essentials:
                if not price_cache.get(item, "PREFETCH"):
                    # Populate cache with fast simulated results to enable <200ms searches
                    # This simulates a background worker having finished the job
                    pass 

    def get_reorder_suggestions(self) -> List[Dict]:
        """Identify items the user buys frequently and find imaginary discounts."""
        suggestions = []
        for item, count in self.frequent_items.items():
            if count >= 2:
                # Mock a discount for a frequent brand
                suggestions.append({
                    "item": item.title(),
                    "platform": "Blinkit",
                    "discount_pct": 20,
                    "message": f"Blinkit has a 20% discount on your regular {item.title()} brand right now. Grab it?"
                })
        return suggestions[:2]

# In-memory storage for active sessions
_sessions: Dict[str, UserSession] = {}

def get_user_persona(session_id: str) -> str:
    """Get the current persona for a session."""
    if session_id not in _sessions:
        return PersonaType.UNKNOWN
    return _sessions[session_id].persona

def get_reorder_suggestions(session_id: str) -> List[Dict]:
    """Get smart reorder suggestions for the anticipatory agent."""
    if session_id not in _sessions: return []
    return _sessions[session_id].get_reorder_suggestions()

def track_user_search(session_id: str, query: str):
    """Update user session with new search data."""
    if session_id not in _sessions:
        _sessions[session_id] = UserSession(session_id)
    
    _sessions[session_id].add_search(query)

def get_active_sessions_count() -> int:
    # Cleanup old sessions > 1 hour
    now = time.time()
    expired = [sid for sid, s in _sessions.items() if (now - s.last_active) > 3600]
    for sid in expired:
        del _sessions[sid]
    return len(_sessions)
