'use client';

import { useState, useEffect } from 'react';
import {
    Brain, TrendingDown, Clock, ShieldCheck, AlertCircle, Bell,
    Search, Loader2, Calendar, Sparkles, CheckCircle2, ArrowRight, Zap
} from 'lucide-react';

interface PriceOraclePredictorProps {
    symbol: string;
    query?: string;
}

interface PriceIntel {
    product_title: string;
    current_price: number;
    action: 'BUY_NOW' | 'WAIT';
    confidence: number;
    expected_savings: number;
    wait_days: number;
    reason: string;
    mape_error: number;
    lowest_30d: number;
    highest_30d: number;
    avg_30d: number;
    pct_from_avg: number;
    history_30d: { day: string; date: string; price: number; type: string }[];
    forecast_14d: { day: string; date: string; price: number; lower_bound: number; upper_bound: number; type: string }[];
    upcoming_events: { name: string; days_away: number; expected_discount_pct: number; category: string }[];
    multi_store_comparison: { store: string; current: number; trend: string; best_time: string }[];
}

export default function PriceOraclePredictor({ symbol, query: initialQuery }: PriceOraclePredictorProps) {
    const [searchQuery, setSearchQuery] = useState(initialQuery || 'iPhone 15 128GB');
    const [loading, setLoading] = useState(false);
    const [intel, setIntel] = useState<PriceIntel | null>(null);
    const [alertPrice, setAlertPrice] = useState('');
    const [alertSet, setAlertSet] = useState(false);

    const fetchIntel = async (q: string = searchQuery) => {
        setLoading(true);
        setAlertSet(false);
        try {
            const res = await fetch('http://localhost:8000/oracle/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: q, postal_code: '560001', country: 'IN' })
            });
            if (res.ok) {
                const data = await res.json();
                setIntel(data);
            }
        } catch (e) {
            console.error('Oracle fetch failed', e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIntel(searchQuery);
    }, []);

    const handleSearchSubmit = () => {
        if (searchQuery.trim()) fetchIntel(searchQuery);
    };

    // Combine history + forecast for chart rendering
    const allChartPoints = intel ? [
        ...intel.history_30d,
        ...intel.forecast_14d.map(f => ({ day: f.day, date: f.date, price: f.price, type: 'forecast' }))
    ] : [];

    const minPrice = intel ? Math.min(intel.lowest_30d * 0.95, ...intel.forecast_14d.map(f => f.lower_bound)) : 0;
    const maxPrice = intel ? Math.max(intel.highest_30d * 1.05, ...intel.forecast_14d.map(f => f.upper_bound)) : 100;

    return (
        <div style={{ maxWidth: 950, margin: '0 auto', paddingBottom: 80 }}>
            {/* Header */}
            <div style={{ marginBottom: 28 }}>
                <div style={{
                    padding: '28px 32px', borderRadius: 20,
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.08))',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Brain size={24} color="#8b5cf6" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>
                                Predictive Price Intelligence (Buy-Now vs Wait Advisor)
                            </h1>
                            <p style={{ fontSize: 14, color: '#71717a', margin: '4px 0 0' }}>
                                Time-series forecasting, seasonal event impact predictions, and 7-day drop advisory
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Search Bar */}
            <div style={{
                display: 'flex', gap: 12, marginBottom: 24,
                padding: 16, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24'
            }}>
                <input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearchSubmit()}
                    placeholder="Enter product to predict price (e.g. iPhone 15, MacBook Air, Sony Headphones)"
                    style={{
                        flex: 1, padding: '12px 16px', borderRadius: 12,
                        background: '#0a0a0f', border: '1px solid #27272a',
                        color: '#fff', fontSize: 14, outline: 'none'
                    }}
                />
                <button
                    onClick={handleSearchSubmit}
                    disabled={loading}
                    style={{
                        padding: '12px 24px', borderRadius: 12,
                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                        border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                        cursor: loading ? 'not-allowed' : 'pointer',
                        display: 'flex', alignItems: 'center', gap: 8
                    }}
                >
                    {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Search size={16} />}
                    Predict
                </button>
            </div>

            {/* Quick Demo Shortcuts */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
                {['iPhone 15 128GB', 'MacBook Air M3', 'Sony WH-1000XM5', 'LG 55-inch OLED TV'].map(q => (
                    <button
                        key={q}
                        onClick={() => { setSearchQuery(q); fetchIntel(q); }}
                        style={{
                            padding: '8px 14px', borderRadius: 10,
                            background: 'rgba(139, 92, 246, 0.08)', border: '1px solid rgba(139, 92, 246, 0.2)',
                            color: '#a78bfa', fontSize: 12, fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        Predict: {q}
                    </button>
                ))}
            </div>

            {loading && (
                <div style={{ padding: 60, textAlign: 'center', color: '#71717a' }}>
                    <Loader2 size={32} color="#8b5cf6" style={{ animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
                    <div>Running 30-day time-series regression & ML forecast...</div>
                </div>
            )}

            {intel && !loading && (
                <div style={{ display: 'grid', gap: 24 }}>
                    {/* Hero Action Advisory Card */}
                    <div style={{
                        padding: 32, borderRadius: 24,
                        background: intel.action === 'WAIT'
                            ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(239, 68, 68, 0.05))'
                            : 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(6, 182, 212, 0.05))',
                        border: `1px solid ${intel.action === 'WAIT' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                        position: 'relative'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16, marginBottom: 16 }}>
                            <div>
                                <div style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 8,
                                    padding: '6px 14px', borderRadius: 10,
                                    background: intel.action === 'WAIT' ? '#f59e0b' : '#22c55e',
                                    color: '#000', fontSize: 14, fontWeight: 900, letterSpacing: 0.5, marginBottom: 12
                                }}>
                                    {intel.action === 'WAIT' ? `🟡 WAIT ${intel.wait_days} DAYS` : '🟢 BUY NOW — GREAT DEAL'}
                                    <span style={{ fontSize: 12, opacity: 0.8 }}>({intel.confidence}% Confidence)</span>
                                </div>
                                <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: 0 }}>
                                    {intel.product_title}
                                </h2>
                            </div>

                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: 12, color: '#71717a' }}>Current Best Price</div>
                                <div style={{ fontSize: 32, fontWeight: 900, color: '#fff' }}>
                                    {symbol}{intel.current_price.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <p style={{ fontSize: 15, color: '#e4e4e7', margin: '0 0 20px', lineHeight: 1.5 }}>
                            {intel.reason}
                        </p>

                        {intel.action === 'WAIT' && intel.expected_savings > 0 && (
                            <div style={{
                                padding: '12px 18px', borderRadius: 12, background: 'rgba(245, 158, 11, 0.12)',
                                border: '1px solid rgba(245, 158, 11, 0.25)', display: 'inline-flex', alignItems: 'center', gap: 10,
                                fontSize: 14, fontWeight: 700, color: '#f59e0b'
                            }}>
                                <TrendingDown size={18} />
                                Expected Savings: {symbol}{intel.expected_savings.toLocaleString()} by waiting {intel.wait_days} days
                            </div>
                        )}

                        <div style={{ marginTop: 20, display: 'flex', gap: 20, fontSize: 12, color: '#71717a', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 16 }}>
                            <span>MAPE Model Error: <strong style={{ color: '#4ade80' }}>{intel.mape_error}%</strong> (&lt; 5% Target)</span>
                            <span>30-Day Avg: <strong style={{ color: '#fff' }}>{symbol}{intel.avg_30d.toLocaleString()}</strong> ({intel.pct_from_avg > 0 ? `+${intel.pct_from_avg}%` : `${intel.pct_from_avg}%`})</span>
                            <span>30-Day Low: <strong style={{ color: '#4ade80' }}>{symbol}{intel.lowest_30d.toLocaleString()}</strong></span>
                        </div>
                    </div>

                    {/* Time-Series Trend & Forecast Visualizer */}
                    <div style={{ padding: 24, borderRadius: 20, background: '#111114', border: '1px solid #1f1f24' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Calendar size={18} color="#8b5cf6" />
                                30-Day Price History + 14-Day Forecast Curve
                            </h3>
                            <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
                                <span style={{ color: '#8b5cf6', display: 'flex', alignItems: 'center', gap: 4 }}>● Past History</span>
                                <span style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: 4 }}>--- Forecast</span>
                            </div>
                        </div>

                        {/* Interactive SVG Trend Chart */}
                        <div style={{ width: '100%', height: 220, position: 'relative' }}>
                            <svg viewBox="0 0 800 200" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                                {/* Horizontal gridlines */}
                                <line x1="0" y1="20" x2="800" y2="20" stroke="#1f1f24" strokeDasharray="4" />
                                <line x1="0" y1="100" x2="800" y2="100" stroke="#1f1f24" strokeDasharray="4" />
                                <line x1="0" y1="180" x2="800" y2="180" stroke="#1f1f24" strokeDasharray="4" />

                                {/* Render Points */}
                                {(() => {
                                    const totalPts = allChartPoints.length;
                                    const getX = (idx: number) => (idx / (totalPts - 1)) * 780 + 10;
                                    const getY = (price: number) => 180 - ((price - minPrice) / (maxPrice - minPrice || 1)) * 150;

                                    const histPts = intel.history_30d;
                                    const pathD = histPts.map((pt, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(pt.price)}`).join(' ');

                                    const lastHistIdx = histPts.length - 1;
                                    const forePts = intel.forecast_14d;
                                    const forePathD = [`M ${getX(lastHistIdx)} ${getY(histPts[lastHistIdx].price)}`,
                                    ...forePts.map((pt, i) => `L ${getX(lastHistIdx + 1 + i)} ${getY(pt.price)}`)
                                    ].join(' ');

                                    return (
                                        <>
                                            {/* History Line */}
                                            <path d={pathD} fill="none" stroke="#8b5cf6" strokeWidth="3" />
                                            {/* Forecast Line */}
                                            <path d={forePathD} fill="none" stroke="#06b6d4" strokeWidth="3" strokeDasharray="6" />

                                            {/* History Dots */}
                                            {histPts.map((pt, i) => (
                                                <circle key={i} cx={getX(i)} cy={getY(pt.price)} r="3" fill="#8b5cf6" />
                                            ))}
                                            {/* Forecast Dots */}
                                            {forePts.map((pt, i) => (
                                                <circle key={`f_${i}`} cx={getX(lastHistIdx + 1 + i)} cy={getY(pt.price)} r="3" fill="#06b6d4" />
                                            ))}
                                        </>
                                    );
                                })()}
                            </svg>
                        </div>
                    </div>

                    {/* Upcoming Seasonal Sales Forecast */}
                    <div style={{ padding: 24, borderRadius: 20, background: '#111114', border: '1px solid #1f1f24' }}>
                        <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Sparkles size={18} color="#f59e0b" />
                            Upcoming Festival & Seasonal Sale Predictions
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
                            {intel.upcoming_events.map((evt, idx) => (
                                <div key={idx} style={{
                                    padding: 16, borderRadius: 14, background: '#0a0a0f', border: '1px solid #1f1f24'
                                }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', marginBottom: 4 }}>{evt.name}</div>
                                    <div style={{ fontSize: 12, color: '#71717a', marginBottom: 10 }}>In {evt.days_away} days • {evt.category}</div>
                                    <div style={{ fontSize: 13, fontWeight: 800, color: '#4ade80' }}>
                                        Est. Discount: -{evt.expected_discount_pct}% Off
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Future Purchase Price Watch Alert Setup */}
                    <div style={{
                        padding: 24, borderRadius: 20, background: '#111114', border: '1px solid #1f1f24',
                        display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16
                    }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Bell size={18} color="#06b6d4" />
                                Set Future Purchase Target Price Watch
                            </h3>
                            <p style={{ margin: '4px 0 0', fontSize: 13, color: '#71717a' }}>
                                Get automated push notification when price dips below your target or when coupon drops.
                            </p>
                        </div>

                        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0a0a0f', padding: '8px 12px', borderRadius: 10, border: '1px solid #27272a' }}>
                                <span style={{ color: '#06b6d4', fontWeight: 700 }}>{symbol}</span>
                                <input
                                    type="number"
                                    value={alertPrice}
                                    onChange={e => setAlertPrice(e.target.value)}
                                    placeholder={Math.round(intel.current_price * 0.9).toString()}
                                    style={{ background: 'none', border: 'none', color: '#fff', fontSize: 14, fontWeight: 700, width: 90, outline: 'none' }}
                                />
                            </div>
                            <button
                                onClick={() => setAlertSet(true)}
                                style={{
                                    padding: '10px 18px', borderRadius: 10,
                                    background: alertSet ? 'rgba(34, 197, 94, 0.2)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                                    border: alertSet ? '1px solid #22c55e' : 'none',
                                    color: '#fff', fontSize: 13, fontWeight: 800, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', gap: 6
                                }}
                            >
                                {alertSet ? <><CheckCircle2 size={16} color="#4ade80" /> Alert Set!</> : 'Set Alert'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
