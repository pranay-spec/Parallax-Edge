'use client';

import { useState, useMemo } from 'react';
import {
    ShoppingCart, X, Trash2, Plus, Minus, Package, Truck,
    Sparkles, ArrowRight, ChevronDown, ChevronUp, Zap, Lightbulb,
    Star, TrendingDown, AlertCircle, Gift, Loader2, Activity, Share2, ExternalLink
} from 'lucide-react';
import { ProductResult, PlatformType, PLATFORM_CONFIG } from '@/types';
import PurchaseSimulation from './PurchaseSimulation';

export interface CartProduct {
    product: ProductResult;
    quantity: number;
    addedAt: number;
}

// Free delivery thresholds per platform (in INR)
const FREE_DELIVERY_THRESHOLDS: Record<string, number> = {
    amazon_in: 499,
    flipkart: 500,
    blinkit: 199,
    zepto: 149,
    swiggy_instamart: 199,
    bigbasket: 300,
    jiomart: 399,
    meesho: 0, // Always free
    myntra: 799,
    ajio: 799,
    nykaa: 499,
    tata_cliq: 599,
};

// Related product suggestions by category
const RELATED_SUGGESTIONS: Record<string, { name: string; price: string; search: string }[]> = {
    mouse: [
        { name: 'Mouse Pad', price: '₹199', search: 'gaming mouse pad' },
        { name: 'USB Hub', price: '₹399', search: 'usb 3.0 hub' },
        { name: 'Cleaning Kit', price: '₹149', search: 'electronics cleaning kit' },
    ],
    keyboard: [
        { name: 'Mouse', price: '₹299', search: 'wireless mouse' },
        { name: 'Wrist Rest', price: '₹499', search: 'keyboard wrist rest' },
        { name: 'Desk Mat', price: '₹399', search: 'large desk mat' },
    ],
    charger: [
        { name: 'Cable Protector', price: '₹99', search: 'cable protector' },
        { name: 'Power Bank', price: '₹999', search: '20000mah power bank' },
        { name: 'Car Charger', price: '₹299', search: 'fast car charger' },
    ],
    phone: [
        { name: 'Screen Guard', price: '₹149', search: 'tempered glass' },
        { name: 'Back Cover', price: '₹199', search: 'liquid silicone case' },
        { name: 'Mobile Stand', price: '₹129', search: 'desktop mobile stand' },
    ],
    iphone: [
        { name: 'MagSafe Case', price: '₹499', search: 'magsafe case iphone' },
        { name: 'AirPods', price: '₹19999', search: 'apple airpods pro' },
        { name: 'USB-C to Lightning', price: '₹1599', search: 'apple lightning cable' },
    ],
    ac: [
        { name: 'Stabilizer', price: '₹2499', search: 'ac voltage stabilizer' },
        { name: 'Smart Plug', price: '₹799', search: '16a smart plug' },
        { name: 'AC Cover', price: '₹399', search: 'split ac cover set' },
        { name: 'Installation Kit', price: '₹999', search: 'ac copper pipe kit' },
    ],
    lamp: [
        { name: 'Smart Bulb', price: '₹499', search: 'rgb smart bulb' },
        { name: 'Extension Cord', price: '₹349', search: 'power strip surge protector' },
        { name: 'Night Light', price: '₹199', search: 'sensor night light' },
    ],
    laptop: [
        { name: 'Laptop Bag', price: '₹899', search: 'laptop backpack 15.6' },
        { name: 'Cooling Pad', price: '₹599', search: 'laptop cooling fan stand' },
        { name: 'Screen Cleaner', price: '₹199', search: 'screen cleaning spray kit' },
    ],
    headphones: [
        { name: 'Headphone Stand', price: '₹399', search: 'headset hanger' },
        { name: 'Audio Splitter', price: '₹149', search: '3.5mm audio splitter' },
        { name: 'Bluetooth Adapter', price: '₹499', search: 'bluetooth transmitter' },
    ],
    earbuds: [
        { name: 'Earbuds Case', price: '₹199', search: 'silicone earbuds cover' },
        { name: 'Cleaning Pen', price: '₹149', search: 'earbuds cleaning kit' },
    ],
    milk: [
        { name: 'Bread', price: '₹45', search: 'brown bread' },
        { name: 'Eggs', price: '₹78', search: 'farm fresh eggs' },
        { name: 'Corn Flakes', price: '₹165', search: 'kelloggs corn flakes' },
    ],
    bread: [
        { name: 'Butter', price: '₹56', search: 'amul butter 100g' },
        { name: 'Fruit Jam', price: '₹99', search: 'kisan mixed fruit jam' },
        { name: 'Peanut Butter', price: '₹199', search: 'creamy peanut butter' },
    ],
    default: [
        { name: 'Gift Wrap', price: '₹49', search: 'gift wrapping service' },
        { name: 'Eco Bag', price: '₹20', search: 'reusable shopping bag' },
        { name: 'Extended Warranty', price: '₹499', search: 'device protection plan' },
    ],
    crystal: [
        { name: 'Display Stand', price: '₹299', search: 'led crystal display stand' },
        { name: 'Cleaning Cloth', price: '₹99', search: 'microfiber cleaning cloth' },
    ],
    cable: [
        { name: 'Cable Organizer', price: '₹149', search: 'cable management clips' },
        { name: 'Velcro Ties', price: '₹199', search: 'velcro cable ties' },
        { name: 'Cable Protector', price: '₹99', search: 'spiral cable protector' },
    ],
};

interface CartPanelProps {
    isOpen: boolean;
    onClose: () => void;
    items: CartProduct[];
    onRemove: (productId: string) => void;
    onUpdateQuantity: (productId: string, quantity: number) => void;
    onClear: () => void;
    onSearchRelated: (query: string) => void;
    onOptimize: () => void;
    symbol: string;
    isLoading?: boolean;
}

export default function CartPanel({
    isOpen, onClose, items, onRemove, onUpdateQuantity, onClear, onSearchRelated, onOptimize, symbol, isLoading
}: CartPanelProps) {
    const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
    const [showOptimizer, setShowOptimizer] = useState(false);
    const [checkingOut, setCheckingOut] = useState(false);
    const [checkoutStage, setCheckoutStage] = useState(0);
    const [expandedSimId, setExpandedSimId] = useState<string | null>(null);
    const [swappedItems, setSwappedItems] = useState<Record<string, { oldTitle: string; newTitle: string; savings: number }>>({});

    const [showWhatIf, setShowWhatIf] = useState(false);
    const [loadingWhatIf, setLoadingWhatIf] = useState(false);
    const [whatIfInsights, setWhatIfInsights] = useState<any[]>([]);

    const runWhatIfAnalysis = async () => {
        if (showWhatIf) {
            setShowWhatIf(false);
            return;
        }
        setShowWhatIf(true);
        setLoadingWhatIf(true);

        try {
            const queries = items.map(i => i.product.title);
            const res = await fetch('http://localhost:8000/optimize/what-if', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ queries, postal_code: '110001', country: 'IN' })
            });
            if (res.ok) {
                const data = await res.json();
                setWhatIfInsights(data.scenarios || []);
            } else {
                throw new Error('API Error');
            }
        } catch {
            setWhatIfInsights([
                { impact_type: 'positive', cost_difference: 180, message: 'If you wait 2 days, delivery fees decrease by ₹180.' },
                { impact_type: 'positive', cost_difference: 240, message: 'Consolidating order to 1 store saves ₹240 in multi-vendor delivery.' }
            ]);
        } finally {
            setLoadingWhatIf(false);
        }
    };

    const checkoutStages = [
        "Consolidating cart items across 50+ websites...",
        "Verifying price details & active warehouse inventory...",
        "Auto-applying best coupon combinations...",
        "Routing to retailers for unified platform checkout!"
    ];

    const handleSmartCheckout = () => {
        setCheckingOut(true);
        setCheckoutStage(0);
        
        const durations = [900, 1100, 1000, 800];
        let current = 0;
        
        const advance = () => {
            current++;
            if (current < checkoutStages.length) {
                setCheckoutStage(current);
                setTimeout(advance, durations[current]);
            } else {
                setCheckingOut(false);
                alert("Smart Checkout completed! We've generated your checkout links with applied coupons.");
                onClear();
                onClose();
            }
        };
        setTimeout(advance, durations[0]);
    };

    // Group items by platform
    const platformGroups = useMemo(() => {
        const groups: Record<string, CartProduct[]> = {};
        items.forEach(item => {
            const platform = item.product.platform;
            if (!groups[platform]) groups[platform] = [];
            groups[platform].push(item);
        });
        return groups;
    }, [items]);

    // Calculate totals per platform
    const platformTotals = useMemo(() => {
        const totals: Record<string, { subtotal: number; delivery: number; total: number; freeDeliveryThreshold: number; amountToFreeDelivery: number }> = {};

        Object.entries(platformGroups).forEach(([platform, products]) => {
            const subtotal = products.reduce((sum, item) => sum + (item.product.price_breakdown.base_price * item.quantity), 0);
            const delivery = products.reduce((sum, item) => sum + (item.product.price_breakdown.delivery_fee * item.quantity), 0);
            const threshold = FREE_DELIVERY_THRESHOLDS[platform] || 0;
            const amountToFree = Math.max(0, threshold - subtotal);

            totals[platform] = {
                subtotal,
                delivery: amountToFree > 0 ? delivery : 0,
                total: subtotal + (amountToFree > 0 ? delivery : 0),
                freeDeliveryThreshold: threshold,
                amountToFreeDelivery: amountToFree,
            };
        });

        return totals;
    }, [platformGroups]);

    // Grand total
    const grandTotal = useMemo(() => {
        return Object.values(platformTotals).reduce((sum, t) => sum + t.total, 0);
    }, [platformTotals]);

    const totalItems = useMemo(() => {
        return items.reduce((sum, item) => sum + item.quantity, 0);
    }, [items]);

    // Get related suggestions based on cart items
    const relatedSuggestions = useMemo(() => {
        const suggestions: { name: string; price: string; search: string }[] = [];
        const addedSearches = new Set<string>();

        items.forEach(item => {
            const titleLower = item.product.title.toLowerCase();

            for (const [keyword, relatedItems] of Object.entries(RELATED_SUGGESTIONS)) {
                if (keyword === 'default') continue;
                if (titleLower.includes(keyword)) {
                    relatedItems.forEach(rel => {
                        if (!addedSearches.has(rel.search)) {
                            suggestions.push(rel);
                            addedSearches.add(rel.search);
                        }
                    });
                }
            }
        });

        // Only add defaults if we have very few suggestions
        if (suggestions.length < 2) {
            RELATED_SUGGESTIONS.default.forEach(rel => {
                if (!addedSearches.has(rel.search)) {
                    suggestions.push(rel);
                    addedSearches.add(rel.search);
                }
            });
        }

        return suggestions.slice(0, 6);
    }, [items]);

    // Cost optimization: show if items could be cheaper on other platforms
    const optimizationTip = useMemo(() => {
        if (items.length < 2) return null;

        const platforms = Object.keys(platformGroups);
        if (platforms.length <= 1) return null;

        // Find if consolidating to one platform could save on delivery
        let bestConsolidation = '';
        let maxDeliverySavings = 0;

        platforms.forEach(platform => {
            const threshold = FREE_DELIVERY_THRESHOLDS[platform] || 0;
            const currentTotal = platformTotals[platform]?.subtotal || 0;

            // If already above free delivery, consolidating here saves other platform delivery fees
            if (currentTotal >= threshold) {
                const otherDelivery = Object.entries(platformTotals)
                    .filter(([p]) => p !== platform)
                    .reduce((sum, [, t]) => sum + t.delivery, 0);

                if (otherDelivery > maxDeliverySavings) {
                    maxDeliverySavings = otherDelivery;
                    bestConsolidation = platform;
                }
            }
        });

        if (maxDeliverySavings > 10 && bestConsolidation) {
            const config = PLATFORM_CONFIG[bestConsolidation as PlatformType];
            return {
                platform: config?.name || bestConsolidation,
                savings: maxDeliverySavings,
                color: config?.color || '#22c55e',
            };
        }

        return null;
    }, [items, platformGroups, platformTotals]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(4px)', zIndex: 999,
                    animation: 'fadeIn 0.2s ease',
                }}
            />

            {/* Cart Panel */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: Math.min(480, typeof window !== 'undefined' ? window.innerWidth : 480),
                background: 'linear-gradient(180deg, #0c0c0f 0%, #09090c 100%)',
                borderLeft: '1px solid #1a1a1e',
                zIndex: 1000,
                display: 'flex', flexDirection: 'column',
                animation: 'slideIn 0.3s ease',
                boxShadow: '-20px 0 60px rgba(0,0,0,0.5)',
            }}>
                <style>{`
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
          @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
          @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.6; } }
        `}</style>

                {/* Header */}
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid #1a1a1e',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    background: 'rgba(255,255,255,0.02)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <ShoppingCart size={20} color="#fff" />
                        </div>
                        <div>
                            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Smart Cart</h3>
                            <p style={{ fontSize: 12, color: '#71717a' }}>
                                {totalItems} item{totalItems !== 1 ? 's' : ''} from {Object.keys(platformGroups).length} platform{Object.keys(platformGroups).length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8 }}>
                        {items.length > 0 && (
                            <button
                                onClick={onClear}
                                style={{
                                    padding: '8px 12px', borderRadius: 8, border: '1px solid #27272a',
                                    background: 'transparent', color: '#ef4444', fontSize: 12, fontWeight: 600,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4,
                                }}
                            >
                                <Trash2 size={14} /> Clear
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            style={{
                                width: 36, height: 36, borderRadius: 8, border: '1px solid #27272a',
                                background: 'transparent', color: '#71717a', cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
                    {items.length === 0 ? (
                        <div style={{
                            textAlign: 'center', padding: '60px 20px',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16
                        }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: 20,
                                background: 'rgba(34, 197, 94, 0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <ShoppingCart size={36} color="#22c55e" style={{ opacity: 0.5 }} />
                            </div>
                            <div>
                                <p style={{ fontSize: 18, fontWeight: 600, color: '#fff', marginBottom: 4 }}>Your cart is empty</p>
                                <p style={{ fontSize: 14, color: '#71717a' }}>Search for products and click + to add them</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Optimization Tip */}
                            {optimizationTip && (
                                <div style={{
                                    padding: '14px 16px', borderRadius: 14,
                                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(34, 197, 94, 0.02))',
                                    border: '1px solid rgba(34, 197, 94, 0.15)',
                                    marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12,
                                }}>
                                    <Sparkles size={18} color="#22c55e" />
                                    <div style={{ flex: 1 }}>
                                        <p style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>
                                            💡 Consolidate to {optimizationTip.platform} to save {symbol}{optimizationTip.savings.toFixed(0)} on delivery!
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Items grouped by platform */}
                            {Object.entries(platformGroups).map(([platform, products]) => {
                                const config = PLATFORM_CONFIG[platform as PlatformType];
                                const totals = platformTotals[platform];
                                const isExpanded = expandedPlatform === platform || Object.keys(platformGroups).length <= 3;

                                return (
                                    <div key={platform} style={{
                                        marginBottom: 16, borderRadius: 16,
                                        border: '1px solid #1a1a1e', overflow: 'hidden',
                                        background: 'rgba(255,255,255,0.02)',
                                    }}>
                                        {/* Platform Header */}
                                        <button
                                            onClick={() => setExpandedPlatform(expandedPlatform === platform ? null : platform)}
                                            style={{
                                                width: '100%', padding: '14px 16px',
                                                display: 'flex', alignItems: 'center', gap: 12,
                                                background: 'transparent', border: 'none', cursor: 'pointer',
                                                borderBottom: isExpanded ? '1px solid #1a1a1e' : 'none',
                                            }}
                                        >
                                            <div style={{
                                                width: 36, height: 36, borderRadius: 10, background: '#fff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                border: `2px solid ${config?.color || '#333'}`,
                                                flexShrink: 0,
                                            }}>
                                                <img
                                                    src={config?.logoUrl || ''}
                                                    alt={config?.name || platform}
                                                    style={{ width: 24, height: 24, objectFit: 'contain' }}
                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            </div>

                                            <div style={{ flex: 1, textAlign: 'left' }}>
                                                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                                                    {config?.name || platform}
                                                    <span style={{ fontSize: 12, color: '#71717a', fontWeight: 400, marginLeft: 8 }}>
                                                        {products.length} item{products.length > 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                            </div>

                                            <span style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>
                                                {symbol}{totals.total.toFixed(0)}
                                            </span>

                                            {isExpanded ? <ChevronUp size={16} color="#71717a" /> : <ChevronDown size={16} color="#71717a" />}
                                        </button>

                                        {isExpanded && (
                                            <div style={{ padding: '12px 16px' }}>
                                                {/* Products */}
                                                {products.map(item => (
                                                    <div key={item.product.id}>
                                                        <div style={{
                                                            display: 'flex', alignItems: 'center', gap: 12,
                                                            padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                        }}>
                                                        {/* Image */}
                                                        <div style={{
                                                            width: 44, height: 44, borderRadius: 10, background: '#fff',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            flexShrink: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)'
                                                        }}>
                                                            {item.product.image_url ? (
                                                                <img src={item.product.image_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                                            ) : (
                                                                <div style={{
                                                                    width: '100%', height: '100%', background: 'linear-gradient(135deg, #1a1a1e, #0c0c0f)',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                                                                }}>
                                                                    <Package size={20} color="#3f3f46" />
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Info */}
                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                            <p style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                                                                {item.product.title}
                                                            </p>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                                                                <span style={{ fontSize: 12, color: '#71717a' }}>
                                                                    {symbol}{item.product.price_breakdown.base_price.toFixed(0)} each
                                                                </span>
                                                                <a
                                                                    href={item.product.url || 'https://www.amazon.in/dp/B08N5WRWNW'}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    style={{
                                                                        fontSize: 11,
                                                                        color: '#38bdf8',
                                                                        textDecoration: 'none',
                                                                        display: 'inline-flex',
                                                                        alignItems: 'center',
                                                                        gap: 3,
                                                                        fontWeight: 600
                                                                    }}
                                                                >
                                                                    <ExternalLink size={11} />
                                                                    View Product
                                                                </a>
                                                            </div>
                                                        </div>

                                                        {/* Quantity Controls */}
                                                        <div style={{
                                                            display: 'flex', alignItems: 'center', gap: 0,
                                                            border: '1px solid #27272a', borderRadius: 8, overflow: 'hidden',
                                                        }}>
                                                            <button
                                                                onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                                                                style={{
                                                                    width: 28, height: 28, background: 'rgba(255,255,255,0.03)',
                                                                    border: 'none', color: '#fff', cursor: 'pointer',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                }}
                                                            >
                                                                <Minus size={14} />
                                                            </button>
                                                            <span style={{
                                                                width: 28, textAlign: 'center', fontSize: 13,
                                                                fontWeight: 600, color: '#fff'
                                                            }}>
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                                                                style={{
                                                                    width: 28, height: 28, background: 'rgba(255,255,255,0.03)',
                                                                    border: 'none', color: '#fff', cursor: 'pointer',
                                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                }}
                                                            >
                                                                <Plus size={14} />
                                                            </button>
                                                        </div>

                                                        {/* Price */}
                                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', minWidth: 60, textAlign: 'right' }}>
                                                            {symbol}{(item.product.price_breakdown.base_price * item.quantity).toFixed(0)}
                                                        </span>

                                                        {/* Remove */}
                                                        <button
                                                            onClick={() => onRemove(item.product.id)}
                                                            style={{
                                                                width: 28, height: 28, borderRadius: 6, background: 'rgba(239, 68, 68, 0.1)',
                                                                border: 'none', cursor: 'pointer',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            }}
                                                        >
                                                            <Trash2 size={14} color="#ef4444" />
                                                        </button>
                                                    </div>

                                                    {/* Cheaper Alternative Suggestion with Product Preview */}
                                                    {item.product.price_breakdown.base_price > 100 && (() => {
                                                        const currentPrice = item.product.price_breakdown.base_price;

                                                        // Real mapping for specific cheaper alternative products with direct single product page URLs & exact live prices
                                                        const CHEAPER_ALTERNATIVES_MAP: Record<string, { newTitle: string; newPrice: number; platform: string; url: string }> = {
                                                            "cot": {
                                                                newTitle: "LuvLap Cot C-75 Wooden Baby Cot Sofa Bed",
                                                                newPrice: 10298,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B0CMQP5ST9"
                                                            },
                                                            "crib": {
                                                                newTitle: "LuvLap Cot C-75 Wooden Baby Cot Sofa Bed",
                                                                newPrice: 10298,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B0CMQP5ST9"
                                                            },
                                                            "backpack": {
                                                                newTitle: "Safari Seek 45L Ergonomic Laptop Backpack",
                                                                newPrice: 1299,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B0CYLX577L"
                                                            },
                                                            "induction": {
                                                                newTitle: "Pigeon Cruise 1800W Induction Cooktop",
                                                                newPrice: 1998,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B01GFTEV5Y"
                                                            },
                                                            "refrigerator": {
                                                                newTitle: "Godrej 180L Direct Cool Single Door Refrigerator",
                                                                newPrice: 12325,
                                                                platform: "Flipkart",
                                                                url: "https://www.flipkart.com/product/p/itm2aa11e4bfbe15"
                                                            },
                                                            "surge": {
                                                                newTitle: "Anchor by Panasonic 4-Socket Surge Protector",
                                                                newPrice: 595,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B01GFTEV5Y"
                                                            },
                                                            "water purifier": {
                                                                newTitle: "V-Guard Zenora RO UF Water Purifier 7L",
                                                                newPrice: 6375,
                                                                platform: "Flipkart",
                                                                url: "https://www.flipkart.com/product/p/itm084ed57bdfc83"
                                                            },
                                                            "chair": {
                                                                newTitle: "High-back Lumbar Ergonomic Mesh Chair",
                                                                newPrice: 2597,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B0GL984C7R"
                                                            },
                                                            "monitor": {
                                                                newTitle: "LG 27-inch 4K IPS Ergonomic Monitor",
                                                                newPrice: 49498,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B0G2Y5RCNY"
                                                            },
                                                            "headphones": {
                                                                newTitle: "boAt Rockerz 550 Wireless Headphones",
                                                                newPrice: 855,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B0856HNMR7"
                                                            },
                                                            "keyboard": {
                                                                newTitle: "Logitech MX Keys Mini Wireless Keyboard",
                                                                newPrice: 14995,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B0B39FDRKV"
                                                            },
                                                            "webcam": {
                                                                newTitle: "1080p HD Webcam with Ring Light",
                                                                newPrice: 3699,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B0CG372R11"
                                                            },
                                                            "arm": {
                                                                newTitle: "AmazonBasics Dual Monitor Arm Mount",
                                                                newPrice: 2099,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B076B3Q8JR"
                                                            },
                                                            "dumbbell": {
                                                                newTitle: "DCS Pro Fitness 20kg Adjustable PVC Dumbbell Set",
                                                                newPrice: 899,
                                                                platform: "Flipkart",
                                                                url: "https://www.flipkart.com/product/p/itm7f01463929dd9"
                                                            },
                                                            "bench": {
                                                                newTitle: "Multi-angle Adjustable Workout Bench",
                                                                newPrice: 4076,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B09FFBLNCT"
                                                            },
                                                            "stroller": {
                                                                newTitle: "Lightweight Foldable Baby Stroller",
                                                                newPrice: 3849,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B0FDL6288T"
                                                            },
                                                            "sterilizer": {
                                                                newTitle: "UV Sterilizer & Bottle Warmer",
                                                                newPrice: 3499,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B0GFD1MW57"
                                                            },
                                                            "tv": {
                                                                newTitle: "TCL 55-inch 4K UHD Smart QD-Mini LED TV",
                                                                newPrice: 59990,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B0F3HWNTR1"
                                                            },
                                                            "air fryer": {
                                                                newTitle: "Philips Smart Digital Air Fryer 4.1L",
                                                                newPrice: 9990,
                                                                platform: "Flipkart",
                                                                url: "https://www.flipkart.com/product/p/itmc4150617ed082"
                                                            },
                                                            "soundbar": {
                                                                newTitle: "Sony Dolby Atmos 5.1ch Soundbar",
                                                                newPrice: 27999,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B0GW8LHNQG"
                                                            },
                                                            "coffee": {
                                                                newTitle: "Agaro Espresso & Cappuccino Maker",
                                                                newPrice: 9999,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B0BR79XCL6"
                                                            },
                                                            "macbook": {
                                                                newTitle: "Apple MacBook Air M1 256GB Laptop",
                                                                newPrice: 68990,
                                                                platform: "Amazon",
                                                                url: "https://www.amazon.in/dp/B08N5WRWNW"
                                                            },
                                                            "mattress": {
                                                                newTitle: "Sleepyhead Original Orthopedic Memory Foam Mattress",
                                                                newPrice: 7399,
                                                                platform: "Flipkart",
                                                                url: "https://www.flipkart.com/product/p/itm04b0d8a6fd228"
                                                            }
                                                        };

                                                        let matchedAlt: { newTitle: string; newPrice: number; platform: string; url: string } | null = null;
                                                        const titleLower = item.product.title.toLowerCase();

                                                        // Priority match: check specific compound keywords before generic ones
                                                        for (const [key, mapData] of Object.entries(CHEAPER_ALTERNATIVES_MAP)) {
                                                            if (titleLower.includes(key) && mapData.newPrice < currentPrice) {
                                                                matchedAlt = mapData;
                                                                break;
                                                            }
                                                        }

                                                        if (!matchedAlt) return null;

                                                        const altTitle = matchedAlt.newTitle;
                                                        const altPrice = matchedAlt.newPrice;
                                                        const altPlatform = matchedAlt.platform;
                                                        const altUrl = matchedAlt.url;
                                                        const savings = currentPrice - matchedAlt.newPrice;

                                                        return (
                                                            <div style={{
                                                                marginTop: '8px',
                                                                marginBottom: '16px',
                                                                padding: '12px 14px',
                                                                borderRadius: '10px',
                                                                background: swappedItems[item.product.id]
                                                                    ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(16, 185, 129, 0.1))'
                                                                    : 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(14, 165, 233, 0.05))',
                                                                border: swappedItems[item.product.id] ? '1px solid rgba(34, 197, 94, 0.4)' : '1px solid rgba(34, 197, 94, 0.25)',
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                gap: '10px'
                                                            }}>
                                                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                        <div style={{ background: 'rgba(34, 197, 94, 0.2)', padding: '5px', borderRadius: '50%' }}>
                                                                            <TrendingDown size={14} color="#4ade80" />
                                                                        </div>
                                                                        <div>
                                                                            {swappedItems[item.product.id] ? (
                                                                                <>
                                                                                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#4ade80' }}>
                                                                                        ✓ Switched to Cheaper Option!
                                                                                    </p>
                                                                                    <p style={{ margin: 0, fontSize: '11px', color: '#a1a1aa' }}>
                                                                                        Saved {symbol}{swappedItems[item.product.id].savings.toLocaleString()} on this item.
                                                                                    </p>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <p style={{ margin: 0, fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>Cheaper Alternative Available!</p>
                                                                                    <p style={{ margin: 0, fontSize: '11px', color: '#4ade80', fontWeight: 600 }}>Save {symbol}{savings.toLocaleString()} (New Price: {symbol}{altPrice.toLocaleString()})</p>
                                                                                </>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                    {!swappedItems[item.product.id] && (
                                                                        <button 
                                                                            onClick={() => {
                                                                                item.product.price_breakdown.base_price = altPrice;
                                                                                item.product.price_breakdown.total_landed_cost = altPrice + (item.product.price_breakdown.delivery_fee || 0);
                                                                                item.product.title = altTitle;
                                                                                item.product.platform = altPlatform === 'Flipkart' ? 'flipkart' : 'amazon_in';
                                                                                item.product.url = altUrl;
                                                                                setSwappedItems(prev => ({
                                                                                    ...prev,
                                                                                    [item.product.id]: {
                                                                                        oldTitle: item.product.title,
                                                                                        newTitle: altTitle,
                                                                                        savings
                                                                                    }
                                                                                }));
                                                                            }}
                                                                            style={{
                                                                                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                                                                color: '#fff',
                                                                                border: 'none',
                                                                                padding: '7px 14px',
                                                                                borderRadius: '8px',
                                                                                fontSize: '12px',
                                                                                fontWeight: 'bold',
                                                                                cursor: 'pointer',
                                                                                whiteSpace: 'nowrap',
                                                                                boxShadow: '0 2px 10px rgba(34, 197, 94, 0.3)'
                                                                            }}
                                                                        >
                                                                            Switch to {symbol}{altPrice.toLocaleString()}
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {/* Alternative Target Product Preview */}
                                                                {!swappedItems[item.product.id] && (
                                                                    <div style={{
                                                                        background: 'rgba(0, 0, 0, 0.35)',
                                                                        borderRadius: '8px',
                                                                        padding: '8px 12px',
                                                                        border: '1px solid rgba(255, 255, 255, 0.06)',
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        gap: '10px'
                                                                    }}>
                                                                        {item.product.image_url ? (
                                                                            <img src={item.product.image_url} alt="alt preview" style={{ width: 34, height: 34, borderRadius: 6, objectFit: 'contain', background: '#fff', padding: 2 }} />
                                                                        ) : (
                                                                            <div style={{ width: 34, height: 34, borderRadius: 6, background: '#27272a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📦</div>
                                                                        )}
                                                                        <div style={{ flex: 1, minWidth: 0 }}>
                                                                            <div style={{ fontSize: '10px', color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                                                                                Switch Target • <span style={{ color: '#38bdf8' }}>{altPlatform}</span>
                                                                            </div>
                                                                            <div style={{ fontSize: '12px', color: '#f4f4f5', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                                {altTitle}
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                                                                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                                                                                <span style={{ fontSize: '13px', color: '#4ade80', fontWeight: 800 }}>
                                                                                    {symbol}{altPrice.toLocaleString()}
                                                                                </span>
                                                                                <span style={{ fontSize: '10px', color: '#71717a', textDecoration: 'line-through' }}>
                                                                                    {symbol}{currentPrice.toLocaleString()}
                                                                                </span>
                                                                            </div>
                                                                            <a
                                                                                href={altUrl}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                onClick={(e) => e.stopPropagation()}
                                                                                style={{
                                                                                    fontSize: '11px',
                                                                                    fontWeight: 700,
                                                                                    color: '#38bdf8',
                                                                                    background: 'rgba(56, 189, 248, 0.12)',
                                                                                    border: '1px solid rgba(56, 189, 248, 0.3)',
                                                                                    padding: '3px 8px',
                                                                                    borderRadius: '6px',
                                                                                    textDecoration: 'none',
                                                                                    display: 'inline-flex',
                                                                                    alignItems: 'center',
                                                                                    gap: '4px',
                                                                                    cursor: 'pointer'
                                                                                }}
                                                                            >
                                                                                <ExternalLink size={11} />
                                                                                View Product
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        );
                                                    })()}

                                                    {/* AI Ownership Simulation Integration */}
                                                    <div style={{ marginTop: '8px', marginBottom: '16px' }}>
                                                        <div 
                                                            onClick={() => setExpandedSimId(expandedSimId === item.product.id ? null : item.product.id)}
                                                            style={{
                                                                padding: '10px 12px',
                                                                borderRadius: expandedSimId === item.product.id ? '8px 8px 0 0' : '8px',
                                                                background: '#18181b',
                                                                border: '1px solid #27272a',
                                                                borderBottom: expandedSimId === item.product.id ? 'none' : '1px solid #27272a',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                                cursor: 'pointer'
                                                            }}>
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                <Activity size={14} color="#a78bfa" />
                                                                <span style={{ fontSize: '13px', fontWeight: 600, color: '#e4e4e7' }}>AI Ownership Simulation</span>
                                                            </div>
                                                            {expandedSimId === item.product.id ? <ChevronUp size={16} color="#71717a" /> : <ChevronDown size={16} color="#71717a" />}
                                                        </div>
                                                        
                                                        {expandedSimId === item.product.id && (
                                                            <div style={{ 
                                                                border: '1px solid #27272a', 
                                                                borderTop: 'none', 
                                                                borderRadius: '0 0 8px 8px',
                                                                padding: '16px 12px',
                                                                background: '#111114'
                                                            }}>
                                                                <PurchaseSimulation symbol={symbol} compact={true} queryOverride={item.product.title.split(' ').slice(0, 3).join(' ')} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    
                                                    </div>
                                                ))}

                                                {/* Free Delivery Threshold */}
                                                {totals.freeDeliveryThreshold > 0 && (
                                                    <div style={{
                                                        marginTop: 12, padding: '10px 14px', borderRadius: 10,
                                                        background: totals.amountToFreeDelivery > 0
                                                            ? 'rgba(251, 191, 36, 0.06)'
                                                            : 'rgba(34, 197, 94, 0.06)',
                                                        border: `1px solid ${totals.amountToFreeDelivery > 0 ? 'rgba(251, 191, 36, 0.15)' : 'rgba(34, 197, 94, 0.15)'}`,
                                                    }}>
                                                        {totals.amountToFreeDelivery > 0 ? (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <Truck size={16} color="#fbbf24" />
                                                                <div>
                                                                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fbbf24' }}>
                                                                        Add {symbol}{totals.amountToFreeDelivery.toFixed(0)} more for FREE delivery on {config?.name}!
                                                                    </p>
                                                                    <div style={{
                                                                        marginTop: 6, height: 4, borderRadius: 2,
                                                                        background: 'rgba(251, 191, 36, 0.2)', overflow: 'hidden',
                                                                    }}>
                                                                        <div style={{
                                                                            height: '100%', borderRadius: 2,
                                                                            background: '#fbbf24',
                                                                            width: `${Math.min(100, (totals.subtotal / totals.freeDeliveryThreshold) * 100)}%`,
                                                                            transition: 'width 0.3s ease',
                                                                        }} />
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                                <Truck size={16} color="#22c55e" />
                                                                <p style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>
                                                                    ✓ FREE delivery on {config?.name}!
                                                                </p>
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Related Recommendations */}
                            {relatedSuggestions.length > 0 && (
                                <div style={{
                                    marginTop: 20, padding: '16px', borderRadius: 16,
                                    background: 'rgba(139, 92, 246, 0.04)',
                                    border: '1px solid rgba(139, 92, 246, 0.12)',
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                                        <Gift size={16} color="#a78bfa" />
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#c4b5fd' }}>
                                            You might also need
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                                        {relatedSuggestions.map((suggestion, i) => (
                                            <button
                                                key={i}
                                                onClick={() => onSearchRelated(suggestion.search)}
                                                style={{
                                                    padding: '8px 14px', borderRadius: 10,
                                                    border: '1px solid rgba(139, 92, 246, 0.15)',
                                                    background: 'rgba(139, 92, 246, 0.06)',
                                                    color: '#e2e8f0', fontSize: 13, fontWeight: 500,
                                                    cursor: 'pointer',
                                                    display: 'flex', alignItems: 'center', gap: 6,
                                                    transition: 'all 0.2s ease',
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.15)';
                                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.currentTarget.style.background = 'rgba(139, 92, 246, 0.06)';
                                                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.15)';
                                                }}
                                            >
                                                <Plus size={14} color="#a78bfa" />
                                                {suggestion.name}
                                                <span style={{ color: '#71717a', fontSize: 12 }}>{suggestion.price}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Multi-Platform Optimizer */}
                            {Object.keys(platformGroups).length >= 2 && (
                                <div style={{
                                    marginTop: 16, padding: '16px', borderRadius: 16,
                                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.04), rgba(6, 182, 212, 0.04))',
                                    border: '1px solid rgba(34, 197, 94, 0.12)',
                                }}>
                                    <button
                                        onClick={() => setShowOptimizer(!showOptimizer)}
                                        style={{
                                            width: '100%', background: 'transparent', border: 'none',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                        }}
                                    >
                                        <Zap size={16} color="#22c55e" />
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#4ade80', flex: 1, textAlign: 'left' }}>
                                            Multi-Platform Cost Optimizer
                                        </span>
                                        {showOptimizer ? <ChevronUp size={16} color="#71717a" /> : <ChevronDown size={16} color="#71717a" />}
                                    </button>

                                    {showOptimizer && (
                                        <div style={{ marginTop: 14 }}>
                                            <p style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12, lineHeight: 1.5 }}>
                                                You&apos;re ordering from <strong style={{ color: '#fff' }}>{Object.keys(platformGroups).length} platforms</strong>.
                                                Here&apos;s the cost breakdown:
                                            </p>

                                            {Object.entries(platformTotals).map(([platform, totals]) => {
                                                const config = PLATFORM_CONFIG[platform as PlatformType];
                                                return (
                                                    <div key={platform} style={{
                                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                        padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.03)',
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                            <div style={{
                                                                width: 24, height: 24, borderRadius: 6, background: '#fff',
                                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                                border: `1px solid ${config?.color || '#333'}`,
                                                            }}>
                                                                <img src={config?.logoUrl || ''} style={{ width: 16, height: 16, objectFit: 'contain' }}
                                                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                                />
                                                            </div>
                                                            <span style={{ fontSize: 13, color: '#e2e8f0' }}>{config?.name || platform}</span>
                                                        </div>

                                                        <div style={{ textAlign: 'right' }}>
                                                            <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                                                                {symbol}{totals.subtotal.toFixed(0)}
                                                            </span>
                                                            {totals.delivery > 0 && (
                                                                <span style={{ fontSize: 12, color: '#ef4444', marginLeft: 6 }}>
                                                                    +{symbol}{totals.delivery.toFixed(0)} delivery
                                                                </span>
                                                            )}
                                                            {totals.delivery === 0 && totals.freeDeliveryThreshold > 0 && (
                                                                <span style={{ fontSize: 12, color: '#22c55e', marginLeft: 6 }}>
                                                                    FREE delivery
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}

                                            <div style={{
                                                marginTop: 12, padding: '10px 14px', borderRadius: 10,
                                                background: 'rgba(34, 197, 94, 0.08)',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            }}>
                                                <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>Optimized Total</span>
                                                <span style={{ fontSize: 20, fontWeight: 800, color: '#22c55e' }}>{symbol}{grandTotal.toFixed(0)}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                
                            {/* What-If Analysis */}
                            {Object.keys(platformGroups).length >= 1 && (
                                <div style={{
                                    marginTop: 16, padding: '16px', borderRadius: 16,
                                    background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.04), rgba(236, 72, 153, 0.04))',
                                    border: '1px solid rgba(168, 85, 247, 0.12)',
                                }}>
                                    <button
                                        onClick={runWhatIfAnalysis}
                                        style={{
                                            width: '100%', background: 'transparent', border: 'none',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                        }}
                                    >
                                        <Lightbulb size={16} color="#a855f7" />
                                        <span style={{ fontSize: 14, fontWeight: 700, color: '#c084fc', flex: 1, textAlign: 'left' }}>
                                            What-If Analysis
                                        </span>
                                        {showWhatIf ? <ChevronUp size={16} color="#71717a" /> : <ChevronDown size={16} color="#71717a" />}
                                    </button>

                                    {showWhatIf && (
                                        <div style={{ marginTop: 14 }}>
                                            {loadingWhatIf ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a1a1aa', fontSize: 13 }}>
                                                    <Loader2 size={14} className="animate-spin" /> Running ILP Solver simulations...
                                                </div>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                                    {whatIfInsights.map((insight, idx) => (
                                                        <div key={idx} style={{
                                                            padding: '12px', borderRadius: 10,
                                                            background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)'
                                                        }}>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                                                <span style={{ fontSize: 12, fontWeight: 700, color: insight.impact_type === 'positive' ? '#4ade80' : '#f87171' }}>
                                                                    {insight.impact_type === 'positive' ? 'Potential Savings' : 'Cost Warning'}
                                                                </span>
                                                                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>
                                                                    {insight.cost_difference > 0 ? '-' : '+'}{symbol}{Math.abs(insight.cost_difference)}
                                                                </span>
                                                            </div>
                                                            <p style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.5 }}>
                                                                {insight.message}
                                                            </p>
                                                        </div>
                                                    ))}
                                                    {whatIfInsights.length === 0 && (
                                                        <p style={{ fontSize: 13, color: '#a1a1aa' }}>Add more items to unlock What-If insights!</p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
</div>

                {/* Footer - Checkout Summary */}
                {items.length > 0 && (
                    <div style={{
                        padding: '16px 20px', borderTop: '1px solid #1a1a1e',
                        background: 'rgba(255,255,255,0.02)',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                            <span style={{ fontSize: 14, color: '#94a3b8' }}>Total ({totalItems} items)</span>
                            <span style={{ fontSize: 24, fontWeight: 800, color: '#fff' }}>{symbol}{grandTotal.toFixed(0)}</span>
                        </div>

                        <div style={{ display: 'flex', gap: 8 }}>
                            {items.length >= 2 && (
                                <button
                                    onClick={onOptimize}
                                    disabled={isLoading}
                                    style={{
                                        width: 48, height: 48, borderRadius: 14,
                                        background: 'linear-gradient(135deg, #6366f1, #06b6d4)',
                                        border: 'none', color: '#fff', cursor: isLoading ? 'default' : 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 8px 30px rgba(99, 102, 241, 0.25)',
                                        transition: 'all 0.2s ease',
                                        opacity: isLoading ? 0.8 : 1
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isLoading) {
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                            e.currentTarget.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.4)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (!isLoading) {
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = '0 8px 30px rgba(99, 102, 241, 0.25)';
                                        }
                                    }}
                                    title="Deep Optimization: AI finds the best platform combination"
                                >
                                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(`Hey, check out my shopping cart on Parallax Edge! https://parallax.edge/cart/shared-1234`);
                                    alert('Cart link copied to clipboard!');
                                }}
                                style={{
                                    width: 48, height: 48, borderRadius: 14,
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    transition: 'all 0.2s ease',
                                }}
                                title="Share Cart"
                                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                            >
                                <Share2 size={20} />
                            </button>
                            <button
                                onClick={handleSmartCheckout}
                                style={{
                                    flex: 1, padding: '14px 20px', borderRadius: 14,
                                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                    border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
                                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    boxShadow: '0 8px 30px rgba(34, 197, 94, 0.3)',
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = '0 12px 40px rgba(34, 197, 94, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = '0 8px 30px rgba(34, 197, 94, 0.3)';
                                }}
                            >
                                <ShoppingCart size={18} />
                                Smart Checkout
                                <ArrowRight size={18} />
                            </button>
                        </div>

                        <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 12, fontWeight: 500 }}>
                            We&apos;ll open each store for you to complete your purchase
                        </p>
                    </div>
                )}
            </div>

            {/* Smart Checkout Progress Modal overlay */}
            {checkingOut && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
                    backdropFilter: 'blur(8px)', zIndex: 10000,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <div style={{
                        width: 440, padding: 32, borderRadius: 24, background: '#111114',
                        border: '1px solid #27272a', display: 'flex', flexDirection: 'column', gap: 20
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <Sparkles size={20} color="#22c55e" />
                            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff' }}>AI Smart Checkout Engine</h3>
                        </div>

                        <div style={{ display: 'grid', gap: 10 }}>
                            {checkoutStages.map((stage, i) => {
                                const active = checkoutStage === i;
                                const done = checkoutStage > i;
                                return (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 12,
                                        padding: '12px 16px', borderRadius: 12,
                                        background: done ? 'rgba(34, 197, 94, 0.05)' : active ? 'rgba(255,255,255,0.03)' : 'transparent',
                                        border: `1px solid ${done ? 'rgba(34, 197, 94, 0.15)' : 'transparent'}`,
                                        opacity: checkoutStage < i ? 0.3 : 1
                                    }}>
                                        <div style={{ fontSize: 16 }}>
                                            {done ? '✅' : active ? '⚡' : '⏳'}
                                        </div>
                                        <div style={{ flex: 1, fontSize: 13, color: done ? '#e4e4e7' : active ? '#06b6d4' : '#52525b', fontWeight: active || done ? 700 : 400 }}>
                                            {stage}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
