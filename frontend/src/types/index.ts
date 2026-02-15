// API Types for multi-country support with real logos

export type CountryCode = 'IN' | 'US' | 'UK' | 'DE' | 'FR' | 'ES' | 'IT' | 'CA' | 'AU' | 'AE' | 'SA' | 'BR' | 'MX' | 'AR' | 'CO' | 'CN' | 'SG' | 'TH' | 'ID' | 'MY' | 'PH';

export type PlatformType = string;

export type DeliverySpeed = 'express' | 'same_day' | 'standard' | 'economy';

export interface PriceBreakdown {
  base_price: number;
  delivery_fee: number;
  platform_fee: number;
  handling_fee: number;
  discount: number;
  total_landed_cost: number;
  currency: string;
  currency_symbol: string;
}

export type ActionEnum = 'BUY_NOW' | 'WAIT';

export interface PricePrediction {
  action: ActionEnum;
  confidence: number;
  reason: string;
  potential_savings: number;
}

export interface ProductResult {
  id: string;
  platform: PlatformType;
  title: string;
  image_url: string;
  price_breakdown: PriceBreakdown;
  price_prediction?: PricePrediction;
  eta_minutes: number;
  eta_display: string;
  delivery_speed: DeliverySpeed;
  rating: number | null;
  reviews_count: number | null;
  in_stock: boolean;
  stock_count?: number;
  unit_price_display?: string;
  url: string;
}

export interface ProductGroup {
  group_id: string;
  canonical_title: string;
  match_confidence: number;
  products: ProductResult[];
  best_price: ProductResult;
  fastest_delivery: ProductResult;
  savings_message: string | null;
}

// ===== SYSTEM HEALTH TYPES =====
export interface SystemHealthData {
  pulse: 'healthy' | 'degraded' | 'synthetic';
  pulse_color: string;
  pulse_label: string;
  uptime_seconds: number;
  total_searches: number;
  avg_response_ms: number;
  data_sources: {
    live: number;
    cached: number;
    synthetic: number;
    live_percentage: number;
  };
}

export interface SmartReorderItem {
  item: string;
  platform: string;
  discount_pct: number;
  message: string;
}

export interface SearchResponse {
  query: string;
  postal_code: string;
  country: CountryCode;
  location_name: string | null;
  currency: string;
  currency_symbol: string;
  total_results: number;
  product_groups: ProductGroup[];
  related_products: RelatedProduct[];
  insights?: InsightsData | null;
  system_health?: SystemHealthData;
  agent_telemetry?: Record<string, any>;
  user_persona?: string;
  smart_reorder?: SmartReorderItem[];
}

// ===== INSIGHTS TYPES =====
export interface CouponData {
  code: string | null;
  discount: string;
  platform: string;
  discount_value: number;
  discount_pct?: number;
  min_order: number;
  type: string;
  for: string;
  expires: string;
  auto_apply: boolean;
  post_coupon_price: number;
  estimated_savings: number;
}

export interface SurgeData {
  status: string;
  platforms: string[];
  tip: string;
}

export interface CategoryInfo {
  category: string;
  label: string;
  icon: string;
  color: string;
  speed_weight: number;
  description: string;
  matched_keyword: string | null;
}

export interface ProductivityMetric {
  matched_item: string;
  device: string;
  downtime_saved_hours: number;
  productivity_label: string;
  impact: string;
  productivity_value: number;
  hourly_value: number;
  verdict: string;
  roi: number;
  roi_label: string;
}

export interface PriceOracleData {
  action: 'BUY_NOW' | 'WAIT';
  confidence: number;
  reason: string;
  product_id: string;
  product_title: string;
  product_url: string;
  platform: string;
  potential_savings: number;
  badge_color: string;
  category: CategoryInfo;
  market_volatility: 'Low' | 'Medium' | 'High' | string;
  surge: {
    status: string;
    tip: string;
  };
  tradeoff: {
    price_gap: number;
    time_gap_minutes: number;
  } | null;
}


export interface HubStock {
  platform: string;
  stock_level: number;
  stockout_probability: number;
  predicted_stockout_time: string;
  surge_forecast: string;
  is_vulnerable: boolean;
  hub_distance: string;
}

export interface StockPulseData {
  hubs: HubStock[];
  overall_status: 'Stable' | 'Critical' | 'Surging';
  prediction_accuracy: number;
  pulse_color: string;
  global_stockout_alert: string | null;
  scarcity_factor: number;
}

export interface AspectScore {
  name: string;
  icon: string;
  score: number;
  sentiment: 'positive' | 'mixed' | 'negative';
  total_mentions: number;
  positive_pct: number;
  negative_pct: number;
  neutral_pct: number;
}

export interface BotDetectionSignal {
  signal: string;
  icon: string;
  detail: string;
  severity: 'low' | 'medium' | 'high';
  contribution: number;
}

export interface BotDetection {
  risk_score: number;
  alert_level: 'low' | 'medium' | 'high';
  alert_label: string;
  alert_color: string;
  total_reviews: number;
  five_star_pct: number;
  verified_pct: number;
  review_velocity: number;
  unique_reviewer_pct: number;
  signals: BotDetectionSignal[];
  recommendation: string;
}

export interface HeatmapRow {
  aspect: string;
  icon: string;
  scores: Record<string, number>;
  avg_score: number;
  best_platform: string | null;
  worst_platform: string | null;
}

export interface HeatmapData {
  platforms: string[];
  rows: HeatmapRow[];
  product_type: string;
}

export interface ReviewSentiment {
  platform: string;
  trust_score: number;
  summary: string;
  strengths: string[];
  concerns: string[];
  aspect_scores?: AspectScore[];
  bot_detection?: BotDetection;
}

export interface LabelWarning {
  type: string;
  message: string;
  severity: string;
}

export interface ReviewData {
  sentiments: ReviewSentiment[];
  label_warnings: LabelWarning[];
  product_type: string;
  heatmap?: HeatmapData;
}

export interface LocalStore {
  name: string;
  location: string;
  hours: string;
  categories: string[];
  delivery: string;
  avg_discount: string;
}

export interface ResaleItem {
  id: string;
  title: string;
  price: number;
  condition: string;
  hand_status?: string;
  seller_name: string;
  location?: string;
  distance_km?: number;
  hostel?: string;
  block?: string;
  is_zero_waste: boolean;
  co2_saved_kg: number;
  time_posted: string;
}

export interface FlashPoolEntry {
  id: string;
  product_name: string;
  neighbors_count: number;
  goal_count: number;
  discount_unlocked: number;
  next_tier_discount: number;
  remaining_slots: number;
  expiry_timer: string;
  is_joined: boolean;
  badge_color: string;
}

export interface FlashPoolData {
  active_pools: FlashPoolEntry[];
  nearby_neighbors_online: number;
  global_savings_today: number;
  local_stores: LocalStore[];
  resale_items: ResaleItem[];
  is_local_area?: boolean;
}

// ===== STACKABILITY ENGINE TYPES =====
export interface BankCardOffer {
  bank: string;
  card_name: string;
  card_type: string;
  logo: string;
  color: string;
  discount_pct: number;
  max_discount: number;
  instant_discount: number;
  cashback: number;
  total_benefit: number;
}

export interface LoyaltyProgram {
  program: string;
  points_earned: number;
  point_value: number;
  tier: string;
  bonus: string;
  color: string;
}

export interface StackedLayers {
  coupon: {
    applied: boolean;
    code: string | null;
    discount_label: string;
    savings: number;
    target: string;
  };
  bank: {
    applied: boolean;
    best_card: BankCardOffer | null;
    savings: number;
    all_options: BankCardOffer[];
  };
  loyalty: {
    applied: boolean;
    program: LoyaltyProgram | null;
    savings: number;
  };
}

export interface StackedProduct {
  product_id: string;
  product_name: string;
  platform: string;
  original_price: number;
  net_effective_price: number;
  total_savings: number;
  savings_pct: number;
  layers: StackedLayers;
}

export interface StackedSavings {
  stacked: StackedProduct[];
  best_deal: StackedProduct | null;
  total_products_analyzed: number;
}

export interface CarbonPlatformData {
  platform: string;
  co2_kg: number;
  distance_km: number;
  vehicle: string;
  is_ev: boolean;
  warehouse: string;
}

export interface CarbonData {
  by_platform: Record<string, CarbonPlatformData>;
  total_avg_co2: number;
  best_platform: string;
  eco_friendly_count: number;
}

export interface InsightsData {
  coupons: {
    by_product: Record<string, CouponData[]>;
    best_coupon: (CouponData & { product_id: string }) | null;
    total_coupons_found: number;
    stacked: StackedSavings;
  };
  oracle: PriceOracleData;
  stock_pulse: StockPulseData;
  carbon: CarbonData;
  reviews: ReviewData;
  flash_pool: FlashPoolData;
}


export interface RelatedProduct {
  name: string;
  price: string;
  search_term: string;
}

export interface CartItem {
  query: string;
  product: ProductResult;
}

export interface CartStrategy {
  name: string;
  total_cost: number;
  items: CartItem[];
  by_platform: Record<string, ProductResult[]>;
  fees: number;
  delivery_fee: number;
  platform_fee: number;
  missing_items: string[];
  savings: number;
  quantum_details?: {
    save_bridge_amount: number;
    efficiency_score: number;
    partition_logic: string;
  };
}

export interface CartOptimizationResponse {
  strategies: CartStrategy[];
  best_strategy: string;
  currency_symbol: string;
}

// Country configurations
export const COUNTRIES: Record<CountryCode, { name: string; flag: string; currency: string; symbol: string; postalPlaceholder: string }> = {
  IN: { name: 'India', flag: '🇮🇳', currency: 'INR', symbol: '₹', postalPlaceholder: '110001' },
  US: { name: 'United States', flag: '🇺🇸', currency: 'USD', symbol: '$', postalPlaceholder: '10001' },
  UK: { name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', symbol: '£', postalPlaceholder: 'SW1A' },
  DE: { name: 'Germany', flag: '🇩🇪', currency: 'EUR', symbol: '€', postalPlaceholder: '10115' },
  FR: { name: 'France', flag: '🇫🇷', currency: 'EUR', symbol: '€', postalPlaceholder: '75001' },
  ES: { name: 'Spain', flag: '🇪🇸', currency: 'EUR', symbol: '€', postalPlaceholder: '28001' },
  IT: { name: 'Italy', flag: '🇮🇹', currency: 'EUR', symbol: '€', postalPlaceholder: '00100' },
  CA: { name: 'Canada', flag: '🇨🇦', currency: 'CAD', symbol: 'C$', postalPlaceholder: 'M5V' },
  AU: { name: 'Australia', flag: '🇦🇺', currency: 'AUD', symbol: 'A$', postalPlaceholder: '2000' },
  AE: { name: 'UAE', flag: '🇦🇪', currency: 'AED', symbol: 'د.إ', postalPlaceholder: '00000' },
  SA: { name: 'Saudi Arabia', flag: '🇸🇦', currency: 'SAR', symbol: '﷼', postalPlaceholder: '11564' },
  BR: { name: 'Brazil', flag: '🇧🇷', currency: 'BRL', symbol: 'R$', postalPlaceholder: '01310' },
  MX: { name: 'Mexico', flag: '🇲🇽', currency: 'MXN', symbol: 'MX$', postalPlaceholder: '06600' },
  AR: { name: 'Argentina', flag: '🇦🇷', currency: 'ARS', symbol: 'AR$', postalPlaceholder: '1000' },
  CO: { name: 'Colombia', flag: '🇨🇴', currency: 'COP', symbol: 'CO$', postalPlaceholder: '110111' },
  CN: { name: 'China', flag: '🇨🇳', currency: 'CNY', symbol: '¥', postalPlaceholder: '100000' },
  SG: { name: 'Singapore', flag: '🇸🇬', currency: 'SGD', symbol: 'S$', postalPlaceholder: '018956' },
  TH: { name: 'Thailand', flag: '🇹🇭', currency: 'THB', symbol: '฿', postalPlaceholder: '10110' },
  ID: { name: 'Indonesia', flag: '🇮🇩', currency: 'IDR', symbol: 'Rp', postalPlaceholder: '10110' },
  MY: { name: 'Malaysia', flag: '🇲🇾', currency: 'MYR', symbol: 'RM', postalPlaceholder: '50000' },
  PH: { name: 'Philippines', flag: '🇵🇭', currency: 'PHP', symbol: '₱', postalPlaceholder: '1000' },
};

// Platform configurations with logos (using Google Favicon API for reliability)
export const PLATFORM_CONFIG: Record<string, { name: string; color: string; logoUrl: string; shortName: string; badgeClass?: string }> = {
  // === INDIA ===
  amazon_in: { name: 'Amazon', color: '#FF9900', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.in&sz=128', shortName: 'AMZ', badgeClass: 'bg-[#FF9900]/10 text-[#FF9900]' },
  flipkart: { name: 'Flipkart', color: '#2874F0', logoUrl: 'https://www.google.com/s2/favicons?domain=flipkart.com&sz=128', shortName: 'FK', badgeClass: 'bg-[#2874F0]/10 text-[#2874F0]' },
  blinkit: { name: 'Blinkit', color: '#F8CB46', logoUrl: 'https://www.google.com/s2/favicons?domain=blinkit.com&sz=128', shortName: 'BL', badgeClass: 'bg-[#F8CB46]/10 text-[#F8CB46]' },
  zepto: { name: 'Zepto', color: '#8B5CF6', logoUrl: 'https://www.google.com/s2/favicons?domain=zeptonow.com&sz=128', shortName: 'ZP', badgeClass: 'bg-[#8B5CF6]/10 text-[#8B5CF6]' },
  jiomart: { name: 'JioMart', color: '#0078AD', logoUrl: 'https://www.google.com/s2/favicons?domain=jiomart.com&sz=128', shortName: 'JM', badgeClass: 'bg-[#0078AD]/10 text-[#0078AD]' },
  swiggy_instamart: { name: 'Swiggy Instamart', color: '#FC8019', logoUrl: 'https://www.google.com/s2/favicons?domain=swiggy.com&sz=128', shortName: 'SW', badgeClass: 'bg-[#FC8019]/10 text-[#FC8019]' },
  bigbasket: { name: 'BigBasket', color: '#84C225', logoUrl: 'https://www.google.com/s2/favicons?domain=bigbasket.com&sz=128', shortName: 'BB', badgeClass: 'bg-[#84C225]/10 text-[#84C225]' },
  zomato: { name: 'Zomato', color: '#E23744', logoUrl: 'https://www.google.com/s2/favicons?domain=zomato.com&sz=128', shortName: 'ZM', badgeClass: 'bg-[#E23744]/10 text-[#E23744]' },
  myntra: { name: 'Myntra', color: '#FF3F6C', logoUrl: 'https://www.google.com/s2/favicons?domain=myntra.com&sz=128', shortName: 'MY', badgeClass: 'bg-[#FF3F6C]/10 text-[#FF3F6C]' },
  ajio: { name: 'Ajio', color: '#2C4152', logoUrl: 'https://www.google.com/s2/favicons?domain=ajio.com&sz=128', shortName: 'AJ', badgeClass: 'bg-[#2C4152]/10 text-[#2C4152]' },
  nykaa: { name: 'Nykaa', color: '#FC2779', logoUrl: 'https://www.google.com/s2/favicons?domain=nykaa.com&sz=128', shortName: 'NY', badgeClass: 'bg-[#FC2779]/10 text-[#FC2779]' },
  meesho: { name: 'Meesho', color: '#FF44AF', logoUrl: 'https://www.google.com/s2/favicons?domain=meesho.com&sz=128', shortName: 'MS', badgeClass: 'bg-[#FF44AF]/10 text-[#FF44AF]' },
  tata_cliq: { name: 'Tata Cliq', color: '#DA1C5C', logoUrl: 'https://www.google.com/s2/favicons?domain=tatacliq.com&sz=128', shortName: 'TC', badgeClass: 'bg-[#DA1C5C]/10 text-[#DA1C5C]' },

  // === USA ===
  amazon_us: { name: 'Amazon', color: '#FF9900', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.com&sz=128', shortName: 'AMZ' },
  walmart: { name: 'Walmart', color: '#0071CE', logoUrl: 'https://www.google.com/s2/favicons?domain=walmart.com&sz=128', shortName: 'WM' },
  target: { name: 'Target', color: '#CC0000', logoUrl: 'https://www.google.com/s2/favicons?domain=target.com&sz=128', shortName: 'TGT' },
  instacart: { name: 'Instacart', color: '#43B02A', logoUrl: 'https://www.google.com/s2/favicons?domain=instacart.com&sz=128', shortName: 'IC' },
  costco: { name: 'Costco', color: '#E31837', logoUrl: 'https://www.google.com/s2/favicons?domain=costco.com&sz=128', shortName: 'CO' },
  doordash: { name: 'DoorDash', color: '#FF3008', logoUrl: 'https://www.google.com/s2/favicons?domain=doordash.com&sz=128', shortName: 'DD' },
  uber_eats: { name: 'Uber Eats', color: '#06C167', logoUrl: 'https://www.google.com/s2/favicons?domain=ubereats.com&sz=128', shortName: 'UE' },
  grubhub: { name: 'Grubhub', color: '#F63440', logoUrl: 'https://www.google.com/s2/favicons?domain=grubhub.com&sz=128', shortName: 'GH' },
  gopuff: { name: 'Gopuff', color: '#00A3E0', logoUrl: 'https://www.google.com/s2/favicons?domain=gopuff.com&sz=128', shortName: 'GP' },

  // === CHINA ===
  meituan: { name: 'Meituan', color: '#FFD100', logoUrl: 'https://www.google.com/s2/favicons?domain=meituan.com&sz=128', shortName: 'MT' },
  eleme: { name: 'Ele.me', color: '#00A0E9', logoUrl: 'https://www.google.com/s2/favicons?domain=ele.me&sz=128', shortName: 'EL' },
  jd: { name: 'JD.com', color: '#E2231A', logoUrl: 'https://www.google.com/s2/favicons?domain=jd.com&sz=128', shortName: 'JD' },
  taobao: { name: 'Taobao', color: '#FF5000', logoUrl: 'https://www.google.com/s2/favicons?domain=taobao.com&sz=128', shortName: 'TB' },
  pinduoduo: { name: 'Pinduoduo', color: '#E02E24', logoUrl: 'https://www.google.com/s2/favicons?domain=pinduoduo.com&sz=128', shortName: 'PDD' },

  // === UK ===
  amazon_uk: { name: 'Amazon', color: '#FF9900', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.co.uk&sz=128', shortName: 'AMZ' },
  tesco: { name: 'Tesco', color: '#00539F', logoUrl: 'https://www.google.com/s2/favicons?domain=tesco.com&sz=128', shortName: 'TS' },
  sainsburys: { name: "Sainsbury's", color: '#F06C00', logoUrl: 'https://www.google.com/s2/favicons?domain=sainsburys.co.uk&sz=128', shortName: 'SB' },
  asda: { name: 'ASDA', color: '#78BE20', logoUrl: 'https://www.google.com/s2/favicons?domain=asda.com&sz=128', shortName: 'AD' },
  deliveroo: { name: 'Deliveroo', color: '#00CCBC', logoUrl: 'https://www.google.com/s2/favicons?domain=deliveroo.com&sz=128', shortName: 'DV' },
  just_eat: { name: 'Just Eat', color: '#FF8000', logoUrl: 'https://www.google.com/s2/favicons?domain=just-eat.co.uk&sz=128', shortName: 'JE' },
  ocado: { name: 'Ocado', color: '#6600CC', logoUrl: 'https://www.google.com/s2/favicons?domain=ocado.com&sz=128', shortName: 'OC' },
  getir: { name: 'Getir', color: '#5D3EBC', logoUrl: 'https://www.google.com/s2/favicons?domain=getir.com&sz=128', shortName: 'GT' },

  // === GERMANY ===
  amazon_de: { name: 'Amazon', color: '#FF9900', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.de&sz=128', shortName: 'AMZ' },
  rewe: { name: 'REWE', color: '#CC071E', logoUrl: 'https://www.google.com/s2/favicons?domain=rewe.de&sz=128', shortName: 'RW' },
  edeka: { name: 'EDEKA', color: '#FFE500', logoUrl: 'https://www.google.com/s2/favicons?domain=edeka.de&sz=128', shortName: 'ED' },
  lidl: { name: 'Lidl', color: '#0050AA', logoUrl: 'https://www.google.com/s2/favicons?domain=lidl.de&sz=128', shortName: 'LD' },
  flink: { name: 'Flink', color: '#FF0066', logoUrl: 'https://www.google.com/s2/favicons?domain=goflink.com&sz=128', shortName: 'FL' },
  gorillas: { name: 'Gorillas', color: '#1D1D1B', logoUrl: 'https://www.google.com/s2/favicons?domain=gorillas.io&sz=128', shortName: 'GR' },

  // === FRANCE ===
  amazon_fr: { name: 'Amazon', color: '#FF9900', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.fr&sz=128', shortName: 'AMZ' },
  carrefour: { name: 'Carrefour', color: '#004A9F', logoUrl: 'https://www.google.com/s2/favicons?domain=carrefour.fr&sz=128', shortName: 'CF' },
  auchan: { name: 'Auchan', color: '#E20613', logoUrl: 'https://www.google.com/s2/favicons?domain=auchan.fr&sz=128', shortName: 'AU' },
  uber_eats_fr: { name: 'Uber Eats', color: '#06C167', logoUrl: 'https://www.google.com/s2/favicons?domain=ubereats.com&sz=128', shortName: 'UE' },

  // === SPAIN ===
  amazon_es: { name: 'Amazon', color: '#FF9900', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.es&sz=128', shortName: 'AMZ' },
  glovo: { name: 'Glovo', color: '#FFC244', logoUrl: 'https://www.google.com/s2/favicons?domain=glovoapp.com&sz=128', shortName: 'GL' },
  just_eat_es: { name: 'Just Eat', color: '#FF8000', logoUrl: 'https://www.google.com/s2/favicons?domain=justeat.es&sz=128', shortName: 'JE' },
  mercadona: { name: 'Mercadona', color: '#4CAF50', logoUrl: 'https://www.google.com/s2/favicons?domain=mercadona.es&sz=128', shortName: 'MC' },

  // === ITALY ===
  amazon_it: { name: 'Amazon', color: '#FF9900', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.it&sz=128', shortName: 'AMZ' },
  glovo_it: { name: 'Glovo', color: '#FFC244', logoUrl: 'https://www.google.com/s2/favicons?domain=glovoapp.com&sz=128', shortName: 'GL' },
  just_eat_it: { name: 'Just Eat', color: '#FF8000', logoUrl: 'https://www.google.com/s2/favicons?domain=justeat.it&sz=128', shortName: 'JE' },
  esselunga: { name: 'Esselunga', color: '#E4002B', logoUrl: 'https://www.google.com/s2/favicons?domain=esselunga.it&sz=128', shortName: 'ES' },

  // === BRAZIL ===
  amazon_br: { name: 'Amazon', color: '#FF9900', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.com.br&sz=128', shortName: 'AMZ' },
  ifood: { name: 'iFood', color: '#EA1D2C', logoUrl: 'https://www.google.com/s2/favicons?domain=ifood.com.br&sz=128', shortName: 'IF' },
  rappi_br: { name: 'Rappi', color: '#FF4500', logoUrl: 'https://www.google.com/s2/favicons?domain=rappi.com&sz=128', shortName: 'RP' },
  mercado_livre: { name: 'Mercado Livre', color: '#FFE600', logoUrl: 'https://www.google.com/s2/favicons?domain=mercadolivre.com.br&sz=128', shortName: 'ML' },

  // === MEXICO ===
  amazon_mx: { name: 'Amazon', color: '#FF9900', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.com.mx&sz=128', shortName: 'AMZ' },
  rappi_mx: { name: 'Rappi', color: '#FF4500', logoUrl: 'https://www.google.com/s2/favicons?domain=rappi.com&sz=128', shortName: 'RP' },
  uber_eats_mx: { name: 'Uber Eats', color: '#06C167', logoUrl: 'https://www.google.com/s2/favicons?domain=ubereats.com&sz=128', shortName: 'UE' },
  cornershop: { name: 'Cornershop', color: '#FF6B00', logoUrl: 'https://www.google.com/s2/favicons?domain=cornershopapp.com&sz=128', shortName: 'CS' },

  // === ARGENTINA ===
  rappi_ar: { name: 'Rappi', color: '#FF4500', logoUrl: 'https://www.google.com/s2/favicons?domain=rappi.com&sz=128', shortName: 'RP' },
  pedidosya: { name: 'PedidosYa', color: '#FF0055', logoUrl: 'https://www.google.com/s2/favicons?domain=pedidosya.com&sz=128', shortName: 'PY' },
  mercado_libre_ar: { name: 'Mercado Libre', color: '#FFE600', logoUrl: 'https://www.google.com/s2/favicons?domain=mercadolibre.com.ar&sz=128', shortName: 'ML' },

  // === COLOMBIA ===
  rappi_co: { name: 'Rappi', color: '#FF4500', logoUrl: 'https://www.google.com/s2/favicons?domain=rappi.com&sz=128', shortName: 'RP' },
  ifood_co: { name: 'iFood', color: '#EA1D2C', logoUrl: 'https://www.google.com/s2/favicons?domain=ifood.com.br&sz=128', shortName: 'IF' },

  // === CANADA ===
  amazon_ca: { name: 'Amazon', color: '#FF9900', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.ca&sz=128', shortName: 'AMZ' },
  walmart_ca: { name: 'Walmart', color: '#0071CE', logoUrl: 'https://www.google.com/s2/favicons?domain=walmart.ca&sz=128', shortName: 'WM' },
  instacart_ca: { name: 'Instacart', color: '#43B02A', logoUrl: 'https://www.google.com/s2/favicons?domain=instacart.com&sz=128', shortName: 'IC' },
  skip_the_dishes: { name: 'SkipTheDishes', color: '#FF6A00', logoUrl: 'https://www.google.com/s2/favicons?domain=skipthedishes.com&sz=128', shortName: 'SK' },
  doordash_ca: { name: 'DoorDash', color: '#FF3008', logoUrl: 'https://www.google.com/s2/favicons?domain=doordash.com&sz=128', shortName: 'DD' },

  // === SINGAPORE ===
  grabfood: { name: 'GrabFood', color: '#00B14F', logoUrl: 'https://www.google.com/s2/favicons?domain=grab.com&sz=128', shortName: 'GR' },
  foodpanda_sg: { name: 'foodpanda', color: '#D70F64', logoUrl: 'https://www.google.com/s2/favicons?domain=foodpanda.com&sz=128', shortName: 'FP' },
  shopee_sg: { name: 'Shopee', color: '#EE4D2D', logoUrl: 'https://www.google.com/s2/favicons?domain=shopee.sg&sz=128', shortName: 'SP' },
  lazada_sg: { name: 'Lazada', color: '#0F146D', logoUrl: 'https://www.google.com/s2/favicons?domain=lazada.sg&sz=128', shortName: 'LZ' },

  // === THAILAND ===
  grabfood_th: { name: 'GrabFood', color: '#00B14F', logoUrl: 'https://www.google.com/s2/favicons?domain=grab.com&sz=128', shortName: 'GR' },
  foodpanda_th: { name: 'foodpanda', color: '#D70F64', logoUrl: 'https://www.google.com/s2/favicons?domain=foodpanda.com&sz=128', shortName: 'FP' },
  line_man: { name: 'LINE MAN', color: '#00B900', logoUrl: 'https://www.google.com/s2/favicons?domain=lineman.line.me&sz=128', shortName: 'LM' },
  shopee_th: { name: 'Shopee', color: '#EE4D2D', logoUrl: 'https://www.google.com/s2/favicons?domain=shopee.co.th&sz=128', shortName: 'SP' },

  // === INDONESIA ===
  gofood: { name: 'GoFood', color: '#00AA13', logoUrl: 'https://www.google.com/s2/favicons?domain=gojek.com&sz=128', shortName: 'GF' },
  grabfood_id: { name: 'GrabFood', color: '#00B14F', logoUrl: 'https://www.google.com/s2/favicons?domain=grab.com&sz=128', shortName: 'GR' },
  shopee_id: { name: 'Shopee', color: '#EE4D2D', logoUrl: 'https://www.google.com/s2/favicons?domain=shopee.co.id&sz=128', shortName: 'SP' },
  tokopedia: { name: 'Tokopedia', color: '#42B549', logoUrl: 'https://www.google.com/s2/favicons?domain=tokopedia.com&sz=128', shortName: 'TP' },

  // === MALAYSIA ===
  grabfood_my: { name: 'GrabFood', color: '#00B14F', logoUrl: 'https://www.google.com/s2/favicons?domain=grab.com&sz=128', shortName: 'GR' },
  foodpanda_my: { name: 'foodpanda', color: '#D70F64', logoUrl: 'https://www.google.com/s2/favicons?domain=foodpanda.com&sz=128', shortName: 'FP' },
  shopee_my: { name: 'Shopee', color: '#EE4D2D', logoUrl: 'https://www.google.com/s2/favicons?domain=shopee.com.my&sz=128', shortName: 'SP' },

  // === PHILIPPINES ===
  grabfood_ph: { name: 'GrabFood', color: '#00B14F', logoUrl: 'https://www.google.com/s2/favicons?domain=grab.com&sz=128', shortName: 'GR' },
  foodpanda_ph: { name: 'foodpanda', color: '#D70F64', logoUrl: 'https://www.google.com/s2/favicons?domain=foodpanda.com&sz=128', shortName: 'FP' },
  shopee_ph: { name: 'Shopee', color: '#EE4D2D', logoUrl: 'https://www.google.com/s2/favicons?domain=shopee.ph&sz=128', shortName: 'SP' },

  // === UAE ===
  amazon_ae: { name: 'Amazon', color: '#FF9900', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.ae&sz=128', shortName: 'AMZ' },
  noon: { name: 'Noon', color: '#FEEE00', logoUrl: 'https://www.google.com/s2/favicons?domain=noon.com&sz=128', shortName: 'NN' },
  carrefour_ae: { name: 'Carrefour', color: '#004A9F', logoUrl: 'https://www.google.com/s2/favicons?domain=carrefour.com&sz=128', shortName: 'CF' },
  talabat: { name: 'Talabat', color: '#FF5A00', logoUrl: 'https://www.google.com/s2/favicons?domain=talabat.com&sz=128', shortName: 'TB' },
  deliveroo_ae: { name: 'Deliveroo', color: '#00CCBC', logoUrl: 'https://www.google.com/s2/favicons?domain=deliveroo.com&sz=128', shortName: 'DV' },

  // === SAUDI ARABIA ===
  noon_sa: { name: 'Noon', color: '#FEEE00', logoUrl: 'https://www.google.com/s2/favicons?domain=noon.com&sz=128', shortName: 'NN' },
  jarir: { name: 'Jarir', color: '#004F9F', logoUrl: 'https://www.google.com/s2/favicons?domain=jarir.com&sz=128', shortName: 'JR' },
  talabat_sa: { name: 'Talabat', color: '#FF5A00', logoUrl: 'https://www.google.com/s2/favicons?domain=talabat.com&sz=128', shortName: 'TB' },
  hungerstation: { name: 'Hungerstation', color: '#6B2D7B', logoUrl: 'https://www.google.com/s2/favicons?domain=hungerstation.com&sz=128', shortName: 'HS' },

  // === AUSTRALIA ===
  amazon_au: { name: 'Amazon', color: '#FF9900', logoUrl: 'https://www.google.com/s2/favicons?domain=amazon.com.au&sz=128', shortName: 'AMZ' },
  woolworths: { name: 'Woolworths', color: '#125D32', logoUrl: 'https://www.google.com/s2/favicons?domain=woolworths.com.au&sz=128', shortName: 'WW' },
  coles: { name: 'Coles', color: '#E01A22', logoUrl: 'https://www.google.com/s2/favicons?domain=coles.com.au&sz=128', shortName: 'CL' },
  uber_eats_au: { name: 'Uber Eats', color: '#06C167', logoUrl: 'https://www.google.com/s2/favicons?domain=ubereats.com&sz=128', shortName: 'UE' },
  menulog: { name: 'Menulog', color: '#FF8000', logoUrl: 'https://www.google.com/s2/favicons?domain=menulog.com.au&sz=128', shortName: 'ML' },
};

// Get platforms for a country
export const getCountryPlatforms = (country: CountryCode): string[] => {
  const platformsByCountry: Record<CountryCode, string[]> = {
    IN: ['amazon_in', 'flipkart', 'blinkit', 'zepto', 'jiomart', 'swiggy_instamart', 'bigbasket', 'myntra', 'ajio', 'meesho', 'nykaa', 'tata_cliq'],
    US: ['amazon_us', 'walmart', 'target', 'instacart', 'costco', 'doordash', 'uber_eats', 'grubhub', 'gopuff'],
    UK: ['amazon_uk', 'tesco', 'sainsburys', 'asda', 'deliveroo', 'just_eat', 'ocado', 'getir'],
    DE: ['amazon_de', 'rewe', 'edeka', 'lidl', 'flink', 'gorillas'],
    FR: ['amazon_fr', 'carrefour', 'auchan', 'uber_eats_fr'],
    ES: ['amazon_es', 'glovo', 'just_eat_es', 'mercadona'],
    IT: ['amazon_it', 'glovo_it', 'just_eat_it', 'esselunga'],
    CA: ['amazon_ca', 'walmart_ca', 'instacart_ca', 'skip_the_dishes', 'doordash_ca'],
    AU: ['amazon_au', 'woolworths', 'coles', 'uber_eats_au', 'menulog'],
    AE: ['amazon_ae', 'noon', 'carrefour_ae', 'talabat', 'deliveroo_ae'],
    SA: ['noon_sa', 'jarir', 'talabat_sa', 'hungerstation'],
    BR: ['amazon_br', 'ifood', 'rappi_br', 'mercado_livre'],
    MX: ['amazon_mx', 'rappi_mx', 'uber_eats_mx', 'cornershop'],
    AR: ['rappi_ar', 'pedidosya', 'mercado_libre_ar'],
    CO: ['rappi_co', 'ifood_co'],
    CN: ['meituan', 'eleme', 'jd', 'taobao', 'pinduoduo'],
    SG: ['grabfood', 'foodpanda_sg', 'shopee_sg', 'lazada_sg'],
    TH: ['grabfood_th', 'foodpanda_th', 'line_man', 'shopee_th'],
    ID: ['gofood', 'grabfood_id', 'shopee_id', 'tokopedia'],
    MY: ['grabfood_my', 'foodpanda_my', 'shopee_my'],
    PH: ['grabfood_ph', 'foodpanda_ph', 'shopee_ph'],
  };
  return platformsByCountry[country] || [];
};
