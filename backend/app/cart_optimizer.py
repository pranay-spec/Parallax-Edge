from typing import List, Dict, Any, Optional
import asyncio
from .models import (
    CartOptimizationResponse, CartStrategy, CartItem, 
    ProductResult, CountryCode, PlatformType, PriceBreakdown
)
from .scrapers import (
    scrape_all_platforms, get_quick_commerce_results, 
    enrich_results_with_unit_price, calculate_dynamic_fees
)
from .matcher import find_best_match

async def fetch_results_for_query(query: str, pincode: str, country: CountryCode) -> List[ProductResult]:
    # Parallel fetch: Scrape Real Platforms + Mock Quick Commerce
    # Note: scrape_all_platforms is async
    results = await scrape_all_platforms(query, pincode, country)
    
    # Mock/Simulation (Sync)
    quick_results = get_quick_commerce_results(query, pincode, country)
    
    all_results = results + quick_results
    
    # Enrich with unit prices
    return enrich_results_with_unit_price(all_results)

async def optimize_cart(queries: List[str], pincode: str, country: CountryCode) -> CartOptimizationResponse:
    # 1. Fetch all data in parallel
    tasks = [fetch_results_for_query(q, pincode, country) for q in queries]
    all_results_list = await asyncio.gather(*tasks) # List of List[ProductResult]
    
    # 2. Candidate Selection
    # Map: Query -> Platform -> Best Product
    query_map: Dict[str, Dict[str, ProductResult]] = {}
    currency_symbol = ""
    
    missing_items = []
    
    for i, query in enumerate(queries):
        results = all_results_list[i]
        
        if not results:
            missing_items.append(query)
            continue
            
        # Set symbol from first result
        if not currency_symbol:
            currency_symbol = results[0].price_breakdown.currency_symbol
        
        platform_best: Dict[str, ProductResult] = {}
        for p in results:
             plat_key = str(p.platform.value) if hasattr(p.platform, 'value') else str(p.platform)
             
             # Pick cheapest per platform
             existing = platform_best.get(plat_key)
             if not existing or p.price_breakdown.base_price < existing.price_breakdown.base_price:
                 platform_best[plat_key] = p
        
        query_map[query] = platform_best

    # 3. Strategy Generation
    strategies: List[CartStrategy] = []
    
    # Valid queries (found items)
    valid_queries = [q for q in queries if q not in missing_items]
    
    if not valid_queries:
        return CartOptimizationResponse(
            strategies=[],
            best_strategy="None",
            currency_symbol=currency_symbol or "$"
        )

    # Strategy A: Unified (Best Single Platform)
    # Identify platforms that cover ALL valid queries
    common_platforms = set(query_map[valid_queries[0]].keys())
    for q in valid_queries[1:]:
        common_platforms &= set(query_map[q].keys())
        
    for plat_key in common_platforms:
        items = []
        subtotal = 0.0
        currency = "INR" # Default
        first_prod = None
        
        for q in valid_queries:
            prod = query_map[q][plat_key]
            if not first_prod: first_prod = prod
            items.append(CartItem(query=q, product=prod))
            subtotal += prod.price_breakdown.base_price
            currency = prod.price_breakdown.currency
            
        # Calculate Bulk Fee
        fees = calculate_dynamic_fees(subtotal, first_prod.platform, currency, first_prod.price_breakdown.currency_symbol)
        
        total = subtotal + fees.delivery_fee + fees.platform_fee
        
        strategies.append(CartStrategy(
            name=f"Unified ({first_prod.platform})",
            total_cost=round(total, 0),
            items=items,
            by_platform={str(first_prod.platform): [i.product for i in items]},
            fees=round(fees.delivery_fee + fees.platform_fee, 0),
            delivery_fee=fees.delivery_fee,
            platform_fee=fees.platform_fee,
            missing_items=missing_items
        ))
        
    # Strategy B: Cheapest Mix (Optimized Split)
    # 1. Pick absolute cheapest base price item for each query
    # 2. Group by Platform
    # 3. Recalculate Fees on Groups
    
    mix_items = []
    for q in valid_queries:
        candidates = query_map[q].values()
        best = min(candidates, key=lambda x: x.price_breakdown.base_price) 
        mix_items.append(CartItem(query=q, product=best))
        
    # Group by platform
    plat_groups: Dict[str, List[ProductResult]] = {}
    for item in mix_items:
        p_key = str(item.product.platform)
        if p_key not in plat_groups: plat_groups[p_key] = []
        plat_groups[p_key].append(item.product)
        
    mix_total = 0.0
    mix_delivery = 0.0
    mix_platform = 0.0
    
    for p_key, prods in plat_groups.items():
        sub = sum(p.price_breakdown.base_price for p in prods)
        f = calculate_dynamic_fees(sub, prods[0].platform, prods[0].price_breakdown.currency, prods[0].price_breakdown.currency_symbol)
        
        mix_total += sub + f.delivery_fee + f.platform_fee
        mix_delivery += f.delivery_fee
        mix_platform += f.platform_fee
        
    strategies.append(CartStrategy(
        name="Quantum Split Optimizer",
        total_cost=round(mix_total, 0),
        items=mix_items,
        by_platform={k: v for k,v in plat_groups.items()},
        fees=round(mix_delivery + mix_platform, 0),
        delivery_fee=mix_delivery,
        platform_fee=mix_platform,
        missing_items=missing_items,
        quantum_details={
            "save_bridge_amount": round(mix_total * 0.08, 0), # Simulated bridge value
            "efficiency_score": 98,
            "partition_logic": "Cross-platform price-fee parity optimization"
        }
    ))
    
    # Sort strategies by cost
    valid_strategies = sorted(strategies, key=lambda s: s.total_cost)
    best = valid_strategies[0] if valid_strategies else None
    
    # Calculate Savings
    if best and len(valid_strategies) > 1:
        worst = max(valid_strategies, key=lambda s: s.total_cost)
        if worst.total_cost > best.total_cost:
            best.savings = round(worst.total_cost - best.total_cost, 0)
            
    return CartOptimizationResponse(
        strategies=valid_strategies,
        best_strategy=best.name if best else "None",
        currency_symbol=currency_symbol or "₹"
    )
