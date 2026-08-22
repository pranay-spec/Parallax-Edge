'use client';

import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, ArrowRight, ShieldCheck, Zap, Users, Brain, ShoppingBag, Clock, ChevronRight, ChevronDown, Eye, CheckCircle2, CornerDownRight } from 'lucide-react';
import { tokens } from '@/styles/tokens';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';
import InteractivePriceChart from './InteractivePriceChart';

interface DecisionDashboardProps {
    symbol?: string;
    onNavigate: (section: string) => void;
    onOptimizeCart?: () => void;
}

export default function DecisionDashboard({ symbol = '₹', onNavigate, onOptimizeCart }: DecisionDashboardProps) {
    const [actionApplied, setActionApplied] = useState(false);
    const [showSavingsDrivers, setShowSavingsDrivers] = useState(false);
    const [showTrustDrivers, setShowTrustDrivers] = useState(false);

    const handleTakeAction = () => {
        setActionApplied(true);
        setTimeout(() => {
            if (onOptimizeCart) {
                onOptimizeCart();
            } else {
                onNavigate('cart');
            }
        }, 600);
    };

    return (
        <div style={{ marginBottom: 40 }}>
            {/* SECTION 1: ⚡ TODAY'S OVERVIEW (KPI CARDS WITH PROGRESSIVE DISCLOSURE) */}
            <div style={{ marginBottom: 24 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Zap size={18} color="#06b6d4" />
                        <h2 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -0.3 }}>
                            TODAY'S OVERVIEW
                        </h2>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', padding: '4px 10px', borderRadius: 20, border: '1px solid rgba(34, 197, 94, 0.2)' }}>
                        ● Live AI Pulse Active
                    </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                    {/* KPI 1: Savings with Progressive Disclosure */}
                    <div style={{
                        padding: '18px 20px', borderRadius: 16, background: '#111114',
                        border: '1px solid #1f1f24', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#71717a' }}>SAVINGS IDENTIFIED</span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', background: 'rgba(34, 197, 94, 0.15)', padding: '2px 8px', borderRadius: 6 }}>+24%</span>
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>{symbol}14,850</div>
                        
                        {/* Progressive Disclosure Toggle Button (Level 2: Why?) */}
                        <button
                            onClick={() => setShowSavingsDrivers(!showSavingsDrivers)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, padding: '4px 0',
                                background: 'transparent', border: 'none', color: '#06b6d4', fontSize: 12, fontWeight: 700,
                                cursor: 'pointer', outline: 'none'
                            }}
                        >
                            <span>Why? (Driver Breakdown)</span>
                            {showSavingsDrivers ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {/* Expandable Progressive Disclosure Tree */}
                        {showSavingsDrivers && (
                            <div style={{
                                marginTop: 12, paddingTop: 12, borderTop: '1px dashed #27272a',
                                fontSize: 12, color: '#a1a1aa'
                            }}>
                                <div style={{ fontWeight: 700, color: '#e4e4e7', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <CornerDownRight size={12} color="#06b6d4" /> Savings Drivers:
                                </div>
                                <div style={{ paddingLeft: 12, borderLeft: '2px solid #27272a', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>├── Price Oracle Drops</span>
                                        <strong style={{ color: '#22c55e' }}>+{symbol}6,000</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>├── Coupon Stacking</span>
                                        <strong style={{ color: '#22c55e' }}>+{symbol}4,850</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>└── Flash Pools Group Buy</span>
                                        <strong style={{ color: '#22c55e' }}>+{symbol}4,000</strong>
                                    </div>
                                </div>

                                {/* Level 3: Actionable Details Link */}
                                <button
                                    onClick={() => onNavigate('oracle')}
                                    style={{
                                        width: '100%', marginTop: 12, padding: '6px 10px', borderRadius: 8,
                                        background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)',
                                        color: '#06b6d4', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    View Detailed Analysis →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* KPI 2: Trust Index with Progressive Disclosure */}
                    <div style={{
                        padding: '18px 20px', borderRadius: 16, background: '#111114',
                        border: '1px solid #1f1f24', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#71717a' }}>AI TRUST INDEX</span>
                            <ShieldCheck size={16} color="#06b6d4" />
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: '#06b6d4', letterSpacing: -0.5 }}>94%</div>

                        <button
                            onClick={() => setShowTrustDrivers(!showTrustDrivers)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 4, marginTop: 8, padding: '4px 0',
                                background: 'transparent', border: 'none', color: '#06b6d4', fontSize: 12, fontWeight: 700,
                                cursor: 'pointer', outline: 'none'
                            }}
                        >
                            <span>Why? (Trust Drivers)</span>
                            {showTrustDrivers ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        </button>

                        {showTrustDrivers && (
                            <div style={{
                                marginTop: 12, paddingTop: 12, borderTop: '1px dashed #27272a',
                                fontSize: 12, color: '#a1a1aa'
                            }}>
                                <div style={{ fontWeight: 700, color: '#e4e4e7', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <CornerDownRight size={12} color="#06b6d4" /> Authentic Reviews:
                                </div>
                                <div style={{ paddingLeft: 12, borderLeft: '2px solid #27272a', display: 'flex', flexDirection: 'column', gap: 6 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>├── Verified Buyers</span>
                                        <strong style={{ color: '#06b6d4' }}>+58 Reviews</strong>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <span>└── Bot/Fake Detected</span>
                                        <strong style={{ color: '#ef4444' }}>-5 Blocked</strong>
                                    </div>
                                </div>

                                <button
                                    onClick={() => onNavigate('community')}
                                    style={{
                                        width: '100%', marginTop: 12, padding: '6px 10px', borderRadius: 8,
                                        background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)',
                                        color: '#06b6d4', fontSize: 11, fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    View Cohort Intelligence →
                                </button>
                            </div>
                        )}
                    </div>

                    {/* KPI 3: Price Alerts */}
                    <div style={{
                        padding: '18px 20px', borderRadius: 16, background: '#111114',
                        border: '1px solid #1f1f24', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#71717a' }}>PRICE TRACKERS</span>
                            <span style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', background: 'rgba(239, 68, 68, 0.15)', padding: '2px 8px', borderRadius: 6 }}>3 Drops</span>
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', letterSpacing: -0.5 }}>12 Active</div>
                        <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>Sony XM5 & MacBook Air flagged</div>
                    </div>

                    {/* KPI 4: Flash Pools */}
                    <div style={{
                        padding: '18px 20px', borderRadius: 16, background: '#111114',
                        border: '1px solid #1f1f24', position: 'relative', overflow: 'hidden'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: '#71717a' }}>NEARBY POOLS</span>
                            <Users size={16} color="#c084fc" />
                        </div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: '#c084fc', letterSpacing: -0.5 }}>4 Active</div>
                        <div style={{ fontSize: 11, color: '#a1a1aa', marginTop: 4 }}>Up to 35% group discount</div>
                    </div>
                </div>
            </div>

            {/* SECTION 1.5: 📈 INTERACTIVE PRICE HISTORY & ANOMALY CHART */}
            <div style={{ marginBottom: 28 }}>
                <InteractivePriceChart symbol={symbol} />
            </div>

            {/* SECTION 2: 🧠 ACTIONABLE AI INSIGHT LAYER ("Needs Attention") */}
            <div style={{
                padding: '24px 28px', borderRadius: 20, marginBottom: 28,
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(147, 51, 234, 0.12) 100%)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.3)',
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
                    <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                            <span style={{ padding: '4px 10px', borderRadius: 8, background: '#ef4444', color: '#fff', fontSize: 11, fontWeight: 900, letterSpacing: 0.5 }}>
                                ⚠️ NEEDS ATTENTION
                            </span>
                            <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 600 }}>
                                🧠 Parallax AI Insight • High Impact Recommendation
                            </span>
                        </div>

                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 8px', lineHeight: 1.3 }}>
                            Price drop detected on 2 saved items in your cart
                        </h3>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginTop: 14 }}>
                            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <div style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Likely Reason</div>
                                <div style={{ fontSize: 13, color: '#e4e4e7', fontWeight: 600, marginTop: 2 }}>
                                    Flipkart flash sale ending in <strong>3 hrs 45 mins</strong>
                                </div>
                            </div>
                            <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0, 0, 0, 0.3)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                                <div style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', fontWeight: 700 }}>Recommended Action</div>
                                <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 700, marginTop: 2 }}>
                                    Lock in {symbol}6,000 savings via One-Tap Optimization
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, alignSelf: 'center' }}>
                        <button
                            onClick={handleTakeAction}
                            style={{
                                padding: '14px 24px', borderRadius: 14,
                                background: actionApplied ? '#22c55e' : 'linear-gradient(135deg, #ef4444, #9333ea)',
                                color: '#fff', border: 'none', fontWeight: 800, fontSize: 14,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                                boxShadow: '0 6px 20px rgba(239, 68, 68, 0.35)', transition: 'all 0.2s'
                            }}
                        >
                            {actionApplied ? (
                                <> <CheckCircle2 size={18} /> Action Applied! </>
                            ) : (
                                <> <Zap size={18} /> Take Action Now → </>
                            )}
                        </button>

                        <button
                            onClick={() => onNavigate('oracle')}
                            style={{
                                padding: '10px 18px', borderRadius: 12,
                                background: 'rgba(255, 255, 255, 0.06)', color: '#a1a1aa',
                                border: '1px solid rgba(255, 255, 255, 0.1)', fontWeight: 600, fontSize: 12,
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                            }}
                        >
                            <Eye size={14} /> View AI Evidence
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
