'use client';

import { useState, useMemo } from 'react';
import {
    ShoppingCart, X, Trash2, Plus, Minus, Package, Truck,
    Sparkles, ArrowRight, ChevronDown, ChevronUp, Zap,
    Star, TrendingDown, AlertCircle, Gift, Loader2
} from 'lucide-react';
import { ProductResult, PlatformType, PLATFORM_CONFIG } from '@/types';

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
                                                    <div key={item.product.id} style={{
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
                                                            <p style={{ fontSize: 13, fontWeight: 500, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                                {item.product.title}
                                                            </p>
                                                            <p style={{ fontSize: 12, color: '#71717a' }}>
                                                                {symbol}{item.product.price_breakdown.base_price.toFixed(0)} each
                                                            </p>
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
                                Checkout on Platforms
                                <ArrowRight size={18} />
                            </button>
                        </div>

                        <p style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', marginTop: 12, fontWeight: 500 }}>
                            We&apos;ll open each store for you to complete your purchase
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
