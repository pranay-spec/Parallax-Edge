'use client';

import { useState, useEffect } from 'react';
import {
    Search, Battery, Wrench, Shield, TrendingUp, ShoppingCart,
    Clock, Loader2, Zap, Package, AlertTriangle, ChevronRight,
    DollarSign, Calendar, Star, ArrowDown, ArrowRight, Sparkles
} from 'lucide-react';

interface PurchaseSimulationProps {
    symbol: string;
    compact?: boolean;
    queryOverride?: string;
}

interface SimulationData {
    productName: string;
    purchasePrice: number;
    timeframe: string;
    ownershipScore: number;
    verdict: string;
    verdictColor: string;
    degradation: {
        name: string;
        emoji: string;
        current: string;
        after: string;
        severity: 'low' | 'medium' | 'high';
        color: string;
    }[];
    likelyExpenses: {
        item: string;
        emoji: string;
        cost: number;
        when: string;
        necessity: 'essential' | 'recommended' | 'optional';
    }[];
    resaleValue: number;
    resalePercent: number;
    realCost: number;
    insights: string[];
    monthlyBreakdown: number;
}


const SCAN_STAGES = [
    { label: 'Analyzing product lifecycle...', icon: '🔍' },
    { label: 'Predicting wear & degradation...', icon: '📉' },
    { label: 'Calculating hidden expenses...', icon: '💸' },
    { label: 'Estimating resale trajectory...', icon: '📊' },
    { label: 'Computing total ownership cost...', icon: '🧮' },
];

export default function PurchaseSimulation({ symbol, compact = false, queryOverride }: PurchaseSimulationProps) {
    const [query, setQuery] = useState(queryOverride || '');
    const [scanning, setScanning] = useState(false);
    const [scanStage, setScanStage] = useState(-1);
    const [result, setResult] = useState<SimulationData | null>(null);
    const [showAllExpenses, setShowAllExpenses] = useState(false);
    const [hasAutoRun, setHasAutoRun] = useState(false);

    useEffect(() => {
        if (queryOverride && !hasAutoRun) {
            setHasAutoRun(true);
            handleSimulate(queryOverride);
        }
    }, [queryOverride, hasAutoRun]);

    const handleSimulate = async (overrideQuery?: string) => {
        const q = (overrideQuery || query).toLowerCase().trim();
        if (!q) return;

        setScanning(true);
        setScanStage(0);
        setResult(null);
        setShowAllExpenses(false);

        // Start LLM fetch
        const fetchPromise = fetch('http://localhost:8000/api/oracle/purchase-simulation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: q })
        }).then(res => {
            if (!res.ok) throw new Error('Failed to fetch');
            return res.json();
        });

        // Start scanning animation
        const durations = [800, 1000, 900, 800, 700];
        let stage = 0;
        const runStages = () => new Promise<void>(resolve => {
            const advance = () => {
                stage++;
                if (stage < SCAN_STAGES.length) {
                    setScanStage(stage);
                    setTimeout(advance, durations[stage]);
                } else {
                    resolve();
                }
            };
            setTimeout(advance, durations[0]);
        });

        try {
            const [data] = await Promise.all([fetchPromise, runStages()]);
            setResult(data);
            setScanning(false);
            setScanStage(-1);
        } catch (error) {
            console.error(error);
            setScanning(false);
            setScanStage(-1);
        }
    };

    const necessityColors: Record<string, { bg: string; text: string; label: string }> = {
        essential: { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', label: 'Essential' },
        recommended: { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', label: 'Recommended' },
        optional: { bg: 'rgba(113, 113, 122, 0.12)', text: '#71717a', label: 'Optional' },
    };

    const severityWidth: Record<string, number> = { low: 85, medium: 60, high: 35 };

    const visibleExpenses = result
        ? showAllExpenses ? result.likelyExpenses : result.likelyExpenses.slice(0, 4)
        : [];
    const totalExpenses = result
        ? result.likelyExpenses.reduce((sum, e) => sum + e.cost, 0)
        : 0;

    return (
        <div style={{ maxWidth: compact ? '100%' : 900, margin: compact ? '0' : '0 auto', paddingBottom: compact ? 16 : 80 }}>
            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulseGlow { 0%,100% { box-shadow: 0 0 20px rgba(139,92,246,0.2); } 50% { box-shadow: 0 0 40px rgba(139,92,246,0.4); } }
            `}</style>

            {/* Header */}
            {!compact && (
                <div style={{ marginBottom: 32 }}>
                    <div style={{
                        padding: '28px 32px', borderRadius: 20,
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.12), rgba(236, 72, 153, 0.06))',
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        position: 'relative', overflow: 'hidden',
                    }}>
                        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15), transparent)' }} />
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14, position: 'relative' }}>
                            <div style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: 'rgba(139,92,246,0.18)', border: '1px solid rgba(139,92,246,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <Sparkles size={24} color="#a78bfa" />
                            </div>
                            <div>
                                <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>AI Purchase Simulation</h1>
                                <p style={{ fontSize: 14, color: '#71717a', margin: '4px 0 0' }}>Predict your total cost of ownership before you buy</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            {!compact && (
                <div style={{
                    display: 'flex', gap: 12, marginBottom: 24,
                    padding: 20, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24',
                }}>
                    <input
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSimulate()}
                        placeholder="Enter product name (e.g., MacBook Air, iPhone 15)"
                    style={{
                        flex: 1, padding: '14px 18px', borderRadius: 12,
                        background: '#0a0a0f', border: '1px solid #27272a',
                        color: '#fff', fontSize: 15, outline: 'none',
                    }}
                />
                <button
                    onClick={() => handleSimulate()}
                    disabled={scanning}
                    style={{
                        padding: '14px 28px', borderRadius: 12,
                        background: scanning ? '#27272a' : 'linear-gradient(135deg, #8b5cf6, #a78bfa)',
                        border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
                        cursor: scanning ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8,
                    }}
                >
                    {scanning ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={18} />}
                    Simulate
                </button>
            </div>
            )}

            {/* Quick Demos */}
            {!compact && !result && !scanning && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 32 }}>
                    {['MacBook Air M4', 'iPhone 15', 'Gaming Laptop'].map(demo => (
                        <button
                            key={demo}
                            onClick={() => { setQuery(demo); handleSimulate(demo); }}
                            style={{
                                padding: '10px 18px', borderRadius: 10,
                                background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)',
                                color: '#a78bfa', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                                transition: 'all 0.2s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.15)'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(139,92,246,0.08)'; }}
                        >
                            Try: {demo}
                        </button>
                    ))}
                </div>
            )}

            {/* Scanning Animation */}
            {scanning && (
                <div style={{ padding: 28, borderRadius: 20, background: '#111114', border: '1px solid #1f1f24' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: '#a78bfa', marginBottom: 20, letterSpacing: 1 }}>
                        🧠 AI OWNERSHIP PREDICTION ENGINE
                    </div>
                    <div style={{ display: 'grid', gap: 10 }}>
                        {SCAN_STAGES.map((stage, i) => {
                            const isActive = scanStage === i;
                            const isDone = scanStage > i;
                            const isPending = scanStage < i;
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '12px 16px', borderRadius: 12,
                                    background: isDone ? 'rgba(139,92,246,0.06)' : isActive ? 'rgba(255,255,255,0.03)' : 'transparent',
                                    border: `1px solid ${isDone ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.03)'}`,
                                    opacity: isPending ? 0.3 : 1, transition: 'all 0.4s ease',
                                }}>
                                    <div style={{ fontSize: 18, width: 28, textAlign: 'center' }}>
                                        {isDone ? '✅' : isActive ? stage.icon : '⏳'}
                                    </div>
                                    <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: isDone ? '#e4e4e7' : isActive ? '#a1a1aa' : '#52525b' }}>
                                        {stage.label}
                                    </div>
                                    {isActive && (
                                        <div style={{ width: 16, height: 16, border: '2px solid', borderColor: '#a78bfa transparent transparent transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Results */}
            {result && (
                <div style={{ display: 'grid', gap: 20, animation: 'fadeSlideUp 0.5s ease' }}>

                    {/* Hero: Real Cost */}
                    <div style={{
                        padding: compact ? 16 : 32, borderRadius: 24, position: 'relative', overflow: 'hidden',
                        background: 'linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.06), rgba(6,182,212,0.04))',
                        border: '1px solid rgba(139,92,246,0.25)',
                        animation: 'pulseGlow 3s ease-in-out infinite',
                    }}>
                        <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'radial-gradient(circle, rgba(139,92,246,0.12), transparent)', borderRadius: '50%' }} />

                        <div style={{ fontSize: 11, fontWeight: 800, color: '#a78bfa', letterSpacing: 1.2, marginBottom: compact ? 10 : 20 }}>
                            🧠 AI PURCHASE SIMULATION — {result.timeframe}
                        </div>

                        {!compact && (
                            <div style={{ fontSize: 18, fontWeight: 700, color: '#e4e4e7', marginBottom: 6 }}>{result.productName}</div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: compact ? 12 : 24, flexWrap: 'wrap', marginBottom: compact ? 16 : 24 }}>
                            <div>
                                <div style={{ fontSize: 12, color: '#71717a', marginBottom: 4 }}>Purchase Price</div>
                                <div style={{ fontSize: compact ? 20 : 28, fontWeight: 900, color: '#a1a1aa', textDecoration: 'line-through' }}>
                                    {symbol}{result.purchasePrice.toLocaleString()}
                                </div>
                            </div>
                            <ArrowRight size={compact ? 20 : 28} color="#a78bfa" />
                            <div>
                                <div style={{ fontSize: 12, color: '#4ade80', marginBottom: 4, fontWeight: 700 }}>Real Cost of Ownership</div>
                                <div style={{ fontSize: compact ? 28 : 42, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                                    {symbol}{result.realCost.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: compact ? 8 : 12, flexWrap: 'wrap' }}>
                            <div style={{
                                padding: '6px 14px', borderRadius: 10,
                                background: `${result.verdictColor}15`, border: `1px solid ${result.verdictColor}30`,
                                fontSize: 13, fontWeight: 800, color: result.verdictColor,
                            }}>
                                {result.verdict}
                            </div>
                            <div style={{
                                padding: '6px 14px', borderRadius: 10,
                                background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)',
                                fontSize: 13, fontWeight: 700, color: '#a78bfa',
                            }}>
                                {symbol}{result.monthlyBreakdown}/month
                            </div>
                            <div style={{
                                padding: '6px 14px', borderRadius: 10,
                                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
                                fontSize: 13, fontWeight: 700, color: '#4ade80',
                            }}>
                                Resale: {result.resalePercent}%
                            </div>
                        </div>
                    </div>

                    {/* Ownership Breakdown Visual */}
                    <div style={{ padding: compact ? 16 : 24, borderRadius: 20, background: '#111114', border: '1px solid #1f1f24' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', marginBottom: 16, letterSpacing: 0.5 }}>
                            💰 COST FLOW — WHERE YOUR MONEY GOES
                        </div>
                        <div style={{ display: 'flex', alignItems: 'stretch', gap: 2, height: 48, borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
                            {(() => {
                                const total = result.purchasePrice + totalExpenses;
                                const purchasePct = (result.purchasePrice / total) * 100;
                                const essentialCost = result.likelyExpenses.filter(e => e.necessity === 'essential').reduce((s, e) => s + e.cost, 0);
                                const essentialPct = (essentialCost / total) * 100;
                                const otherCost = totalExpenses - essentialCost;
                                const otherPct = (otherCost / total) * 100;
                                return (
                                    <>
                                        <div style={{ width: `${purchasePct}%`, background: 'linear-gradient(135deg, #8b5cf6, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff' }}>
                                            Product
                                        </div>
                                        <div style={{ width: `${essentialPct}%`, background: 'linear-gradient(135deg, #ef4444, #f87171)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#fff' }}>
                                            Must-Have
                                        </div>
                                        <div style={{ width: `${otherPct}%`, background: 'linear-gradient(135deg, #f59e0b, #fbbf24)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#000' }}>
                                            Optional
                                        </div>
                                    </>
                                );
                            })()}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#71717a' }}>
                            <span>Product: {symbol}{result.purchasePrice.toLocaleString()}</span>
                            <span>+ Extras: {symbol}{totalExpenses.toLocaleString()}</span>
                            <span>− Resale: {symbol}{result.resaleValue.toLocaleString()}</span>
                            <span style={{ color: '#4ade80', fontWeight: 800 }}>= {symbol}{result.realCost.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Degradation Prediction */}
                    <div style={{ padding: compact ? 16 : 24, borderRadius: 20, background: '#111114', border: '1px solid #1f1f24' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', marginBottom: 16, letterSpacing: 0.5 }}>
                            📉 PREDICTED WEAR & DEGRADATION — After {result.timeframe}
                        </div>
                        <div style={{ display: 'grid', gap: 10 }}>
                            {result.degradation.map((item, i) => (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: 14,
                                    padding: '14px 16px', borderRadius: 12,
                                    background: `${item.color}06`, border: `1px solid ${item.color}15`,
                                }}>
                                    <div style={{ fontSize: 20, width: 32, textAlign: 'center' }}>{item.emoji}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7', marginBottom: 6 }}>{item.name}</div>
                                        <div style={{ height: 6, borderRadius: 3, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
                                            <div style={{
                                                height: '100%', width: `${severityWidth[item.severity]}%`,
                                                background: `linear-gradient(90deg, ${item.color}, ${item.color}80)`,
                                                borderRadius: 3, transition: 'width 1s ease',
                                            }} />
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', minWidth: 80 }}>
                                        <div style={{ fontSize: 11, color: '#52525b' }}>{item.current}</div>
                                        <div style={{ fontSize: 13, fontWeight: 700, color: item.color }}>→ {item.after}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Likely Expenses */}
                    <div style={{ padding: compact ? 16 : 24, borderRadius: 20, background: '#111114', border: '1px solid #1f1f24' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', marginBottom: 16, letterSpacing: 0.5 }}>
                            💸 HIDDEN EXPENSES YOU&apos;LL LIKELY INCUR
                        </div>
                        <div style={{ display: 'grid', gap: 8 }}>
                            {visibleExpenses.map((expense, i) => {
                                const nec = necessityColors[expense.necessity];
                                return (
                                    <div key={i} style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        padding: '14px 16px', borderRadius: 12,
                                        background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)',
                                    }}>
                                        <div style={{ fontSize: 20, width: 28, textAlign: 'center' }}>{expense.emoji}</div>
                                        <div style={{ flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: '#e4e4e7' }}>{expense.item}</div>
                                            <div style={{ fontSize: 11, color: '#52525b' }}>{expense.when}</div>
                                        </div>
                                        <div style={{
                                            padding: '3px 8px', borderRadius: 6,
                                            background: nec.bg, fontSize: 10, fontWeight: 700, color: nec.text,
                                        }}>
                                            {nec.label}
                                        </div>
                                        <div style={{ fontSize: 15, fontWeight: 800, color: '#e4e4e7', minWidth: 70, textAlign: 'right' }}>
                                            {symbol}{expense.cost.toLocaleString()}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {result.likelyExpenses.length > 4 && (
                            <button
                                onClick={() => setShowAllExpenses(!showAllExpenses)}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: 6, margin: '12px auto 0',
                                    padding: '8px 16px', borderRadius: 8,
                                    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
                                    color: '#a1a1aa', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                                }}
                            >
                                {showAllExpenses ? 'Show Less' : `Show All ${result.likelyExpenses.length} Expenses`}
                                <ChevronRight size={14} style={{ transform: showAllExpenses ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                            </button>
                        )}
                        <div style={{
                            marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.06)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}>
                            <span style={{ fontSize: 14, fontWeight: 700, color: '#e4e4e7' }}>Total Hidden Costs</span>
                            <span style={{ fontSize: 20, fontWeight: 900, color: '#f59e0b' }}>{symbol}{totalExpenses.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Resale Value */}
                    <div style={{
                        padding: compact ? 16 : 24, borderRadius: 20,
                        background: 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))',
                        border: '1px solid rgba(34,197,94,0.15)',
                    }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', marginBottom: 16, letterSpacing: 0.5 }}>
                            📊 RESALE VALUE PREDICTION — After {result.timeframe}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 16 }}>
                            <div style={{
                                width: 80, height: 80, borderRadius: '50%',
                                background: `conic-gradient(#22c55e 0% ${result.resalePercent}%, rgba(255,255,255,0.05) ${result.resalePercent}% 100%)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <div style={{
                                    width: 64, height: 64, borderRadius: '50%', background: '#111114',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column',
                                }}>
                                    <div style={{ fontSize: 22, fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>{result.resalePercent}%</div>
                                    <div style={{ fontSize: 9, color: '#71717a' }}>retained</div>
                                </div>
                            </div>
                            <div>
                                <div style={{ fontSize: 13, color: '#a1a1aa', marginBottom: 4 }}>Expected Resale Value</div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: '#4ade80' }}>
                                    {symbol}{result.resaleValue.toLocaleString()}
                                </div>
                                <div style={{ fontSize: 12, color: '#52525b' }}>
                                    from original {symbol}{result.purchasePrice.toLocaleString()}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights */}
                    <div style={{ padding: compact ? 16 : 24, borderRadius: 20, background: '#111114', border: '1px solid #1f1f24' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#71717a', marginBottom: 16, letterSpacing: 0.5 }}>
                            🧠 AI INSIGHTS
                        </div>
                        <div style={{ display: 'grid', gap: 10 }}>
                            {result.insights.map((insight, i) => (
                                <div key={i} style={{
                                    display: 'flex', gap: 12, padding: '12px 14px', borderRadius: 12,
                                    background: 'rgba(139,92,246,0.04)', border: '1px solid rgba(139,92,246,0.1)',
                                }}>
                                    <Sparkles size={16} color="#a78bfa" style={{ flexShrink: 0, marginTop: 2 }} />
                                    <p style={{ fontSize: 13, color: '#a1a1aa', margin: 0, lineHeight: 1.6 }}>{insight}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
