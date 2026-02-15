"""
FastAPI Main Application - Multi-Country Price Aggregator
"""
from fastapi import FastAPI, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import hashlib
import time

from .models import (
    SearchRequest, SearchResponse, ProductGroup, ProductResult,
    CountryCode, COUNTRY_CONFIG, RelatedProduct, CartRequest, CartOptimizationResponse
)
from .mock_data import get_location_name, get_related_products, PLATFORM_CONFIGS
from .matcher import group_similar_products, calculate_match_score
from .scrapers import scrape_all_platforms, get_quick_commerce_results
from .cart_optimizer import optimize_cart
from .insights import generate_product_insights


app = FastAPI(
    title="Parallax Edge API",
    description="Multi-country hyper-local price aggregator across e-commerce platforms",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def sanitize_data(obj):
    """Recursively strip surrogate characters that crash JSON serialization."""
    if isinstance(obj, str):
        # Explicitly remove surrogate characters U+D800 to U+DFFF
        return "".join(c for c in obj if not (0xD800 <= ord(c) <= 0xDFFF))
    elif isinstance(obj, dict):
        return {k: sanitize_data(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_data(x) for x in obj]
    return obj


from .agent_orchestrator import OrchestratorAgent
from .data_engine import price_cache, health_monitor
from .price_predictor import predict_price_action
from .user_persona import track_user_search, get_user_persona

@app.get("/")
async def root():
    return {
        "name": "Parallax Edge API",
        "version": "2.1.0 (Agentic)",
        "supported_countries": [c.value for c in CountryCode],
        "system_status": "operational"
    }


@app.get("/countries")
async def get_countries():
    """Get list of supported countries with their configurations"""
    return {
        code.value: {
            "name": config["name"],
            "currency": config["currency"],
            "symbol": config["symbol"],
            "postal_code_format": config["postal_code_format"],
            "platforms": [p.value for p in config["platforms"]],
        }
        for code, config in COUNTRY_CONFIG.items()
    }

@app.get("/system/health")
async def get_system_health():
    """Get real-time agent system health metrics (for UI pulse)."""
    return health_monitor.get_health()


@app.get("/search")
async def search_get(
    query: str = Query(..., min_length=1),
    postal_code: str = Query(..., alias="pincode"),
    country: CountryCode = Query(default=CountryCode.IN),
    session_id: str = Query(default="guest_session")  # Track user session
):
    """Search products across platforms for a specific country"""
    return await perform_search(query, postal_code, country, session_id)


@app.post("/search")
async def search_post(request: SearchRequest):
    """Search products (POST)"""
    # Use a default session_id for POST requests if not provided
    session_id = "guest_session"
    return await perform_search(request.query, request.postal_code, request.country, session_id)


@app.post("/cart/optimize", response_model=CartOptimizationResponse)
async def optimize_cart_post(request: CartRequest):
    """Optimize multi-item cart to find best combination"""
    return await optimize_cart(request.queries, request.postal_code, request.country)


async def perform_search(query: str, postal_code: str, country: CountryCode, session_id: str):
    """Core search logic - Agentic Orchestration + Hybrid Data Engine"""
    start_time = time.time()
    
    # Sanitize input immediately
    query = sanitize_data(query)
    postal_code = sanitize_data(postal_code)
    
    country_config = COUNTRY_CONFIG[country]
    
    # 1. Behavioral Personalization: Track User Intent
    track_user_search(session_id, query)
    persona = get_user_persona(session_id)
    
    products = []
    telemetry = None
    
    # 2. Check Fault-Tolerant Cache First
    cached_data = price_cache.get(query, postal_code)
    # Note: For this turn, we'll let it pass to ensure we get results or fresh scrape
    # In a real app, we'd reconstruct objects from cache here.

    # 3. Agentic Orchestration
    if not products:
        orchestrator = OrchestratorAgent(query, postal_code, country.value)
        products, telemetry = await orchestrator.orchestrate(
            scrape_fn=scrape_all_platforms,
            quick_commerce_fn=get_quick_commerce_results,
            country_enum=country
        )
        
        if products:
            price_cache.put(query, postal_code, products)
            
    # 4. Filter and cleanup
    products = list({p.id: p for p in products}.values())
    
    # Group similar products
    product_groups = group_and_compare_products(products, country_config["symbol"])
    
    # Get related products
    related_data = get_related_products(query, country)
    related = [RelatedProduct(**item) for item in related_data]
    
    # Generate smart insights
    insights = generate_product_insights(
        products=products,
        query=query,
        pincode=postal_code,
        symbol=country_config["symbol"]
    )
    
    from .user_persona import get_reorder_suggestions
    
    # Assembly
    response_obj = SearchResponse(
        query=query,
        postal_code=postal_code,
        country=country,
        location_name=get_location_name(postal_code, country),
        currency=country_config["currency"],
        currency_symbol=country_config["symbol"],
        total_results=sum(len(g.products) for g in product_groups),
        product_groups=product_groups,
        related_products=related,
        insights=insights,
        system_health=health_monitor.get_health(),
        agent_telemetry=telemetry,
        user_persona=persona,
        smart_reorder=get_reorder_suggestions(session_id)
    )
    
    # Final assembly and sanitization
    # We use jsonable_encoder to safely convert Pydantic/complex objects to standard dicts/lists
    clean_dict = sanitize_data(jsonable_encoder(response_obj))
    
    # Final safety: use json.dumps with ensure_ascii=True to escape surrogates into \uXXXX
    import json
    from fastapi import Response
    json_str = json.dumps(clean_dict, ensure_ascii=True)
    return Response(content=json_str, media_type="application/json")


def group_and_compare_products(products: list[ProductResult], symbol: str) -> list[ProductGroup]:
    """Group similar products and find best options"""
    if not products:
        return []
    
    # Group by similar titles
    grouped = group_similar_products([p.title for p in products])
    result = []
    
    for i, group_indices in enumerate(grouped):
        group_products = [products[j] for j in group_indices]
        if not group_products:
            continue
        
        # Find best price and fastest delivery
        best_price = min(group_products, key=lambda p: p.price_breakdown.total_landed_cost)
        fastest = min(group_products, key=lambda p: p.eta_minutes)
        
        # Calculate match confidence
        titles = [p.title for p in group_products]
        match_confidence = 100
        if len(titles) > 1:
            scores = [calculate_match_score(titles[0], t) for t in titles[1:]]
            match_confidence = sum(scores) / len(scores) if scores else 100
        
        # Generate decision badges (Value Proposition)
        savings_message = None
        if best_price.id != fastest.id:
            price_diff = fastest.price_breakdown.total_landed_cost - best_price.price_breakdown.total_landed_cost
            time_diff = best_price.eta_minutes - fastest.eta_minutes
            
            # Scenario: Q-Commerce is faster but more expensive
            if price_diff > 0 and time_diff > 0:
                # 3. Urgency Metric: Low Delta (< 30 currency units)
                if price_diff < 30:
                     savings_message = f"Fastest is also Best Value! (+{symbol}{price_diff:.0f})"
                
                # Scenario 1: Significant Savings (Wait to Save)
                elif price_diff > 50:
                    time_str = f"{time_diff // 60} hours" if time_diff >= 60 else f"{time_diff} mins"
                    if time_diff >= 1440: time_str = f"{time_diff // 1440} days"
                    percentage = int((price_diff / fastest.price_breakdown.total_landed_cost) * 100)
                    savings_message = f"Save {symbol}{price_diff:.0f} ({percentage}%) by waiting {time_str}."
                
                # Scenario 2: Small premium for Speed (Pay for Speed)
                elif price_diff <= 50 and fastest.eta_minutes < 60:
                     savings_message = f"Pay only {symbol}{price_diff:.0f} extra to get it in {fastest.eta_minutes} mins."
        
        result.append(ProductGroup(
            group_id=hashlib.md5(group_products[0].title.encode()).hexdigest()[:8],
            canonical_title=group_products[0].title.split(',')[0].split('-')[0].split('|')[0].strip(),
            match_confidence=match_confidence,
            products=group_products,
            best_price=best_price,
            fastest_delivery=fastest,
            savings_message=savings_message
        ))
    
    return result


@app.get("/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}


@app.post("/insights")
async def get_insights(request: SearchRequest):
    """
    Get smart insights (coupons, urgency, carbon, reviews, campus deals)
    for a product search. Returns contextual intelligence.
    """
    country_config = COUNTRY_CONFIG[request.country]
    
    # Get products first
    products = await scrape_all_platforms(request.query, request.postal_code, request.country)
    quick_commerce = get_quick_commerce_results(
        request.query, request.postal_code, request.country
    )
    products.extend(quick_commerce)
    products = list({p.id: p for p in products}.values())
    
    if not products:
        return {
            "coupons": {"by_product": {}, "best_coupon": None, "total_coupons_found": 0},
            "urgency": {},
            "carbon": {},
            "reviews": {"sentiments": [], "label_warnings": [], "product_type": "General"},
            "campus": {"local_stores": [], "group_buy": None, "is_vit_area": False},
        }
    
    insights = generate_product_insights(
        products=products,
        query=request.query,
        pincode=request.postal_code,
        symbol=country_config["symbol"]
    )
    
    return insights
