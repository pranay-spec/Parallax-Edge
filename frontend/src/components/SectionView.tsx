'use client';

import { useState } from 'react';
import {
    ArrowLeft, Tag, Clock, Leaf, MessageSquare, MapPin,
    ChevronRight, Zap, TrendingDown, Shield, AlertTriangle,
    Bike, Truck, Copy, Check, Star, Map, History,
    Bookmark, ShoppingCart, TrendingUp, Bell, Heart, Brain,
    Trophy, Users, Award, Crown, Sparkles, Loader2, X, Send, PlusCircle, Package, Compass, Activity
} from 'lucide-react';
import {
    InsightsData, CouponData, StackedProduct, PLATFORM_CONFIG, SearchResponse, SmartReorderItem
} from '@/types';
import LocalSupplyMap from './LocalSupplyMap';

interface SectionViewProps {
    section: string;
    insights: InsightsData | null;
    symbol: string;
    query: string;
    pincode: string;
    searchHistory: string[];
    onBack: () => void;
    onSearchHistoryClick?: (query: string) => void;
    userPersona?: string | null;
    smartReorder?: SmartReorderItem[];
    cartItems?: any[];
    onRemoveFromCart?: (id: string) => void;
    onUpdateCartQuantity?: (id: string, q: number) => void;
    onOptimize?: () => void;
    favorites?: any[];
    onToggleFavorite?: (product: any) => void;
    savedGroups?: any[];
    onToggleSaveGroup?: (group: any) => void;
    priceAlerts?: any[];
    onTogglePriceAlert?: (product: any) => void;
    isLoading?: boolean;
    userResaleItems?: any[];
    onSellItem?: (item: any) => void;
    activeChat?: { seller: string; product: string } | null;
    onChatWithSeller?: (seller: string, product: string) => void;
    onCloseChat?: () => void;
}

// Section metadata
const SECTION_META: Record<string, { title: string; subtitle: string; icon: React.ElementType; gradient: string; color: string }> = {
    coupons: { title: 'Coupons & Rewards', subtitle: 'Live coupon codes and automatic savings', icon: Tag, gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.04))', color: '#f59e0b' },
    oracle: { title: 'AI Price Oracle', subtitle: 'AI-powered buy vs wait signals', icon: Brain, gradient: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(139, 92, 246, 0.04))', color: '#8b5cf6' },
    stock_pulse: { title: 'Hyper-Local Stock Pulse', subtitle: 'Predict stockout and surge for nearby hubs', icon: Activity, gradient: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.04))', color: '#ef4444' },
    reviews: { title: 'Review Sentinel', subtitle: 'AI-powered review authenticity analysis', icon: Shield, gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(6, 182, 212, 0.04))', color: '#06b6d4' },
    carbon: { title: 'Green Edge Score', subtitle: 'Sustainability analytics & carbon impact of delivery', icon: Leaf, gradient: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.04))', color: '#22c55e' },
    flash_pool: { title: 'Local Flash-Pool Engine', subtitle: 'Real-time community group-buy tracker', icon: Users, gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(244, 63, 94, 0.04))', color: '#f43f5e' },
    supplymap: { title: 'Local Supply Map', subtitle: 'Dark store heatmap near your location', icon: Map, gradient: 'linear-gradient(135deg, rgba(59, 130, 246, 0.12), rgba(59, 130, 246, 0.04))', color: '#3b82f6' },
    history: { title: 'Search History', subtitle: 'Your recent product searches', icon: History, gradient: 'linear-gradient(135deg, rgba(161, 161, 170, 0.08), rgba(161, 161, 170, 0.03))', color: '#a1a1aa' },
    saved: { title: 'Saved Compares', subtitle: 'Bookmarked price comparisons', icon: Bookmark, gradient: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(99, 102, 241, 0.04))', color: '#818cf8' },
    cart: { title: 'Cart Optimizer', subtitle: 'Multi-item bundle optimization', icon: ShoppingCart, gradient: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08), rgba(6, 182, 212, 0.04))', color: '#06b6d4' },
    alerts: { title: 'Price Alerts', subtitle: 'Get notified when prices drop', icon: Bell, gradient: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08), rgba(245, 158, 11, 0.04))', color: '#f59e0b' },
    favourites: { title: 'Favourites', subtitle: 'Your saved products and deals', icon: Heart, gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.08), rgba(244, 63, 94, 0.04))', color: '#f43f5e' },
    campus: { title: 'Campus Deals', subtitle: 'P2P Resale & Community Flash-Pools', icon: MapPin, gradient: 'linear-gradient(135deg, rgba(244, 63, 94, 0.12), rgba(244, 63, 94, 0.04))', color: '#f43f5e' },
};

export default function SectionView({
    section, insights, symbol, query, pincode,
    searchHistory, onBack, onSearchHistoryClick, userPersona, smartReorder,
    cartItems, onRemoveFromCart, onUpdateCartQuantity, onOptimize,
    favorites, onToggleFavorite, savedGroups, onToggleSaveGroup,
    priceAlerts, onTogglePriceAlert, isLoading,
    userResaleItems = [], onSellItem, activeChat, onChatWithSeller, onCloseChat
}: SectionViewProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const [isSellModalOpen, setIsSellModalOpen] = useState(false);
    const meta = SECTION_META[section];

    if (!meta) return null;

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const Icon = meta.icon;

    return (
        <div style={{ maxWidth: 900, margin: '0 auto', paddingBottom: 80 }}>
            {/* Section Header */}
            <div style={{ marginBottom: 32 }}>
                <button
                    onClick={onBack}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#71717a', fontSize: 13, fontWeight: 500,
                        padding: '8px 0', marginBottom: 20, transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#e4e4e7')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#71717a')}
                >
                    <ArrowLeft size={16} /> Back to Search
                </button>

                <div style={{
                    padding: '28px 32px',
                    borderRadius: 20,
                    background: meta.gradient,
                    border: `1px solid ${meta.color}20`,
                    position: 'relative',
                    overflow: 'hidden',
                }}>
                    {/* Glow */}
                    <div style={{
                        position: 'absolute', top: -30, right: -30,
                        width: 120, height: 120, borderRadius: '50%',
                        background: `radial-gradient(circle, ${meta.color}15, transparent)`,
                    }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: `${meta.color}18`,
                            border: `1px solid ${meta.color}25`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Icon size={24} color={meta.color} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>
                                {meta.title}
                            </h1>
                            <p style={{ fontSize: 14, color: '#71717a', margin: '4px 0 0' }}>
                                {meta.subtitle}
                            </p>
                        </div>
                    </div>

                    {query && (
                        <div style={{
                            marginTop: 16, padding: '8px 14px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.04)', display: 'inline-flex',
                            alignItems: 'center', gap: 6, fontSize: 12, color: '#a1a1aa',
                        }}>
                            Showing insights for: <span style={{ color: '#fff', fontWeight: 600 }}>&quot;{query}&quot;</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Section Content */}
            <div style={{ padding: '0 4px' }}>
                {section === 'coupons' && <InlineCouponsView insights={insights} symbol={symbol} copiedCode={copiedCode} onCopy={handleCopy} />}
                {section === 'oracle' && <InlinePriceOracleView insights={insights} symbol={symbol} query={query} />}
                {section === 'stock_pulse' && <InlineStockPulseView insights={insights} />}
                {section === 'reviews' && <InlineReviewsView insights={insights} query={query} />}
                {section === 'carbon' && <InlineCarbonView insights={insights} />}
                {(section === 'flash_pool' || section === 'campus') && <InlineFlashPoolView
                    insights={insights}
                    onChatWithSeller={onChatWithSeller}
                    userResaleItems={userResaleItems}
                    onSellClick={() => setIsSellModalOpen(true)}
                />}

                {isSellModalOpen && (
                    <SellItemModal
                        onClose={() => setIsSellModalOpen(false)}
                        onSell={(item) => {
                            onSellItem?.(item);
                            setIsSellModalOpen(false);
                        }}
                    />
                )}
                {section === 'supplymap' && <LocalSupplyMap pincode={pincode || '560001'} query={query} />}
                {section === 'history' && <InlineHistoryView
                    searchHistory={searchHistory}
                    onSearchClick={onSearchHistoryClick}
                    userPersona={userPersona}
                    smartReorder={smartReorder}
                />}
                {section === 'cart' && <InlineCartOptimizerView
                    items={cartItems || []}
                    onRemove={onRemoveFromCart || (() => { })}
                    onUpdateQuantity={onUpdateCartQuantity || (() => { })}
                    onOptimize={onOptimize || (() => { })}
                    symbol={symbol}
                    isLoading={isLoading}
                />}
                {section === 'saved' && <InlineSavedView
                    groups={savedGroups || []}
                    onToggleSave={onToggleSaveGroup || (() => { })}
                    symbol={symbol}
                />}
                {section === 'alerts' && <InlinePriceAlertsView
                    items={priceAlerts || []}
                    onToggleAlert={onTogglePriceAlert || (() => { })}
                    symbol={symbol}
                />}
                {section === 'favourites' && <InlineFavouritesView
                    items={favorites || []}
                    onToggleFavorite={onToggleFavorite || (() => { })}
                    symbol={symbol}
                />}
            </div>
        </div>
    );
}


// ============================================================
// INLINE COUPONS VIEW — THE STACKABILITY ENGINE
// ============================================================
function InlineCouponsView({ insights, symbol, copiedCode, onCopy }: {
    insights: InsightsData | null; symbol: string; copiedCode: string | null; onCopy: (code: string) => void;
}) {
    const [showCheckoutSim, setShowCheckoutSim] = useState(false);
    const [selectedDeal, setSelectedDeal] = useState<StackedProduct | null>(null);

    if (!insights?.coupons) return <EmptyState icon={Tag} label="No coupon data yet" sublabel="Search for a product first" />;

    const stacked = insights.coupons.stacked;
    const bestDeal = stacked?.best_deal;

    const allCoupons: (CouponData & { productId: string })[] = [];
    Object.entries(insights.coupons.by_product).forEach(([productId, coupons]) => {
        coupons.forEach(c => allCoupons.push({ ...c, productId }));
    });
    const autoCoupons = allCoupons.filter(c => c.auto_apply);
    const manualCoupons = allCoupons.filter(c => !c.auto_apply);

    if (allCoupons.length === 0 && !stacked?.stacked?.length) return <EmptyState icon={Tag} label="No coupons available" sublabel="We're always scanning for deals" />;

    const activeDeal = selectedDeal || bestDeal;

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* ── HERO: Best Net Effective Price ── */}
            {bestDeal && (
                <div style={{
                    padding: 28, borderRadius: 20, position: 'relative', overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.08), rgba(245, 158, 11, 0.06))',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                }}>
                    <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, background: 'radial-gradient(circle, rgba(139, 92, 246, 0.2), transparent)', borderRadius: '50%' }} />
                    <div style={{ position: 'absolute', bottom: -20, left: '30%', width: 80, height: 80, background: 'radial-gradient(circle, rgba(245, 158, 11, 0.12), transparent)', borderRadius: '50%' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 14 }}>
                        <Brain size={14} color="#a78bfa" />
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa', letterSpacing: 1 }}>⚡ STACKABILITY ENGINE</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, marginBottom: 6 }}>
                        <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                            {symbol}{bestDeal.net_effective_price.toFixed(0)}
                        </div>
                        <div style={{ fontSize: 16, color: '#52525b', textDecoration: 'line-through', fontWeight: 500 }}>
                            {symbol}{bestDeal.original_price.toFixed(0)}
                        </div>
                        <div style={{
                            padding: '4px 10px', borderRadius: 8,
                            background: 'rgba(34, 197, 94, 0.15)', border: '1px solid rgba(34, 197, 94, 0.25)',
                            fontSize: 13, fontWeight: 800, color: '#4ade80',
                        }}>
                            {bestDeal.savings_pct}% OFF
                        </div>
                    </div>

                    <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>
                        Net Effective Price on <strong style={{ color: '#e4e4e7' }}>{PLATFORM_CONFIG[bestDeal.platform]?.name || bestDeal.platform}</strong>
                    </div>
                    <div style={{ fontSize: 11, color: '#71717a' }}>
                        Combining {[bestDeal.layers.coupon.applied && 'coupon', bestDeal.layers.bank.applied && 'bank offer', bestDeal.layers.loyalty.applied && 'loyalty points'].filter(Boolean).join(' + ')}
                    </div>
                </div>
            )}

            {/* ── SAVINGS WATERFALL ── */}
            {activeDeal && (
                <div style={{
                    padding: 22, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24',
                }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', marginBottom: 16, letterSpacing: 0.5 }}>
                        💧 SAVINGS WATERFALL — {PLATFORM_CONFIG[activeDeal.platform]?.name || activeDeal.platform}
                    </div>

                    {/* Layer 1: Coupon */}
                    <WaterfallLayer
                        label="Platform Coupon"
                        icon="🏷️"
                        applied={activeDeal.layers.coupon.applied}
                        savings={activeDeal.layers.coupon.savings}
                        detail={activeDeal.layers.coupon.code ? `${activeDeal.layers.coupon.code} • ${activeDeal.layers.coupon.discount_label}` : activeDeal.layers.coupon.discount_label || 'No eligible coupon'}
                        color="#f59e0b"
                        maxSavings={activeDeal.total_savings}
                        symbol={symbol}
                    />

                    {/* Connector */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', marginLeft: 18 }}>
                        <div style={{ width: 2, height: 16, background: 'rgba(255,255,255,0.06)' }} />
                        <span style={{ fontSize: 10, color: '#3f3f46' }}>+</span>
                    </div>

                    {/* Layer 2: Bank Card */}
                    <WaterfallLayer
                        label="Bank Card Offer"
                        icon="💳"
                        applied={activeDeal.layers.bank.applied}
                        savings={activeDeal.layers.bank.savings}
                        detail={activeDeal.layers.bank.best_card ? `${activeDeal.layers.bank.best_card.card_name} — ${activeDeal.layers.bank.best_card.discount_pct}% instant` : 'No bank offer available'}
                        color="#6366f1"
                        maxSavings={activeDeal.total_savings}
                        symbol={symbol}
                    />

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', marginLeft: 18 }}>
                        <div style={{ width: 2, height: 16, background: 'rgba(255,255,255,0.06)' }} />
                        <span style={{ fontSize: 10, color: '#3f3f46' }}>+</span>
                    </div>

                    {/* Layer 3: Loyalty Points */}
                    <WaterfallLayer
                        label="Loyalty Points"
                        icon="⭐"
                        applied={activeDeal.layers.loyalty.applied}
                        savings={activeDeal.layers.loyalty.savings}
                        detail={activeDeal.layers.loyalty.program ? `${activeDeal.layers.loyalty.program.program} — ${activeDeal.layers.loyalty.program.points_earned} pts earned` : 'No loyalty program'}
                        color="#22c55e"
                        maxSavings={activeDeal.total_savings}
                        symbol={symbol}
                    />

                    {/* Total */}
                    <div style={{
                        marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#e4e4e7' }}>Total Stacked Savings</span>
                        <span style={{ fontSize: 22, fontWeight: 900, color: '#4ade80' }}>{symbol}{activeDeal.total_savings.toFixed(0)}</span>
                    </div>
                </div>
            )}

            {/* ── ONE-TAP CHECKOUT SIMULATION ── */}
            {activeDeal && activeDeal.layers.bank.applied && (
                <div>
                    <button
                        onClick={() => setShowCheckoutSim(!showCheckoutSim)}
                        style={{
                            width: '100%', padding: '16px 24px', borderRadius: 14,
                            background: showCheckoutSim
                                ? 'linear-gradient(135deg, #4f46e5, #7c3aed)'
                                : 'linear-gradient(135deg, rgba(99, 102, 241, 0.12), rgba(139, 92, 246, 0.08))',
                            border: '1px solid rgba(99, 102, 241, 0.3)',
                            color: showCheckoutSim ? '#fff' : '#a5b4fc',
                            fontSize: 15, fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                            transition: 'all 0.3s ease',
                            letterSpacing: 0.5,
                        }}
                    >
                        <Zap size={18} />
                        {showCheckoutSim ? '✅ Optimal Checkout Strategy' : '🔥 One-Tap Checkout Simulation'}
                    </button>

                    {showCheckoutSim && activeDeal.layers.bank.best_card && (
                        <div style={{
                            marginTop: 12, padding: 24, borderRadius: 16,
                            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.08), rgba(15, 15, 20, 0.95))',
                            border: '1px solid rgba(99, 102, 241, 0.2)',
                        }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginBottom: 16, letterSpacing: 1 }}>YOUR OPTIMAL CHECKOUT STRATEGY</div>

                            {/* Step 1 */}
                            <CheckoutStep step={1} label="Apply Coupon Code" color="#f59e0b"
                                detail={activeDeal.layers.coupon.applied ? `Enter code ${activeDeal.layers.coupon.code || 'AUTO-APPLIED'} at checkout` : 'No coupon needed — proceed to payment'}
                                savings={activeDeal.layers.coupon.savings} symbol={symbol}
                            />

                            {/* Step 2 */}
                            <CheckoutStep step={2} label={`Pay with ${activeDeal.layers.bank.best_card.card_name}`} color={activeDeal.layers.bank.best_card.color}
                                detail={`${activeDeal.layers.bank.best_card.discount_pct}% instant discount${activeDeal.layers.bank.best_card.max_discount > 0 ? ` (up to ${symbol}${activeDeal.layers.bank.best_card.max_discount})` : ''} + ${activeDeal.layers.bank.best_card.cashback.toFixed(0)} cashback`}
                                savings={activeDeal.layers.bank.savings} symbol={symbol}
                            />

                            {/* Step 3 */}
                            {activeDeal.layers.loyalty.applied && activeDeal.layers.loyalty.program && (
                                <CheckoutStep step={3} label={`Earn ${activeDeal.layers.loyalty.program.program}`} color={activeDeal.layers.loyalty.program.color}
                                    detail={`${activeDeal.layers.loyalty.program.points_earned} points earned (worth ${symbol}${activeDeal.layers.loyalty.program.point_value.toFixed(0)}) • ${activeDeal.layers.loyalty.program.bonus}`}
                                    savings={activeDeal.layers.loyalty.savings} symbol={symbol}
                                />
                            )}

                            {/* Final Price */}
                            <div style={{
                                marginTop: 20, padding: 20, borderRadius: 14,
                                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.04))',
                                border: '1px solid rgba(34, 197, 94, 0.25)',
                                textAlign: 'center',
                            }}>
                                <div style={{ fontSize: 11, color: '#4ade80', fontWeight: 700, marginBottom: 6, letterSpacing: 1 }}>💰 YOU PAY</div>
                                <div style={{ fontSize: 34, fontWeight: 900, color: '#fff' }}>{symbol}{activeDeal.net_effective_price.toFixed(0)}</div>
                                <div style={{ fontSize: 13, color: '#71717a', marginTop: 4 }}>
                                    instead of <span style={{ textDecoration: 'line-through', color: '#52525b' }}>{symbol}{activeDeal.original_price.toFixed(0)}</span>
                                    {' '}<span style={{ color: '#4ade80', fontWeight: 700 }}>Save {symbol}{activeDeal.total_savings.toFixed(0)}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ── BANK CARD COMPARISON (for active deal) ── */}
            {activeDeal && activeDeal.layers.bank.all_options.length > 1 && (
                <div style={{ padding: 20, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', marginBottom: 14, letterSpacing: 0.5 }}>💳 CARD COMPARISON — {PLATFORM_CONFIG[activeDeal.platform]?.name || activeDeal.platform}</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {activeDeal.layers.bank.all_options.map((card, i) => (
                            <div key={i} style={{
                                display: 'flex', alignItems: 'center', gap: 12,
                                padding: '14px 16px', borderRadius: 12,
                                background: i === 0 ? 'rgba(99, 102, 241, 0.06)' : 'rgba(255,255,255,0.02)',
                                border: `1px solid ${i === 0 ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.04)'}`,
                            }}>
                                {i === 0 && <div style={{ position: 'absolute', fontSize: 8, color: '#818cf8', fontWeight: 800, marginTop: -40 }}>👑 BEST</div>}
                                <div style={{
                                    width: 36, height: 36, borderRadius: 10,
                                    background: `${card.color}15`, border: `1px solid ${card.color}30`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    fontSize: 18,
                                }}>{card.logo}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{card.card_name}</div>
                                    <div style={{ fontSize: 11, color: '#71717a' }}>{card.bank} • {card.card_type}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: i === 0 ? '#818cf8' : '#a1a1aa' }}>
                                        {symbol}{card.total_benefit.toFixed(0)}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#52525b' }}>
                                        {symbol}{card.instant_discount.toFixed(0)} off + {symbol}{card.cashback.toFixed(0)} CB
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── ALL PRODUCTS STACKED (if multiple) ── */}
            {stacked && stacked.stacked.length > 1 && (
                <div style={{ padding: 20, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', marginBottom: 14, letterSpacing: 0.5 }}>📊 ALL PRODUCTS — NET EFFECTIVE PRICE</div>
                    <div style={{ display: 'grid', gap: 8 }}>
                        {stacked.stacked.map((item, i) => (
                            <div
                                key={item.product_id}
                                onClick={() => setSelectedDeal(item)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 12,
                                    padding: '14px 16px', borderRadius: 12,
                                    background: (selectedDeal?.product_id || bestDeal?.product_id) === item.product_id
                                        ? 'rgba(139, 92, 246, 0.06)' : 'rgba(255,255,255,0.02)',
                                    border: `1px solid ${(selectedDeal?.product_id || bestDeal?.product_id) === item.product_id ? 'rgba(139, 92, 246, 0.2)' : 'rgba(255,255,255,0.04)'}`,
                                    cursor: 'pointer', transition: 'all 0.2s',
                                }}>
                                {i === 0 && <span style={{ fontSize: 10, color: '#4ade80', fontWeight: 800 }}>BEST</span>}
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {PLATFORM_CONFIG[item.platform]?.name || item.platform}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#71717a' }}>
                                        {[item.layers.coupon.applied && '🏷️', item.layers.bank.applied && '💳', item.layers.loyalty.applied && '⭐'].filter(Boolean).join(' ')}
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 15, fontWeight: 800, color: i === 0 ? '#4ade80' : '#e4e4e7' }}>
                                        {symbol}{item.net_effective_price.toFixed(0)}
                                    </div>
                                    <div style={{ fontSize: 10, color: '#52525b', textDecoration: 'line-through' }}>
                                        {symbol}{item.original_price.toFixed(0)}
                                    </div>
                                </div>
                                <div style={{
                                    padding: '3px 8px', borderRadius: 6,
                                    background: 'rgba(34, 197, 94, 0.1)', fontSize: 11, fontWeight: 700, color: '#4ade80',
                                }}>
                                    -{item.savings_pct}%
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── TRADITIONAL COUPON LIST ── */}
            {allCoupons.length > 0 && (
                <div style={{ padding: 20, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', marginBottom: 14, letterSpacing: 0.5 }}>🎟️ ALL AVAILABLE COUPONS ({allCoupons.length})</div>
                    {autoCoupons.length > 0 && (
                        <>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#4ade80', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Zap size={10} /> AUTO-APPLIED
                            </div>
                            <div style={{ display: 'grid', gap: 8, marginBottom: 16 }}>
                                {autoCoupons.map((coupon, i) => (
                                    <CouponRow key={i} coupon={coupon} symbol={symbol} copiedCode={copiedCode} onCopy={onCopy} />
                                ))}
                            </div>
                        </>
                    )}
                    {manualCoupons.length > 0 && (
                        <>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', marginBottom: 10 }}>💳 BANK & PROMO OFFERS</div>
                            <div style={{ display: 'grid', gap: 8 }}>
                                {manualCoupons.map((coupon, i) => (
                                    <CouponRow key={i} coupon={coupon} symbol={symbol} copiedCode={copiedCode} onCopy={onCopy} />
                                ))}
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
}

// ── Waterfall Layer Component ──
function WaterfallLayer({ label, icon, applied, savings, detail, color, maxSavings, symbol }: {
    label: string; icon: string; applied: boolean; savings: number;
    detail: string; color: string; maxSavings: number; symbol: string;
}) {
    const pct = maxSavings > 0 ? Math.min(100, (savings / maxSavings) * 100) : 0;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 14, padding: '12px 14px',
            borderRadius: 12, background: applied ? `${color}08` : 'rgba(255,255,255,0.01)',
            border: `1px solid ${applied ? `${color}20` : 'rgba(255,255,255,0.04)'}`,
            opacity: applied ? 1 : 0.5,
        }}>
            <div style={{ fontSize: 20, width: 32, textAlign: 'center' }}>{icon}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: applied ? '#e4e4e7' : '#52525b', marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 11, color: '#71717a', marginBottom: 6 }}>{detail}</div>
                {applied && (
                    <div style={{ height: 4, borderRadius: 2, background: 'rgba(255,255,255,0.04)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}80)`, borderRadius: 2, transition: 'width 0.6s ease' }} />
                    </div>
                )}
            </div>
            <div style={{ fontSize: applied ? 16 : 13, fontWeight: 800, color: applied ? color : '#3f3f46' }}>
                {applied ? `${symbol}${savings.toFixed(0)}` : '—'}
            </div>
        </div>
    );
}

// ── Checkout Step Component ──
function CheckoutStep({ step, label, detail, color, savings, symbol }: {
    step: number; label: string; detail: string; color: string; savings: number; symbol: string;
}) {
    return (
        <div style={{
            display: 'flex', gap: 14, marginBottom: 14,
        }}>
            <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: `${color}20`, border: `2px solid ${color}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 13, fontWeight: 800, color: color,
            }}>{step}</div>
            <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#e4e4e7', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.5 }}>{detail}</div>
            </div>
            {savings > 0 && (
                <div style={{ fontSize: 14, fontWeight: 800, color: '#4ade80', whiteSpace: 'nowrap' }}>-{symbol}{savings.toFixed(0)}</div>
            )}
        </div>
    );
}


// ============================================================
// INLINE PRICE ORACLE VIEW — THE AI BUY SIGNAL
// ============================================================
function InlinePriceOracleView({ insights, symbol, query }: { insights: InsightsData | null; symbol: string; query: string }) {
    if (!insights?.oracle) return <EmptyState icon={Brain} label="No AI Oracle data" sublabel="Search for a product to see price prediction signals" />;

    const oracle = insights.oracle;
    const cat = oracle.category;

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* AI PREDICTION BANNER */}
            <div style={{
                padding: 32, borderRadius: 24, position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg, ${oracle.badge_color}15, rgba(17, 17, 20, 0.95))`,
                border: `1px solid ${oracle.badge_color}30`,
                boxShadow: `0 10px 40px ${oracle.badge_color}10`,
            }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, background: `radial-gradient(circle, ${oracle.badge_color}15, transparent)`, borderRadius: '50%' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Brain size={18} color={oracle.badge_color} />
                        <span style={{ fontSize: 11, fontWeight: 800, color: oracle.badge_color, letterSpacing: 1.2 }}>AI MARKET PREDICTION</span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                        <span style={{ color: oracle.badge_color }}>{oracle.confidence}%</span> Confidence Score
                    </div>
                </div>

                {/* Platform/Product Identification Banner */}
                <a
                    href={oracle.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        padding: '10px 16px', borderRadius: 12, background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 10,
                        marginBottom: 24, textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                    }}
                >
                    <div style={{
                        width: 20, height: 20, borderRadius: 6, background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 3, flexShrink: 0
                    }}>
                        <img src={PLATFORM_CONFIG[oracle.platform as keyof typeof PLATFORM_CONFIG]?.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ fontSize: 11, color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        Predicting for <span style={{ color: '#fff', fontWeight: 600 }}>{oracle.product_title}</span> on <span style={{ color: PLATFORM_CONFIG[oracle.platform as keyof typeof PLATFORM_CONFIG]?.color || '#fff', fontWeight: 700 }}>{PLATFORM_CONFIG[oracle.platform as keyof typeof PLATFORM_CONFIG]?.name}</span>
                    </div>
                </a>

                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 24, marginBottom: 28 }}>
                    <div style={{
                        fontSize: 48, padding: 24, borderRadius: 24,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
                    }}>
                        {oracle.action === 'BUY_NOW' ? '⚡' : '⌛'}
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 36, fontWeight: 900, color: '#fff', letterSpacing: -1, lineHeight: 1 }}>
                            {oracle.action === 'BUY_NOW' ? 'BUY NOW' : 'WAIT'}
                        </div>
                        <div style={{ fontSize: 16, color: '#a1a1aa', marginTop: 12, lineHeight: 1.6 }}>{oracle.reason}</div>
                    </div>
                </div>

                {oracle.potential_savings > 0 && (
                    <div style={{
                        padding: '16px 20px', borderRadius: 16,
                        background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.15)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <TrendingDown size={18} color="#4ade80" />
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#e4e4e7' }}>Projected Savings if you wait:</span>
                        </div>
                        <span style={{ fontSize: 22, fontWeight: 900, color: '#4ade80' }}>~{symbol}{oracle.potential_savings.toFixed(0)}</span>
                    </div>
                )}
            </div>

            {/* MARKET CONTEXT TILES */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
                {/* Volatility */}
                <div style={{ padding: 20, borderRadius: 18, background: '#111114', border: '1px solid #1f1f24' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', marginBottom: 12, letterSpacing: 0.5 }}>MARKET VOLATILITY</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 24 }}>📈</div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: oracle.market_volatility === 'High' ? '#ef4444' : '#22c55e' }}>{oracle.market_volatility}</div>
                    </div>
                </div>

                {/* Category */}
                {cat && (
                    <div style={{ padding: 20, borderRadius: 18, background: '#111114', border: '1px solid #1f1f24' }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', marginBottom: 12, letterSpacing: 0.5 }}>ITEM CLASS</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ fontSize: 24 }}>{cat.icon}</div>
                            <div style={{ fontSize: 18, fontWeight: 800, color: cat.color }}>{cat.label}</div>
                        </div>
                    </div>
                )}

                {/* Surge */}
                <div style={{ padding: 20, borderRadius: 18, background: '#111114', border: '1px solid #1f1f24' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#71717a', marginBottom: 12, letterSpacing: 0.5 }}>SURGE RESILIENCE</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ fontSize: 24 }}>{oracle.surge.status === 'normal' ? '✅' : '🚨'}</div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: oracle.surge.status === 'normal' ? '#22c55e' : '#f59e0b' }}>
                            {oracle.surge.status === 'normal' ? 'Defensive' : 'Vulnerable'}
                        </div>
                    </div>
                </div>
            </div>

            {oracle.surge.status !== 'normal' && (
                <div style={{ padding: 20, borderRadius: 18, background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.15)', display: 'flex', gap: 12 }}>
                    <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: 14, color: '#a1a1aa', margin: 0 }}>{oracle.surge.tip}</p>
                </div>
            )}

            {/* SPEED TRADEOFF */}
            {oracle.tradeoff && (
                <div style={{
                    padding: 24, borderRadius: 24,
                    background: 'rgba(255,255,255,0.02)', border: '1px solid #1f1f24',
                    textAlign: 'center'
                }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#52525b', marginBottom: 16, letterSpacing: 1 }}>TIME REDUCTION OVERVIEW</div>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 40 }}>
                        <div>
                            <div style={{ fontSize: 12, color: '#71717a', marginBottom: 4 }}>Premium Cost</div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{symbol}{oracle.tradeoff.price_gap}</div>
                        </div>
                        <div style={{ height: 40, width: 1, background: '#3f3f46' }} />
                        <div>
                            <div style={{ fontSize: 12, color: '#71717a', marginBottom: 4 }}>Minutes Saved</div>
                            <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{oracle.tradeoff.time_gap_minutes}m</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


// ============================================================
// INLINE HYPER-LOCAL STOCK PULSE VIEW
// ============================================================
function InlineStockPulseView({ insights }: { insights: InsightsData | null }) {
    if (!insights?.stock_pulse) return <EmptyState icon={Activity} label="No Stock Pulse data" sublabel="Live stock tracking unavailable for this query" />;

    const pulse = insights.stock_pulse;

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            {/* ── PREDICTIVE STATUS HERO ── */}
            <div style={{
                padding: 40, borderRadius: 24, textAlign: 'center', position: 'relative', overflow: 'hidden',
                background: `linear-gradient(135deg, ${pulse.pulse_color}15, rgba(17,17,20,0.95))`,
                border: `1px solid ${pulse.pulse_color}30`
            }}>
                <div style={{ position: 'absolute', top: -50, left: -50, width: 150, height: 150, background: `radial-gradient(circle, ${pulse.pulse_color}15, transparent)`, borderRadius: '50%' }} />

                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                    <Activity size={18} color={pulse.pulse_color} />
                    <span style={{ fontSize: 11, fontWeight: 800, color: pulse.pulse_color, letterSpacing: 1.5 }}>LIVE INVENTORY PULSE</span>
                </div>

                <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', marginBottom: 12 }}>{pulse.overall_status.toUpperCase()}</div>
                <div style={{ fontSize: 16, color: '#a1a1aa', maxWidth: 500, margin: '0 auto' }}>
                    {pulse.global_stockout_alert || 'Inventory levels are stable across local delivery hubs.'}
                </div>
            </div>

            {/* ── HUB BREAKDOWN ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                {pulse.hubs.map((hub) => {
                    const config = PLATFORM_CONFIG[hub.platform];
                    return (
                        <div key={hub.platform} style={{
                            padding: 24, borderRadius: 20, background: '#111114', border: '1px solid #1f1f24',
                            position: 'relative', overflow: 'hidden'
                        }}>
                            {hub.is_vulnerable && (
                                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: '#ef4444' }} />
                            )}

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <div style={{
                                        padding: 10, borderRadius: 12, background: '#fff', border: `1px solid ${config?.color || '#333'}30`
                                    }}>
                                        <img src={config?.logoUrl} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{config?.name} Hub</div>
                                        <div style={{ fontSize: 12, color: '#71717a' }}>{hub.surge_forecast}</div>
                                    </div>
                                </div>
                                <div style={{
                                    padding: '4px 10px', borderRadius: 8, fontSize: 10, fontWeight: 800,
                                    background: hub.is_vulnerable ? '#ef444415' : '#22c55e15',
                                    color: hub.is_vulnerable ? '#ef4444' : '#22c55e',
                                    border: `1px solid ${hub.is_vulnerable ? '#ef444430' : '#22c55e30'}`
                                }}>
                                    {hub.is_vulnerable ? 'LOW STOCK' : 'IN STOCK'}
                                </div>
                            </div>

                            <div style={{ marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#52525b', marginBottom: 6 }}>
                                    <span>DEMAND INTENSITY</span>
                                    <span>{hub.stockout_probability}% Risk</span>
                                </div>
                                <div style={{ height: 6, background: 'rgba(255,255,255,0.03)', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', background: hub.is_vulnerable ? '#ef4444' : '#22c55e',
                                        width: `${hub.stockout_probability}%`, transition: 'width 1s ease'
                                    }} />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                    <div style={{ fontSize: 9, color: '#52525b', fontWeight: 800, letterSpacing: 0.5, marginBottom: 4 }}>EST. DEPLETION</div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{hub.predicted_stockout_time}</div>
                                </div>
                                <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.03)' }}>
                                    <div style={{ fontSize: 9, color: '#52525b', fontWeight: 800, letterSpacing: 0.5, marginBottom: 4 }}>SURGE RISK</div>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>Medium</div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}


// ============================================================
// INLINE LOCAL FLASH-POOL ENGINE VIEW
// ============================================================
function InlineCarbonView({ insights }: { insights: InsightsData | null }) {
    if (!insights?.carbon) return <EmptyState icon={Leaf} label="No Carbon data" sublabel="Sustainability tracking unavailable for this query" />;

    const carbon = insights.carbon;

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            {/* ── SUSTAINABILITY HERO ── */}
            <div style={{
                padding: 40, borderRadius: 24, textAlign: 'center', position: 'relative', overflow: 'hidden',
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(17, 17, 20, 0.95))',
                border: '1px solid rgba(34, 197, 94, 0.2)'
            }}>
                <div style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, background: 'radial-gradient(circle, rgba(34, 197, 94, 0.15), transparent)', borderRadius: '50%' }} />

                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                    <Leaf size={18} color="#22c55e" />
                    <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', letterSpacing: 1.5 }}>ENVIRONMENTAL IMPACT SCORE</span>
                </div>

                <div style={{ fontSize: 56, fontWeight: 900, color: '#fff', marginBottom: 12 }}>{carbon.total_avg_co2} <span style={{ fontSize: 24, color: '#71717a' }}>kg CO2e</span></div>
                <div style={{ fontSize: 16, color: '#a1a1aa', maxWidth: 500, margin: '0 auto' }}>
                    Average delivery emissions for this search. <span style={{ color: '#fff', fontWeight: 600 }}>{carbon.eco_friendly_count} paths</span> use electric vehicles.
                </div>
            </div>

            {/* ── PLATFORM BREAKDOWN ── */}
            <div style={{ display: 'grid', gap: 12 }}>
                {Object.values(carbon.by_platform).map((plat) => {
                    const config = PLATFORM_CONFIG[plat.platform];
                    const isBest = plat.platform === carbon.best_platform;

                    return (
                        <div key={plat.platform} style={{
                            padding: 20, borderRadius: 16, background: '#111114', border: isBest ? '1px solid #22c55e40' : '1px solid #1f1f24',
                            display: 'flex', alignItems: 'center', gap: 20, position: 'relative'
                        }}>
                            {isBest && (
                                <div style={{
                                    position: 'absolute', top: -10, right: 20, padding: '4px 10px',
                                    borderRadius: 8, background: '#22c55e', color: '#fff', fontSize: 10, fontWeight: 900
                                }}>
                                    MOST ECO-FRIENDLY
                                </div>
                            )}

                            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                                <img src={config?.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{config?.name}</div>
                                <div style={{ fontSize: 12, color: '#71717a', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    {plat.vehicle} • {plat.warehouse}
                                    {plat.is_ev && <span style={{ color: '#22c55e' }}>(EV Fleet)</span>}
                                </div>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 18, fontWeight: 800, color: plat.is_ev ? '#22c55e' : '#fff' }}>{plat.co2_kg} kg</div>
                                <div style={{ fontSize: 10, color: '#52525b', fontWeight: 600 }}>CARBON RADIUS: {plat.distance_km}km</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function InlineFlashPoolView({
    insights, onChatWithSeller, userResaleItems = [], onSellClick
}: {
    insights: InsightsData | null;
    onChatWithSeller?: (s: string, p: string) => void;
    userResaleItems?: any[];
    onSellClick?: () => void;
}) {
    const [joinedPools, setJoinedPools] = useState<Set<string>>(new Set());
    const [sharingPool, setSharingPool] = useState<string | null>(null);

    const handleJoin = (id: string) => {
        setJoinedPools(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const handleShare = (id: string) => {
        setSharingPool(id);
        setTimeout(() => setSharingPool(null), 2000);
    };

    if (!insights?.flash_pool) return <EmptyState icon={Users} label="No Flash-Pools active" sublabel="Start a pool or join neighbors to unlock discounts" />;

    const flash = insights.flash_pool;

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            {/* ── COMMUNITY STATUS ── */}
            <div style={{
                padding: '24px 32px', borderRadius: 24,
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.08), rgba(17, 17, 20, 0.95))',
                border: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: 'radial-gradient(circle, rgba(34, 197, 94, 0.1), transparent)', borderRadius: '50%' }} />

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative' }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 16, background: 'rgba(34, 197, 94, 0.1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(34, 197, 94, 0.2)'
                    }}>
                        <Users size={24} color="#22c55e" />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', boxShadow: '0 0 10px #22c55e', animation: 'pulse 2s infinite' }} />
                            <span style={{ fontSize: 18, fontWeight: 900, color: '#fff' }}>{flash.nearby_neighbors_online} Shopping Now</span>
                        </div>
                        <div style={{ fontSize: 13, color: '#a1a1aa', marginTop: 2 }}>Hyper-local purchase intent detected in your pincode</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right', position: 'relative' }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#52525b', letterSpacing: 1.5, marginBottom: 4 }}>HUB SAVINGS TODAY</div>
                    <div style={{ fontSize: 28, fontWeight: 950, color: '#4ade80', letterSpacing: -0.5 }}>₹{flash.global_savings_today}</div>
                </div>
            </div>

            {/* ── ACTIVE POOLS ── */}
            <div style={{ display: 'grid', gap: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Zap size={16} color="#f43f5e" />
                    <span style={{ fontSize: 12, fontWeight: 800, color: '#f43f5e', letterSpacing: 1 }}>ACTIVE FLASH-POOLS</span>
                </div>

                {flash.active_pools.map((pool) => {
                    const themeColor = pool.badge_color || '#f43f5e';
                    return (
                        <div key={pool.id} style={{
                            padding: 24, borderRadius: 24, position: 'relative', overflow: 'hidden',
                            background: `linear-gradient(135deg, ${themeColor}10, #0a0a0d)`,
                            border: `1px solid ${themeColor}30`,
                            boxShadow: `0 10px 30px ${themeColor}0a`
                        }}>
                            {/* Glow Background Element */}
                            <div style={{ position: 'absolute', top: -60, right: -60, width: 140, height: 140, background: `radial-gradient(circle, ${themeColor}20, transparent)`, borderRadius: '50%' }} />

                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 14, background: `${themeColor}15`,
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${themeColor}30`
                                    }}>
                                        <Sparkles size={24} color={themeColor} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', marginBottom: 4 }}>{pool.product_name}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#71717a' }}>
                                            <Clock size={14} /> Ends in <span style={{ color: themeColor, fontWeight: 800 }}>{pool.expiry_timer}</span>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{
                                        display: 'flex', flexDirection: 'column', alignItems: 'flex-end'
                                    }}>
                                        <span style={{ fontSize: 10, fontWeight: 800, color: '#52525b', letterSpacing: 1, marginBottom: 4 }}>UNLOCKED</span>
                                        <div style={{ background: themeColor, color: '#fff', padding: '6px 12px', borderRadius: 10, fontSize: 18, fontWeight: 950 }}>
                                            -{pool.discount_unlocked}%
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Progress Section */}
                            <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.03)', marginBottom: 20 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 800, color: '#71717a', marginBottom: 10 }}>
                                    <span style={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>{pool.neighbors_count} / {pool.goal_count} Neighbors Participating</span>
                                    <span style={{ color: '#fff' }}>NEXT TIER: -{pool.next_tier_discount}% OFF</span>
                                </div>
                                <div style={{ height: 8, background: '#111114', borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
                                    <div style={{
                                        height: '100%', background: themeColor,
                                        width: `${(pool.neighbors_count / pool.goal_count) * 100}%`,
                                        boxShadow: `0 0 15px ${themeColor}`,
                                        transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)'
                                    }} />
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                                <button
                                    onClick={() => handleJoin(pool.id)}
                                    style={{
                                        flex: 2, padding: '14px', borderRadius: 14, border: 'none',
                                        background: (pool.is_joined || joinedPools.has(pool.id)) ? 'rgba(255,255,255,0.05)' : themeColor,
                                        color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                        boxShadow: (pool.is_joined || joinedPools.has(pool.id)) ? 'none' : `0 8px 20px ${themeColor}33`
                                    }}
                                >
                                    {(pool.is_joined || joinedPools.has(pool.id)) ? <Check size={18} /> : <Zap size={18} fill="currentColor" />}
                                    {(pool.is_joined || joinedPools.has(pool.id)) ? 'POOL JOINED' : 'SECURE THIS DEAL'}
                                </button>
                                <button
                                    onClick={() => handleShare(pool.id)}
                                    style={{
                                        flex: 1, padding: '14px', borderRadius: 14, border: '1px solid #1f1f24',
                                        background: sharingPool === pool.id ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                                        color: sharingPool === pool.id ? '#22c55e' : '#a1a1aa', fontSize: 14, fontWeight: 700,
                                        cursor: 'pointer', transition: 'all 0.2s',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                    }}
                                >
                                    {sharingPool === pool.id ? <Check size={16} /> : 'SHARE'}
                                    {sharingPool === pool.id && <span style={{ fontSize: 10 }}>LINK COPIED</span>}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* ── LOCAL HUB STORES ── */}
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <Compass size={16} color="#06b6d4" />
                    <span style={{ fontSize: 11, fontWeight: 900, color: '#06b6d4', letterSpacing: 1.5 }}>DIRECT CAMPUS OUTLETS</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
                    {flash.local_stores.map((store, i) => (
                        <div key={i} style={{
                            padding: 24, borderRadius: 20, background: '#0a0a0d', border: '1px solid #1f1f24',
                            transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                                    {store.name.includes('Stationery') ? '✏️' : store.name.includes('Market') ? '🛒' : '🔌'}
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 18, fontWeight: 900, color: '#22c55e' }}>{store.avg_discount}</div>
                                    <div style={{ fontSize: 9, fontWeight: 800, color: '#52525b', letterSpacing: 0.5 }}>AVG. OFF</div>
                                </div>
                            </div>

                            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 12 }}>{store.name}</div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                                    <MapPin size={14} color="#f43f5e" style={{ marginTop: 2, flexShrink: 0 }} />
                                    <div style={{ fontSize: 12, color: '#a1a1aa', lineHeight: 1.4 }}>{store.location}</div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <Truck size={14} color="#06b6d4" style={{ flexShrink: 0 }} />
                                    <div style={{ fontSize: 12, color: '#a1a1aa' }}>{store.delivery} • <span style={{ color: '#06b6d4', fontWeight: 600 }}>{store.hours}</span></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── P2P RESALE DEALS (CAMPUS) ── */}
            {(flash.resale_items?.length > 0 || userResaleItems.length > 0) && (
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Users size={16} color="#8b5cf6" />
                            <span style={{ fontSize: 12, fontWeight: 800, color: '#8b5cf6', letterSpacing: 1 }}>P2P RESALE SHED (CAMPUS ONLY)</span>
                        </div>
                        <button
                            onClick={onSellClick}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 6,
                                padding: '6px 12px', borderRadius: 8, background: 'rgba(139, 92, 246, 0.1)',
                                border: '1px solid rgba(139, 92, 246, 0.2)', color: '#a78bfa',
                                fontSize: 11, fontWeight: 700, cursor: 'pointer'
                            }}
                        >
                            <PlusCircle size={14} /> List an Item
                        </button>
                    </div>
                    <div style={{ display: 'grid', gap: 12 }}>
                        {[...userResaleItems, ...flash.resale_items].map((item, idx) => (
                            <div key={item.id || idx} style={{
                                padding: 20, borderRadius: 18, background: '#111114', border: '1px solid #1f1f24',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                {/* New User Label for self-posted items */}
                                {idx < userResaleItems.length && (
                                    <div style={{
                                        position: 'absolute', top: 0, left: 0, padding: '2px 8px',
                                        background: '#8b5cf6', color: '#fff', fontSize: 9, fontWeight: 800
                                    }}>
                                        YOUR LISTING
                                    </div>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{
                                        width: 52, height: 52, borderRadius: 14, background: 'rgba(139, 92, 246, 0.1)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        fontSize: 24, border: '1px solid rgba(139, 92, 246, 0.2)'
                                    }}>
                                        {item.id?.includes('electronics') || item.id?.includes('phone') ? '💻' : item.id?.includes('calc') || item.category === 'stationery' ? '📚' : '📦'}
                                    </div>
                                    <div>
                                        <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{item.title}</div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: '#a78bfa', fontWeight: 700 }}>{item.condition}</span>
                                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: 'rgba(255,255,255,0.05)', color: '#a1a1aa', fontWeight: 700 }}>{item.hand_status}</span>
                                            <span style={{ fontSize: 10, color: '#52525b', marginLeft: 4 }}>{item.time_posted || 'Recently'}</span>
                                        </div>

                                        {/* Stylized Seller Info */}
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14, padding: '10px 14px', background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #8b5cf6, #6366f1)',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 900, color: '#fff'
                                            }}>
                                                {(item.seller_name || 'U')[0]}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontSize: 12, fontWeight: 800, color: '#e4e4e7' }}>{item.seller_name || 'Anonymous Student'}</span>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <MapPin size={10} color="#f43f5e" />
                                                    <span style={{ fontSize: 10, color: '#71717a' }}>{item.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 22, fontWeight: 950, color: '#fff', marginBottom: 10, letterSpacing: -0.5 }}>₹{item.price}</div>
                                    {idx < userResaleItems.length ? (
                                        <div style={{ padding: '8px 16px', borderRadius: 8, background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontSize: 11, fontWeight: 900, border: '1px solid rgba(34, 197, 94, 0.2)' }}>MY LISTING</div>
                                    ) : (
                                        <button
                                            onClick={() => onChatWithSeller?.(item.seller_name, item.title)}
                                            style={{
                                                padding: '10px 20px', borderRadius: 10, background: 'rgba(139, 92, 246, 0.1)',
                                                border: '1px solid rgba(139, 92, 246, 0.2)', color: '#a78bfa',
                                                fontSize: 13, fontWeight: 800, cursor: 'pointer', transition: 'all 0.2s',
                                                display: 'flex', alignItems: 'center', gap: 8
                                            }}
                                            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.2)')}
                                            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)')}
                                        >
                                            <MessageSquare size={16} /> Chat
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                    {flash.global_savings_today > 5000 && (
                        <div style={{
                            marginTop: 16, padding: '12px 16px', borderRadius: 12,
                            background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.15)',
                            display: 'flex', alignItems: 'center', gap: 10
                        }}>
                            <Leaf size={16} color="#22c55e" />
                            <span style={{ fontSize: 12, color: '#a1a1aa' }}>
                                Reselling helps the campus. <span style={{ color: '#4ade80', fontWeight: 600 }}>~5.2kg CO2</span> saved per item vs buying new.
                            </span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}


// ============================================================
// INLINE REVIEWS VIEW — THE NLP SENTIMENT HEATMAP
// ============================================================
function InlineReviewsView({ insights, query }: { insights: InsightsData | null; query: string }) {
    const [expandedPlatform, setExpandedPlatform] = useState<string | null>(null);
    const [showBotDetails, setShowBotDetails] = useState<Record<string, boolean>>({});

    if (!insights?.reviews?.sentiments?.length) return <EmptyState icon={Shield} label="No review data" sublabel="Search for a product to see review analysis" />;
    const reviews = insights.reviews;
    const heatmap = reviews.heatmap;
    const avgTrust = reviews.sentiments.reduce((sum, s) => sum + s.trust_score, 0) / reviews.sentiments.length;

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#22c55e';
        if (score >= 65) return '#4ade80';
        if (score >= 50) return '#facc15';
        if (score >= 35) return '#f59e0b';
        return '#ef4444';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'rgba(34, 197, 94, 0.15)';
        if (score >= 65) return 'rgba(74, 222, 128, 0.12)';
        if (score >= 50) return 'rgba(250, 204, 21, 0.12)';
        if (score >= 35) return 'rgba(245, 158, 11, 0.12)';
        return 'rgba(239, 68, 68, 0.12)';
    };

    const toggleBotDetails = (platform: string) => {
        setShowBotDetails(prev => ({ ...prev, [platform]: !prev[platform] }));
    };

    return (
        <div style={{ display: 'grid', gap: 20 }}>

            {/* ── Summary Stats ── */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                <StatCard label="Avg Trust Score" value={`${avgTrust.toFixed(1)}/5`} color="#06b6d4" />
                <StatCard label="Platforms Analyzed" value={`${reviews.sentiments.length}`} color="#f59e0b" />
                <StatCard label="Product Type" value={reviews.product_type || '—'} color="#22c55e" />
            </div>

            {/* ── CROSS-PLATFORM NLP SENTIMENT HEATMAP ── */}
            {heatmap && heatmap.rows.length > 0 && (
                <div style={{
                    padding: 20, borderRadius: 18, overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.06), rgba(6, 182, 212, 0.04))',
                    border: '1px solid rgba(99, 102, 241, 0.15)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                        <Brain size={16} color="#818cf8" />
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#818cf8', letterSpacing: 1.2 }}>📊 NLP SENTIMENT HEATMAP — ASPECT-BASED ANALYSIS</span>
                    </div>

                    {/* Heatmap Grid */}
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 2 }}>
                            <thead>
                                <tr>
                                    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: 10, fontWeight: 700, color: '#71717a', letterSpacing: 0.5 }}>ASPECT</th>
                                    {heatmap.platforms.map(p => (
                                        <th key={p} style={{ padding: '8px 6px', textAlign: 'center', fontSize: 10, fontWeight: 700, color: '#a1a1aa', letterSpacing: 0.3 }}>
                                            {(PLATFORM_CONFIG[p]?.name || p).split(' ')[0]}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {heatmap.rows.map((row) => (
                                    <tr key={row.aspect}>
                                        <td style={{ padding: '8px 12px', fontSize: 12, fontWeight: 600, color: '#d4d4d8', whiteSpace: 'nowrap' }}>
                                            <span style={{ marginRight: 6 }}>{row.icon}</span>{row.aspect}
                                        </td>
                                        {heatmap.platforms.map(p => {
                                            const score = row.scores[p];
                                            const isBest = p === row.best_platform;
                                            const isWorst = p === row.worst_platform;
                                            return (
                                                <td key={p} style={{
                                                    padding: '6px 4px', textAlign: 'center',
                                                    background: score ? getScoreBg(score) : 'rgba(255,255,255,0.02)',
                                                    borderRadius: 6,
                                                }}>
                                                    <div style={{
                                                        fontSize: 14, fontWeight: 800,
                                                        color: score ? getScoreColor(score) : '#3f3f46',
                                                    }}>
                                                        {score || '—'}
                                                    </div>
                                                    {isBest && <div style={{ fontSize: 8, color: '#22c55e', fontWeight: 700, marginTop: 1 }}>BEST</div>}
                                                    {isWorst && heatmap.platforms.length > 1 && <div style={{ fontSize: 8, color: '#ef4444', fontWeight: 700, marginTop: 1 }}>LOW</div>}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                                {/* Platform Average Row (Vertical) */}
                                <tr style={{ borderTop: '1px solid #1f1f24' }}>
                                    <td style={{ padding: '12px 12px', fontSize: 10, fontWeight: 800, color: '#71717a', letterSpacing: 1 }}>OVERALL</td>
                                    {heatmap.platforms.map(p => {
                                        const scores = heatmap.rows.map(r => r.scores[p]).filter(s => s !== undefined);
                                        const platformTotal = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                                        return (
                                            <td key={p} style={{
                                                padding: '10px 4px', textAlign: 'center',
                                                background: 'rgba(255,255,255,0.03)',
                                                borderRadius: '0 0 10px 10px',
                                            }}>
                                                <div style={{ fontSize: 14, fontWeight: 900, color: getScoreColor(platformTotal) }}>
                                                    {platformTotal || '—'}
                                                </div>
                                                <div style={{ fontSize: 7, color: '#52525b', fontWeight: 700, marginTop: 2 }}>SCORE</div>
                                            </td>
                                        );
                                    })}
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Heatmap Legend */}
                    <div style={{ display: 'flex', gap: 12, marginTop: 14, justifyContent: 'center' }}>
                        {[
                            { label: 'Excellent', color: '#22c55e', range: '80+' },
                            { label: 'Good', color: '#4ade80', range: '65-79' },
                            { label: 'Average', color: '#facc15', range: '50-64' },
                            { label: 'Below Avg', color: '#f59e0b', range: '35-49' },
                            { label: 'Poor', color: '#ef4444', range: '<35' },
                        ].map(l => (
                            <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: '#52525b' }}>
                                <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                                {l.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Label Warnings ── */}
            {reviews.label_warnings?.length > 0 && (
                <div style={{
                    padding: 20, borderRadius: 16,
                    background: 'rgba(245, 158, 11, 0.08)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <AlertTriangle size={16} color="#f59e0b" />
                        <span style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>LABEL WARNINGS</span>
                    </div>
                    {reviews.label_warnings.map((w, i) => (
                        <div key={i} style={{
                            padding: '10px 14px', borderRadius: 10, marginBottom: 6,
                            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                        }}>
                            <span style={{ fontSize: 13, color: '#e4e4e7' }}>{w.message}</span>
                            <span style={{
                                marginLeft: 8, fontSize: 10, padding: '2px 6px', borderRadius: 4,
                                background: w.severity === 'high' ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                                color: w.severity === 'high' ? '#ef4444' : '#f59e0b', fontWeight: 700,
                            }}>{w.severity}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Per-Platform Sentiment + ABSA + Bot Detection ── */}
            {reviews.sentiments.map((sentiment) => {
                const config = PLATFORM_CONFIG[sentiment.platform];
                const trustColor = sentiment.trust_score >= 4.0 ? '#22c55e' : sentiment.trust_score >= 3.0 ? '#f59e0b' : '#ef4444';
                const isExpanded = expandedPlatform === sentiment.platform;
                const bot = sentiment.bot_detection;
                const showBot = showBotDetails[sentiment.platform] ?? false;

                return (
                    <div key={sentiment.platform} style={{
                        borderRadius: 18, overflow: 'hidden',
                        background: '#111114', border: '1px solid #1f1f24',
                    }}>
                        {/* Platform Header */}
                        <div
                            onClick={() => setExpandedPlatform(isExpanded ? null : sentiment.platform)}
                            style={{
                                padding: 20, cursor: 'pointer',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span style={{ fontSize: 15, fontWeight: 700, color: '#e4e4e7' }}>{config?.name || sentiment.platform}</span>
                                {bot && (
                                    <span style={{
                                        fontSize: 9, padding: '3px 8px', borderRadius: 6,
                                        background: `${bot.alert_color}15`, border: `1px solid ${bot.alert_color}30`,
                                        color: bot.alert_color, fontWeight: 800, letterSpacing: 0.3,
                                    }}>
                                        {bot.alert_level === 'high' ? '🤖 BOT RISK' : bot.alert_level === 'medium' ? '🟡 CAUTION' : '✅ ORGANIC'}
                                    </span>
                                )}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <Shield size={14} color={trustColor} />
                                    <span style={{ fontSize: 14, fontWeight: 800, color: trustColor }}>{sentiment.trust_score}/5</span>
                                </div>
                                <ChevronRight size={16} color="#52525b" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                            </div>
                        </div>

                        {/* Expanded: ABSA Bars + Bot Detection */}
                        {isExpanded && (
                            <div style={{ padding: '0 20px 20px 20px', display: 'grid', gap: 16 }}>
                                <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.6 }}>{sentiment.summary}</p>

                                {/* ABSA Aspect Bars */}
                                {sentiment.aspect_scores && sentiment.aspect_scores.length > 0 && (
                                    <div>
                                        <div style={{ fontSize: 11, fontWeight: 700, color: '#6366f1', marginBottom: 10, letterSpacing: 0.5 }}>ASPECT-BASED SENTIMENT</div>
                                        {sentiment.aspect_scores.map((asp) => (
                                            <div key={asp.name} style={{ marginBottom: 10 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        <span style={{ fontSize: 13 }}>{asp.icon}</span>
                                                        <span style={{ fontSize: 12, fontWeight: 600, color: '#d4d4d8' }}>{asp.name}</span>
                                                        <span style={{ fontSize: 9, color: '#52525b' }}>({asp.total_mentions} mentions)</span>
                                                    </div>
                                                    <span style={{
                                                        fontSize: 13, fontWeight: 800,
                                                        color: getScoreColor(asp.score),
                                                    }}>{asp.score}</span>
                                                </div>
                                                {/* Score bar */}
                                                <div style={{ background: '#1a1a1e', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                                                    <div style={{
                                                        width: `${asp.score}%`, height: '100%', borderRadius: 4,
                                                        background: `linear-gradient(90deg, ${getScoreColor(asp.score)}cc, ${getScoreColor(asp.score)}55)`,
                                                        transition: 'width 0.5s ease',
                                                    }} />
                                                </div>
                                                {/* Sentiment distribution mini-bar */}
                                                <div style={{ display: 'flex', height: 3, borderRadius: 2, overflow: 'hidden', marginTop: 3 }}>
                                                    <div style={{ width: `${asp.positive_pct}%`, background: '#22c55e' }} />
                                                    <div style={{ width: `${asp.neutral_pct}%`, background: '#71717a' }} />
                                                    <div style={{ width: `${asp.negative_pct}%`, background: '#ef4444' }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Strengths & Concerns */}
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                    <div>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: '#22c55e', marginBottom: 6, display: 'block' }}>✅ Strengths</span>
                                        {sentiment.strengths.map((s, i) => (
                                            <div key={i} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)', fontSize: 11, color: '#4ade80', marginBottom: 4 }}>{s}</div>
                                        ))}
                                    </div>
                                    <div>
                                        <span style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', marginBottom: 6, display: 'block' }}>⚠️ Concerns</span>
                                        {sentiment.concerns.map((c, i) => (
                                            <div key={i} style={{ padding: '5px 10px', borderRadius: 6, background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.12)', fontSize: 11, color: '#fbbf24', marginBottom: 4 }}>{c}</div>
                                        ))}
                                    </div>
                                </div>

                                {/* Bot Detection Section */}
                                {bot && (
                                    <div style={{
                                        borderRadius: 14, overflow: 'hidden',
                                        background: `${bot.alert_color}08`,
                                        border: `1px solid ${bot.alert_color}20`,
                                    }}>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleBotDetails(sentiment.platform); }}
                                            style={{
                                                width: '100%', padding: '14px 16px', cursor: 'pointer',
                                                background: 'transparent', border: 'none',
                                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            }}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{ fontSize: 14 }}>🤖</span>
                                                <span style={{ fontSize: 12, fontWeight: 800, color: bot.alert_color, letterSpacing: 0.5 }}>BOT DETECTION — REVIEW AUTHENTICITY</span>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                <span style={{
                                                    fontSize: 11, padding: '3px 10px', borderRadius: 6, fontWeight: 800,
                                                    background: `${bot.alert_color}18`, color: bot.alert_color,
                                                }}>
                                                    Risk: {bot.risk_score}/100
                                                </span>
                                                <ChevronRight size={14} color="#52525b" style={{ transform: showBot ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
                                            </div>
                                        </button>

                                        {showBot && (
                                            <div style={{ padding: '0 16px 16px 16px', display: 'grid', gap: 12 }}>
                                                {/* Risk Score Gauge */}
                                                <div style={{ padding: 16, borderRadius: 12, background: 'rgba(0,0,0,0.3)' }}>
                                                    <div style={{ fontSize: 10, fontWeight: 700, color: '#71717a', marginBottom: 8, letterSpacing: 0.5 }}>REVIEW VOLATILITY INDEX</div>
                                                    <div style={{ background: '#1a1a1e', borderRadius: 6, height: 12, overflow: 'hidden', position: 'relative' }}>
                                                        {/* Threshold markers */}
                                                        <div style={{ position: 'absolute', left: '30%', top: 0, bottom: 0, width: 1, background: 'rgba(245,158,11,0.3)', zIndex: 1 }} />
                                                        <div style={{ position: 'absolute', left: '60%', top: 0, bottom: 0, width: 1, background: 'rgba(239,68,68,0.3)', zIndex: 1 }} />
                                                        <div style={{
                                                            width: `${bot.risk_score}%`, height: '100%', borderRadius: 6,
                                                            background: `linear-gradient(90deg, #22c55e, ${bot.risk_score > 30 ? '#f59e0b' : '#22c55e'}, ${bot.risk_score > 60 ? '#ef4444' : bot.risk_score > 30 ? '#f59e0b' : '#22c55e'})`,
                                                            transition: 'width 0.5s ease',
                                                        }} />
                                                    </div>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                                                        <span style={{ fontSize: 9, color: '#22c55e' }}>Organic</span>
                                                        <span style={{ fontSize: 9, color: '#f59e0b' }}>Caution</span>
                                                        <span style={{ fontSize: 9, color: '#ef4444' }}>Suspicious</span>
                                                    </div>
                                                </div>

                                                {/* Alert Label */}
                                                <div style={{
                                                    padding: '10px 14px', borderRadius: 10,
                                                    background: `${bot.alert_color}0a`,
                                                    fontSize: 13, fontWeight: 700, color: bot.alert_color,
                                                    textAlign: 'center',
                                                }}>
                                                    {bot.alert_label}
                                                </div>

                                                {/* Key Metrics */}
                                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                                                    <div style={{ padding: '8px 6px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                                                        <div style={{ fontSize: 14, fontWeight: 800, color: bot.five_star_pct > 70 ? '#ef4444' : bot.five_star_pct > 55 ? '#f59e0b' : '#22c55e' }}>{bot.five_star_pct}%</div>
                                                        <div style={{ fontSize: 9, color: '#52525b' }}>5-Star %</div>
                                                    </div>
                                                    <div style={{ padding: '8px 6px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                                                        <div style={{ fontSize: 14, fontWeight: 800, color: bot.verified_pct < 55 ? '#ef4444' : bot.verified_pct < 70 ? '#f59e0b' : '#22c55e' }}>{bot.verified_pct}%</div>
                                                        <div style={{ fontSize: 9, color: '#52525b' }}>Verified</div>
                                                    </div>
                                                    <div style={{ padding: '8px 6px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                                                        <div style={{ fontSize: 14, fontWeight: 800, color: bot.review_velocity > 8 ? '#ef4444' : bot.review_velocity > 4 ? '#f59e0b' : '#22c55e' }}>{bot.review_velocity}/d</div>
                                                        <div style={{ fontSize: 9, color: '#52525b' }}>Velocity</div>
                                                    </div>
                                                    <div style={{ padding: '8px 6px', borderRadius: 8, background: 'rgba(0,0,0,0.3)', textAlign: 'center' }}>
                                                        <div style={{ fontSize: 14, fontWeight: 800, color: '#06b6d4' }}>{bot.total_reviews.toLocaleString()}</div>
                                                        <div style={{ fontSize: 9, color: '#52525b' }}>Reviews</div>
                                                    </div>
                                                </div>

                                                {/* Detection Signals */}
                                                {bot.signals.length > 0 && (
                                                    <div>
                                                        <div style={{ fontSize: 10, fontWeight: 700, color: '#71717a', marginBottom: 8, letterSpacing: 0.5 }}>DETECTION SIGNALS</div>
                                                        {bot.signals.map((sig, i) => (
                                                            <div key={i} style={{
                                                                padding: '10px 12px', borderRadius: 10, marginBottom: 6,
                                                                background: sig.severity === 'high' ? 'rgba(239,68,68,0.06)' : sig.severity === 'medium' ? 'rgba(245,158,11,0.06)' : 'rgba(34,197,94,0.06)',
                                                                border: `1px solid ${sig.severity === 'high' ? 'rgba(239,68,68,0.15)' : sig.severity === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)'}`,
                                                            }}>
                                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 }}>
                                                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#e4e4e7' }}>
                                                                        {sig.icon} {sig.signal}
                                                                    </span>
                                                                    <span style={{
                                                                        fontSize: 9, padding: '2px 6px', borderRadius: 4, fontWeight: 800,
                                                                        background: sig.severity === 'high' ? 'rgba(239,68,68,0.15)' : sig.severity === 'medium' ? 'rgba(245,158,11,0.15)' : 'rgba(34,197,94,0.15)',
                                                                        color: sig.severity === 'high' ? '#ef4444' : sig.severity === 'medium' ? '#f59e0b' : '#22c55e',
                                                                    }}>{sig.severity.toUpperCase()} +{sig.contribution}</span>
                                                                </div>
                                                                <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.5 }}>{sig.detail}</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Recommendation */}
                                                <div style={{
                                                    padding: '10px 14px', borderRadius: 10,
                                                    background: 'rgba(6, 182, 212, 0.06)', border: '1px solid rgba(6, 182, 212, 0.12)',
                                                    fontSize: 12, color: '#67e8f9', lineHeight: 1.6,
                                                }}>
                                                    💡 {bot.recommendation}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
}




// ============================================================
// INLINE HISTORY VIEW — THE ANTICIPATORY AGENT
// ============================================================
function InlineHistoryView({
    searchHistory, onSearchClick, userPersona, smartReorder
}: {
    searchHistory: string[];
    onSearchClick?: (query: string) => void;
    userPersona?: string | null;
    smartReorder?: SmartReorderItem[];
}) {
    if (!searchHistory.length && (!smartReorder || smartReorder.length === 0)) {
        return <EmptyState icon={History} label="No search history" sublabel="Your searches will appear here" />;
    }

    const isEmergency = userPersona === 'The Emergency Buyer';

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* AI PERSONA HEADER */}
            <div style={{
                padding: '20px 24px', borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(6, 182, 212, 0.05))',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                display: 'flex', alignItems: 'center', gap: 16
            }}>
                <div style={{
                    width: 48, height: 48, borderRadius: 14,
                    background: 'rgba(139, 92, 246, 0.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    position: 'relative'
                }}>
                    <Brain size={24} color="#a78bfa" />
                    <div style={{
                        position: 'absolute', inset: -2, borderRadius: 16,
                        border: '2px solid #a78bfa', opacity: 0.4,
                        animation: 'personaPulse 2s ease-in-out infinite'
                    }} />
                </div>
                <div>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#a78bfa', letterSpacing: 1.5, marginBottom: 4 }}>IDENTIFIED PERSONA</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#fff', textTransform: 'uppercase' }}>
                        {userPersona || 'NEW SEARCH AGENT'}
                    </div>
                </div>
                <style>{`
                    @keyframes personaPulse {
                        0%, 100% { transform: scale(1); opacity: 0.4; }
                        50% { transform: scale(1.1); opacity: 0.1; }
                    }
                `}</style>
            </div>

            {/* SMART REORDER WIDGET */}
            {smartReorder && smartReorder.length > 0 && (
                <div style={{ padding: '0 4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                        <div style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', letterSpacing: 1 }}>✨ SMART REORDER</div>
                        <div style={{ height: 1, flex: 1, background: 'linear-gradient(90deg, #22c55e30, transparent)' }} />
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                        {smartReorder.map((item, idx) => (
                            <div key={idx} style={{
                                padding: 18, borderRadius: 16,
                                background: 'rgba(34, 197, 94, 0.05)',
                                border: '1px solid rgba(34, 197, 94, 0.15)',
                                position: 'relative', overflow: 'hidden'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                                    <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{item.item}</div>
                                    <div style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', background: '#22c55e15', padding: '4px 10px', borderRadius: 8 }}>
                                        {item.discount_pct}% OFF
                                    </div>
                                </div>
                                <div style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.5, marginBottom: 14 }}>
                                    {item.message}
                                </div>
                                <button
                                    onClick={() => onSearchClick?.(item.item)}
                                    style={{
                                        width: '100%', padding: '10px', borderRadius: 10,
                                        background: '#22c55e', color: '#fff', fontSize: 13, fontWeight: 700,
                                        border: 'none', cursor: 'pointer', transition: 'all 0.2s'
                                    }}
                                >
                                    Reorder from {item.platform}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* PREDICTIVE PREFETCHING INFO */}
            {isEmergency && (
                <div style={{
                    padding: '12px 16px', borderRadius: 12,
                    background: 'rgba(6, 182, 212, 0.05)',
                    border: '1px solid rgba(6, 182, 212, 0.2)',
                    fontSize: 12, color: '#67e8f9', display: 'flex', gap: 10, alignItems: 'center'
                }}>
                    <Zap size={16} color="#67e8f9" />
                    <span><strong>Anticipatory Mode:</strong> Results for health & electronics pre-warmed for instant access.</span>
                </div>
            )}

            {/* SEARCH HISTORY LIST */}
            <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: '#71717a', letterSpacing: 1, marginBottom: 12, paddingLeft: 4 }}>RECENT SEARCHES</div>
                <div style={{ display: 'grid', gap: 8 }}>
                    {searchHistory.map((q, i) => (
                        <button
                            key={i}
                            onClick={() => onSearchClick?.(q)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                width: '100%', padding: '16px 20px', borderRadius: 14,
                                border: '1px solid #1f1f24', cursor: 'pointer',
                                background: '#111114', color: '#e4e4e7',
                                fontSize: 14, fontWeight: 500, textAlign: 'left',
                                transition: 'all 0.2s',
                            }}
                        >
                            <History size={16} color="#71717a" />
                            <span style={{ flex: 1 }}>{q}</span>
                            <ChevronRight size={14} color="#3f3f46" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}


// ============================================================
// COMING SOON PLACEHOLDER
// ============================================================
function ComingSoonView({ icon: Icon, title, color, desc }: { icon: React.ElementType; title: string; color: string; desc: string }) {
    return (
        <div style={{ textAlign: 'center', padding: '80px 40px' }}>
            <div style={{
                width: 80, height: 80, borderRadius: 24,
                background: `${color}10`, border: `1px solid ${color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 24px',
            }}>
                <Icon size={36} color={color} />
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: '#e4e4e7', marginBottom: 8 }}>{title}</h3>
            <p style={{ fontSize: 14, color: '#52525b', maxWidth: 400, margin: '0 auto', lineHeight: 1.7 }}>{desc}</p>
            <div style={{
                marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 20px', borderRadius: 10,
                background: `${color}10`, border: `1px solid ${color}20`,
                fontSize: 12, fontWeight: 600, color: color,
            }}>
                <Zap size={14} /> Coming Soon
            </div>
        </div>
    );
}


// ============================================================
// SHARED COMPONENTS
// ============================================================

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
    return (
        <div style={{
            padding: '18px 16px', borderRadius: 14,
            background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)',
            textAlign: 'center',
        }}>
            <div style={{ fontSize: 22, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: '#52525b', marginTop: 4 }}>{label}</div>
        </div>
    );
}

function CouponRow({ coupon, symbol, copiedCode, onCopy }: {
    coupon: CouponData & { productId?: string }; symbol: string;
    copiedCode: string | null; onCopy: (code: string) => void;
}) {
    const config = PLATFORM_CONFIG[coupon.platform as keyof typeof PLATFORM_CONFIG];

    return (
        <div style={{
            padding: 18, borderRadius: 14,
            background: '#111114', border: '1px solid #1f1f24',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 16
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flex: 1 }}>
                {/* Platform Logo */}
                <div style={{
                    width: 40, height: 40, borderRadius: 10, background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 6, flexShrink: 0, border: `1px solid ${config?.color || '#333'}20`
                }}>
                    <img src={config?.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>

                <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                        <span style={{ fontSize: 13, fontWeight: 800, color: config?.color || '#fff' }}>{config?.name}</span>
                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#3f3f46' }} />
                        <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{coupon.discount}</span>
                    </div>
                    <div style={{ fontSize: 11, color: '#71717a' }}>
                        {coupon.for} • Min ₹{coupon.min_order} • Post-coupon: <span style={{ color: '#22c55e', fontWeight: 700 }}>{symbol}{coupon.post_coupon_price}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#3f3f46', marginTop: 4 }}>Expires: {coupon.expires}</div>
                </div>
            </div>

            {coupon.code ? (
                <button
                    onClick={() => onCopy(coupon.code!)}
                    style={{
                        padding: '10px 16px', borderRadius: 10,
                        background: copiedCode === coupon.code ? '#22c55e' : '#1f1f24',
                        border: `1px dashed ${copiedCode === coupon.code ? '#22c55e' : '#3f3f46'}`,
                        color: copiedCode === coupon.code ? '#000' : '#a1a1aa',
                        fontSize: 12, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4, letterSpacing: 1,
                        whiteSpace: 'nowrap'
                    }}
                >
                    {copiedCode === coupon.code ? <Check size={12} /> : <Copy size={12} />}
                    {copiedCode === coupon.code ? 'COPIED' : coupon.code}
                </button>
            ) : (
                <div style={{
                    padding: '8px 14px', borderRadius: 8,
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#818cf8', fontSize: 11, fontWeight: 800,
                    letterSpacing: 0.5, textTransform: 'uppercase'
                }}>Auto</div>
            )}
        </div>
    );
}

// ============================================================
// INLINE CART OPTIMIZER VIEW
// ============================================================
function InlineCartOptimizerView({ items, onRemove, onUpdateQuantity, onOptimize, symbol, isLoading }: {
    items: any[]; onRemove: (id: string) => void; onUpdateQuantity: (id: string, q: number) => void;
    onOptimize: () => void; symbol: string; isLoading?: boolean;
}) {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum, item) => sum + (item.product.price_breakdown.base_price * item.quantity), 0);

    if (items.length === 0) {
        return <EmptyState icon={ShoppingCart} label="Your bundle is empty" sublabel="Add products from search results to optimize them together" />;
    }

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            <div style={{
                padding: 24, borderRadius: 20, background: 'rgba(6, 182, 212, 0.05)',
                border: '1px solid rgba(6, 182, 212, 0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
            }}>
                <div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Optimizer Mode</h3>
                    <p style={{ fontSize: 13, color: '#71717a' }}>Analyzing {items.length} unique products across all platforms</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#06b6d4' }}>{symbol}{subtotal.toFixed(0)}</div>
                    <div style={{ fontSize: 11, color: '#52525b', fontWeight: 600, letterSpacing: 0.5 }}>CURRENT TOTAL</div>
                </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
                {items.map((item, i) => (
                    <div key={i} style={{
                        padding: 16, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24',
                        display: 'flex', alignItems: 'center', gap: 16
                    }}>
                        <div style={{ width: 48, height: 48, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 4 }}>
                            <img src={item.product.image_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{item.product.title}</div>
                            <div style={{ fontSize: 12, color: '#71717a' }}>{PLATFORM_CONFIG[item.product.platform as keyof typeof PLATFORM_CONFIG]?.name} • {symbol}{item.product.price_breakdown.base_price}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#18181b', borderRadius: 10, padding: 4, border: '1px solid #27272a' }}>
                            <button onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'none', color: '#fff', cursor: 'pointer' }}>-</button>
                            <span style={{ fontSize: 13, fontWeight: 600, width: 24, textAlign: 'center' }}>{item.quantity}</span>
                            <button onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)} style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: 'none', color: '#fff', cursor: 'pointer' }}>+</button>
                        </div>
                    </div>
                ))}
            </div>

            {items.length >= 2 && (
                <button
                    onClick={onOptimize}
                    disabled={isLoading}
                    style={{
                        padding: 20, borderRadius: 16, background: 'linear-gradient(135deg, #06b6d4, #6366f1)',
                        border: 'none', color: '#fff', fontSize: 16, fontWeight: 700, cursor: isLoading ? 'default' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                        boxShadow: '0 10px 30px rgba(6, 182, 212, 0.3)',
                        opacity: isLoading ? 0.8 : 1
                    }}
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                    {isLoading ? 'AI Analyzing Bundle...' : 'Deep Bundle Optimization (AI)'}
                </button>
            )}
        </div>
    );
}

// ============================================================
// INLINE FAVOURITES VIEW
// ============================================================
function InlineFavouritesView({ items, onToggleFavorite, symbol }: {
    items: any[]; onToggleFavorite: (id: any) => void; symbol: string;
}) {
    if (items.length === 0) {
        return <EmptyState icon={Heart} label="No favourites yet" sublabel="Heart any product in search results to save it here" />;
    }

    return (
        <div style={{ display: 'grid', gap: 12 }}>
            {items.map((product, i) => (
                <div key={i} style={{
                    padding: 16, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24',
                    display: 'flex', alignItems: 'center', gap: 16
                }}>
                    <div style={{ width: 60, height: 60, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                        <img src={product.image_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{product.title}</div>
                        <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 700 }}>{symbol}{product.price_breakdown.total_landed_cost.toFixed(0)}</div>
                    </div>
                    <button
                        onClick={() => onToggleFavorite(product)}
                        style={{
                            width: 36, height: 36, borderRadius: 10, border: 'none',
                            background: 'rgba(244, 63, 94, 0.1)', color: '#f43f5e', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <Heart size={18} fill="#f43f5e" />
                    </button>
                    <a href={product.url} target="_blank" rel="noopener noreferrer" style={{
                        padding: '8px 16px', borderRadius: 8, background: '#1f1f24', border: '1px solid #27272a',
                        color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none'
                    }}>
                        Visit
                    </a>
                </div>
            ))}
        </div>
    );
}

// ============================================================
// INLINE SAVED COMPARES VIEW
// ============================================================
function InlineSavedView({ groups, onToggleSave, symbol }: {
    groups: any[]; onToggleSave: (group: any) => void; symbol: string;
}) {
    if (groups.length === 0) {
        return <EmptyState icon={Bookmark} label="No saved compares" sublabel="Bookmark any search result group to revisit it later" />;
    }

    return (
        <div style={{ display: 'grid', gap: 16 }}>
            {groups.map((group, i) => (
                <div key={i} style={{
                    padding: 20, borderRadius: 18, background: '#111114', border: '1px solid #1f1f24',
                    display: 'flex', alignItems: 'center', gap: 20
                }}>
                    <div style={{ width: 64, height: 64, borderRadius: 14, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                        <img src={group.best_price.image_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{group.canonical_title}</div>
                        <div style={{ fontSize: 13, color: '#71717a' }}>{group.products.length} store offers starting at <span style={{ color: '#22c55e', fontWeight: 700 }}>{symbol}{group.best_price.price_breakdown.total_landed_cost.toFixed(0)}</span></div>
                    </div>
                    <button
                        onClick={() => onToggleSave(group)}
                        style={{
                            width: 40, height: 40, borderRadius: 10, border: 'none',
                            background: 'rgba(99, 102, 241, 0.1)', color: '#818cf8', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <Bookmark size={20} fill="#818cf8" />
                    </button>
                </div>
            ))}
        </div>
    );
}
// ============================================================
// INLINE PRICE ALERTS VIEW
// ============================================================
function InlinePriceAlertsView({ items, onToggleAlert, symbol }: {
    items: any[]; onToggleAlert: (id: any) => void; symbol: string;
}) {
    if (items.length === 0) {
        return <EmptyState icon={Bell} label="No price alerts" sublabel="Set a price alert on any product to get notified when the price drops" />;
    }

    return (
        <div style={{ display: 'grid', gap: 12 }}>
            {items.map((product, i) => (
                <div key={i} style={{
                    padding: 16, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24',
                    display: 'flex', alignItems: 'center', gap: 16
                }}>
                    <div style={{ width: 60, height: 60, borderRadius: 12, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                        <img src={product.image_url} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{product.title}</div>
                        <div style={{ fontSize: 12, color: '#f59e0b', fontWeight: 700 }}>Alert set for {symbol}{product.price_breakdown.total_landed_cost.toFixed(0)}</div>
                    </div>
                    <button
                        onClick={() => onToggleAlert(product)}
                        style={{
                            width: 36, height: 36, borderRadius: 10, border: 'none',
                            background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <Bell size={18} fill="#f59e0b" />
                    </button>
                    <a href={product.url} target="_blank" rel="noopener noreferrer" style={{
                        padding: '8px 16px', borderRadius: 8, background: '#1f1f24', border: '1px solid #27272a',
                        color: '#fff', fontSize: 12, fontWeight: 600, textDecoration: 'none'
                    }}>
                        Visit
                    </a>
                </div>
            ))}
        </div>
    );
}
// ============================================================
// SELL ITEM MODAL
// ============================================================
function SellItemModal({ onClose, onSell }: { onClose: () => void; onSell: (item: any) => void }) {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState('');
    const [condition, setCondition] = useState('Like New');
    const [location, setLocation] = useState('Hostel Block K');

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
            <div style={{
                width: '100%', maxWidth: 460, background: '#111114',
                border: '1px solid #1f1f24', borderRadius: 24, padding: 32,
                boxShadow: '0 40px 100px rgba(0,0,0,0.8)'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(139, 92, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Package size={20} color="#a78bfa" />
                        </div>
                        <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>List Item for Sale</h2>
                    </div>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#52525b' }}>
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'grid', gap: 20 }}>
                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#52525b', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>PRODUCT TITLE</label>
                        <input
                            value={title} onChange={e => setTitle(e.target.value)}
                            placeholder="e.g. Mechanical Keyboard"
                            style={{ width: '100%', background: '#050507', border: '1px solid #1f1f24', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 14, outline: 'none' }}
                        />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#52525b', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>PRICE (₹)</label>
                            <input
                                value={price} onChange={e => setPrice(e.target.value)}
                                placeholder="1200"
                                style={{ width: '100%', background: '#050507', border: '1px solid #1f1f24', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 14, outline: 'none' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#52525b', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>CONDITION</label>
                            <select
                                value={condition} onChange={e => setCondition(e.target.value)}
                                style={{ width: '100%', background: '#050507', border: '1px solid #1f1f24', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 14, outline: 'none' }}
                            >
                                <option>Like New</option>
                                <option>Gently Used</option>
                                <option>Fair</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#52525b', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>LOCATION</label>
                        <input
                            value={location} onChange={e => setLocation(e.target.value)}
                            placeholder="e.g. Hostel Block K"
                            style={{ width: '100%', background: '#050507', border: '1px solid #1f1f24', borderRadius: 12, padding: '14px 16px', color: '#fff', fontSize: 14, outline: 'none' }}
                        />
                    </div>

                    <div style={{ marginTop: 8, padding: 16, borderRadius: 12, background: 'rgba(34, 197, 94, 0.05)', border: '1px solid rgba(34, 197, 94, 0.1)' }}>
                        <div style={{ fontSize: 12, color: '#4ade80', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Leaf size={14} /> Eco-Contribution
                        </div>
                        <div style={{ fontSize: 11, color: '#71717a', marginTop: 4 }}>
                            Listing this item saves ~5.2kg of CO2 vs someone buying a new one.
                        </div>
                    </div>

                    <button
                        disabled={!title || !price}
                        onClick={() => onSell({
                            id: `user_${Date.now()}`,
                            title,
                            price: parseInt(price),
                            condition,
                            location,
                            hand_status: '2nd Hand',
                            seller_name: 'You',
                            time_posted: 'Just now'
                        })}
                        style={{
                            width: '100%', padding: '16px', borderRadius: 14, background: '#8b5cf6',
                            color: '#fff', fontSize: 15, fontWeight: 800, border: 'none', cursor: 'pointer',
                            marginTop: 10, opacity: (!title || !price) ? 0.5 : 1
                        }}
                    >
                        List Item Successfully
                    </button>
                </div>
            </div>
        </div>
    );
}
function EmptyState({ icon: Icon, label, sublabel }: { icon: React.ElementType; label: string; sublabel: string }) {
    return (
        <div style={{
            padding: '60px 40px', textAlign: 'center', background: 'rgba(255,255,255,0.02)',
            borderRadius: 24, border: '1px dashed rgba(255,255,255,0.1)'
        }}>
            <div style={{
                width: 64, height: 64, borderRadius: 20, background: 'rgba(255,255,255,0.03)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px'
            }}>
                <Icon size={32} color="#3f3f46" />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{label}</h3>
            <p style={{ fontSize: 14, color: '#52525b', maxWidth: 300, margin: '0 auto' }}>{sublabel}</p>
        </div>
    );
}
