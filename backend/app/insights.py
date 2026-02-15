"""
Smart Insights Engine - Generates contextual intelligence for product comparisons
Includes: Coupons, Urgency Analytics, Carbon Footprint, Review Sentiment, Campus Deals
"""
import random
import hashlib
from typing import List, Optional, Dict, Any
from datetime import datetime

from .models import ProductResult, PlatformType, ActionEnum
from .price_predictor import predict_price_action


# ============================================================
# 1. SMART COUPON & REWARDS ENGINE
# ============================================================

# Platform-specific coupon databases (simulated - in production, these would be scraped/API-driven)
PLATFORM_COUPONS = {
    PlatformType.BLINKIT: [
        {"code": "BLINKNEW", "discount": "₹100 off", "discount_value": 100, "min_order": 299, "type": "flat", "for": "New Users", "expires": "2026-03-31", "auto_apply": True},
        {"code": "HDFC200", "discount": "₹200 off", "discount_value": 200, "min_order": 999, "type": "flat", "for": "HDFC Card", "expires": "2026-02-28", "auto_apply": False},
        {"code": "BLINKSUPER", "discount": "20% off", "discount_value": 0, "discount_pct": 20, "min_order": 499, "type": "percentage", "for": "All Users", "expires": "2026-03-15", "auto_apply": False},
    ],
    PlatformType.ZEPTO: [
        {"code": "ZEPTONEW", "discount": "₹150 off", "discount_value": 150, "min_order": 199, "type": "flat", "for": "New Users", "expires": "2026-03-31", "auto_apply": True},
        {"code": "WELCOME50", "discount": "50% off (up to ₹100)", "discount_value": 100, "discount_pct": 50, "min_order": 149, "type": "percentage", "for": "First 3 Orders", "expires": "2026-04-30", "auto_apply": True},
        {"code": "ICICI10", "discount": "10% off", "discount_value": 0, "discount_pct": 10, "min_order": 499, "type": "percentage", "for": "ICICI Card", "expires": "2026-02-28", "auto_apply": False},
    ],
    PlatformType.SWIGGY_INSTAMART: [
        {"code": "INSTANEW", "discount": "₹125 off", "discount_value": 125, "min_order": 249, "type": "flat", "for": "New Users", "expires": "2026-03-31", "auto_apply": True},
        {"code": "SWIGGY50", "discount": "50% off (up to ₹75)", "discount_value": 75, "discount_pct": 50, "min_order": 199, "type": "percentage", "for": "All Users", "expires": "2026-03-01", "auto_apply": False},
        {"code": "SBISWIGGY", "discount": "15% off", "discount_value": 0, "discount_pct": 15, "min_order": 599, "type": "percentage", "for": "SBI Card", "expires": "2026-03-15", "auto_apply": False},
    ],
    PlatformType.BIGBASKET: [
        {"code": "BBNEW", "discount": "₹200 off", "discount_value": 200, "min_order": 599, "type": "flat", "for": "New Users", "expires": "2026-03-31", "auto_apply": True},
        {"code": "BBKOTAK", "discount": "12% off", "discount_value": 0, "discount_pct": 12, "min_order": 799, "type": "percentage", "for": "Kotak Card", "expires": "2026-02-28", "auto_apply": False},
    ],
    PlatformType.AMAZON_IN: [
        {"code": None, "discount": "10% off with SBI Credit Card", "discount_value": 0, "discount_pct": 10, "min_order": 0, "type": "bank_offer", "for": "SBI Card", "expires": "2026-03-31", "auto_apply": False},
        {"code": None, "discount": "5% cashback with Amazon Pay", "discount_value": 0, "discount_pct": 5, "min_order": 0, "type": "cashback", "for": "All Users", "expires": "2026-12-31", "auto_apply": True},
        {"code": "AMZNEW", "discount": "₹200 off on first order", "discount_value": 200, "min_order": 500, "type": "flat", "for": "New Users", "expires": "2026-06-30", "auto_apply": True},
    ],
    PlatformType.FLIPKART: [
        {"code": None, "discount": "10% off with Axis Bank Card", "discount_value": 0, "discount_pct": 10, "min_order": 0, "type": "bank_offer", "for": "Axis Card", "expires": "2026-03-31", "auto_apply": False},
        {"code": None, "discount": "5% Unlimited Cashback with FlipKart Axis Card", "discount_value": 0, "discount_pct": 5, "min_order": 0, "type": "cashback", "for": "FK Axis Card", "expires": "2026-12-31", "auto_apply": True},
    ],
    PlatformType.JIOMART: [
        {"code": "JIONEW", "discount": "₹150 off", "discount_value": 150, "min_order": 499, "type": "flat", "for": "New Users", "expires": "2026-03-31", "auto_apply": True},
        {"code": "JIOFREE", "discount": "Free Delivery", "discount_value": 40, "min_order": 199, "type": "flat", "for": "All Users", "expires": "2026-03-15", "auto_apply": False},
    ],
}


def get_applicable_coupons(product: ProductResult) -> List[Dict]:
    """Get applicable coupons for a product's platform"""
    platform = product.platform
    base_price = product.price_breakdown.base_price
    coupons = PLATFORM_COUPONS.get(platform, [])
    
    applicable = []
    for coupon in coupons:
        if base_price >= coupon.get("min_order", 0):
            # Calculate post-coupon price
            if coupon["type"] == "flat":
                post_coupon_price = max(0, product.price_breakdown.total_landed_cost - coupon["discount_value"])
                savings = coupon["discount_value"]
            elif coupon["type"] in ["percentage", "cashback"]:
                pct = coupon.get("discount_pct", 0)
                max_discount = coupon.get("discount_value", float('inf'))
                savings = min(base_price * pct / 100, max_discount) if max_discount > 0 else base_price * pct / 100
                post_coupon_price = max(0, product.price_breakdown.total_landed_cost - savings)
            elif coupon["type"] == "bank_offer":
                pct = coupon.get("discount_pct", 0)
                savings = base_price * pct / 100
                post_coupon_price = max(0, product.price_breakdown.total_landed_cost - savings)
            else:
                continue
                
            applicable.append({
                **coupon,
                "platform": platform.value,
                "post_coupon_price": round(post_coupon_price, 2),
                "estimated_savings": round(savings, 2),
            })
    
    # Sort by savings (highest first)
    applicable.sort(key=lambda x: x.get("estimated_savings", 0), reverse=True)
    return applicable


# ============================================================
# 1b. BANK CREDIT CARD OFFERS DATABASE
# ============================================================

BANK_CARD_OFFERS = [
    {
        "bank": "HDFC Bank",
        "card_type": "Credit Card",
        "card_name": "HDFC Millennia",
        "logo": "\ud83c\udfe6",
        "color": "#004B87",
        "platforms": {
            PlatformType.BLINKIT: {"discount_pct": 10, "max_discount": 200, "min_order": 499},
            PlatformType.SWIGGY_INSTAMART: {"discount_pct": 10, "max_discount": 150, "min_order": 399},
            PlatformType.AMAZON_IN: {"discount_pct": 5, "max_discount": 500, "min_order": 0},
            PlatformType.BIGBASKET: {"discount_pct": 7, "max_discount": 250, "min_order": 599},
        },
        "cashback_pct": 1.5,
    },
    {
        "bank": "ICICI Bank",
        "card_type": "Credit Card",
        "card_name": "ICICI Amazon Pay",
        "logo": "\ud83c\udfdb\ufe0f",
        "color": "#F37920",
        "platforms": {
            PlatformType.AMAZON_IN: {"discount_pct": 5, "max_discount": 0, "min_order": 0},
            PlatformType.ZEPTO: {"discount_pct": 10, "max_discount": 200, "min_order": 299},
            PlatformType.FLIPKART: {"discount_pct": 5, "max_discount": 300, "min_order": 0},
        },
        "cashback_pct": 2.0,
    },
    {
        "bank": "SBI",
        "card_type": "Credit Card",
        "card_name": "SBI SimplyCLICK",
        "logo": "\ud83c\udfe6",
        "color": "#1A4D8F",
        "platforms": {
            PlatformType.AMAZON_IN: {"discount_pct": 10, "max_discount": 500, "min_order": 0},
            PlatformType.SWIGGY_INSTAMART: {"discount_pct": 15, "max_discount": 200, "min_order": 499},
            PlatformType.FLIPKART: {"discount_pct": 5, "max_discount": 250, "min_order": 0},
        },
        "cashback_pct": 1.25,
    },
    {
        "bank": "Axis Bank",
        "card_type": "Credit Card",
        "card_name": "Axis Flipkart",
        "logo": "\ud83c\udfe6",
        "color": "#800020",
        "platforms": {
            PlatformType.FLIPKART: {"discount_pct": 5, "max_discount": 0, "min_order": 0},
            PlatformType.ZEPTO: {"discount_pct": 8, "max_discount": 150, "min_order": 199},
            PlatformType.BLINKIT: {"discount_pct": 7, "max_discount": 200, "min_order": 299},
        },
        "cashback_pct": 1.5,
    },
    {
        "bank": "Kotak Mahindra",
        "card_type": "Credit Card",
        "card_name": "Kotak 811",
        "logo": "\ud83c\udfe6",
        "color": "#ED1C24",
        "platforms": {
            PlatformType.BIGBASKET: {"discount_pct": 12, "max_discount": 300, "min_order": 799},
            PlatformType.JIOMART: {"discount_pct": 10, "max_discount": 200, "min_order": 499},
            PlatformType.SWIGGY_INSTAMART: {"discount_pct": 8, "max_discount": 150, "min_order": 399},
        },
        "cashback_pct": 1.0,
    },
    {
        "bank": "AMEX",
        "card_type": "Credit Card",
        "card_name": "Amex SmartEarn",
        "logo": "\ud83d\udcb3",
        "color": "#006FCF",
        "platforms": {
            PlatformType.AMAZON_IN: {"discount_pct": 10, "max_discount": 600, "min_order": 999},
            PlatformType.FLIPKART: {"discount_pct": 10, "max_discount": 500, "min_order": 999},
        },
        "cashback_pct": 3.0,
    },
    {
        "bank": "RuPay",
        "card_type": "Debit Card",
        "card_name": "RuPay Platinum",
        "logo": "\ud83e\ude99",
        "color": "#00A650",
        "platforms": {
            PlatformType.BLINKIT: {"discount_pct": 5, "max_discount": 100, "min_order": 199},
            PlatformType.ZEPTO: {"discount_pct": 5, "max_discount": 100, "min_order": 199},
            PlatformType.SWIGGY_INSTAMART: {"discount_pct": 5, "max_discount": 100, "min_order": 199},
            PlatformType.JIOMART: {"discount_pct": 8, "max_discount": 150, "min_order": 199},
        },
        "cashback_pct": 0.5,
    },
]


# ============================================================
# 1c. PLATFORM LOYALTY PROGRAMS
# ============================================================

LOYALTY_PROGRAMS = {
    PlatformType.ZEPTO: {
        "name": "Zepto Pass",
        "points_per_100": 12,
        "point_value": 0.25,
        "bonus": "Free delivery + extra 5% off",
        "tier": "Gold",
        "color": "#8b5cf6",
    },
    PlatformType.BLINKIT: {
        "name": "Blinkit SuperSaver",
        "points_per_100": 8,
        "point_value": 0.30,
        "bonus": "\u20b925 off next 3 orders",
        "tier": "Silver",
        "color": "#f59e0b",
    },
    PlatformType.SWIGGY_INSTAMART: {
        "name": "Swiggy One",
        "points_per_100": 10,
        "point_value": 0.20,
        "bonus": "Free delivery + no surge",
        "tier": "Pro",
        "color": "#f97316",
    },
    PlatformType.AMAZON_IN: {
        "name": "Amazon Pay Rewards",
        "points_per_100": 5,
        "point_value": 1.0,
        "bonus": "5% cashback with Pay balance",
        "tier": "Prime",
        "color": "#FF9900",
    },
    PlatformType.FLIPKART: {
        "name": "SuperCoins",
        "points_per_100": 4,
        "point_value": 1.0,
        "bonus": "Use for subscriptions & offers",
        "tier": "Plus",
        "color": "#2874F0",
    },
    PlatformType.BIGBASKET: {
        "name": "BB Star",
        "points_per_100": 6,
        "point_value": 0.50,
        "bonus": "Free delivery + priority slots",
        "tier": "Star",
        "color": "#8DC63F",
    },
    PlatformType.JIOMART: {
        "name": "JioMart Rewards",
        "points_per_100": 7,
        "point_value": 0.20,
        "bonus": "Jio recharge cashback",
        "tier": "Standard",
        "color": "#0A3D91",
    },
}


def calculate_stacked_savings(products: List[ProductResult], coupon_data: dict) -> Dict:
    """
    The Stackability Engine:
    For each product, find the optimal combination of:
      1. Best platform coupon
      2. Best bank card offer
      3. Loyalty points earned
    to compute the "Net Effective Price".
    """
    stacked_results = []

    for product in products:
        base_price = product.price_breakdown.total_landed_cost
        platform = product.platform

        # --- Layer 1: Best Product Coupon ---
        product_coupons = coupon_data.get(product.id, [])
        platform_coupons = [c for c in product_coupons if c.get("type") not in ["bank_offer"]]
        best_coupon = platform_coupons[0] if platform_coupons else None
        coupon_savings = best_coupon["estimated_savings"] if best_coupon else 0
        price_after_coupon = base_price - coupon_savings

        # --- Layer 2: Best Bank Card Offer ---
        best_bank = None
        best_bank_savings = 0
        all_bank_options = []

        for bank in BANK_CARD_OFFERS:
            if platform in bank["platforms"]:
                offer = bank["platforms"][platform]
                if price_after_coupon >= offer.get("min_order", 0):
                    discount = price_after_coupon * offer["discount_pct"] / 100
                    max_disc = offer.get("max_discount", 0)
                    if max_disc > 0:
                        discount = min(discount, max_disc)
                    general_cashback = price_after_coupon * bank.get("cashback_pct", 0) / 100
                    total_bank_benefit = round(discount + general_cashback, 2)

                    bank_entry = {
                        "bank": bank["bank"],
                        "card_name": bank["card_name"],
                        "card_type": bank["card_type"],
                        "logo": bank["logo"],
                        "color": bank["color"],
                        "discount_pct": offer["discount_pct"],
                        "max_discount": max_disc,
                        "instant_discount": round(discount, 2),
                        "cashback": round(general_cashback, 2),
                        "total_benefit": total_bank_benefit,
                    }
                    all_bank_options.append(bank_entry)

                    if total_bank_benefit > best_bank_savings:
                        best_bank_savings = total_bank_benefit
                        best_bank = bank_entry

        price_after_bank = price_after_coupon - best_bank_savings

        # --- Layer 3: Loyalty Points ---
        loyalty = LOYALTY_PROGRAMS.get(platform)
        loyalty_data = None
        loyalty_value = 0
        if loyalty:
            points_earned = round(base_price / 100 * loyalty["points_per_100"])
            loyalty_value = round(points_earned * loyalty["point_value"], 2)
            loyalty_data = {
                "program": loyalty["name"],
                "points_earned": points_earned,
                "point_value": loyalty_value,
                "tier": loyalty["tier"],
                "bonus": loyalty["bonus"],
                "color": loyalty["color"],
            }

        # --- Net Effective Price ---
        net_effective_price = round(max(0, price_after_bank - loyalty_value), 2)
        total_savings = round(base_price - net_effective_price, 2)
        savings_pct = round((total_savings / base_price) * 100, 1) if base_price > 0 else 0

        stacked_results.append({
            "product_id": product.id,
            "product_name": product.title,
            "platform": platform.value,
            "original_price": round(base_price, 2),
            "net_effective_price": net_effective_price,
            "total_savings": total_savings,
            "savings_pct": savings_pct,
            "layers": {
                "coupon": {
                    "applied": best_coupon is not None,
                    "code": best_coupon.get("code") if best_coupon else None,
                    "discount_label": best_coupon.get("discount", "") if best_coupon else "",
                    "savings": coupon_savings,
                    "target": best_coupon.get("for", "") if best_coupon else "",
                },
                "bank": {
                    "applied": best_bank is not None,
                    "best_card": best_bank,
                    "savings": best_bank_savings,
                    "all_options": sorted(all_bank_options, key=lambda x: x["total_benefit"], reverse=True)[:4],
                },
                "loyalty": {
                    "applied": loyalty_data is not None,
                    "program": loyalty_data,
                    "savings": loyalty_value,
                },
            },
        })

    stacked_results.sort(key=lambda x: x["net_effective_price"])
    best_deal = stacked_results[0] if stacked_results else None

    return {
        "stacked": stacked_results,
        "best_deal": best_deal,
        "total_products_analyzed": len(stacked_results),
    }


# ============================================================
# 2. PRICE OF URGENCY ANALYTICS — THE OPPORTUNITY COST CALCULATOR
# ============================================================

# --- 2a. Categorical Urgency Taxonomy ---
# Items are classified by how time-sensitive they are.
# speed_weight > 1 means speed matters more; < 1 means savings matter more.
ITEM_CATEGORIES = {
    "perishable": {
        "label": "Perishable / Daily Essential",
        "icon": "🥛",
        "color": "#ef4444",
        "speed_weight": 5.0,
        "description": "Time-critical — delayed delivery causes spoilage or immediate inconvenience",
        "keywords": [
            "milk", "curd", "yogurt", "paneer", "bread", "egg", "eggs", "butter",
            "cheese", "cream", "ice cream", "fruit", "vegetable", "salad", "meat",
            "chicken", "fish", "prawns", "tofu", "dosa batter", "idli batter",
            "juice", "smoothie", "baby food", "infant formula", "diaper", "diapers",
            "sanitary", "napkin", "tissue", "toilet paper",
        ],
    },
    "medical": {
        "label": "Medical / Health Emergency",
        "icon": "💊",
        "color": "#f43f5e",
        "speed_weight": 5.0,
        "description": "Health-critical — delays can cause discomfort or worsened conditions",
        "keywords": [
            "medicine", "tablet", "capsule", "syrup", "paracetamol", "crocin",
            "dolo", "bandage", "band-aid", "thermometer", "oximeter", "inhaler",
            "nebulizer", "ointment", "drops", "eye drop", "ear drop", "antacid",
            "vitamin", "supplement", "protein powder", "first aid", "sanitizer",
            "mask", "masks", "glucose", "ors", "betadine", "pain relief",
            "fever", "cold", "cough", "allergy", "bp monitor", "glucometer",
        ],
    },
    "tech": {
        "label": "Tech / Productivity Device",
        "icon": "⚡",
        "color": "#6366f1",
        "speed_weight": 3.0,
        "description": "Productivity-critical — delays cause device downtime and lost work hours",
        "keywords": [
            "charger", "charging cable", "usb cable", "power bank", "adapter",
            "hdmi", "dongle", "mouse", "keyboard", "webcam", "headphone",
            "earphone", "earbuds", "airpods", "speaker", "mic", "microphone",
            "pen drive", "pendrive", "usb", "ssd", "hard disk", "hard drive",
            "ram", "memory card", "sd card", "laptop stand", "monitor", "screen",
            "screen guard", "tempered glass", "phone case", "phone cover", "cable",
            "extension cord", "router", "wifi", "ethernet", "ups", "inverter",
            "battery", "printer", "ink", "toner", "cartridge",
            "laptop", "phone", "tablet", "ipad", "macbook", "iphone", "samsung",
        ],
    },
    "office": {
        "label": "Office / Work Supply",
        "icon": "📎",
        "color": "#0ea5e9",
        "speed_weight": 2.0,
        "description": "Work-adjacent — moderate urgency, next-day is usually acceptable",
        "keywords": [
            "pen", "pencil", "notebook", "diary", "stapler", "tape", "glue",
            "scissors", "marker", "highlighter", "eraser", "sharpener",
            "envelope", "paper", "a4", "folder", "file", "binder", "sticky note",
            "post-it", "whiteboard", "calculator", "desk", "chair", "lamp",
        ],
    },
    "fashion": {
        "label": "Fashion / Lifestyle",
        "icon": "👕",
        "color": "#a855f7",
        "speed_weight": 0.3,
        "description": "Low urgency — planned purchase, savings should be prioritized",
        "keywords": [
            "shirt", "t-shirt", "tshirt", "jeans", "trousers", "shorts", "dress",
            "saree", "kurta", "kurti", "lehenga", "jacket", "hoodie", "sweater",
            "shoe", "shoes", "sneaker", "sandal", "heel", "slipper", "flip flop",
            "watch", "sunglasses", "bag", "backpack", "wallet", "belt", "cap",
            "hat", "scarf", "perfume", "deodorant", "cosmetic", "lipstick",
            "foundation", "mascara", "eyeliner", "nail polish",
        ],
    },
    "gaming": {
        "label": "Gaming / Entertainment",
        "icon": "🎮",
        "color": "#8b5cf6",
        "speed_weight": 0.4,
        "description": "Discretionary — no real urgency, maximize savings",
        "keywords": [
            "gaming mouse", "gaming keyboard", "gaming headset", "controller",
            "joystick", "gamepad", "console", "playstation", "ps5", "xbox",
            "nintendo", "switch", "game", "gaming chair", "mousepad", "rgb",
            "gaming monitor", "graphics card", "gpu",
        ],
    },
}

# --- 2b. Productivity Uptime Metrics ---
# For tech items: how much potential downtime does faster delivery prevent?
PRODUCTIVITY_METRICS = {
    "charger": {
        "device": "phone/laptop",
        "downtime_per_hour": 1.0,  # 1 hr delay = 1 hr potential downtime
        "productivity_label": "device downtime",
        "impact": "calls, emails, and apps become inaccessible",
        "hourly_value": 300,  # ₹300/hr avg productivity value
    },
    "charging cable": {
        "device": "phone/laptop",
        "downtime_per_hour": 1.0,
        "productivity_label": "device downtime",
        "impact": "device battery drains, rendering it unusable",
        "hourly_value": 300,
    },
    "power bank": {
        "device": "phone",
        "downtime_per_hour": 0.5,
        "productivity_label": "potential mobile downtime",
        "impact": "risk of phone dying during commute or meetings",
        "hourly_value": 250,
    },
    "adapter": {
        "device": "laptop/charger",
        "downtime_per_hour": 1.0,
        "productivity_label": "device downtime",
        "impact": "laptop cannot charge, halting all work",
        "hourly_value": 350,
    },
    "mouse": {
        "device": "computer",
        "downtime_per_hour": 0.3,
        "productivity_label": "reduced work efficiency",
        "impact": "trackpad-only use slows productivity by ~30%",
        "hourly_value": 200,
    },
    "keyboard": {
        "device": "computer",
        "downtime_per_hour": 0.8,
        "productivity_label": "typing downtime",
        "impact": "virtual keyboard is impractical for extended work",
        "hourly_value": 300,
    },
    "headphone": {
        "device": "phone/laptop",
        "downtime_per_hour": 0.2,
        "productivity_label": "meeting disruption risk",
        "impact": "unable to take private calls or join virtual meetings",
        "hourly_value": 200,
    },
    "earphone": {
        "device": "phone/laptop",
        "downtime_per_hour": 0.2,
        "productivity_label": "meeting disruption risk",
        "impact": "no private audio for calls and meetings",
        "hourly_value": 200,
    },
    "earbuds": {
        "device": "phone/laptop",
        "downtime_per_hour": 0.2,
        "productivity_label": "meeting disruption risk",
        "impact": "unable to take private calls or join virtual meetings",
        "hourly_value": 200,
    },
    "webcam": {
        "device": "laptop/desktop",
        "downtime_per_hour": 0.5,
        "productivity_label": "video call downtime",
        "impact": "cannot join video meetings — camera off affects presence",
        "hourly_value": 300,
    },
    "wifi": {
        "device": "all devices",
        "downtime_per_hour": 1.0,
        "productivity_label": "internet downtime",
        "impact": "complete connectivity loss across all devices",
        "hourly_value": 400,
    },
    "router": {
        "device": "all devices",
        "downtime_per_hour": 1.0,
        "productivity_label": "internet downtime",
        "impact": "no internet for entire household/office",
        "hourly_value": 400,
    },
    "printer": {
        "device": "printer",
        "downtime_per_hour": 0.3,
        "productivity_label": "print job delay",
        "impact": "pending documents cannot be printed",
        "hourly_value": 150,
    },
    "ink": {
        "device": "printer",
        "downtime_per_hour": 0.3,
        "productivity_label": "print job delay",
        "impact": "printer unusable until ink replaced",
        "hourly_value": 150,
    },
    "laptop": {
        "device": "laptop",
        "downtime_per_hour": 1.0,
        "productivity_label": "full workday loss",
        "impact": "no primary work device — entire workflow halted",
        "hourly_value": 500,
    },
    "phone": {
        "device": "phone",
        "downtime_per_hour": 0.8,
        "productivity_label": "communication downtime",
        "impact": "calls, messages, and 2FA inaccessible",
        "hourly_value": 350,
    },
    "monitor": {
        "device": "desktop/laptop",
        "downtime_per_hour": 0.7,
        "productivity_label": "screen productivity loss",
        "impact": "reduced to single small screen — multitasking crippled",
        "hourly_value": 300,
    },
    "ups": {
        "device": "all devices",
        "downtime_per_hour": 0.5,
        "productivity_label": "power outage risk",
        "impact": "sudden shutdowns during power cuts damage work",
        "hourly_value": 300,
    },
    "extension cord": {
        "device": "multiple",
        "downtime_per_hour": 0.4,
        "productivity_label": "power access issue",
        "impact": "cannot power devices at current location",
        "hourly_value": 200,
    },
    "battery": {
        "device": "various",
        "downtime_per_hour": 0.5,
        "productivity_label": "device downtime",
        "impact": "device non-functional without power source",
        "hourly_value": 250,
    },
}


def _classify_item(query: str) -> Dict:
    """Classify a search query into a category with speed weight."""
    q = query.lower().strip()
    
    # First check for exact/compound matches (longer phrases first)
    for cat_key, cat in sorted(ITEM_CATEGORIES.items(), key=lambda x: -max(len(k) for k in x[1]["keywords"])):
        for keyword in sorted(cat["keywords"], key=len, reverse=True):
            if keyword in q:
                return {
                    "category": cat_key,
                    "label": cat["label"],
                    "icon": cat["icon"],
                    "color": cat["color"],
                    "speed_weight": cat["speed_weight"],
                    "description": cat["description"],
                    "matched_keyword": keyword,
                }
    
    # Default: general item
    return {
        "category": "general",
        "label": "General Item",
        "icon": "📦",
        "color": "#71717a",
        "speed_weight": 1.0,
        "description": "Standard urgency — balanced between speed and savings",
        "matched_keyword": None,
    }


def _get_productivity_metric(query: str, time_gap_minutes: int, price_gap: float, symbol: str) -> Optional[Dict]:
    """For tech items, calculate productivity uptime savings."""
    q = query.lower().strip()
    
    for keyword, metric in sorted(PRODUCTIVITY_METRICS.items(), key=lambda x: -len(x[0])):
        if keyword in q:
            time_gap_hours = time_gap_minutes / 60
            downtime_saved = round(time_gap_hours * metric["downtime_per_hour"], 1)
            productivity_value = round(downtime_saved * metric["hourly_value"], 0)
            
            return {
                "matched_item": keyword,
                "device": metric["device"],
                "downtime_saved_hours": downtime_saved,
                "productivity_label": metric["productivity_label"],
                "impact": metric["impact"],
                "productivity_value": productivity_value,
                "hourly_value": metric["hourly_value"],
                "verdict": f"Paying {symbol}{price_gap:.0f} premium saves {downtime_saved:.1f} hours of potential {metric['productivity_label']}.",
                "roi": round(productivity_value / max(price_gap, 1), 1),
                "roi_label": f"{round(productivity_value / max(price_gap, 1), 1)}x return" if productivity_value > price_gap else "Break-even",
            }
    
    return None


def calculate_price_oracle(products: List[ProductResult], symbol: str, query: str = "") -> Dict:
    """
    AI Price Oracle - Replaces Urgency Analytics:
    - AI Buy Signal: Predicts if prices will fall soon.
    - Surge Resilience: Alerts for high-demand price hikes.
    - Category Context: Industry-specific urgency levels.
    - Confidence Matrix: Certainty of the recommendation.
    """
    if not products:
        return {}
        
    # Find the best overall contender (usually the best price)
    best_contender = products[0]
    prediction = predict_price_action(best_contender)
    
    # --- Classify the item (Legacy category logic) ---
    category = _classify_item(query)
    speed_weight = category["speed_weight"]
    
    # 1. Base Strategy from Prediction
    action = prediction.action if prediction else ActionEnum.BUY_NOW
    confidence = prediction.confidence if prediction else 90
    reason = prediction.reason if prediction else "Price is stable."
    potential_savings = prediction.potential_savings if prediction else 0.0
    
    # 2. Surge Detection (Environmental factor)
    hour = datetime.now().hour
    surge_status = "normal"
    surge_platforms = []
    surge_tip = ""
    
    if 18 <= hour <= 21:
        surge_status = "high_demand"
        surge_platforms = ["Blinkit", "Zepto"]
        surge_tip = "Surge active in your area. Wait ~45 mins for normal rates."
        # If surge is active, override to WAIT if it was BUY_NOW for quick commerce
        if best_contender.platform.value in ["blinkit", "zepto"] and action == ActionEnum.BUY_NOW:
            action = ActionEnum.WAIT
            confidence = 85
            reason = "Surge pricing detected. AI recommends waiting for demand to cool."
            potential_savings = 25.0 # Estimated surge premium
            
    # 3. Market Sentiment (Simulated factors)
    market_volatility = "Stable"
    if speed_weight >= 4.0: market_volatility = "High" # Tech/Med moves fast
    
    # 4. Recommendation Badge
    badge_color = "#22c55e" if action == ActionEnum.BUY_NOW else "#f87171"
    if action == ActionEnum.WAIT and confidence < 80: badge_color = "#facc15" # Yellow for cautious wait
    
    # 5. Opportunity Matrix (Fastest vs Cheapest)
    cheapest = min(products, key=lambda p: p.price_breakdown.total_landed_cost)
    fastest = min(products, key=lambda p: p.eta_minutes)
    
    return {
        "action": action.value,
        "confidence": confidence,
        "reason": reason,
        "product_id": best_contender.id,
        "product_title": best_contender.title,
        "product_url": best_contender.url,
        "platform": best_contender.platform.value,
        "potential_savings": potential_savings,
        "badge_color": badge_color,
        "category": category,
        "market_volatility": market_volatility,
        "surge": {
            "status": surge_status,
            "tip": surge_tip,
        },
        "tradeoff": {
            "price_gap": fastest.price_breakdown.total_landed_cost - cheapest.price_breakdown.total_landed_cost,
            "time_gap_minutes": cheapest.eta_minutes - fastest.eta_minutes,
        } if cheapest.id != fastest.id else None
    }


# ============================================================
# 3. SUSTAINABILITY & CARBON FOOTPRINT
# ============================================================

# Estimated carbon data per platform (kg CO2 per delivery)
PLATFORM_CARBON_DATA = {
    PlatformType.BLINKIT: {"co2_kg": 0.18, "distance_km": 2, "vehicle": "EV Bike", "is_ev": True, "warehouse": "Dark Store"},
    PlatformType.ZEPTO: {"co2_kg": 0.15, "distance_km": 1.5, "vehicle": "EV Scooter", "is_ev": True, "warehouse": "Dark Store"},
    PlatformType.SWIGGY_INSTAMART: {"co2_kg": 0.25, "distance_km": 3, "vehicle": "Bike", "is_ev": False, "warehouse": "Dark Store"},
    PlatformType.BIGBASKET: {"co2_kg": 0.45, "distance_km": 8, "vehicle": "Mini Van", "is_ev": False, "warehouse": "Warehouse"},
    PlatformType.JIOMART: {"co2_kg": 0.50, "distance_km": 10, "vehicle": "Delivery Van", "is_ev": False, "warehouse": "Store"},
    PlatformType.AMAZON_IN: {"co2_kg": 1.20, "distance_km": 200, "vehicle": "Truck + Last Mile", "is_ev": False, "warehouse": "Fulfillment Center"},
    PlatformType.FLIPKART: {"co2_kg": 1.15, "distance_km": 180, "vehicle": "Truck + Last Mile", "is_ev": False, "warehouse": "Fulfillment Center"},
}


def calculate_stock_pulse(products: List[ProductResult]) -> Dict:
    """
    Hyper-Local Stock Pulse: Predicts stockout and surge for nearby hubs.
    """
    hubs = []
    overall_risk = "Stable"
    
    platforms = list(set([p.platform for p in products]))
    
    for plat in platforms:
        # Deterministic simulation based on platform and hour
        seed = int(hashlib.md5(f"{plat}{datetime.now().hour}".encode()).hexdigest(), 16)
        random.seed(seed)
        
        stock_level = random.randint(2, 50)
        prob = 100 - (stock_level * 2)
        vulnerable = prob > 60
        
        if vulnerable: overall_risk = "Critical"
        
        hubs.append({
            "platform": plat.value if hasattr(plat, 'value') else str(plat),
            "stock_level": stock_level,
            "stockout_probability": prob,
            "predicted_stockout_time": f"{random.randint(5, 55)}m",
            "surge_forecast": "Expected +₹40 surge" if vulnerable else "Stable",
            "is_vulnerable": vulnerable,
            "hub_distance": f"{random.uniform(0.5, 3.5):.1f}km",
        })
    
    random.seed()
    
    return {
        "hubs": hubs,
        "overall_status": overall_risk if overall_risk == "Critical" else "Stable",
        "prediction_accuracy": 94,
        "pulse_color": "#ef4444" if overall_risk == "Critical" else "#22c55e",
        "global_stockout_alert": "High demand detected in your sector" if overall_risk == "Critical" else None,
        "scarcity_factor": random.uniform(0.1, 0.9) if overall_risk == "Critical" else 0.05,
    }


# --- Flash Pool logic replaces ESG ---


# ============================================================
# 4. PRODUCT AUTHENTICITY & REVIEW SENTIMENT
# ============================================================

# Simulated sentiment data (in production, LLM-summarized reviews)
PLATFORM_SENTIMENTS = {
    PlatformType.AMAZON_IN: {
        "avg_trust": 4.2,
        "strengths": ["Genuine products", "Easy returns", "Detailed reviews"],
        "concerns": ["Slow delivery", "Mixed 3rd party sellers"],
        "summary_template": "Amazon users say: {product_type} quality is generally reliable. {positive}. However, {negative}.",
    },
    PlatformType.FLIPKART: {
        "avg_trust": 4.0,
        "strengths": ["Good deals during sales", "Fast delivery in metros"],
        "concerns": ["Occasional counterfeit reports", "Return process can be slow"],
        "summary_template": "Flipkart users say: {positive}. Some report {negative}.",
    },
    PlatformType.BLINKIT: {
        "avg_trust": 3.8,
        "strengths": ["Ultra-fast delivery", "Fresh produce"],
        "concerns": ["Limited variety", "Items sometimes out of stock"],
        "summary_template": "Blinkit users say: {positive}. Note: {negative}.",
    },
    PlatformType.ZEPTO: {
        "avg_trust": 3.9,
        "strengths": ["10-minute delivery", "Good packaging"],
        "concerns": ["Prices slightly higher", "Smaller pack sizes"],
        "summary_template": "Zepto users say: {positive}. Note: {negative}.",
    },
    PlatformType.SWIGGY_INSTAMART: {
        "avg_trust": 3.7,
        "strengths": ["Wide selection", "Combo offers"],
        "concerns": ["Delivery can be delayed during rain", "Occasional wrong items"],
        "summary_template": "Instamart users say: {positive}. However, {negative}.",
    },
}


# --- Aspect-Based Sentiment Analysis (ABSA) ---
ASPECT_TAXONOMY = {
    "Electronics": {
        "aspects": [
            {"name": "Build Quality", "icon": "🔧", "keywords": ["build", "quality", "material", "sturdy", "durable", "flimsy"]},
            {"name": "Battery Life", "icon": "🔋", "keywords": ["battery", "charge", "lasting", "drain", "backup"]},
            {"name": "Performance", "icon": "⚡", "keywords": ["speed", "fast", "lag", "smooth", "performance", "processor"]},
            {"name": "Display", "icon": "🖥️", "keywords": ["display", "screen", "brightness", "resolution", "color"]},
            {"name": "Camera", "icon": "📷", "keywords": ["camera", "photo", "video", "lens", "clarity"]},
            {"name": "Value for Money", "icon": "💰", "keywords": ["price", "value", "worth", "expensive", "cheap", "affordable"]},
            {"name": "Packaging", "icon": "📦", "keywords": ["packaging", "box", "damage", "sealed", "wrap"]},
            {"name": "After-Sales", "icon": "🛠️", "keywords": ["warranty", "service", "support", "replacement", "return"]},
        ],
    },
    "Fashion": {
        "aspects": [
            {"name": "Material Quality", "icon": "🧵", "keywords": ["fabric", "material", "cotton", "polyester", "soft"]},
            {"name": "Sizing Accuracy", "icon": "📏", "keywords": ["size", "fit", "loose", "tight", "true to size"]},
            {"name": "Color Accuracy", "icon": "🎨", "keywords": ["color", "shade", "dye", "fading", "as shown"]},
            {"name": "Stitching", "icon": "🪡", "keywords": ["stitch", "seam", "thread", "tear", "sewing"]},
            {"name": "Comfort", "icon": "😊", "keywords": ["comfortable", "breathable", "itchy", "rough"]},
            {"name": "Value for Money", "icon": "💰", "keywords": ["price", "value", "worth", "overpriced"]},
            {"name": "Packaging", "icon": "📦", "keywords": ["packaging", "box", "wrinkled", "folded"]},
        ],
    },
    "Grocery": {
        "aspects": [
            {"name": "Freshness", "icon": "🥬", "keywords": ["fresh", "stale", "expiry", "shelf life"]},
            {"name": "Packaging", "icon": "📦", "keywords": ["packaging", "sealed", "leak", "damage"]},
            {"name": "Quantity Accuracy", "icon": "⚖️", "keywords": ["weight", "quantity", "less", "accurate", "grams"]},
            {"name": "Value for Money", "icon": "💰", "keywords": ["price", "value", "costly", "cheap"]},
            {"name": "Taste / Quality", "icon": "👅", "keywords": ["taste", "flavor", "quality", "pure", "adulterated"]},
            {"name": "Delivery Speed", "icon": "🚀", "keywords": ["delivery", "fast", "late", "time"]},
        ],
    },
    "General": {
        "aspects": [
            {"name": "Build Quality", "icon": "🔧", "keywords": ["quality", "build", "material", "durable"]},
            {"name": "Value for Money", "icon": "💰", "keywords": ["price", "value", "worth"]},
            {"name": "Packaging", "icon": "📦", "keywords": ["packaging", "box", "damage"]},
            {"name": "Performance", "icon": "⚡", "keywords": ["works", "performance", "function"]},
            {"name": "Delivery Speed", "icon": "🚀", "keywords": ["delivery", "fast", "late", "shipping"]},
            {"name": "After-Sales", "icon": "🛠️", "keywords": ["return", "refund", "warranty"]},
        ],
    },
}

# Platform-specific aspect score biases (out of 100)
PLATFORM_ASPECT_BIASES = {
    PlatformType.AMAZON_IN: {"Build Quality": 5, "After-Sales": 10, "Value for Money": -5, "Packaging": 3},
    PlatformType.FLIPKART: {"Value for Money": 8, "Delivery Speed": 5, "After-Sales": -3, "Build Quality": 0},
    PlatformType.BLINKIT: {"Delivery Speed": 15, "Freshness": 10, "Value for Money": -8, "Packaging": 5},
    PlatformType.ZEPTO: {"Delivery Speed": 18, "Packaging": 8, "Value for Money": -10, "Freshness": 8},
    PlatformType.SWIGGY_INSTAMART: {"Delivery Speed": 10, "Value for Money": 5, "Packaging": -3, "Freshness": 3},
}


def _generate_aspect_scores(platform: "PlatformType", product_type: str, query: str) -> List[Dict]:
    """Generate ABSA scores per aspect for a platform, deterministically seeded."""
    taxonomy = ASPECT_TAXONOMY.get(product_type, ASPECT_TAXONOMY["General"])
    biases = PLATFORM_ASPECT_BIASES.get(platform, {})
    
    seed = int(hashlib.md5(f"{platform.value}{query}{product_type}".encode()).hexdigest(), 16)
    random.seed(seed)
    
    aspects = []
    for aspect_def in taxonomy["aspects"]:
        base_score = random.randint(55, 92)
        bias = biases.get(aspect_def["name"], 0)
        score = max(15, min(98, base_score + bias))
        
        # Simulate review count & sentiment distribution
        total_mentions = random.randint(12, 340)
        positive_pct = max(10, min(95, score + random.randint(-8, 5)))
        negative_pct = max(3, min(50, 100 - positive_pct - random.randint(5, 20)))
        neutral_pct = 100 - positive_pct - negative_pct
        
        # Sentiment label
        if score >= 80:
            sentiment = "positive"
        elif score >= 55:
            sentiment = "mixed"
        else:
            sentiment = "negative"
        
        aspects.append({
            "name": aspect_def["name"],
            "icon": aspect_def["icon"],
            "score": score,
            "sentiment": sentiment,
            "total_mentions": total_mentions,
            "positive_pct": positive_pct,
            "negative_pct": negative_pct,
            "neutral_pct": neutral_pct,
        })
    
    random.seed()
    return aspects


def _detect_bot_reviews(platform: "PlatformType", query: str) -> Dict:
    """
    Simulated Bot-Detection ML Model.
    Analyzes review patterns for signs of manipulation:
    - Review velocity (too many reviews in short time)
    - Rating distribution kurtosis (unnatural 5-star clustering)
    - Unverified buyer ratio
    - Reviewer diversity (same reviewers across products)
    """
    seed = int(hashlib.md5(f"bot_{platform.value}{query}".encode()).hexdigest(), 16)
    random.seed(seed)
    
    # Simulate detection signals
    total_reviews = random.randint(50, 5000)
    five_star_pct = random.uniform(0.25, 0.85)
    one_star_pct = random.uniform(0.02, 0.20)
    verified_pct = random.uniform(0.40, 0.95)
    review_velocity = random.uniform(0.5, 15.0)  # reviews/day in first week
    unique_reviewer_pct = random.uniform(0.70, 1.0)
    
    # Calculate risk signals
    signals = []
    risk_score = 0
    
    # Signal 1: Rating distribution anomaly (too many 5-stars)
    rating_skew = five_star_pct
    if rating_skew > 0.70:
        signals.append({
            "signal": "Rating Distribution Anomaly",
            "icon": "📊",
            "detail": f"{int(five_star_pct * 100)}% of reviews are 5-star — organic products typically show 50-65%",
            "severity": "high",
            "contribution": 30,
        })
        risk_score += 30
    elif rating_skew > 0.55:
        signals.append({
            "signal": "Slightly Skewed Ratings",
            "icon": "📊",
            "detail": f"{int(five_star_pct * 100)}% 5-star reviews — slightly above organic average",
            "severity": "low",
            "contribution": 10,
        })
        risk_score += 10
    
    # Signal 2: Low verified purchase ratio
    if verified_pct < 0.55:
        signals.append({
            "signal": "Low Verified Purchases",
            "icon": "🔓",
            "detail": f"Only {int(verified_pct * 100)}% verified buyers — organic average is 75%+",
            "severity": "high",
            "contribution": 25,
        })
        risk_score += 25
    elif verified_pct < 0.70:
        signals.append({
            "signal": "Below-Average Verification",
            "icon": "🔓",
            "detail": f"{int(verified_pct * 100)}% verified — slightly below the 75% benchmark",
            "severity": "medium",
            "contribution": 12,
        })
        risk_score += 12
    
    # Signal 3: Review velocity spike
    if review_velocity > 8.0:
        signals.append({
            "signal": "Review Velocity Spike",
            "icon": "📈",
            "detail": f"{review_velocity:.1f} reviews/day in first week — suggests coordinated campaign",
            "severity": "high",
            "contribution": 25,
        })
        risk_score += 25
    elif review_velocity > 4.0:
        signals.append({
            "signal": "Elevated Review Rate",
            "icon": "📈",
            "detail": f"{review_velocity:.1f} reviews/day — above typical organic rate of 2-3/day",
            "severity": "medium",
            "contribution": 10,
        })
        risk_score += 10
    
    # Signal 4: Reviewer diversity
    if unique_reviewer_pct < 0.80:
        signals.append({
            "signal": "Low Reviewer Diversity",
            "icon": "👥",
            "detail": f"Only {int(unique_reviewer_pct * 100)}% unique reviewers — possible review farm activity",
            "severity": "medium",
            "contribution": 15,
        })
        risk_score += 15
    
    # Clamp risk score
    risk_score = min(100, risk_score)
    
    # Determine alert level
    if risk_score >= 60:
        alert_level = "high"
        alert_label = "⚠️ High Risk — Likely Manipulated"
        alert_color = "#ef4444"
    elif risk_score >= 30:
        alert_level = "medium"
        alert_label = "🟡 Moderate Risk — Exercise Caution"
        alert_color = "#f59e0b"
    else:
        alert_level = "low"
        alert_label = "✅ Low Risk — Reviews Appear Organic"
        alert_color = "#22c55e"
    
    random.seed()
    
    return {
        "risk_score": risk_score,
        "alert_level": alert_level,
        "alert_label": alert_label,
        "alert_color": alert_color,
        "total_reviews": total_reviews,
        "five_star_pct": round(five_star_pct * 100, 1),
        "verified_pct": round(verified_pct * 100, 1),
        "review_velocity": round(review_velocity, 1),
        "unique_reviewer_pct": round(unique_reviewer_pct * 100, 1),
        "signals": signals,
        "recommendation": f"{'Read 1-3 star reviews carefully before purchasing.' if risk_score >= 30 else 'Reviews appear trustworthy. Standard due diligence recommended.'}",
    }


def get_review_sentiment(products: List[ProductResult], query: str) -> Dict:
    """Generate sentiment-aggregated review data with ABSA and Bot Detection"""
    sentiments = []
    
    # Determine product type for contextual summaries
    query_lower = query.lower()
    if any(w in query_lower for w in ["phone", "iphone", "samsung", "laptop", "tv", "tablet", "headphone", "earbuds", "mouse", "keyboard", "charger"]):
        product_type = "Electronics"
        positive_phrases = ["Build quality is praised", "Performance meets expectations"]
        negative_phrases = ["some units have defects", "warranty claims can be slow"]
    elif any(w in query_lower for w in ["shoe", "shirt", "dress", "clothing", "jeans", "jacket", "kurta", "saree"]):
        product_type = "Fashion"
        positive_phrases = ["Sizing is accurate", "Material quality is decent"]
        negative_phrases = ["color may differ from photos", "stitching quality varies"]
    elif any(w in query_lower for w in ["milk", "bread", "rice", "oil", "sugar", "grocery", "flour", "dal", "atta", "ghee", "butter"]):
        product_type = "Grocery"
        positive_phrases = ["Products are fresh", "Good expiry dates"]
        negative_phrases = ["packaging sometimes damaged in transit", "prices fluctuate"]
    else:
        product_type = "General"
        positive_phrases = ["Product quality is acceptable", "Value for money"]
        negative_phrases = ["delivery packaging could improve", "occasional delays"]
    
    for product in products:
        platform_sentiment = PLATFORM_SENTIMENTS.get(product.platform)
        if platform_sentiment:
            positive = random.choice(platform_sentiment["strengths"])
            negative = random.choice(platform_sentiment["concerns"])
            
            summary = platform_sentiment["summary_template"].format(
                product_type=product_type,
                positive=positive,
                negative=negative,
            )
            
            # Generate ABSA aspect scores for this platform
            aspect_scores = _generate_aspect_scores(product.platform, product_type, query)
            
            # Generate bot detection for this platform
            bot_detection = _detect_bot_reviews(product.platform, query)
            
            sentiments.append({
                "platform": product.platform.value,
                "trust_score": platform_sentiment["avg_trust"],
                "summary": summary,
                "strengths": platform_sentiment["strengths"],
                "concerns": platform_sentiment["concerns"],
                "aspect_scores": aspect_scores,
                "bot_detection": bot_detection,
            })
    
    # Label-Lie detection (simulated)
    label_warnings = []
    if any(w in query_lower for w in ["kg", "liter", "litre", "ml", "gram"]):
        label_warnings.append({
            "type": "quantity_check",
            "message": "⚠️ Always verify net weight on delivery. Some '1kg' packs may be '900g + 100g free' — same quantity, different perception.",
            "severity": "info"
        })
    
    if any(w in query_lower for w in ["organic", "natural", "pure"]):
        label_warnings.append({
            "type": "certification_check",
            "message": "🔍 Look for FSSAI/USDA organic certification. Labels like 'Natural' or 'Pure' are not regulated terms.",
            "severity": "warning"
        })
    
    # Cross-platform ABSA heatmap data (aggregate aspects across all platforms)
    heatmap_data = _build_cross_platform_heatmap(sentiments, product_type)
    
    return {
        "sentiments": sentiments,
        "label_warnings": label_warnings,
        "product_type": product_type,
        "heatmap": heatmap_data,
    }


def _build_cross_platform_heatmap(sentiments: List[Dict], product_type: str) -> Dict:
    """Build a cross-platform aspect heatmap for the NLP Sentiment Heatmap visualization."""
    taxonomy = ASPECT_TAXONOMY.get(product_type, ASPECT_TAXONOMY["General"])
    aspect_names = [a["name"] for a in taxonomy["aspects"]]
    aspect_icons = {a["name"]: a["icon"] for a in taxonomy["aspects"]}
    
    # 1. Aggregate unique platforms and their scores
    unique_platforms = []
    platform_scores = {} # platform -> {aspect_name: [scores]}
    
    for sent in sentiments:
        platform = sent["platform"]
        if platform not in platform_scores:
            unique_platforms.append(platform)
            platform_scores[platform] = {}
        
        for asp in sent.get("aspect_scores", []):
            if asp["name"] not in platform_scores[platform]:
                platform_scores[platform][asp["name"]] = []
            platform_scores[platform][asp["name"]].append(asp["score"])
    
    # 2. Build heatmap matrix with AVERAGED scores per platform
    matrix = {} # aspect_name -> {platform: averaged_score}
    for platform, aspects in platform_scores.items():
        for aspect_name, scores in aspects.items():
            if aspect_name not in matrix:
                matrix[aspect_name] = {}
            avg = round(sum(scores) / len(scores), 1)
            matrix[aspect_name][platform] = avg
    
    # 3. Build heatmap rows
    rows = []
    for aspect_name in aspect_names:
        scores = matrix.get(aspect_name, {})
        avg_score = round(sum(scores.values()) / max(len(scores), 1), 1) if scores else 0
        best_platform = max(scores, key=scores.get) if scores else None
        worst_platform = min(scores, key=scores.get) if scores else None
        
        rows.append({
            "aspect": aspect_name,
            "icon": aspect_icons.get(aspect_name, "📊"),
            "scores": scores,  # {platform: averaged_score}
            "avg_score": avg_score,
            "best_platform": best_platform,
            "worst_platform": worst_platform,
        })
    
    return {
        "platforms": unique_platforms,
        "rows": rows,
        "product_type": product_type,
    }


# ============================================================  
# 5. VIT STUDENT-SPECIFIC / CAMPUS SECTION
# ============================================================

# Campus store data (simulated)
CAMPUS_STORES = {
    "Hostel Stationery Shop": {
        "location": "VIT Main Gate, Kondhwa",
        "hours": "8 AM - 10 PM",
        "categories": ["stationery", "snacks", "charger", "cable", "earphones", "pen drive"],
        "delivery": "Walk-in only",
        "avg_discount": "5-15% cheaper than online",
    },
    "Kondhwa Market": {
        "location": "Kondhwa Main Road, 1.2 km from VIT",
        "hours": "9 AM - 9 PM",
        "categories": ["grocery", "fruits", "vegetables", "milk", "bread", "eggs", "toiletries"],
        "delivery": "Some shops deliver for ₹20",
        "avg_discount": "10-25% cheaper than Q-commerce",
    },
    "Bibwewadi Electronics": {
        "location": "Bibwewadi Road, 2.5 km from VIT",
        "hours": "10 AM - 8 PM",
        "categories": ["laptop", "phone", "headphones", "charger", "accessories", "tv"],
        "delivery": "Free delivery above ₹2000",
        "avg_discount": "Negotiable prices, 5-20% off MRP",
    },
}


def _get_local_resale_deals(query: str) -> List[Dict]:
    """
    Simulate local P2P resale items from nearby users.
    """
    query_lower = query.lower()
    
    # Static database for specific common items
    resale_database = [
        {"item": "Fast Charger 65W", "price": 450, "condition": "Like New", "category": "charger", "hand": "2nd Hand"},
        {"item": "USB-C to Lightning Cable", "price": 150, "condition": "Good", "category": "cable", "hand": "2nd Hand"},
        {"item": "Scientific Calculator FX-991ES", "price": 600, "condition": "Mint", "category": "stationery", "hand": "2nd Hand"},
        {"item": "Mechanical Keyboard", "price": 1200, "condition": "Used - 6 months", "category": "accessories", "hand": "3rd Hand"},
        {"item": "Noise Cancelling Headphones", "price": 2500, "condition": "Good", "category": "headphones", "hand": "2nd Hand"},
        {"item": "Study Lamp (LED)", "price": 300, "condition": "Fair", "category": "stationery", "hand": "2nd Hand"},
        {"item": "Laptop Stand (Aluminum)", "price": 400, "condition": "Like New", "category": "accessories", "hand": "2nd Hand"},
    ]
    
    matches = []
    # Seed by query to make deals consistent for same search
    seed = int(hashlib.md5(query.encode()).hexdigest(), 16)
    random.seed(seed)
    
    # 1. Check static database
    for item in resale_database:
        # If no query, show a featured selection
        should_include = not query or (item["category"] in query_lower or any(w in item["item"].lower() for w in query_lower.split()))
        
        if should_include:
            student_names = ["Arjun", "Sneha", "Rahul", "Priya", "Vikram", "Anjali", "Kartik", "Meera"]
            locations = ["Hostel Block K", "Hostel Block L", "Faculty Quarters", "Nearby Guest House", "Viman Nagar", "Kalyani Nagar"]
            
            matches.append({
                "id": f"resale_{len(matches)}",
                "title": item["item"],
                "price": item["price"],
                "condition": item["condition"],
                "hand_status": item["hand"],
                "seller_name": random.choice(student_names),
                "location": random.choice(locations),
                "distance_km": round(random.uniform(0.2, 4.8), 1),
                "is_zero_waste": True,
                "co2_saved_kg": random.uniform(2.5, 8.0),
                "time_posted": f"{random.randint(1, 23)}h ago",
            })
            
    # 2. Dynamic generation if few matches found (The "Low Cost Alternative" logic)
    if len(matches) < 2 and len(query) > 3:
        # Generate a second-hand version of the current search query
        # Price is significantly lower (40-70% off)
        base_title = query.title()
        gen_price = random.randint(300, 5000) # Simple range, would be better with real price context
        
        matches.append({
            "id": f"resale_dynamic_{random.randint(100, 999)}",
            "title": f"Pre-owned {base_title}",
            "price": gen_price,
            "condition": random.choice(["Gently Used", "Like New", "Good Condition"]),
            "hand_status": random.choice(["2nd Hand", "3rd Hand"]),
            "seller_name": random.choice(["Tanmay", "Aisha", "Varun", "Isha"]),
            "location": random.choice(["Hostel Area", "Nearby Appt"]),
            "distance_km": round(random.uniform(0.5, 5.0), 1),
            "is_zero_waste": True,
            "co2_saved_kg": 5.2,
            "time_posted": "Recently posted",
        })

    random.seed() # Reset
    return matches[:3] # Limit to 3 best local deals


def get_flash_pool_insights(query: str, pincode: str) -> Dict:
    """
    Local Flash-Pool Engine: Real-time community demand tracker.
    """
    # Neighbors online
    seed = int(hashlib.md5(pincode.encode()).hexdigest(), 16)
    random.seed(seed)
    neighbors = random.randint(15, 250)
    
    # Pools
    pools = []
    if len(query) > 2:
        for i in range(2):
            goal = random.choice([5, 10, 20])
            count = random.randint(1, goal - 1)
            unlocked = 5 if count >= 3 else 0
            
            pools.append({
                "id": f"pool_{i}_{seed}",
                "product_name": query.title() if i == 0 else f"{query.title()} Bundle",
                "neighbors_count": count,
                "goal_count": goal,
                "discount_unlocked": unlocked,
                "next_tier_discount": 10 if goal >= 10 else 15,
                "remaining_slots": goal - count,
                "expiry_timer": f"{random.randint(1, 4)}h",
                "is_joined": False,
                "badge_color": "#f43f5e" if i == 0 else "#8b5cf6",
            })

    # Default Featured Pools if no query
    if not pools:
        featured_items = ["Lab Coat", "Drafting Board", "Mini Drafter", "Reference Books"]
        for i, item in enumerate(featured_items[:2]):
            goal = 10
            count = random.randint(3, 8)
            pools.append({
                "id": f"featured_pool_{i}_{seed}",
                "product_name": f"Campus Essential: {item}",
                "neighbors_count": count,
                "goal_count": goal,
                "discount_unlocked": 10,
                "next_tier_discount": 20,
                "remaining_slots": goal - count,
                "expiry_timer": "24h",
                "is_joined": False,
                "badge_color": "#8b5cf6" if i == 0 else "#f43f5e",
            })

    local_stores = []
    store_names = list(CAMPUS_STORES.keys())
    for name in store_names:
        store = CAMPUS_STORES[name]
        if any(c in query.lower() for c in store["categories"]):
            local_stores.append({
                "name": name,
                **store
            })

    resale_items = _get_local_resale_deals(query)
    
    random.seed()
    
    return {
        "active_pools": pools,
        "nearby_neighbors_online": neighbors,
        "global_savings_today": random.randint(1200, 8500),
        "local_stores": local_stores,
        "resale_items": resale_items,
        "is_local_area": pincode in ["411048", "411046", "411001", "500001", "110001"],
    }


# ============================================================
# MASTER INSIGHTS FUNCTION
# ============================================================

def calculate_carbon_footprint(products: List[ProductResult]) -> Dict:
    """
    Green Edge Engine: Calculates the environmental impact of various delivery options.
    """
    by_platform = {}
    total_co2 = 0
    eco_count = 0
    
    platforms = list(set([p.platform for p in products]))
    
    for plat in platforms:
        data = PLATFORM_CARBON_DATA.get(plat, {
            "co2_kg": 0.8, "distance_km": 50, "vehicle": "Truck", "is_ev": False, "warehouse": "Regional Hub"
        })
        
        by_platform[plat.value] = {
            "platform": plat.value,
            **data
        }
        total_co2 += data["co2_kg"]
        if data.get("is_ev"):
            eco_count += 1
            
    avg_co2 = total_co2 / max(len(platforms), 1)
    best_plat = min(platforms, key=lambda p: PLATFORM_CARBON_DATA.get(p, {"co2_kg": 9.9})["co2_kg"])
    
    return {
        "by_platform": by_platform,
        "total_avg_co2": round(avg_co2, 2),
        "best_platform": best_plat.value,
        "eco_friendly_count": eco_count,
    }


def generate_product_insights(
    products: List[ProductResult],
    query: str,
    pincode: str,
    symbol: str = "₹"
) -> Dict[str, Any]:
    """
    Generate all smart insights for a product comparison.
    This is the main function called by the API.
    """
    # 1. Coupons for each product
    coupon_data = {}
    for product in products:
        coupons = get_applicable_coupons(product)
        if coupons:
            coupon_data[product.id] = coupons
    
    # Best coupon overall
    best_coupon = None
    best_savings = 0
    for prod_id, coupons in coupon_data.items():
        for c in coupons:
            if c.get("estimated_savings", 0) > best_savings:
                best_savings = c["estimated_savings"]
                best_coupon = {**c, "product_id": prod_id}
    
    # 1b. Stackability Engine — combine coupons + bank offers + loyalty
    stacked = calculate_stacked_savings(products, coupon_data)
    
    # 2. AI Price Oracle (Replaces Urgency)
    oracle = calculate_price_oracle(products, symbol, query)
    
    # 3. Stock Pulse
    stock_pulse = calculate_stock_pulse(products)
    
    # 4. Carbon Footprint (Green Edge)
    carbon = calculate_carbon_footprint(products)
    
    # 5. Review sentiment
    reviews = get_review_sentiment(products, query)
    
    # 6. Flash Pool insights
    flash_pool = get_flash_pool_insights(query, pincode)
    
    return {
        "coupons": {
            "by_product": coupon_data,
            "best_coupon": best_coupon,
            "total_coupons_found": sum(len(v) for v in coupon_data.values()),
            "stacked": stacked,
        },
        "oracle": oracle,
        "stock_pulse": stock_pulse,
        "carbon": carbon,
        "reviews": reviews,
        "flash_pool": flash_pool,
    }
