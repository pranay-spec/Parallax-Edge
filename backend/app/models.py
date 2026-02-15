"""
Pydantic models for the API - Multi-Region with Popular Delivery Apps
"""
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum


class CountryCode(str, Enum):
    # Asia
    IN = "IN"  # India
    CN = "CN"  # China
    SG = "SG"  # Singapore
    TH = "TH"  # Thailand
    ID = "ID"  # Indonesia
    MY = "MY"  # Malaysia
    PH = "PH"  # Philippines
    # Americas
    US = "US"  # United States
    CA = "CA"  # Canada
    BR = "BR"  # Brazil
    MX = "MX"  # Mexico
    AR = "AR"  # Argentina
    CO = "CO"  # Colombia
    # Europe
    UK = "UK"  # United Kingdom
    DE = "DE"  # Germany
    FR = "FR"  # France
    ES = "ES"  # Spain
    IT = "IT"  # Italy
    # Middle East
    AE = "AE"  # UAE
    SA = "SA"  # Saudi Arabia
    # Oceania
    AU = "AU"  # Australia


class PlatformType(str, Enum):
    # === INDIA ===
    AMAZON_IN = "amazon_in"
    FLIPKART = "flipkart"
    BLINKIT = "blinkit"
    ZEPTO = "zepto"
    JIOMART = "jiomart"
    SWIGGY_INSTAMART = "swiggy_instamart"
    ZOMATO = "zomato"
    BIGBASKET = "bigbasket"
    MYNTRA = "myntra"
    AJIO = "ajio"
    MEESHO = "meesho"
    NYKAA = "nykaa"
    TATA_CLIQ = "tata_cliq"
    
    # === USA ===
    AMAZON_US = "amazon_us"
    WALMART = "walmart"
    TARGET = "target"
    INSTACART = "instacart"
    COSTCO = "costco"
    DOORDASH = "doordash"
    UBER_EATS = "uber_eats"
    GRUBHUB = "grubhub"
    GOPUFF = "gopuff"
    
    # === CHINA ===
    MEITUAN = "meituan"
    ELEME = "eleme"
    JD = "jd"
    TAOBAO = "taobao"
    PINDUODUO = "pinduoduo"
    
    # === UK ===
    AMAZON_UK = "amazon_uk"
    TESCO = "tesco"
    SAINSBURYS = "sainsburys"
    ASDA = "asda"
    DELIVEROO = "deliveroo"
    JUST_EAT = "just_eat"
    OCADO = "ocado"
    GETIR = "getir"
    
    # === GERMANY ===
    AMAZON_DE = "amazon_de"
    REWE = "rewe"
    EDEKA = "edeka"
    LIDL = "lidl"
    FLINK = "flink"
    GORILLAS = "gorillas"
    
    # === FRANCE ===
    AMAZON_FR = "amazon_fr"
    CARREFOUR = "carrefour"
    AUCHAN = "auchan"
    UBER_EATS_FR = "uber_eats_fr"
    
    # === SPAIN ===
    AMAZON_ES = "amazon_es"
    GLOVO = "glovo"
    JUST_EAT_ES = "just_eat_es"
    MERCADONA = "mercadona"
    
    # === ITALY ===
    AMAZON_IT = "amazon_it"
    GLOVO_IT = "glovo_it"
    JUST_EAT_IT = "just_eat_it"
    ESSELUNGA = "esselunga"
    
    # === BRAZIL ===
    AMAZON_BR = "amazon_br"
    IFOOD = "ifood"
    RAPPI_BR = "rappi_br"
    MERCADO_LIVRE = "mercado_livre"
    
    # === MEXICO ===
    AMAZON_MX = "amazon_mx"
    RAPPI_MX = "rappi_mx"
    UBER_EATS_MX = "uber_eats_mx"
    CORNERSHOP = "cornershop"
    
    # === ARGENTINA ===
    RAPPI_AR = "rappi_ar"
    PEDIDOSYA = "pedidosya"
    MERCADO_LIBRE_AR = "mercado_libre_ar"
    
    # === COLOMBIA ===
    RAPPI_CO = "rappi_co"
    IFOOD_CO = "ifood_co"
    
    # === CANADA ===
    AMAZON_CA = "amazon_ca"
    WALMART_CA = "walmart_ca"
    INSTACART_CA = "instacart_ca"
    SKIP_THE_DISHES = "skip_the_dishes"
    DOORDASH_CA = "doordash_ca"
    
    # === SINGAPORE ===
    GRABFOOD = "grabfood"
    FOODPANDA_SG = "foodpanda_sg"
    SHOPEE_SG = "shopee_sg"
    LAZADA_SG = "lazada_sg"
    
    # === THAILAND ===
    GRABFOOD_TH = "grabfood_th"
    FOODPANDA_TH = "foodpanda_th"
    LINE_MAN = "line_man"
    SHOPEE_TH = "shopee_th"
    
    # === INDONESIA ===
    GOFOOD = "gofood"
    GRABFOOD_ID = "grabfood_id"
    SHOPEE_ID = "shopee_id"
    TOKOPEDIA = "tokopedia"
    
    # === MALAYSIA ===
    GRABFOOD_MY = "grabfood_my"
    FOODPANDA_MY = "foodpanda_my"
    SHOPEE_MY = "shopee_my"
    
    # === PHILIPPINES ===
    GRABFOOD_PH = "grabfood_ph"
    FOODPANDA_PH = "foodpanda_ph"
    SHOPEE_PH = "shopee_ph"
    
    # === UAE ===
    AMAZON_AE = "amazon_ae"
    NOON = "noon"
    CARREFOUR_AE = "carrefour_ae"
    TALABAT = "talabat"
    DELIVEROO_AE = "deliveroo_ae"
    
    # === SAUDI ARABIA ===
    NOON_SA = "noon_sa"
    JARIR = "jarir"
    TALABAT_SA = "talabat_sa"
    HUNGERSTATION = "hungerstation"
    
    # === AUSTRALIA ===
    AMAZON_AU = "amazon_au"
    WOOLWORTHS = "woolworths"
    COLES = "coles"
    UBER_EATS_AU = "uber_eats_au"
    MENULOG = "menulog"


class DeliverySpeed(str, Enum):
    EXPRESS = "express"      # < 30 mins
    SAME_DAY = "same_day"    # 1-4 hours
    STANDARD = "standard"    # 1-3 days
    ECONOMY = "economy"      # 3-7 days


class PriceBreakdown(BaseModel):
    base_price: float
    delivery_fee: float
    platform_fee: float
    handling_fee: float = 0.0
    discount: float
    total_landed_cost: float
    currency: str = "INR"
    currency_symbol: str = "₹"
    
    @classmethod
    def calculate(cls, base: float, delivery: float = 0, platform: float = 0, handling: float = 0,
                  discount: float = 0, currency: str = "INR", symbol: str = "₹") -> "PriceBreakdown":
        total = base + delivery + platform + handling - discount
        return cls(
            base_price=base,
            delivery_fee=delivery,
            platform_fee=platform,
            handling_fee=handling,
            discount=discount,
            total_landed_cost=max(0, total),
            currency=currency,
            currency_symbol=symbol
        )


class ActionEnum(str, Enum):
    BUY_NOW = "BUY_NOW"
    WAIT = "WAIT"

class PricePrediction(BaseModel):
    action: ActionEnum
    confidence: int
    reason: str
    potential_savings: float = 0.0

class ProductResult(BaseModel):
    id: str
    platform: PlatformType
    title: str
    image_url: str
    price_breakdown: PriceBreakdown
    price_prediction: Optional[PricePrediction] = None
    eta_minutes: int
    eta_display: str
    delivery_speed: DeliverySpeed
    rating: Optional[float] = None
    reviews_count: Optional[int] = None
    in_stock: bool = True
    stock_count: Optional[int] = None
    unit_price_display: Optional[str] = None
    url: str


class ProductGroup(BaseModel):
    group_id: str
    canonical_title: str
    match_confidence: float
    products: List[ProductResult]
    best_price: ProductResult
    fastest_delivery: ProductResult
    savings_message: Optional[str] = None


class SearchRequest(BaseModel):
    query: str
    postal_code: str
    country: CountryCode = CountryCode.IN


class RelatedProduct(BaseModel):
    name: str
    price: str
    search_term: str


class SearchResponse(BaseModel):
    query: str
    postal_code: str
    country: CountryCode
    location_name: Optional[str] = None
    currency: str
    currency_symbol: str
    total_results: int
    product_groups: List[ProductGroup]
    related_products: List[RelatedProduct] = []
    insights: Optional[Dict[str, Any]] = None
    system_health: Optional[Dict[str, Any]] = None
    agent_telemetry: Optional[Dict[str, Any]] = None
    user_persona: Optional[str] = None
    smart_reorder: List[Dict] = []


# Country configurations
COUNTRY_CONFIG = {
    # === ASIA ===
    CountryCode.IN: {
        "name": "India",
        "currency": "INR",
        "symbol": "₹",
        "postal_code_format": "6 digits",
        "platforms": [PlatformType.AMAZON_IN, PlatformType.FLIPKART, PlatformType.BLINKIT, PlatformType.ZEPTO, PlatformType.JIOMART, PlatformType.SWIGGY_INSTAMART, PlatformType.BIGBASKET, PlatformType.MYNTRA, PlatformType.AJIO, PlatformType.MEESHO, PlatformType.NYKAA, PlatformType.TATA_CLIQ],
    },
    CountryCode.CN: {
        "name": "China",
        "currency": "CNY",
        "symbol": "¥",
        "postal_code_format": "6 digits",
        "platforms": [PlatformType.MEITUAN, PlatformType.ELEME, PlatformType.JD, PlatformType.TAOBAO, PlatformType.PINDUODUO],
    },
    CountryCode.SG: {
        "name": "Singapore",
        "currency": "SGD",
        "symbol": "S$",
        "postal_code_format": "6 digits",
        "platforms": [PlatformType.GRABFOOD, PlatformType.FOODPANDA_SG, PlatformType.SHOPEE_SG, PlatformType.LAZADA_SG],
    },
    CountryCode.TH: {
        "name": "Thailand",
        "currency": "THB",
        "symbol": "฿",
        "postal_code_format": "5 digits",
        "platforms": [PlatformType.GRABFOOD_TH, PlatformType.FOODPANDA_TH, PlatformType.LINE_MAN, PlatformType.SHOPEE_TH],
    },
    CountryCode.ID: {
        "name": "Indonesia",
        "currency": "IDR",
        "symbol": "Rp",
        "postal_code_format": "5 digits",
        "platforms": [PlatformType.GOFOOD, PlatformType.GRABFOOD_ID, PlatformType.SHOPEE_ID, PlatformType.TOKOPEDIA],
    },
    CountryCode.MY: {
        "name": "Malaysia",
        "currency": "MYR",
        "symbol": "RM",
        "postal_code_format": "5 digits",
        "platforms": [PlatformType.GRABFOOD_MY, PlatformType.FOODPANDA_MY, PlatformType.SHOPEE_MY],
    },
    CountryCode.PH: {
        "name": "Philippines",
        "currency": "PHP",
        "symbol": "₱",
        "postal_code_format": "4 digits",
        "platforms": [PlatformType.GRABFOOD_PH, PlatformType.FOODPANDA_PH, PlatformType.SHOPEE_PH],
    },
    # === AMERICAS ===
    CountryCode.US: {
        "name": "United States",
        "currency": "USD",
        "symbol": "$",
        "postal_code_format": "5 digits (ZIP)",
        "platforms": [PlatformType.AMAZON_US, PlatformType.WALMART, PlatformType.TARGET, PlatformType.INSTACART, PlatformType.COSTCO, PlatformType.DOORDASH, PlatformType.UBER_EATS, PlatformType.GRUBHUB, PlatformType.GOPUFF],
    },
    CountryCode.CA: {
        "name": "Canada",
        "currency": "CAD",
        "symbol": "C$",
        "postal_code_format": "A1A 1A1",
        "platforms": [PlatformType.AMAZON_CA, PlatformType.WALMART_CA, PlatformType.INSTACART_CA, PlatformType.SKIP_THE_DISHES, PlatformType.DOORDASH_CA],
    },
    CountryCode.BR: {
        "name": "Brazil",
        "currency": "BRL",
        "symbol": "R$",
        "postal_code_format": "8 digits",
        "platforms": [PlatformType.AMAZON_BR, PlatformType.IFOOD, PlatformType.RAPPI_BR, PlatformType.MERCADO_LIVRE],
    },
    CountryCode.MX: {
        "name": "Mexico",
        "currency": "MXN",
        "symbol": "MX$",
        "postal_code_format": "5 digits",
        "platforms": [PlatformType.AMAZON_MX, PlatformType.RAPPI_MX, PlatformType.UBER_EATS_MX, PlatformType.CORNERSHOP],
    },
    CountryCode.AR: {
        "name": "Argentina",
        "currency": "ARS",
        "symbol": "AR$",
        "postal_code_format": "4 digits",
        "platforms": [PlatformType.RAPPI_AR, PlatformType.PEDIDOSYA, PlatformType.MERCADO_LIBRE_AR],
    },
    CountryCode.CO: {
        "name": "Colombia",
        "currency": "COP",
        "symbol": "CO$",
        "postal_code_format": "6 digits",
        "platforms": [PlatformType.RAPPI_CO, PlatformType.IFOOD_CO],
    },
    # === EUROPE ===
    CountryCode.UK: {
        "name": "United Kingdom",
        "currency": "GBP",
        "symbol": "£",
        "postal_code_format": "Alphanumeric",
        "platforms": [PlatformType.AMAZON_UK, PlatformType.TESCO, PlatformType.SAINSBURYS, PlatformType.ASDA, PlatformType.DELIVEROO, PlatformType.JUST_EAT, PlatformType.OCADO, PlatformType.GETIR],
    },
    CountryCode.DE: {
        "name": "Germany",
        "currency": "EUR",
        "symbol": "€",
        "postal_code_format": "5 digits",
        "platforms": [PlatformType.AMAZON_DE, PlatformType.REWE, PlatformType.EDEKA, PlatformType.LIDL, PlatformType.FLINK, PlatformType.GORILLAS],
    },
    CountryCode.FR: {
        "name": "France",
        "currency": "EUR",
        "symbol": "€",
        "postal_code_format": "5 digits",
        "platforms": [PlatformType.AMAZON_FR, PlatformType.CARREFOUR, PlatformType.AUCHAN, PlatformType.UBER_EATS_FR],
    },
    CountryCode.ES: {
        "name": "Spain",
        "currency": "EUR",
        "symbol": "€",
        "postal_code_format": "5 digits",
        "platforms": [PlatformType.AMAZON_ES, PlatformType.GLOVO, PlatformType.JUST_EAT_ES, PlatformType.MERCADONA],
    },
    CountryCode.IT: {
        "name": "Italy",
        "currency": "EUR",
        "symbol": "€",
        "postal_code_format": "5 digits",
        "platforms": [PlatformType.AMAZON_IT, PlatformType.GLOVO_IT, PlatformType.JUST_EAT_IT, PlatformType.ESSELUNGA],
    },
    # === MIDDLE EAST ===
    CountryCode.AE: {
        "name": "UAE",
        "currency": "AED",
        "symbol": "د.إ",
        "postal_code_format": "Optional",
        "platforms": [PlatformType.AMAZON_AE, PlatformType.NOON, PlatformType.CARREFOUR_AE, PlatformType.TALABAT, PlatformType.DELIVEROO_AE],
    },
    CountryCode.SA: {
        "name": "Saudi Arabia",
        "currency": "SAR",
        "symbol": "﷼",
        "postal_code_format": "5 digits",
        "platforms": [PlatformType.NOON_SA, PlatformType.JARIR, PlatformType.TALABAT_SA, PlatformType.HUNGERSTATION],
    },
    # === OCEANIA ===
    CountryCode.AU: {
        "name": "Australia",
        "currency": "AUD",
        "symbol": "A$",
        "postal_code_format": "4 digits",
        "platforms": [PlatformType.AMAZON_AU, PlatformType.WOOLWORTHS, PlatformType.COLES, PlatformType.UBER_EATS_AU, PlatformType.MENULOG],
    },
}

# Cart Optimization Models
class CartItem(BaseModel):
    query: str
    product: ProductResult

class CartStrategy(BaseModel):
    name: str # e.g. "Cheapest Mix" or "All from Blinkit"
    total_cost: float
    items: List[CartItem]
    by_platform: Dict[str, List[ProductResult]] # keyed by PlatformType.value
    fees: float = 0.0
    delivery_fee: float = 0.0
    platform_fee: float = 0.0
    missing_items: List[str]
    savings: float = 0.0

class CartOptimizationResponse(BaseModel):
    strategies: List[CartStrategy]
    best_strategy: str # Name of best strategy
    currency_symbol: str

class CartRequest(BaseModel):
    queries: List[str] # ["milk", "bread", "eggs"]
    postal_code: str
    country: CountryCode = CountryCode.IN
