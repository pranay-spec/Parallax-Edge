"""
Multi-Region Mock Data with Popular Delivery Apps
"""
import random
import hashlib
from typing import List
from .models import (
    ProductResult, PriceBreakdown, PlatformType, DeliverySpeed, 
    CountryCode, COUNTRY_CONFIG
)


# ============================================
# REALISTIC INDIA PRODUCT DATA (Milk Category)
# ============================================
# Based on actual prices from Blinkit, Zepto, Swiggy Instamart, BigBasket, Amazon, Flipkart
# As of Feb 2026 prices

INDIA_MILK_PRODUCTS = {
    "blinkit": [
        {
            "title": "Amul Taaza Tetra Milk 200ml",
            "base_price": 16,
            "delivery_fee": 0,
            "handling_fee": 0,
            "small_cart_fee": 15,
            "platform_fee": 2,
            "eta_minutes": 10,
        },
        {
            "title": "Amul Taaza Toned Milk 500ml",
            "base_price": 29,
            "delivery_fee": 0,
            "handling_fee": 0,
            "small_cart_fee": 15,
            "platform_fee": 2,
            "eta_minutes": 10,
        },
        {
            "title": "Amul Gold Full Cream Milk 500ml",
            "base_price": 33,
            "delivery_fee": 0,
            "handling_fee": 0,
            "small_cart_fee": 15,
            "platform_fee": 2,
            "eta_minutes": 8,
        },
        {
            "title": "Mother Dairy Toned Milk 500ml",
            "base_price": 28,
            "delivery_fee": 0,
            "handling_fee": 0,
            "small_cart_fee": 15,
            "platform_fee": 2,
            "eta_minutes": 12,
        },
    ],
    "zepto": [
        {
            "title": "Amul Taaza Tetra Milk 200ml",
            "base_price": 16,
            "delivery_fee": 0,
            "handling_fee": 0,
            "small_cart_fee": 15,
            "platform_fee": 2,
            "eta_minutes": 10,
        },
        {
            "title": "Amul Taaza Toned Milk 500ml",
            "base_price": 29,
            "delivery_fee": 0,
            "handling_fee": 0,
            "small_cart_fee": 15,
            "platform_fee": 2,
            "eta_minutes": 8,
        },
        {
            "title": "Amul Gold Full Cream Milk 500ml",
            "base_price": 33,
            "delivery_fee": 0,
            "handling_fee": 0,
            "small_cart_fee": 15,
            "platform_fee": 2,
            "eta_minutes": 9,
        },
    ],
    "swiggy_instamart": [
        {
            "title": "Amul Taaza Tetra Milk 200ml",
            "base_price": 16,
            "delivery_fee": 0,
            "handling_fee": 0,
            "small_cart_fee": 15,
            "platform_fee": 2,
            "eta_minutes": 10,
        },
        {
            "title": "Amul Taaza Toned Milk 500ml",
            "base_price": 29,
            "delivery_fee": 0,
            "handling_fee": 0,
            "small_cart_fee": 15,
            "platform_fee": 2,
            "eta_minutes": 15,
        },
        {
            "title": "Amul Gold Full Cream Milk 500ml",
            "base_price": 33,
            "delivery_fee": 0,
            "handling_fee": 0,
            "small_cart_fee": 15,
            "platform_fee": 2,
            "eta_minutes": 12,
        },
    ],
    "bigbasket": [
        {
            "title": "Amul Taaza Homogenised Toned Milk 500ml",
            "base_price": 16,
            "delivery_fee": 0,  # Free on orders above ₹300
            "handling_fee": 0,
            "small_cart_fee": 30,  # Applied if cart < ₹300
            "platform_fee": 0,
            "eta_minutes": 120,  # 2-hour slot
        },
        {
            "title": "Amul Gold Full Cream Milk 500ml",
            "base_price": 32,
            "delivery_fee": 0,
            "handling_fee": 0,
            "small_cart_fee": 30,
            "platform_fee": 0,
            "eta_minutes": 120,
        },
        {
            "title": "Nandini Goodlife Toned Milk 500ml",
            "base_price": 21,
            "delivery_fee": 0,
            "handling_fee": 0,
            "small_cart_fee": 30,
            "platform_fee": 0,
            "eta_minutes": 180,
        },
    ],
    "amazon_in": [
        {
            "title": "Amul Taaza Homogenised Toned Milk 1L (Pack of 12)",
            "base_price": 624,  # Bulk pack pricing
            "delivery_fee": 0,  # Prime free delivery
            "handling_fee": 0,
            "small_cart_fee": 0,
            "platform_fee": 0,
            "eta_minutes": 1440,  # 1 day
        },
        {
            "title": "Amul Gold Milk 1L Tetra Pack",
            "base_price": 75,
            "delivery_fee": 40,
            "handling_fee": 0,
            "small_cart_fee": 0,
            "platform_fee": 0,
            "eta_minutes": 1440,
        },
        {
            "title": "Nestle a+ Nourish Toned Milk 1L",
            "base_price": 72,
            "delivery_fee": 40,
            "handling_fee": 0,
            "small_cart_fee": 0,
            "platform_fee": 0,
            "eta_minutes": 2880,  # 2 days
        },
    ],
    "flipkart": [
        {
            "title": "Amul Gold Milk 1L Tetra Pack",
            "base_price": 78,
            "delivery_fee": 40,
            "handling_fee": 0,
            "small_cart_fee": 0,
            "platform_fee": 0,
            "eta_minutes": 2880,
        },
        {
            "title": "Amul Taaza Toned Milk 1L (Pack of 6)",
            "base_price": 324,
            "delivery_fee": 0,  # Free on orders above ₹500
            "handling_fee": 0,
            "small_cart_fee": 0,
            "platform_fee": 0,
            "eta_minutes": 1440,
        },
    ],
}


def get_india_milk_products(query: str, postal_code: str) -> List["ProductResult"]:
    """Get realistic milk products for India with accurate pricing"""
    results = []
    query_lower = query.lower()
    
    # Only return milk products for milk-related queries
    if not any(word in query_lower for word in ['milk', 'amul', 'dairy', 'doodh', 'mother dairy', 'nandini']):
        return results
    
    # Platform mapping
    platform_map = {
        "blinkit": PlatformType.BLINKIT,
        "zepto": PlatformType.ZEPTO,
        "swiggy_instamart": PlatformType.SWIGGY_INSTAMART,
        "bigbasket": PlatformType.BIGBASKET,
        "amazon_in": PlatformType.AMAZON_IN,
        "flipkart": PlatformType.FLIPKART,
    }
    
    for platform_key, products in INDIA_MILK_PRODUCTS.items():
        platform = platform_map.get(platform_key)
        if not platform:
            continue
            
        for product in products:
            # Skip if query doesn't match product title
            if query_lower not in product["title"].lower() and not any(
                word in product["title"].lower() for word in query_lower.split()
            ):
                # Still include if it's a generic "milk" search
                if query_lower not in ["milk", "doodh"]:
                    continue
            
            # Calculate total fees
            base = product["base_price"]
            delivery = product["delivery_fee"]
            handling = product.get("handling_fee", 0)
            platform_fee = product.get("platform_fee", 0)
            
            # Add small cart fee since we're searching for single item
            small_cart = product.get("small_cart_fee", 0)
            
            # Total delivery/fees
            # EXCEPTION: For milk essentials (< ₹50), ignore all fees to match store prices
            if base < 50:
                total_fees = 0.0
            else:
                total_fees = delivery + handling + platform_fee + small_cart
            
            price_breakdown = PriceBreakdown.calculate(
                base=float(base),
                delivery=float(total_fees),
                platform=0,
                discount=0,
                currency="INR",
                symbol="₹"
            )
            
            # Get speed
            eta = product["eta_minutes"]
            if eta <= 30:
                speed = DeliverySpeed.EXPRESS
            elif eta <= 180:
                speed = DeliverySpeed.SAME_DAY
            else:
                speed = DeliverySpeed.STANDARD
            
            results.append(ProductResult(
                id=hashlib.md5(f"{platform.value}:{product['title']}".encode()).hexdigest()[:12].upper(),
                platform=platform,
                title=product["title"],
                image_url=get_mock_image(product["title"]),
                price_breakdown=price_breakdown,
                eta_minutes=eta,
                eta_display=format_eta(eta),
                delivery_speed=speed,
                rating=round(random.uniform(4.0, 4.8), 1),
                reviews_count=random.randint(500, 5000),
                in_stock=True,
                url=f"https://{platform_key.replace('_', '')}.com/product/{hashlib.md5(product['title'].encode()).hexdigest()[:8]}"
            ))
    
    return results


# Platform configurations - all delivery apps
PLATFORM_CONFIGS = {
    # === INDIA ===
    PlatformType.AMAZON_IN: {"name": "Amazon", "eta_range": (1440, 2880), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 40), "url": "https://amazon.in"},
    PlatformType.FLIPKART: {"name": "Flipkart", "eta_range": (1440, 2880), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 40), "url": "https://flipkart.com"},
    PlatformType.BLINKIT: {"name": "Blinkit", "eta_range": (8, 15), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 25), "url": "https://blinkit.com"},
    PlatformType.ZEPTO: {"name": "Zepto", "eta_range": (10, 20), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 29), "url": "https://zeptonow.com"},
    PlatformType.JIOMART: {"name": "JioMart", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 0), "url": "https://jiomart.com"},
    PlatformType.SWIGGY_INSTAMART: {"name": "Swiggy Instamart", "eta_range": (10, 25), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 35), "url": "https://swiggy.com"},
    PlatformType.BIGBASKET: {"name": "BigBasket", "eta_range": (120, 240), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 30), "url": "https://bigbasket.com"},
    PlatformType.MEESHO: {"name": "Meesho", "eta_range": (4320, 8640), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 0), "url": "https://meesho.com"},
    
    # === USA ===
    PlatformType.AMAZON_US: {"name": "Amazon", "eta_range": (1440, 2880), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 5.99), "url": "https://amazon.com"},
    PlatformType.WALMART: {"name": "Walmart", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 7.95), "url": "https://walmart.com"},
    PlatformType.TARGET: {"name": "Target", "eta_range": (1440, 2880), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 9.99), "url": "https://target.com"},
    PlatformType.INSTACART: {"name": "Instacart", "eta_range": (60, 120), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (3.99, 7.99), "url": "https://instacart.com"},
    PlatformType.COSTCO: {"name": "Costco", "eta_range": (2880, 5760), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 0), "url": "https://costco.com"},
    PlatformType.DOORDASH: {"name": "DoorDash", "eta_range": (30, 60), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (1.99, 5.99), "url": "https://doordash.com"},
    PlatformType.UBER_EATS: {"name": "Uber Eats", "eta_range": (25, 55), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0.99, 4.99), "url": "https://ubereats.com"},
    PlatformType.GRUBHUB: {"name": "Grubhub", "eta_range": (35, 65), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 6.99), "url": "https://grubhub.com"},
    PlatformType.GOPUFF: {"name": "Gopuff", "eta_range": (15, 30), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 3.95), "url": "https://gopuff.com"},
    
    # === CHINA ===
    PlatformType.MEITUAN: {"name": "Meituan 美团", "eta_range": (20, 45), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 5), "url": "https://meituan.com"},
    PlatformType.ELEME: {"name": "Ele.me 饿了么", "eta_range": (25, 50), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 6), "url": "https://ele.me"},
    PlatformType.JD: {"name": "JD 京东", "eta_range": (1440, 2880), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 6), "url": "https://jd.com"},
    PlatformType.TAOBAO: {"name": "Taobao 淘宝", "eta_range": (2880, 5760), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 10), "url": "https://taobao.com"},
    PlatformType.PINDUODUO: {"name": "Pinduoduo 拼多多", "eta_range": (2880, 7200), "speed": DeliverySpeed.ECONOMY, "delivery_fee": (0, 0), "url": "https://pinduoduo.com"},
    
    # === UK ===
    PlatformType.AMAZON_UK: {"name": "Amazon", "eta_range": (1440, 2880), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 3.99), "url": "https://amazon.co.uk"},
    PlatformType.TESCO: {"name": "Tesco", "eta_range": (1440, 2880), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 5.50), "url": "https://tesco.com"},
    PlatformType.SAINSBURYS: {"name": "Sainsbury's", "eta_range": (1440, 2880), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 7.00), "url": "https://sainsburys.co.uk"},
    PlatformType.ASDA: {"name": "ASDA", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 5.50), "url": "https://asda.com"},
    PlatformType.DELIVEROO: {"name": "Deliveroo", "eta_range": (20, 45), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0.99, 4.99), "url": "https://deliveroo.co.uk"},
    PlatformType.JUST_EAT: {"name": "Just Eat", "eta_range": (25, 55), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 3.50), "url": "https://just-eat.co.uk"},
    PlatformType.OCADO: {"name": "Ocado", "eta_range": (1440, 2880), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 6.99), "url": "https://ocado.com"},
    PlatformType.GETIR: {"name": "Getir", "eta_range": (10, 20), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 1.99), "url": "https://getir.com"},
    
    # === GERMANY ===
    PlatformType.AMAZON_DE: {"name": "Amazon", "eta_range": (1440, 2880), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 4.99), "url": "https://amazon.de"},
    PlatformType.REWE: {"name": "REWE", "eta_range": (1440, 2880), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 5.90), "url": "https://rewe.de"},
    PlatformType.EDEKA: {"name": "EDEKA", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 4.90), "url": "https://edeka.de"},
    PlatformType.LIDL: {"name": "Lidl", "eta_range": (2880, 5760), "speed": DeliverySpeed.ECONOMY, "delivery_fee": (0, 3.99), "url": "https://lidl.de"},
    PlatformType.FLINK: {"name": "Flink", "eta_range": (10, 20), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 2.49), "url": "https://goflink.com"},
    PlatformType.GORILLAS: {"name": "Gorillas", "eta_range": (10, 15), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (1.80, 1.80), "url": "https://gorillas.io"},
    
    # === FRANCE ===
    PlatformType.AMAZON_FR: {"name": "Amazon", "eta_range": (1440, 2880), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 4.99), "url": "https://amazon.fr"},
    PlatformType.CARREFOUR: {"name": "Carrefour", "eta_range": (1440, 2880), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 5.90), "url": "https://carrefour.fr"},
    PlatformType.AUCHAN: {"name": "Auchan", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 4.90), "url": "https://auchan.fr"},
    PlatformType.UBER_EATS_FR: {"name": "Uber Eats", "eta_range": (25, 50), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0.99, 4.99), "url": "https://ubereats.com/fr"},
    
    # === SPAIN ===
    PlatformType.AMAZON_ES: {"name": "Amazon", "eta_range": (1440, 2880), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 4.99), "url": "https://amazon.es"},
    PlatformType.GLOVO: {"name": "Glovo", "eta_range": (20, 45), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0.99, 3.99), "url": "https://glovoapp.com"},
    PlatformType.JUST_EAT_ES: {"name": "Just Eat", "eta_range": (30, 55), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 2.99), "url": "https://justeat.es"},
    PlatformType.MERCADONA: {"name": "Mercadona", "eta_range": (1440, 2880), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 7.20), "url": "https://mercadona.es"},
    
    # === ITALY ===
    PlatformType.AMAZON_IT: {"name": "Amazon", "eta_range": (1440, 2880), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 4.99), "url": "https://amazon.it"},
    PlatformType.GLOVO_IT: {"name": "Glovo", "eta_range": (20, 45), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0.99, 3.99), "url": "https://glovoapp.com/it"},
    PlatformType.JUST_EAT_IT: {"name": "Just Eat", "eta_range": (30, 55), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 2.99), "url": "https://justeat.it"},
    PlatformType.ESSELUNGA: {"name": "Esselunga", "eta_range": (1440, 2880), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 7.90), "url": "https://esselungaacasa.it"},
    
    # === BRAZIL ===
    PlatformType.AMAZON_BR: {"name": "Amazon", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 15), "url": "https://amazon.com.br"},
    PlatformType.IFOOD: {"name": "iFood", "eta_range": (30, 60), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 8), "url": "https://ifood.com.br"},
    PlatformType.RAPPI_BR: {"name": "Rappi", "eta_range": (25, 50), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 10), "url": "https://rappi.com.br"},
    PlatformType.MERCADO_LIVRE: {"name": "Mercado Livre", "eta_range": (1440, 5760), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 20), "url": "https://mercadolivre.com.br"},
    
    # === MEXICO ===
    PlatformType.AMAZON_MX: {"name": "Amazon", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 99), "url": "https://amazon.com.mx"},
    PlatformType.RAPPI_MX: {"name": "Rappi", "eta_range": (25, 50), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 35), "url": "https://rappi.com.mx"},
    PlatformType.UBER_EATS_MX: {"name": "Uber Eats", "eta_range": (30, 55), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 29), "url": "https://ubereats.com/mx"},
    PlatformType.CORNERSHOP: {"name": "Cornershop", "eta_range": (60, 120), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 59), "url": "https://cornershopapp.com"},
    
    # === ARGENTINA ===
    PlatformType.RAPPI_AR: {"name": "Rappi", "eta_range": (25, 50), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 300), "url": "https://rappi.com.ar"},
    PlatformType.PEDIDOSYA: {"name": "PedidosYa", "eta_range": (30, 55), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 250), "url": "https://pedidosya.com.ar"},
    PlatformType.MERCADO_LIBRE_AR: {"name": "Mercado Libre", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 0), "url": "https://mercadolibre.com.ar"},
    
    # === COLOMBIA ===
    PlatformType.RAPPI_CO: {"name": "Rappi", "eta_range": (25, 50), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 5000), "url": "https://rappi.com.co"},
    PlatformType.IFOOD_CO: {"name": "iFood", "eta_range": (30, 60), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 4500), "url": "https://ifood.com.co"},
    
    # === CANADA ===
    PlatformType.AMAZON_CA: {"name": "Amazon", "eta_range": (1440, 2880), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 6.99), "url": "https://amazon.ca"},
    PlatformType.WALMART_CA: {"name": "Walmart", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 7.97), "url": "https://walmart.ca"},
    PlatformType.INSTACART_CA: {"name": "Instacart", "eta_range": (60, 120), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (3.99, 7.99), "url": "https://instacart.ca"},
    PlatformType.SKIP_THE_DISHES: {"name": "SkipTheDishes", "eta_range": (30, 60), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 4.99), "url": "https://skipthedishes.com"},
    PlatformType.DOORDASH_CA: {"name": "DoorDash", "eta_range": (30, 60), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (1.99, 5.99), "url": "https://doordash.com/en-CA"},
    
    # === SINGAPORE ===
    PlatformType.GRABFOOD: {"name": "GrabFood", "eta_range": (25, 45), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 5), "url": "https://grab.com/sg/food"},
    PlatformType.FOODPANDA_SG: {"name": "foodpanda", "eta_range": (25, 50), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 4), "url": "https://foodpanda.sg"},
    PlatformType.SHOPEE_SG: {"name": "Shopee", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 0), "url": "https://shopee.sg"},
    PlatformType.LAZADA_SG: {"name": "Lazada", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 5), "url": "https://lazada.sg"},
    
    # === THAILAND ===
    PlatformType.GRABFOOD_TH: {"name": "GrabFood", "eta_range": (25, 45), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 40), "url": "https://grab.com/th/food"},
    PlatformType.FOODPANDA_TH: {"name": "foodpanda", "eta_range": (25, 50), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 35), "url": "https://foodpanda.co.th"},
    PlatformType.LINE_MAN: {"name": "LINE MAN", "eta_range": (20, 40), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 45), "url": "https://lineman.line.me"},
    PlatformType.SHOPEE_TH: {"name": "Shopee", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 0), "url": "https://shopee.co.th"},
    
    # === INDONESIA ===
    PlatformType.GOFOOD: {"name": "GoFood", "eta_range": (25, 50), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 15000), "url": "https://gojek.com/gofood"},
    PlatformType.GRABFOOD_ID: {"name": "GrabFood", "eta_range": (25, 45), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 12000), "url": "https://grab.com/id/food"},
    PlatformType.SHOPEE_ID: {"name": "Shopee", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 0), "url": "https://shopee.co.id"},
    PlatformType.TOKOPEDIA: {"name": "Tokopedia", "eta_range": (1440, 5760), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 15000), "url": "https://tokopedia.com"},
    
    # === MALAYSIA ===
    PlatformType.GRABFOOD_MY: {"name": "GrabFood", "eta_range": (25, 45), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 6), "url": "https://grab.com/my/food"},
    PlatformType.FOODPANDA_MY: {"name": "foodpanda", "eta_range": (25, 50), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 5), "url": "https://foodpanda.my"},
    PlatformType.SHOPEE_MY: {"name": "Shopee", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 0), "url": "https://shopee.com.my"},
    
    # === PHILIPPINES ===
    PlatformType.GRABFOOD_PH: {"name": "GrabFood", "eta_range": (30, 55), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 59), "url": "https://grab.com/ph/food"},
    PlatformType.FOODPANDA_PH: {"name": "foodpanda", "eta_range": (30, 55), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 49), "url": "https://foodpanda.ph"},
    PlatformType.SHOPEE_PH: {"name": "Shopee", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 0), "url": "https://shopee.ph"},
    
    # === UAE ===
    PlatformType.AMAZON_AE: {"name": "Amazon", "eta_range": (1440, 2880), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 10), "url": "https://amazon.ae"},
    PlatformType.NOON: {"name": "Noon", "eta_range": (1440, 2880), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 10), "url": "https://noon.com"},
    PlatformType.CARREFOUR_AE: {"name": "Carrefour", "eta_range": (60, 180), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 15), "url": "https://carrefouruae.com"},
    PlatformType.TALABAT: {"name": "Talabat", "eta_range": (30, 55), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 7), "url": "https://talabat.com"},
    PlatformType.DELIVEROO_AE: {"name": "Deliveroo", "eta_range": (25, 45), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 9), "url": "https://deliveroo.ae"},
    
    # === SAUDI ARABIA ===
    PlatformType.NOON_SA: {"name": "Noon", "eta_range": (1440, 2880), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 15), "url": "https://noon.com/saudi-en"},
    PlatformType.JARIR: {"name": "Jarir", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 25), "url": "https://jarir.com"},
    PlatformType.TALABAT_SA: {"name": "Talabat", "eta_range": (30, 55), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 10), "url": "https://talabat.com/saudi"},
    PlatformType.HUNGERSTATION: {"name": "Hungerstation", "eta_range": (30, 60), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 12), "url": "https://hungerstation.com"},
    
    # === AUSTRALIA ===
    PlatformType.AMAZON_AU: {"name": "Amazon", "eta_range": (1440, 4320), "speed": DeliverySpeed.STANDARD, "delivery_fee": (0, 9.99), "url": "https://amazon.com.au"},
    PlatformType.WOOLWORTHS: {"name": "Woolworths", "eta_range": (1440, 2880), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 12.00), "url": "https://woolworths.com.au"},
    PlatformType.COLES: {"name": "Coles", "eta_range": (1440, 2880), "speed": DeliverySpeed.SAME_DAY, "delivery_fee": (0, 10.00), "url": "https://coles.com.au"},
    PlatformType.UBER_EATS_AU: {"name": "Uber Eats", "eta_range": (30, 55), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 5.99), "url": "https://ubereats.com/au"},
    PlatformType.MENULOG: {"name": "Menulog", "eta_range": (35, 60), "speed": DeliverySpeed.EXPRESS, "delivery_fee": (0, 4.99), "url": "https://menulog.com.au"},
}


# Sample products with regional pricing
def get_sample_products(country: CountryCode):
    """Get sample products with prices appropriate for each country"""
    
    # Comprehensive product catalog with USD base prices
    base_products = {
        # === GROCERIES ===
        "milk": {"name": "Fresh Milk 1L", "base": 2.5},
        "bread": {"name": "White Bread 400g", "base": 2.0},
        "rice": {"name": "Basmati Rice 5kg", "base": 15.0},
        "coffee": {"name": "Instant Coffee 100g", "base": 8.0},
        "eggs": {"name": "Fresh Eggs 12pcs", "base": 4.0},
        "butter": {"name": "Butter 500g", "base": 5.0},
        "cheese": {"name": "Cheese 200g", "base": 4.5},
        "sugar": {"name": "Sugar 1kg", "base": 1.5},
        "oil": {"name": "Cooking Oil 1L", "base": 4.0},
        "flour": {"name": "Wheat Flour 1kg", "base": 1.8},
        "pasta": {"name": "Pasta 500g", "base": 2.5},
        "cereal": {"name": "Breakfast Cereal 400g", "base": 5.0},
        "juice": {"name": "Orange Juice 1L", "base": 3.5},
        "water": {"name": "Mineral Water 6-pack", "base": 4.0},
        "cola": {"name": "Cola 2L", "base": 2.5},
        "chips": {"name": "Potato Chips 150g", "base": 3.0},
        "chocolate": {"name": "Chocolate Bar 100g", "base": 2.5},
        "biscuits": {"name": "Biscuits 300g", "base": 3.0},
        "ice cream": {"name": "Ice Cream 500ml", "base": 5.0},
        "yogurt": {"name": "Yogurt 500g", "base": 3.0},
        
        # === ELECTRONICS ===
        "iphone": {"name": "iPhone 15 Pro 256GB", "base": 1199.0},
        "iphone 15": {"name": "iPhone 15 128GB", "base": 899.0},
        "samsung": {"name": "Samsung Galaxy S24 Ultra", "base": 1299.0},
        "samsung phone": {"name": "Samsung Galaxy A54 5G", "base": 449.0},
        "pixel": {"name": "Google Pixel 8 Pro", "base": 999.0},
        "oneplus": {"name": "OnePlus 12 256GB", "base": 799.0},
        "mobile": {"name": "Smartphone (Mid-range)", "base": 350.0},
        "phone": {"name": "Smartphone (Budget)", "base": 199.0},
        "airpods": {"name": "Apple AirPods Pro 2nd Gen", "base": 249.0},
        "airpods max": {"name": "Apple AirPods Max", "base": 549.0},
        "earbuds": {"name": "Wireless Earbuds", "base": 79.0},
        "headphones": {"name": "Sony WH-1000XM5 Headphones", "base": 399.0},
        # Chargers - Multiple variants with brand & wattage
        "charger": {"name": "Portronics Adapto 20W USB-C Charger", "base": 6.0},
        "18w charger": {"name": "Mi 18W Fast Charger USB-C", "base": 5.0},
        "20w charger": {"name": "Samsung 20W USB-C Fast Charger", "base": 7.0},
        "25w charger": {"name": "Samsung 25W Super Fast Charger", "base": 10.0},
        "33w charger": {"name": "Realme 33W SuperDart Charger", "base": 8.0},
        "45w charger": {"name": "Samsung 45W Super Fast Charger 2.0", "base": 15.0},
        "65w charger": {"name": "Anker 65W GaN II USB-C Charger", "base": 24.0},
        "67w charger": {"name": "Mi 67W SonicCharge 3.0 Charger", "base": 20.0},
        "iphone charger": {"name": "Apple 20W USB-C Power Adapter", "base": 19.0},
        "fast charger": {"name": "Ambrane 25W Quick Charge 3.0 Charger", "base": 6.5},
        "mobile charger": {"name": "Boat WCDV 20W Type-C Charger", "base": 5.5},
        "usb charger": {"name": "Syska 10W Dual USB Charger", "base": 4.0},
        "type c charger": {"name": "pTron Volta FC15 20W USB-C Charger", "base": 4.5},
        "wall charger": {"name": "Zebronics ZEB-MA5211 10W Dual USB Charger", "base": 3.5},
        "gan charger": {"name": "Belkin BoostCharge 65W GaN Charger", "base": 35.0},
        "cable": {"name": "USB-C Charging Cable 2m", "base": 15.0},
        "powerbank": {"name": "Power Bank 20000mAh", "base": 45.0},
        "laptop": {"name": "MacBook Air M3", "base": 1099.0},
        "macbook": {"name": "MacBook Pro 14-inch M3", "base": 1999.0},
        "ipad": {"name": "iPad Air 11-inch", "base": 599.0},
        "tablet": {"name": "Samsung Galaxy Tab S9", "base": 849.0},
        "watch": {"name": "Apple Watch Series 9", "base": 399.0},
        "smartwatch": {"name": "Samsung Galaxy Watch 6", "base": 299.0},
        "tv": {"name": "Samsung 55\" 4K Smart TV", "base": 599.0},
        "monitor": {"name": "Dell 27\" 4K Monitor", "base": 449.0},
        "keyboard": {"name": "Mechanical Gaming Keyboard", "base": 99.0},
        "mouse": {"name": "Logitech MX Master 3S", "base": 99.0},
        "speaker": {"name": "JBL Bluetooth Speaker", "base": 129.0},
        "camera": {"name": "Sony Alpha A7 IV", "base": 2499.0},
        "gopro": {"name": "GoPro Hero 12", "base": 399.0},
        "drone": {"name": "DJI Mini 3 Pro", "base": 759.0},
        "console": {"name": "PlayStation 5", "base": 499.0},
        "ps5": {"name": "PlayStation 5 Digital", "base": 449.0},
        "xbox": {"name": "Xbox Series X", "base": 499.0},
        "nintendo": {"name": "Nintendo Switch OLED", "base": 349.0},
        
        # === HOME APPLIANCES ===
        "ac": {"name": "Split AC 1.5 Ton", "base": 450.0},
        "refrigerator": {"name": "Refrigerator 300L", "base": 550.0},
        "fridge": {"name": "Mini Fridge 50L", "base": 150.0},
        "washing machine": {"name": "Front Load Washing Machine 7kg", "base": 400.0},
        "microwave": {"name": "Microwave Oven 20L", "base": 120.0},
        "oven": {"name": "OTG Oven 25L", "base": 100.0},
        "air fryer": {"name": "Air Fryer 4L", "base": 99.0},
        "blender": {"name": "Blender 500W", "base": 45.0},
        "mixer": {"name": "Hand Mixer", "base": 35.0},
        "toaster": {"name": "2-Slice Toaster", "base": 30.0},
        "kettle": {"name": "Electric Kettle 1.5L", "base": 25.0},
        "coffee maker": {"name": "Drip Coffee Maker", "base": 50.0},
        "vacuum": {"name": "Robot Vacuum Cleaner", "base": 299.0},
        "iron": {"name": "Steam Iron", "base": 35.0},
        "fan": {"name": "Tower Fan", "base": 60.0},
        "heater": {"name": "Room Heater", "base": 50.0},
        "purifier": {"name": "Air Purifier", "base": 150.0},
        
        # === PERSONAL CARE ===
        "shampoo": {"name": "Shampoo 400ml", "base": 8.0},
        "soap": {"name": "Body Wash 250ml", "base": 5.0},
        "toothpaste": {"name": "Toothpaste 150g", "base": 3.0},
        "perfume": {"name": "Eau de Parfum 100ml", "base": 80.0},
        "sunscreen": {"name": "Sunscreen SPF50 100ml", "base": 15.0},
        "moisturizer": {"name": "Face Moisturizer 100ml", "base": 18.0},
        "razor": {"name": "Razor Blades 8-pack", "base": 20.0},
        "trimmer": {"name": "Electric Trimmer", "base": 40.0},
        "hair dryer": {"name": "Hair Dryer 1800W", "base": 35.0},
        "detergent": {"name": "Laundry Detergent 1kg", "base": 10.0},
        "dishwasher": {"name": "Dishwashing Liquid 750ml", "base": 4.0},
        
        # === FASHION ===
        "tshirt": {"name": "Cotton T-Shirt", "base": 20.0},
        "shirt": {"name": "Formal Shirt", "base": 40.0},
        "jeans": {"name": "Denim Jeans", "base": 50.0},
        "sneakers": {"name": "Running Sneakers", "base": 80.0},
        "shoes": {"name": "Casual Shoes", "base": 60.0},
        "jacket": {"name": "Winter Jacket", "base": 100.0},
        "backpack": {"name": "Laptop Backpack", "base": 45.0},
        "wallet": {"name": "Leather Wallet", "base": 35.0},
        "sunglasses": {"name": "Polarized Sunglasses", "base": 50.0},
        
        # === FITNESS ===
        "yoga mat": {"name": "Yoga Mat 6mm", "base": 25.0},
        "dumbbell": {"name": "Dumbbell Set 10kg", "base": 40.0},
        "protein": {"name": "Whey Protein 1kg", "base": 45.0},
        "fitness band": {"name": "Fitness Tracker Band", "base": 50.0},
        "water bottle": {"name": "Stainless Steel Water Bottle 1L", "base": 20.0},
        
        # === BABY & KIDS ===
        "diapers": {"name": "Baby Diapers 50pcs", "base": 25.0},
        "baby food": {"name": "Baby Cereal 400g", "base": 8.0},
        "toys": {"name": "Building Blocks Set", "base": 30.0},
        "stroller": {"name": "Baby Stroller", "base": 150.0},
        
        # === PET SUPPLIES ===
        "dog food": {"name": "Dog Food 3kg", "base": 25.0},
        "cat food": {"name": "Cat Food 2kg", "base": 20.0},
        "pet toys": {"name": "Pet Toy Set", "base": 15.0},
        
        # === OFFICE & STATIONERY ===
        "notebook": {"name": "Spiral Notebook A4", "base": 5.0},
        "pen": {"name": "Ballpoint Pen 10-pack", "base": 6.0},
        "printer": {"name": "Inkjet Printer", "base": 150.0},
        "paper": {"name": "A4 Paper 500 sheets", "base": 8.0},
    }
    
    # Currency multipliers (to USD base)
    multipliers = {
        CountryCode.IN: 83, CountryCode.CN: 7.2, CountryCode.SG: 1.35,
        CountryCode.TH: 35, CountryCode.ID: 15600, CountryCode.MY: 4.7,
        CountryCode.PH: 56, CountryCode.US: 1, CountryCode.CA: 1.36,
        CountryCode.BR: 5, CountryCode.MX: 17, CountryCode.AR: 850,
        CountryCode.CO: 4000, CountryCode.UK: 0.79, CountryCode.DE: 0.92,
        CountryCode.FR: 0.92, CountryCode.ES: 0.92, CountryCode.IT: 0.92,
        CountryCode.AE: 3.67, CountryCode.SA: 3.75, CountryCode.AU: 1.53,
    }
    
    mult = multipliers.get(country, 1)
    return {k: {"name": v["name"], "price": round(v["base"] * mult, 2)} for k, v in base_products.items()}


def generate_product_id(platform: PlatformType, title: str) -> str:
    return hashlib.md5(f"{platform.value}:{title}".encode()).hexdigest()[:12].upper()


def format_eta(minutes: int) -> str:
    if minutes < 60:
        return f"{minutes} Mins"
    elif minutes < 1440:
        return f"{minutes // 60} Hours"
    else:
        days = minutes // 1440
        return f"{days} Day{'s' if days > 1 else ''}"




def get_mock_image(title: str) -> str:
    """Get a category-appropriate mock image URL based on product title"""
    title_lower = title.lower()
    
    # Mapping of keywords to reliable Unsplash placeholder images
    mapping = {
        "milk": "https://images.unsplash.com/photo-1563636619-e910ef2a844b?auto=format\u0026fit=crop\u0026w=200\u0026h=200\u0026q=80",
        "iphone": "https://images.unsplash.com/photo-1592750475338-74b7022d9503?auto=format\u0026fit=crop\u0026w=200\u0026h=200\u0026q=80",
        "phone": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format\u0026fit=crop\u0026w=200\u0026h=200\u0026q=80",
        "laptop": "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format\u0026fit=crop\u0026w=200\u0026h=200\u0026q=80",
        "watch": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format\u0026fit=crop\u0026w=200\u0026h=200\u0026q=80",
        "headphone": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format\u0026fit=crop\u0026w=200\u0026h=200\u0026q=80",
        "earbuds": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format\u0026fit=crop\u0026w=200\u0026h=200\u0026q=80",
        "charger": "https://images.unsplash.com/photo-1627916524180-8742616f94b8?auto=format\u0026fit=crop\u0026w=200\u0026h=200\u0026q=80",
        "adapter": "https://images.unsplash.com/photo-1627916524180-8742616f94b8?auto=format\u0026fit=crop\u0026w=200\u0026h=200\u0026q=80",
        "sneakers": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format\u0026fit=crop\u0026w=200\u0026h=200\u0026q=80",
        "lamp": "https://images.unsplash.com/photo-1507473885765-e6ed03a2748e?auto=format\u0026fit=crop\u0026w=200\u0026h=200\u0026q=80",
        "crystal": "https://images.unsplash.com/photo-1614850523296-d8c1af93d400?auto=format\u0026fit=crop\u0026w=200\u0026h=200\u0026q=80",
    }
    
    for key, url in mapping.items():
        if key in title_lower:
            return url
            
    # Default fallback for electronics/gadgets
    return "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format\u0026fit=crop\u0026w=200\u0026h=200\u0026q=80"


def search_mock_products(query: str, postal_code: str, country: CountryCode) -> List[ProductResult]:
    from .scrapers import is_relevant_result
    query_lower = query.lower().strip()
    query_words = query_lower.split()
    country_config = COUNTRY_CONFIG[country]
    currency = country_config["currency"]
    symbol = country_config["symbol"]
    available_platforms = country_config["platforms"]
    
    results = []
    
    # === 0. REALISTIC INDIA PRODUCT DATA ===
    # For India, use accurate pricing from actual delivery apps
    if country == CountryCode.IN:
        # Check for milk-related queries
        milk_results = get_india_milk_products(query, postal_code)
        if milk_results:
            return milk_results  # Return realistic data instead of generated
    
    # === 1. EXACT QUERY MATCH LOGIC ===
    # If the user searches for a specific thing (length > 3), assume they want THAT exact item
    if len(query) > 3:
        # Generate a consistent base price based on the characters in the query
        hash_val = sum(ord(c) for c in query)
        
        # --- SMART PRICE LOGIC ---
        # 1. Base Category Price
        price_estimate = 999  # Default fallback
        
        # Check specific specific categories first (Longer matches first)
        if any(w in query_lower for w in ['macbook', 'laptop', 'gaming pc']):
            price_estimate = 65000
        elif any(w in query_lower for w in ['iphone', 'samsung s', 'pixel', 'premium phone']):
            price_estimate = 70000
        elif any(w in query_lower for w in ['smart tv', 'television', 'led tv', 'oled']):
            price_estimate = 35000
        elif any(w in query_lower for w in ['ipad', 'tablet', 'tab']):
            price_estimate = 30000
        elif any(w in query_lower for w in ['smartwatch', 'apple watch', 'galaxy watch']):
            price_estimate = 15000
        elif any(w in query_lower for w in ['monitor', 'screen']):
            price_estimate = 12000
        elif any(w in query_lower for w in ['smartphone', 'mobile', 'android']) or ('phone' in query_words):
             # Ensure "phone" is a distinct word, not part of "headphone"
            price_estimate = 15000
        elif any(w in query_lower for w in ['airpods', 'galaxy buds', 'pixel buds']):
            price_estimate = 12000
        elif any(w in query_lower for w in ['headphones', 'headset', 'earphones', 'neckband']):
            price_estimate = 2000
        elif any(w in query_lower for w in ['earbuds', 'tws', 'airdotes']):
            price_estimate = 1500
        # Chargers - Smart wattage-based pricing
        elif 'charger' in query_lower or 'adapter' in query_lower:
            # Premium GaN chargers
            if 'gan' in query_lower or any(w in query_lower for w in ['65w', '67w', '100w', '120w']):
                price_estimate = 1999
            # High-wattage chargers
            elif any(w in query_lower for w in ['45w', '50w', '55w', '60w']):
                price_estimate = 1299
            # Mid-range fast chargers
            elif any(w in query_lower for w in ['25w', '30w', '33w']):
                price_estimate = 699
            # Standard 18-20W chargers
            elif any(w in query_lower for w in ['18w', '20w', '22w']):
                price_estimate = 499
            # Apple chargers
            elif 'apple' in query_lower or 'iphone' in query_lower:
                price_estimate = 1599
            # Budget chargers
            elif any(b in query_lower for b in ['ptron', 'zebronics', 'syska', 'portronics', 'ambrane']):
                price_estimate = 349
            # Default mobile charger
            else:
                price_estimate = 449
        elif 'powerbank' in query_lower:
            price_estimate = 1200
        elif any(w in query_lower for w in ['cable', 'case', 'cover', 'glass']):
            price_estimate = 300
        elif any(w in query_lower for w in ['shoe', 'sneaker', 'slipper']):
            price_estimate = 2500
        elif any(w in query_lower for w in ['watch', 'clock']):
            price_estimate = 2000

        # 2. Brand Multipliers & Overrides
        # Budget Brands
        if any(b in query_lower for b in ['boat', 'noise', 'boult', 'ptron', 'redmi', 'realme', 'mi ', 'zebronics']):
            if price_estimate > 5000: price_estimate *= 0.4  # Reduce drastic mis-cats
            else: price_estimate = min(price_estimate, 1800)   # Cap budget items
            
            # Specific fixes for boAt/Noise likely items
            if 'watch' in query_lower: price_estimate = 1800
            if 'headphone' in query_lower or 'rockerz' in query_lower: price_estimate = 1600
            if 'airdopes' in query_lower or 'earbuds' in query_lower: price_estimate = 1200
            
        # Premium Brands
        elif any(b in query_lower for b in ['apple', 'sony', 'bose', 'jbl', 'samsung', 'pixel']):
            if 'headphone' in query_lower and 'sony' in query_lower: price_estimate = 18000 # WH series
            if 'headphone' in query_lower and 'jbl' in query_lower: price_estimate = 4000
            if 'iphone' in query_lower: price_estimate = 75000
            
        # 3. Add small random variance to look natural
        # Use hash to keep it consistent for the same query
        variance_seed = (hash_val % 200) - 100  # -100 to +100
        final_base_price = max(price_estimate + variance_seed, 199)
        
        for platform in available_platforms:
            config = PLATFORM_CONFIGS.get(platform)
            if not config: continue
            
            # Platform-specific variance (Amazon cheaper vs Retail)
            plat_variance = random.uniform(0.95, 1.05)
            platform_price = final_base_price * plat_variance
            
            delivery_low, delivery_high = config["delivery_fee"]
            delivery_fee = random.choice([delivery_low, delivery_high]) if random.random() > 0.4 else 0
            
            price_bd = PriceBreakdown.calculate(
                base=round(platform_price, 2),
                delivery=float(delivery_fee),
                platform=0,
                discount=0,
                currency=currency,
                symbol=symbol
            )
            
            eta_min, eta_max = config["eta_range"]
            eta_minutes = random.randint(eta_min, eta_max)
            
            # Clean title (capitalize)
            display_title = query.title() if len(query.split()) < 5 else query
            
            results.append(ProductResult(
                id=generate_product_id(platform, display_title),
                platform=platform,
                title=display_title,
                image_url=get_mock_image(display_title),
                price_breakdown=price_bd,
                eta_minutes=eta_minutes,
                eta_display=format_eta(eta_minutes),
                delivery_speed=config["speed"],
                rating=round(random.uniform(3.5, 5.0), 1),
                reviews_count=random.randint(50, 10000),
                in_stock=True,
                url=f"{config['url']}/p/{generate_product_id(platform, display_title)}"
            ))

    # === 2. CATEGORY MATCH LOGIC (Existing) ===
    # Also include category matches for variety
    products = get_sample_products(country)
    matched_categories = []
    
    # ... (existing matching logic) ...
    for category, product_info in products.items():
        category_lower = category.lower()
        if query_lower in category_lower or category_lower in query_lower:
             if is_relevant_result(product_info["name"], query):
                 matched_categories.append((category, product_info, 80))
             
    # Limit category matches if we already have exact matches
    if results:
        matched_categories = matched_categories[:2]
    else:
        # If no exact matches (short query), behave normally
        matched_categories.sort(key=lambda x: x[2], reverse=True)
        matched_categories = matched_categories[:5]

    for category, product_info, score in matched_categories:
        for platform in available_platforms:
            config = PLATFORM_CONFIGS.get(platform)
            if not config: continue
            
            base_price = product_info["price"] * random.uniform(0.9, 1.15)
            # ... Generate PriceBreakdown ...
             
            # (Re-use existing generation logic for brevity in this patch, simplified for now)
            delivery_low, delivery_high = config["delivery_fee"]
            delivery_fee = random.choice([delivery_low, delivery_high]) if random.random() > 0.4 else 0
            
            price_breakdown = PriceBreakdown.calculate(
                base=round(base_price, 2),
                delivery=float(delivery_fee),
                currency=currency, symbol=symbol
            )
            
            eta_min, eta_max = config["eta_range"]
            eta_minutes = random.randint(eta_min, eta_max)
            
            results.append(ProductResult(
                id=generate_product_id(platform, product_info["name"]),
                platform=platform,
                title=product_info["name"],
                image_url=get_mock_image(product_info["name"]),
                price_breakdown=price_breakdown,
                eta_minutes=eta_minutes,
                eta_display=format_eta(eta_minutes),
                delivery_speed=config["speed"],
                rating=round(random.uniform(4.0, 4.9), 1),
                reviews_count=random.randint(100, 50000),
                in_stock=True,
                url=f"{config['url']}/p/{generate_product_id(platform, product_info['name'])}"
            ))
    
    return results


def get_fallback_results(query: str, platform: PlatformType) -> List[ProductResult]:
    """Provide realistic fallback results for a specific platform if live scraping fails"""
    # Use search_mock_products but filter by platform
    all_mock = search_mock_products(query, "560001", CountryCode.IN)
    return [p for p in all_mock if p.platform == platform]

def get_location_name(postal_code: str, country: CountryCode) -> str:
    locations = {
        CountryCode.IN: {"110001": "New Delhi", "400001": "Mumbai", "560001": "Bangalore", "600001": "Chennai"},
        CountryCode.US: {"10001": "New York, NY", "90210": "Los Angeles, CA", "60601": "Chicago, IL", "33101": "Miami, FL"},
        CountryCode.UK: {"SW1A": "London", "M1": "Manchester", "B1": "Birmingham", "G1": "Glasgow"},
        CountryCode.DE: {"10115": "Berlin", "80331": "Munich", "20095": "Hamburg"},
        CountryCode.FR: {"75001": "Paris", "69001": "Lyon", "13001": "Marseille"},
        CountryCode.CN: {"100000": "Beijing", "200000": "Shanghai", "510000": "Guangzhou"},
        CountryCode.BR: {"01310": "São Paulo", "22041": "Rio de Janeiro"},
        CountryCode.MX: {"06600": "Mexico City", "44100": "Guadalajara"},
        CountryCode.SG: {"018956": "Singapore Central", "238823": "Orchard"},
        CountryCode.AU: {"2000": "Sydney", "3000": "Melbourne", "4000": "Brisbane"},
        CountryCode.AE: {"00000": "Dubai", "": "Abu Dhabi"},
    }
    return locations.get(country, {}).get(postal_code[:5] if len(postal_code) >= 5 else postal_code, f"Postal Code {postal_code}")


# Related products mapping
RELATED_PRODUCTS = {
    # Electronics - Phones
    "iphone": ["airpods", "iphone charger", "cable", "powerbank", "watch"],
    "samsung": ["earbuds", "charger", "cable", "powerbank", "smartwatch"],
    "phone": ["earbuds", "charger", "cable", "powerbank", "phone"],
    "mobile": ["earbuds", "charger", "cable", "powerbank"],
    "pixel": ["earbuds", "charger", "cable", "powerbank"],
    "oneplus": ["earbuds", "charger", "cable", "powerbank"],
    
    # Audio
    "airpods": ["iphone", "cable", "powerbank", "watch"],
    "earbuds": ["phone", "cable", "powerbank"],
    "headphones": ["earbuds", "cable", "phone", "laptop"],
    
    # Chargers & Accessories
    "charger": ["cable", "powerbank", "fast charger", "type c charger", "earbuds"],
    "fast charger": ["cable", "powerbank", "charger", "mobile charger"],
    "mobile charger": ["cable", "powerbank", "earbuds", "phone"],
    "type c charger": ["cable", "powerbank", "charger", "earbuds"],
    "cable": ["charger", "powerbank", "phone"],
    "powerbank": ["charger", "cable", "phone", "earbuds"],
    
    # Computers
    "laptop": ["mouse", "keyboard", "monitor", "headphones", "backpack"],
    "macbook": ["mouse", "keyboard", "monitor", "airpods", "ipad"],
    "ipad": ["keyboard", "cable", "charger", "airpods"],
    "tablet": ["keyboard", "cable", "charger", "earbuds"],
    
    # Wearables
    "watch": ["charger", "iphone", "airpods"],
    "smartwatch": ["charger", "phone", "earbuds"],
    
    # TV & Entertainment
    "tv": ["speaker", "console", "headphones"],
    "monitor": ["keyboard", "mouse", "laptop", "cable"],
    "console": ["headphones", "tv", "controller"],
    "ps5": ["headphones", "tv", "controller"],
    "xbox": ["headphones", "tv", "controller"],
    "nintendo": ["headphones", "tv"],
    
    # Groceries
    "milk": ["bread", "eggs", "butter", "cereal", "coffee"],
    "bread": ["butter", "eggs", "milk", "cheese"],
    "eggs": ["bread", "butter", "milk", "cheese"],
    "coffee": ["milk", "sugar", "biscuits", "cereal"],
    "rice": ["oil", "flour", "pasta", "detergent"],
    "butter": ["bread", "milk", "eggs", "cheese"],
    "cheese": ["bread", "butter", "milk", "pasta"],
    
    # Home Appliances
    "refrigerator": ["microwave", "washing machine", "air fryer"],
    "washing machine": ["detergent", "iron", "refrigerator"],
    "microwave": ["oven", "air fryer", "toaster", "kettle"],
    "air fryer": ["microwave", "oven", "blender"],
    "vacuum": ["fan", "purifier", "iron"],
    
    # Personal Care
    "shampoo": ["soap", "toothpaste", "moisturizer"],
    "perfume": ["moisturizer", "sunscreen", "razor"],
    "trimmer": ["razor", "hair dryer", "shampoo"],
    
    # Fashion
    "tshirt": ["jeans", "sneakers", "jacket", "backpack"],
    "jeans": ["tshirt", "shirt", "sneakers", "shoes"],
    "sneakers": ["tshirt", "jeans", "backpack", "fitness band"],
    "jacket": ["tshirt", "jeans", "sneakers", "backpack"],
    
    # Fitness
    "yoga mat": ["water bottle", "dumbbell", "protein"],
    "protein": ["water bottle", "dumbbell", "yoga mat", "fitness band"],
    "dumbbell": ["yoga mat", "protein", "water bottle"],
    
    # Baby
    "diapers": ["baby food", "toys", "stroller"],
    "baby food": ["diapers", "toys", "milk"],
    
    # Pets
    "dog food": ["pet toys", "cat food"],
    "cat food": ["pet toys", "dog food"],
}


def get_related_products(query: str, country: CountryCode):
    """Get related products based on search query"""
    query_lower = query.lower()
    products = get_sample_products(country)
    country_config = COUNTRY_CONFIG[country]
    symbol = country_config["symbol"]
    
    # Find related product keys
    related_keys = []
    for key, related in RELATED_PRODUCTS.items():
        if key in query_lower or query_lower in key:
            related_keys = related[:5]  # Max 5 related products
            break
    
    # If no specific mapping, suggest popular items
    if not related_keys:
        related_keys = ["airpods", "charger", "coffee", "milk", "headphones"]
    
    related = []
    for key in related_keys:
        if key in products:
            product = products[key]
            related.append({
                "name": product["name"],
                "price": f"{symbol}{product['price']:,.0f}",
                "search_term": key,
            })
    
    return related

