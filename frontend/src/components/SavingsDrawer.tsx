'use client';

import { useState, useEffect } from 'react';
import {
    X, Tag, Clock, MessageSquare, MapPin, Users,
    ChevronRight, Zap, TrendingDown, Shield, AlertTriangle,
    Bike, Truck, Copy, Check, Star, Map, Brain, Activity, Leaf
} from 'lucide-react';
import {
    InsightsData, CouponData, PLATFORM_CONFIG
} from '@/types';
import LocalSupplyMap from './LocalSupplyMap';

interface SavingsDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    insights: InsightsData | null;
    symbol: string;
    query: string;
    initialTab?: string;
    pincode?: string;
}

const TABS = [
    { id: 'coupons', label: 'Coupons', icon: Tag, color: '#f59e0b' },
    { id: 'oracle', label: 'Oracle', icon: Brain, color: '#8b5cf6' },
    { id: 'stock_pulse', label: 'Stock Pulse', icon: Activity, color: '#ef4444' },
    { id: 'carbon', label: 'Green Edge', icon: Leaf, color: '#22c55e' },
    { id: 'reviews', label: 'Reviews', icon: MessageSquare, color: '#06b6d4' },
    { id: 'flash_pool', label: 'Flash Pool', icon: Users, color: '#f43f5e' },
    { id: 'supplymap', label: 'Supply Map', icon: Map, color: '#3b82f6' },
] as const;

type TabId = typeof TABS[number]['id'];

export default function SavingsDrawer({ isOpen, onClose, insights, symbol, query, initialTab, pincode }: SavingsDrawerProps) {
    const [activeTab, setActiveTab] = useState<TabId>('coupons');
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    // Sync tab when opened from sidebar
    useEffect(() => {
        if (initialTab && TABS.some(t => t.id === initialTab)) {
            setActiveTab(initialTab as TabId);
        }
    }, [initialTab, isOpen]);

    if (!insights) return null;

    const handleCopy = (code: string) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
                    zIndex: 999, opacity: isOpen ? 1 : 0,
                    pointerEvents: isOpen ? 'auto' : 'none',
                    transition: 'opacity 0.3s ease',
                }}
            />

            {/* Drawer */}
            <div style={{
                position: 'fixed', top: 0, right: 0, bottom: 0,
                width: 520, maxWidth: '95vw',
                background: 'linear-gradient(180deg, #0c0c10 0%, #08080c 100%)',
                borderLeft: '1px solid #1f1f24',
                zIndex: 1000,
                transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
                transition: 'transform 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                display: 'flex', flexDirection: 'column',
                boxShadow: isOpen ? '-20px 0 80px rgba(0,0,0,0.5)' : 'none',
            }}>
                {/* Header */}
                <div style={{
                    padding: '24px 28px 0', borderBottom: '1px solid #1a1a1e',
                }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <div>
                            <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 6,
                                padding: '4px 12px', marginBottom: 8,
                                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(139, 92, 246, 0.15))',
                                border: '1px solid rgba(245, 158, 11, 0.25)', borderRadius: 50,
                                fontSize: 11, fontWeight: 700, color: '#fbbf24', letterSpacing: 0.5,
                            }}>
                                ✨ SMART SAVINGS ENGINE
                            </div>
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>
                                Savings Insights
                            </h2>
                            <p style={{ fontSize: 13, color: '#52525b', marginTop: 4 }}>for &quot;{query}&quot;</p>
                        </div>
                        <button
                            onClick={onClose}
                            style={{
                                width: 40, height: 40, borderRadius: 12,
                                background: '#18181b', border: '1px solid #27272a',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer', color: '#71717a',
                            }}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Tab Strip */}
                    <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 0 }}>
                        {TABS.map(tab => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 6,
                                        padding: '10px 14px', borderRadius: '10px 10px 0 0',
                                        border: 'none', cursor: 'pointer',
                                        background: isActive
                                            ? `linear-gradient(180deg, ${tab.color}15, transparent)`
                                            : 'transparent',
                                        borderBottom: isActive ? `2px solid ${tab.color}` : '2px solid transparent',
                                        color: isActive ? tab.color : '#52525b',
                                        fontSize: 12, fontWeight: isActive ? 700 : 500,
                                        transition: 'all 0.2s ease',
                                        whiteSpace: 'nowrap',
                                    }}
                                >
                                    <Icon size={14} />
                                    {tab.label}
                                    {tab.id === 'coupons' && insights.coupons.total_coupons_found > 0 && (
                                        <span style={{
                                            width: 18, height: 18, borderRadius: '50%',
                                            background: tab.color, color: '#000',
                                            fontSize: 10, fontWeight: 800,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}>
                                            {insights.coupons.total_coupons_found}
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Content */}
                <div style={{ flex: 1, overflow: 'auto', padding: '24px 28px' }}>
                    {activeTab === 'coupons' && <CouponsTab insights={insights} symbol={symbol} copiedCode={copiedCode} onCopy={handleCopy} />}
                    {activeTab === 'oracle' && <OracleTab insights={insights} symbol={symbol} />}
                    {activeTab === 'stock_pulse' && <StockPulseTab insights={insights} />}
                    {activeTab === 'carbon' && <CarbonTab insights={insights} />}
                    {activeTab === 'reviews' && <ReviewsTab insights={insights} query={query} />}
                    {activeTab === 'flash_pool' && <FlashPoolTab insights={insights} />}
                    {activeTab === 'supplymap' && <LocalSupplyMap pincode={pincode || '560001'} query={query} />}
                </div>
            </div>
        </>
    );
}


// ============================================================
// TAB 1: COUPONS & REWARDS
// ============================================================
function CouponsTab({ insights, symbol, copiedCode, onCopy }: {
    insights: InsightsData; symbol: string; copiedCode: string | null; onCopy: (code: string) => void;
}) {
    const allCoupons: (CouponData & { productId: string })[] = [];
    Object.entries(insights.coupons.by_product).forEach(([productId, coupons]) => {
        coupons.forEach(c => allCoupons.push({ ...c, productId }));
    });

    // Separate auto-apply and manual
    const autoCoupons = allCoupons.filter(c => c.auto_apply);
    const manualCoupons = allCoupons.filter(c => !c.auto_apply);

    if (allCoupons.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Tag size={48} color="#27272a" />
                <p style={{ fontSize: 16, fontWeight: 600, color: '#52525b', marginTop: 16 }}>No coupons available</p>
                <p style={{ fontSize: 13, color: '#3f3f46', marginTop: 8 }}>We&apos;re always scanning for the latest deals</p>
            </div>
        );
    }

    return (
        <div>
            {/* Best Coupon Highlight */}
            {insights.coupons.best_coupon && (
                <div style={{
                    padding: 20, borderRadius: 16, marginBottom: 24,
                    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.04))',
                    border: '1px solid rgba(245, 158, 11, 0.25)',
                    position: 'relative', overflow: 'hidden',
                }}>
                    <div style={{
                        position: 'absolute', top: -20, right: -20, width: 80, height: 80,
                        background: 'radial-gradient(circle, rgba(245, 158, 11, 0.15), transparent)',
                        borderRadius: '50%',
                    }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                        <Zap size={14} color="#f59e0b" />
                        <span style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', letterSpacing: 0.5 }}>
                            🏆 BEST SAVINGS
                        </span>
                    </div>
                    <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                        Save {symbol}{insights.coupons.best_coupon.estimated_savings.toFixed(0)}
                    </div>
                    <div style={{ fontSize: 14, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontWeight: 700, color: '#fff' }}>{PLATFORM_CONFIG[insights.coupons.best_coupon.platform as keyof typeof PLATFORM_CONFIG]?.name}</span>
                        <span style={{ width: 3, height: 3, borderRadius: '50%', background: '#3f3f46' }} />
                        {insights.coupons.best_coupon.discount} — {insights.coupons.best_coupon.for}
                    </div>
                    {insights.coupons.best_coupon.code && (
                        <button
                            onClick={() => onCopy(insights.coupons.best_coupon!.code!)}
                            style={{
                                marginTop: 12, display: 'flex', alignItems: 'center', gap: 8,
                                padding: '10px 16px', borderRadius: 10,
                                background: '#f59e0b', border: 'none',
                                color: '#000', fontSize: 13, fontWeight: 700,
                                cursor: 'pointer', letterSpacing: 1,
                            }}
                        >
                            {copiedCode === insights.coupons.best_coupon.code ? <Check size={14} /> : <Copy size={14} />}
                            {copiedCode === insights.coupons.best_coupon.code ? 'COPIED!' : insights.coupons.best_coupon.code}
                        </button>
                    )}
                    {insights.coupons.best_coupon.auto_apply && (
                        <div style={{
                            marginTop: 10, fontSize: 11, color: '#4ade80',
                            display: 'flex', alignItems: 'center', gap: 4,
                        }}>
                            <Check size={12} /> Auto-Applied at Checkout
                        </div>
                    )}
                </div>
            )}

            {/* Auto-Apply Section */}
            {autoCoupons.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Zap size={12} /> AUTO-APPLIED FOR NEW USERS
                    </div>
                    {autoCoupons.map((coupon, i) => (
                        <CouponCard key={i} coupon={coupon} symbol={symbol} copiedCode={copiedCode} onCopy={onCopy} />
                    ))}
                </div>
            )}

            {/* Bank & Manual Offers */}
            {manualCoupons.length > 0 && (
                <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', marginBottom: 12 }}>
                        💳 BANK & PROMO OFFERS
                    </div>
                    {manualCoupons.map((coupon, i) => (
                        <CouponCard key={i} coupon={coupon} symbol={symbol} copiedCode={copiedCode} onCopy={onCopy} />
                    ))}
                </div>
            )}
        </div>
    );
}

function CouponCard({ coupon, symbol, copiedCode, onCopy }: {
    coupon: CouponData & { productId?: string }; symbol: string;
    copiedCode: string | null; onCopy: (code: string) => void;
}) {
    const config = PLATFORM_CONFIG[coupon.platform as keyof typeof PLATFORM_CONFIG];

    return (
        <div style={{
            padding: 16, borderRadius: 12, marginBottom: 10,
            background: '#111114', border: '1px solid #1f1f24',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            gap: 12
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
                <div style={{
                    width: 36, height: 36, borderRadius: 10, background: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: 6, flexShrink: 0
                }}>
                    <img src={config?.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff', marginBottom: 2 }}>
                        <span style={{ color: config?.color || '#fff' }}>{config?.name}</span> • {coupon.discount}
                    </div>
                    <div style={{ fontSize: 11, color: '#71717a' }}>
                        {coupon.for} • Min ₹{coupon.min_order} • Post-coupon: <span style={{ color: '#22c55e', fontWeight: 700 }}>{symbol}{coupon.post_coupon_price}</span>
                    </div>
                    <div style={{ fontSize: 10, color: '#3f3f46', marginTop: 4 }}>
                        Expires: {coupon.expires}
                    </div>
                </div>
            </div>
            {coupon.code ? (
                <button
                    onClick={() => onCopy(coupon.code!)}
                    style={{
                        padding: '8px 14px', borderRadius: 8,
                        background: copiedCode === coupon.code ? '#22c55e' : '#1f1f24',
                        border: `1px dashed ${copiedCode === coupon.code ? '#22c55e' : '#3f3f46'}`,
                        color: copiedCode === coupon.code ? '#000' : '#a1a1aa',
                        fontSize: 11, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4,
                        letterSpacing: 1,
                    }}
                >
                    {copiedCode === coupon.code ? <Check size={12} /> : <Copy size={12} />}
                    {copiedCode === coupon.code ? 'COPIED' : coupon.code}
                </button>
            ) : (
                <div style={{
                    padding: '8px 12px', borderRadius: 8,
                    background: 'rgba(99, 102, 241, 0.1)',
                    color: '#818cf8', fontSize: 11, fontWeight: 600
                }}>
                    Auto
                </div>
            )}
        </div>
    );
}


// ============================================================
// TAB 2: AI PRICE ORACLE
// ============================================================
function OracleTab({ insights, symbol }: { insights: InsightsData; symbol: string }) {
    const oracle = insights.oracle;

    if (!oracle || (!oracle.action)) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Clock size={48} color="#27272a" />
                <p style={{ fontSize: 16, fontWeight: 600, color: '#52525b', marginTop: 16 }}>No AI Oracle data</p>
            </div>
        );
    }

    const surgeColors: Record<string, string> = {
        high_demand: '#ef4444',
        moderate_demand: '#f59e0b',
        limited_availability: '#a855f7',
        normal: '#22c55e',
    };

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* AI PREDICTION CARD */}
            <div style={{
                padding: 24, borderRadius: 20,
                background: `linear-gradient(135deg, ${oracle.badge_color}15, rgba(0,0,0,0.5))`,
                border: `1px solid ${oracle.badge_color}30`,
                position: 'relative', overflow: 'hidden'
            }}>
                <div style={{ position: 'absolute', top: -20, right: -20, width: 90, height: 90, background: `radial-gradient(circle, ${oracle.badge_color}20, transparent)`, borderRadius: '50%' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ padding: '6px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.05)', fontSize: 10, fontWeight: 800, color: '#71717a', letterSpacing: 1 }}>AI BUY SIGNAL</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: oracle.badge_color }}>{oracle.confidence}% Certainty</div>
                </div>

                {/* Identity Banner */}
                <a
                    href={oracle.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                        padding: '8px 12px', borderRadius: 10, background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8,
                        marginBottom: 20, textDecoration: 'none', cursor: 'pointer', transition: 'all 0.2s ease'
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
                        width: 18, height: 18, borderRadius: 5, background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 3, flexShrink: 0
                    }}>
                        <img src={PLATFORM_CONFIG[oracle.platform as keyof typeof PLATFORM_CONFIG]?.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ fontSize: 10, color: '#71717a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        <span style={{ color: '#fff' }}>{PLATFORM_CONFIG[oracle.platform as keyof typeof PLATFORM_CONFIG]?.name}</span> • {oracle.product_title}
                    </div>
                </a>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                    <div style={{
                        fontSize: 32, padding: 16, borderRadius: 16,
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)'
                    }}>{oracle.action === 'BUY_NOW' ? '⚡' : '⌛'}</div>
                    <div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>{oracle.action === 'BUY_NOW' ? 'BUY NOW' : 'WAIT FOR DROP'}</div>
                        <div style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>{oracle.reason}</div>
                    </div>
                </div>

                {oracle.potential_savings > 0 && (
                    <div style={{
                        padding: '12px 16px', borderRadius: 12,
                        background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                    }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#4ade80' }}>Predicted Price Drop:</span>
                        <span style={{ fontSize: 18, fontWeight: 900, color: '#4ade80' }}>~{symbol}{oracle.potential_savings}</span>
                    </div>
                )}
            </div>

            {/* MARKET METRICS */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div style={{ padding: 16, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#52525b', marginBottom: 6, letterSpacing: 0.5 }}>MARKET VOLATILITY</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: oracle.market_volatility === 'High' ? '#ef4444' : '#22c55e' }}>{oracle.market_volatility}</div>
                </div>
                <div style={{ padding: 16, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24' }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: '#52525b', marginBottom: 6, letterSpacing: 0.5 }}>ITEM CATEGORY</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{oracle.category.label}</div>
                </div>
            </div>

            {/* SURGE RESILIENCE */}
            {oracle.surge.status !== 'normal' && (
                <div style={{
                    padding: 20, borderRadius: 16,
                    background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)',
                    display: 'flex', gap: 14
                }}>
                    <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
                    <p style={{ fontSize: 13, color: '#fbbf24', lineHeight: 1.5, margin: 0 }}>{oracle.surge.tip}</p>
                </div>
            )}

            {/* SPEED-PRICE TRADEOFF */}
            {oracle.tradeoff && (
                <div style={{ padding: 20, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24' }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', marginBottom: 12, letterSpacing: 0.5 }}>TIME-VALUE TRADE-OFF</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <div style={{ fontSize: 11, color: '#52525b' }}>Price Premium</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{symbol}{oracle.tradeoff.price_gap}</div>
                        </div>
                        <div style={{ height: 24, width: 1, background: '#1f1f24' }} />
                        <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: 11, color: '#52525b' }}>Time Saved</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>{oracle.tradeoff.time_gap_minutes}m</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


// ============================================================
// TAB 3: HYPER-LOCAL STOCK PULSE
// ============================================================
function StockPulseTab({ insights }: { insights: InsightsData }) {
    const pulse = insights.stock_pulse;

    if (!pulse || !pulse.hubs) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <Activity size={48} color="#27272a" />
                <p style={{ fontSize: 16, fontWeight: 600, color: '#52525b', marginTop: 16 }}>No pulse data</p>
            </div>
        );
    }

    return (
        <div style={{ display: 'grid', gap: 20 }}>
            {/* Status Banner */}
            <div style={{
                padding: 24, borderRadius: 20,
                background: `linear-gradient(135deg, ${pulse.pulse_color}15, rgba(0,0,0,0.5))`,
                border: `1px solid ${pulse.pulse_color}30`,
                textAlign: 'center'
            }}>
                <div style={{ fontSize: 11, fontWeight: 800, color: pulse.pulse_color, letterSpacing: 1, marginBottom: 8 }}>PREDICTIVE STOCK STATUS</div>
                <div style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>{pulse.overall_status.toUpperCase()}</div>
                <div style={{ fontSize: 13, color: '#a1a1aa', marginTop: 4 }}>{pulse.global_stockout_alert || 'Inventory levels within safety margins'}</div>
            </div>

            {/* Platform Breakdown */}
            <div style={{ display: 'grid', gap: 12 }}>
                {pulse.hubs.map((hub) => {
                    const config = PLATFORM_CONFIG[hub.platform];
                    return (
                        <div key={hub.platform} style={{
                            padding: 16, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24',
                            display: 'flex', alignItems: 'center', gap: 16
                        }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: 12, background: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                            }}>
                                <img src={config?.logoUrl} style={{ width: 24, height: 24, objectFit: 'contain' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                    <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{config?.name} Hub</span>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: hub.is_vulnerable ? '#ef4444' : '#22c55e' }}>
                                        {hub.is_vulnerable ? 'VULNERABLE' : 'HEALTHY'}
                                    </span>
                                </div>
                                <div style={{ height: 4, background: '#1f1f24', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{
                                        height: '100%', background: hub.is_vulnerable ? '#ef4444' : '#22c55e',
                                        width: `${100 - hub.stockout_probability}%`
                                    }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: '#71717a' }}>
                                    <span>{hub.predicted_stockout_time} to stockout</span>
                                    <span>{hub.surge_forecast}</span>
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
// TAB 4: CARBON FOOTPRINT
// ============================================================
function CarbonTab({ insights }: { insights: InsightsData }) {
    if (!insights.carbon) return null;
    const carbon = insights.carbon;

    return (
        <div style={{ padding: '0 4px', animation: 'fadeIn 0.4s ease' }}>
            <div style={{ marginBottom: 28 }}>
                <div style={{
                    padding: 32, borderRadius: 24, textAlign: 'center', position: 'relative', overflow: 'hidden',
                    background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(17, 17, 20, 0.95))',
                    border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                        <Leaf size={18} color="#22c55e" />
                        <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', letterSpacing: 1.5 }}>GREEN EDGE SCORE</span>
                    </div>
                    <div style={{ fontSize: 48, fontWeight: 900, color: '#fff', marginBottom: 12 }}>{carbon.total_avg_co2} <span style={{ fontSize: 20, color: '#71717a' }}>kg CO2e</span></div>
                    <p style={{ fontSize: 14, color: '#a1a1aa' }}>Average emissions for delivery paths in this comparison.</p>
                </div>
            </div>

            <div style={{ display: 'grid', gap: 12 }}>
                {Object.values(carbon.by_platform).map((plat) => {
                    const config = PLATFORM_CONFIG[plat.platform];
                    const isBest = plat.platform === carbon.best_platform;

                    return (
                        <div key={plat.platform} style={{
                            padding: 20, borderRadius: 16, background: '#111114', border: isBest ? '1px solid #22c55e40' : '1px solid #1f1f24',
                            display: 'flex', alignItems: 'center', gap: 16, position: 'relative'
                        }}>
                            {isBest && (
                                <div style={{ position: 'absolute', top: -10, right: 16, padding: '4px 10px', borderRadius: 8, background: '#22c55e', color: '#fff', fontSize: 10, fontWeight: 900 }}>ECO-PICK</div>
                            )}
                            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 8 }}>
                                <img src={config?.logoUrl} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{config?.name}</div>
                                <div style={{ fontSize: 11, color: '#71717a' }}>{plat.vehicle} • {plat.warehouse}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 16, fontWeight: 800, color: plat.is_ev ? '#22c55e' : '#fff' }}>{plat.co2_kg} kg</div>
                                <div style={{ fontSize: 10, color: '#52525b' }}>{plat.distance_km} km</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================
// TAB 5: REVIEWS & SENTIMENT
// ============================================================
function ReviewsTab({ insights, query }: { insights: InsightsData; query: string }) {
    const reviews = insights.reviews;

    if (!reviews || reviews.sentiments.length === 0) {
        return (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                <MessageSquare size={48} color="#27272a" />
                <p style={{ fontSize: 16, fontWeight: 600, color: '#52525b', marginTop: 16 }}>No review data</p>
            </div>
        );
    }

    return (
        <div>
            {/* Product Type Tag */}
            <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '6px 14px', borderRadius: 8,
                background: 'rgba(6, 182, 212, 0.1)',
                border: '1px solid rgba(6, 182, 212, 0.2)',
                marginBottom: 20, fontSize: 12, fontWeight: 600, color: '#06b6d4',
            }}>
                <Shield size={12} /> Sentiment Analysis: {reviews.product_type}
            </div>

            {/* Platform Sentiments */}
            {reviews.sentiments.map((sentiment, i) => {
                const config = PLATFORM_CONFIG[sentiment.platform];
                return (
                    <div key={i} style={{
                        padding: 18, borderRadius: 14, marginBottom: 12,
                        background: '#111114', border: '1px solid #1f1f24',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <div style={{
                                width: 28, height: 28, borderRadius: 8, background: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                border: `2px solid ${config?.color || '#333'}`,
                            }}>
                                <img
                                    src={config?.logoUrl || ''}
                                    alt={config?.name}
                                    style={{ width: 18, height: 18, objectFit: 'contain' }}
                                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                />
                            </div>
                            <span style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>
                                {config?.name || sentiment.platform}
                            </span>
                            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
                                <Star size={12} fill="#facc15" color="#facc15" />
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#facc15' }}>
                                    {sentiment.trust_score}/5
                                </span>
                            </div>
                        </div>

                        <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.6, marginBottom: 12, fontStyle: 'italic' }}>
                            &quot;{sentiment.summary}&quot;
                        </p>

                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                            {sentiment.strengths.slice(0, 2).map((s, j) => (
                                <span key={j} style={{
                                    padding: '4px 10px', borderRadius: 6,
                                    background: 'rgba(34, 197, 94, 0.08)',
                                    border: '1px solid rgba(34, 197, 94, 0.15)',
                                    fontSize: 11, color: '#4ade80',
                                }}>
                                    ✓ {s}
                                </span>
                            ))}
                            {sentiment.concerns.slice(0, 1).map((c, j) => (
                                <span key={j} style={{
                                    padding: '4px 10px', borderRadius: 6,
                                    background: 'rgba(239, 68, 68, 0.08)',
                                    border: '1px solid rgba(239, 68, 68, 0.15)',
                                    fontSize: 11, color: '#f87171',
                                }}>
                                    ⚠ {c}
                                </span>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Label-Lie Warnings */}
            {reviews.label_warnings.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <AlertTriangle size={12} /> LABEL-LIE DETECTOR
                    </div>
                    {reviews.label_warnings.map((warning, i) => (
                        <div key={i} style={{
                            padding: 14, borderRadius: 12,
                            background: warning.severity === 'warning'
                                ? 'rgba(245, 158, 11, 0.08)'
                                : 'rgba(99, 102, 241, 0.06)',
                            border: warning.severity === 'warning'
                                ? '1px solid rgba(245, 158, 11, 0.2)'
                                : '1px solid rgba(99, 102, 241, 0.15)',
                            marginBottom: 8,
                        }}>
                            <p style={{ fontSize: 13, color: '#d4d4d8', lineHeight: 1.6 }}>
                                {warning.message}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}


// ============================================================
// TAB 5: FLASH POOL / LOCAL DEALS
// ============================================================
function FlashPoolTab({ insights }: { insights: InsightsData }) {
    const flash = insights.flash_pool;

    return (
        <div style={{ display: 'grid', gap: 24 }}>
            {/* Global Context */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{flash.nearby_neighbors_online} Neighbors Shopping Live</span>
                </div>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#4ade80' }}>₹{flash.global_savings_today} Community Savings Today</div>
            </div>

            {/* Active Pools */}
            {flash.active_pools.length > 0 && (
                <div style={{ display: 'grid', gap: 14 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#52525b', letterSpacing: 1 }}>ACTIVE FLASH-POOLS</div>
                    {flash.active_pools.map((pool) => (
                        <div key={pool.id} style={{
                            padding: 20, borderRadius: 18,
                            background: `linear-gradient(135deg, ${pool.badge_color}15, #111114)`,
                            border: `1px solid ${pool.badge_color}30`,
                            position: 'relative', overflow: 'hidden'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                                <div>
                                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{pool.product_name}</div>
                                    <div style={{ fontSize: 12, color: '#a1a1aa' }}>Ends in {pool.expiry_timer}</div>
                                </div>
                                <div style={{ padding: '4px 10px', borderRadius: 8, background: 'rgba(255,255,255,0.05)', fontSize: 14, fontWeight: 800, color: pool.badge_color }}>
                                    -{pool.discount_unlocked}%
                                </div>
                            </div>

                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, fontWeight: 700, color: '#71717a', marginBottom: 6 }}>
                                    <span>{pool.neighbors_count}/{pool.goal_count} JOINED</span>
                                    <span>Next Tier: -{pool.next_tier_discount}%</span>
                                </div>
                                <div style={{ height: 6, background: 'rgba(0,0,0,0.3)', borderRadius: 3, overflow: 'hidden' }}>
                                    <div style={{ height: '100%', background: pool.badge_color, width: `${(pool.neighbors_count / pool.goal_count) * 100}%` }} />
                                </div>
                            </div>

                            <button style={{
                                width: '100%', padding: '12px', borderRadius: 12, border: 'none',
                                background: pool.badge_color, color: '#fff', fontSize: 13, fontWeight: 700,
                                cursor: 'pointer', transition: 'transform 0.2s'
                            }}>
                                {pool.is_joined ? 'ALREADY IN POOL' : 'JOIN FLASH-POOL'}
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {/* Local Stores */}
            {flash.local_stores.length > 0 && (
                <div style={{ display: 'grid', gap: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#52525b', letterSpacing: 1 }}>HUB-STORES (NO WAIT)</div>
                    {flash.local_stores.map((store, i) => (
                        <div key={i} style={{ padding: 16, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                                <span style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{store.name}</span>
                                <span style={{ fontSize: 12, fontWeight: 800, color: '#22c55e' }}>{store.avg_discount}</span>
                            </div>
                            <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#71717a' }}>
                                <span>📍 {store.location}</span>
                                <span>•</span>
                                <span>🚚 {store.delivery}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
