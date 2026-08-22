"""
Platform Configuration & Location Helpers (No Mock Data)
"""
from .models import PlatformType, DeliverySpeed, CountryCode

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
}


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
    return locations.get(country, {}).get(postal_code[:5] if len(postal_code) >= 5 else postal_code, f"PIN {postal_code}")


RELATED_PRODUCTS = {
    "iphone": ["airpods", "iphone charger", "cable", "powerbank", "watch"],
    "samsung": ["earbuds", "charger", "cable", "powerbank", "smartwatch"],
    "phone": ["earbuds", "charger", "cable", "powerbank"],
    "laptop": ["mouse", "keyboard", "bag", "stand", "charger"],
    "tv": ["soundbar", "wall mount", "hdmi cable"],
    "perfume": ["deodorant", "body spray", "cologne"],
}


def get_related_products(query: str, country: CountryCode):
    """Get related product search suggestions based on query"""
    query_lower = query.lower()
    related_terms = []
    for key, related in RELATED_PRODUCTS.items():
        if key in query_lower or query_lower in key:
            related_terms = related[:5]
            break
    if not related_terms:
        related_terms = ["earbuds", "charger", "powerbank", "cable", "headphones"]
    
    return [{"name": term.title(), "price": "", "search_term": term} for term in related_terms]


def generate_mock_products(query: str = "laptop", pincode: str = "560102", count: int = 20):
    return []
