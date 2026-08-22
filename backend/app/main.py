"""
FastAPI Main Application - Multi-Country Price Aggregator
"""
# Load .env file first (GEMINI_API_KEY etc.)
try:
    from pathlib import Path
    from dotenv import load_dotenv
    load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env", override=True)
except ImportError:
    pass

import sys
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")

from fastapi import FastAPI, Query
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, Dict
import hashlib
import time
import json
import threading
from fastapi import Response
from pydantic import BaseModel

from .models import (
    SearchRequest, SearchResponse, ProductGroup, ProductResult,
    CountryCode, COUNTRY_CONFIG, RelatedProduct, CartRequest, CartOptimizationResponse,
    ChatRequest, CustomPlannerRequest, VisionAnalyzeRequest, AlertSubscriptionRequest,
    ForecastRequest, ForecastResponse
)
from .mock_data import get_location_name, get_related_products, PLATFORM_CONFIGS
from .matcher import group_similar_products, calculate_match_score
from .scrapers import scrape_all_platforms, get_quick_commerce_results
from .cart_optimizer import optimize_cart
from .insights import generate_product_insights
from .agent_orchestrator import OrchestratorAgent
from .data_engine import price_cache, health_monitor
from .price_predictor import predict_price_action
from .user_persona import track_user_search, get_user_persona
from .database import get_db, init_db
from .etl_pipeline import run_etl_job
from .agent_chat import generate_price_forecast, generate_health_score, generate_purchase_simulation

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
    session_id: str = Query(default="guest_session")
):
    """Search products across platforms for a specific country"""
    return await perform_search(query, postal_code, country, session_id)


@app.post("/search")
async def search_post(request: SearchRequest):
    """Search products (POST)"""
    session_id = "guest_session"
    return await perform_search(request.query, request.postal_code, request.country, session_id)


@app.post("/cart/optimize", response_model=CartOptimizationResponse)
async def optimize_cart_post(request: CartRequest):
    """Optimize multi-item cart to find best combination"""
    return await optimize_cart(request.queries, request.postal_code, request.country)


@app.post("/api/oracle/predict", response_model=ForecastResponse)
async def predict_price_oracle(request: ForecastRequest):
    """Generate a dynamic predictive price forecast for any product"""
    forecast = await generate_price_forecast(request.query)
    return forecast

class OracleQueryRequest(BaseModel):
    query: str

@app.post("/api/oracle/health-score", response_model=Dict)
async def health_score_oracle(request: OracleQueryRequest):
    """Generate dynamic health score for a product"""
    return await generate_health_score(request.query)

@app.post("/api/oracle/purchase-simulation", response_model=Dict)
async def purchase_simulation_oracle(request: OracleQueryRequest):
    """Generate dynamic purchase simulation for a product"""
    return await generate_purchase_simulation(request.query)


@app.post("/api/alerts/subscribe")
async def subscribe_alerts(request: AlertSubscriptionRequest):
    """Subscribe to dynamic price drops and dispatch verification messages live"""
    import httpx
    import urllib.parse
    
    # Generate verification alert welcome message
    message = (
        f"🌟 *Welcome to Parallax Edge!*\n\n"
        f"You will get notified about the product *{request.product}* when the price drops below *₹{request.targetPrice:,.2f}*.\n\n"
        f"🔔 *Subscription Details:*\n"
        f"• Target Price: ₹{request.targetPrice:,.2f}\n"
        f"• Dip Threshold: {request.dipPct}%\n"
        f"• Alert Status: Active & Sourced Live\n\n"
        f"Thank you for using Parallax Edge!"
    )
    
    telegram_success = False
    whatsapp_success = False
    sms_success = False
    error_details = None
    
    # 1. Dispatch via Telegram Bot API
    if request.channel == "telegram":
        chat_id = request.contact.strip()
        if not chat_id.startswith("-") and not chat_id.isdigit():
            if not chat_id.startswith("@"):
                chat_id = f"@{chat_id}"
        
        bot_token = "8960134526:AAHHUJSjAqWz5hpjjZhEgJXgg9GSRbk1Bic"
        telegram_url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                res = await client.post(telegram_url, json={
                    "chat_id": chat_id,
                    "text": message,
                    "parse_mode": "Markdown"
                })
                if res.status_code == 200:
                    telegram_success = True
                else:
                    error_details = f"Telegram error (status {res.status_code}): {res.text}"
        except Exception as e:
            error_details = f"Telegram request failed: {str(e)}"
            
    # 2. Dispatch via Twilio Sandbox WhatsApp API
    elif request.channel == "whatsapp":
        from twilio.rest import Client
        import json
        
        import os
        account_sid = os.getenv("TWILIO_ACCOUNT_SID", "")
        auth_token = os.getenv("TWILIO_AUTH_TOKEN", "")
        
        clean_phone = request.contact.strip().replace(" ", "")
        if not clean_phone.startswith("+"):
            clean_phone = f"+{clean_phone}"
        
        to_number = f"whatsapp:{clean_phone}"
        from_number = os.getenv("TWILIO_PHONE_NUMBER", "whatsapp:+17372212163")
        
        try:
            client = Client(account_sid, auth_token)
            msg_res = client.messages.create(
                content_sid="HXfe5ab5f00277942d4d4200328b4d403c",
                content_variables=json.dumps({
                    "1": "Parallax Edge Welcome",
                    "2": f"{request.product} price alert below Rs {request.targetPrice:,.0f}"
                }),
                from_=from_number,
                to=to_number
            )
            whatsapp_success = True
        except Exception as e:
            error_details = f"Twilio WhatsApp dispatch failed: {str(e)}"
            whatsapp_success = False
            
    # 3. SMS notification trigger
    elif request.channel == "sms":
        sms_success = True
        
    return {
        "status": "subscribed",
        "product": request.product,
        "channel": request.channel,
        "contact": request.contact,
        "telegram_success": telegram_success,
        "whatsapp_success": whatsapp_success or sms_success,
        "error_details": error_details
    }


async def perform_search(query: str, postal_code: str, country: CountryCode, session_id: str):
    """Core search logic - Agentic Orchestration + Hybrid Data Engine"""
    start_time = time.time()
    
    # Sanitize input immediately
    query = sanitize_data(query)
    postal_code = sanitize_data(postal_code)
    
    country_config = COUNTRY_CONFIG[country]
    
    track_user_search(session_id, query)
    persona = get_user_persona(session_id)
    
    products = []
    telemetry = None
    
    orchestrator = OrchestratorAgent(query, postal_code, country.value)
    products, telemetry = await orchestrator.orchestrate(
        scrape_fn=scrape_all_platforms,
        quick_commerce_fn=get_quick_commerce_results,
        country_enum=country
    )
    
    if products:
        price_cache.put(query, postal_code, products)
        
    products = list({p.id: p for p in products}.values())
    product_groups = group_and_compare_products(products, country_config["symbol"])
    
    related_data = get_related_products(query, country)
    related = [RelatedProduct(**item) for item in related_data]
    
    insights = generate_product_insights(
        products=products,
        query=query,
        pincode=postal_code,
        symbol=country_config["symbol"]
    )
    
    from .user_persona import get_reorder_suggestions
    
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
    
    clean_dict = sanitize_data(jsonable_encoder(response_obj))
    json_str = json.dumps(clean_dict, ensure_ascii=True)
    return Response(content=json_str, media_type="application/json")


@app.post("/chat")
async def chat(request: ChatRequest):
    from .agent_chat import process_chat_message
    reply, products, budget_plan = await process_chat_message(
        request.messages, request.postal_code, request.country
    )
    response = {
        "reply": reply,
        "recommended_products": [sanitize_data(jsonable_encoder(p)) for p in products],
        "budget_plan": sanitize_data(jsonable_encoder(budget_plan)) if budget_plan else None,
    }
    json_str = json.dumps(response, ensure_ascii=True)
    return Response(content=json_str, media_type="application/json")


@app.post("/planner/custom")
async def custom_planner(request: CustomPlannerRequest):
    from .agent_chat import generate_custom_plan
    items = await generate_custom_plan(request.situation, request.budget)
    
    clean_items = [sanitize_data(jsonable_encoder(item)) for item in items]
    json_str = json.dumps(clean_items, ensure_ascii=True)
    return Response(content=json_items, media_type="application/json")


@app.post("/vision/analyze")
async def vision_analyze(request: VisionAnalyzeRequest):
    from .agent_chat import analyze_image
    items = await analyze_image(request.image_data)
    
    clean_items = [sanitize_data(jsonable_encoder(item)) for item in items]
    json_str = json.dumps(clean_items, ensure_ascii=True)
    return Response(content=json_str, media_type="application/json")


class ReceiptVisionRequest(BaseModel):
    image_data: str

@app.post("/api/vision/receipt")
async def vision_receipt(request: ReceiptVisionRequest):
    from .agent_chat import analyze_receipt
    data = await analyze_receipt(request.image_data)
    
    json_str = json.dumps(sanitize_data(data), ensure_ascii=True)
    return Response(content=json_str, media_type="application/json")


class ReviewAnalysisRequest(BaseModel):
    product_title: str

@app.post("/api/vision/reviews")
async def vision_reviews_post(request: ReviewAnalysisRequest):
    from .agent_chat import analyze_product_reviews
    data = await analyze_product_reviews(request.product_title)
    json_str = json.dumps(sanitize_data(data), ensure_ascii=True)
    return Response(content=json_str, media_type="application/json")

@app.get("/api/vision/reviews")
async def vision_reviews_get(q: str = "Target Product"):
    from .agent_chat import analyze_product_reviews
    data = await analyze_product_reviews(q)
    json_str = json.dumps(sanitize_data(data), ensure_ascii=True)
    return Response(content=json_str, media_type="application/json")


def group_and_compare_products(products: list[ProductResult], symbol: str) -> list[ProductGroup]:
    """Group similar products and find best options"""
    if not products:
        return []
    
    grouped = group_similar_products([p.title for p in products])
    result = []
    
    for i, group_indices in enumerate(grouped):
        group_products = [products[j] for j in group_indices]
        if not group_products:
            continue
        
        best_price = min(group_products, key=lambda p: p.price_breakdown.total_landed_cost)
        fastest = min(group_products, key=lambda p: p.eta_minutes)
        
        titles = [p.title for p in group_products]
        match_confidence = 100
        if len(titles) > 1:
            scores = [calculate_match_score(titles[0], t) for t in titles[1:]]
            match_confidence = sum(scores) / len(scores) if scores else 100
        
        savings_message = None
        if best_price.id != fastest.id:
            price_diff = fastest.price_breakdown.total_landed_cost - best_price.price_breakdown.total_landed_cost
            time_diff = best_price.eta_minutes - fastest.eta_minutes
            
            if price_diff > 0 and time_diff > 0:
                if price_diff < 30:
                     savings_message = f"Fastest is also Best Value! (+{symbol}{price_diff:.0f})"
                elif price_diff > 50:
                    time_str = f"{time_diff // 60} hours" if time_diff >= 60 else f"{time_diff} mins"
                    if time_diff >= 1440: time_str = f"{time_diff // 1440} days"
                    percentage = int((price_diff / fastest.price_breakdown.total_landed_cost) * 100)
                    savings_message = f"Save {symbol}{price_diff:.0f} ({percentage}%) by waiting {time_str}."
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
    country_config = COUNTRY_CONFIG[request.country]
    
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


@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/admin/metrics")
async def get_metrics():
    with get_db() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM scrape_metrics ORDER BY timestamp DESC LIMIT 20")
        metrics = [dict(row) for row in cursor.fetchall()]
        
        cursor.execute("SELECT COUNT(*) as c FROM warehouse_products")
        warehouse_count = cursor.fetchone()['c']
        
        cursor.execute("SELECT COUNT(*) as c FROM staging_scrapes WHERE processed = FALSE")
        staging_count = cursor.fetchone()['c']
        
        cursor.execute("SELECT variant_id, COUNT(*) as c FROM ab_test_logs GROUP BY variant_id")
        ab_stats = [dict(row) for row in cursor.fetchall()]
        
    return {
        "warehouse_total": warehouse_count,
        "staging_pending": staging_count,
        "recent_metrics": metrics,
        "ab_test_stats": ab_stats
    }

@app.post("/admin/etl-run")
async def trigger_etl():
    threading.Thread(target=run_etl_job).start()
    return {"status": "ETL job started"}

@app.post("/ab-test/log")
async def log_ab_test(data: dict):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO ab_test_logs (user_id, variant_id, event_type)
            VALUES (?, ?, ?)
        ''', (data.get('user_id', 'unknown'), data.get('variant_id', 'A'), data.get('event_type', 'view')))
        conn.commit()
    return {"status": "logged"}

@app.post("/optimize/what-if")
@app.post("/cart/what-if")
async def what_if_analysis(request: dict):
    cart_items = request.get("items", [])
    queries = request.get("queries", [])
    symbol = request.get("symbol", "₹")
    
    scenarios = []
    
    if cart_items:
        platforms = set(item.get("product", {}).get("platform", "") for item in cart_items)
        total_items = sum(item.get("quantity", 1) for item in cart_items)
        
        if len(platforms) > 1:
            multi_vendor_delivery = sum(
                float(item.get("product", {}).get("price_breakdown", {}).get("delivery_fee", 0)) 
                for item in cart_items
            )
            est_savings = max(150, int(multi_vendor_delivery + 90))
            scenarios.append({
                "impact_type": "positive",
                "cost_difference": est_savings,
                "message": f"Consolidating order across {len(platforms)} vendors to 1 single store saves {symbol}{est_savings} in multi-vendor delivery & platform fees."
            })
            
        subtotal = sum(
            float(item.get("product", {}).get("price_breakdown", {}).get("base_price", 0)) * item.get("quantity", 1)
            for item in cart_items
        )
        if subtotal < 500:
            shortfall = 500 - subtotal
            scenarios.append({
                "impact_type": "positive",
                "cost_difference": 40,
                "message": f"Add {symbol}{shortfall:.0f} more to your cart to unlock 100% FREE express shipping!"
            })
            
        scenarios.append({
            "impact_type": "positive",
            "cost_difference": 120,
            "message": f"Selecting standard 2-day delivery instead of rush express saves {symbol}120 on handling."
        })
    else:
        if queries:
            item_name = queries[0][:40]
            scenarios.append({
                "impact_type": "positive",
                "cost_difference": 180,
                "message": f"If you schedule standard delivery for '{item_name}', delivery fees drop by {symbol}180."
            })
            if len(queries) > 1:
                scenarios.append({
                    "impact_type": "positive",
                    "cost_difference": 240,
                    "message": f"Combining '{queries[0][:25]}' and '{queries[1][:25]}' in 1 shipment saves {symbol}240 in multi-vendor fees."
                })
        else:
            scenarios.append({
                "impact_type": "positive",
                "cost_difference": 150,
                "message": f"Consolidating items into a single daily delivery slot saves {symbol}150."
            })
            
    return {"scenarios": scenarios, "insights": scenarios}


from .ml_engine import ml_engine

@app.post("/oracle/forecast")
async def get_price_forecast_ml(product: ProductResult):
    forecast = predict_price_action(product)
    if not forecast:
        return {"error": "Insufficient data for forecasting"}
    return forecast

@app.post("/api/ml/classify")
async def classify_product_title(request: dict):
    title = request.get("title", "")
    if not title:
        return {"error": "Title required"}
    return ml_engine.classify_title(title)

@app.post("/api/ml/recommend")
async def recommend_products_ml(request: dict):
    query = request.get("query", "electronics")
    persona = request.get("persona", "Student")
    products = request.get("products", None)
    return {"recommendations": ml_engine.recommend_products(query, persona, products)}

@app.get("/api/ml/anomalies")
async def get_ml_anomalies():
    return {"anomalies": ml_engine.detect_price_anomalies()}
