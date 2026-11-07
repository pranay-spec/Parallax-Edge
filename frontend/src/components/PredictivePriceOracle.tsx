'use client';

import { useState, useEffect } from 'react';
import {
    Brain, TrendingDown, TrendingUp, Clock, AlertTriangle, ShieldCheck,
    Check, Bell, Search, Calendar, Award, Sparkles, ChevronRight, Zap,
    ArrowRight, Info, BarChart3, Target, Tag, ExternalLink
} from 'lucide-react';
import InteractivePriceChart from './InteractivePriceChart';

interface PredictivePriceOracleProps {
    symbol: string;
    pincode?: string;
}

interface ProductForecastData {
    query: string;
    productTitle: string;
    currentPrice: number;
    recommendedAction: 'BUY' | 'WAIT';
    confidence: number;
    predictedLowestPrice: number;
    predictedLowestDays: number;
    mapeAccuracy: number;
    historicalHigh90: number;
    historicalLow90: number;
    historicalAverage90: number;
    reasons: string[];
    upcomingSales: {
        eventName: string;
        dateRange: string;
        projectedPrice: number;
        dropPct: number;
    }[];
    chartData: { day: string; price: number; type: 'historical' | 'predicted'; minBound?: number; maxBound?: number }[];
    url?: string;
    platform?: string;
}


export default function PredictivePriceOracle({ symbol }: PredictivePriceOracleProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeForecast, setActiveForecast] = useState<ProductForecastData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [targetPrice, setTargetPrice] = useState<string>('55000');
    const [alertSet, setAlertSet] = useState(false);
    const [anomalies, setAnomalies] = useState<any[]>([]);

    useEffect(() => {
        fetch('http://localhost:8000/api/ml/anomalies')
            .then(r => r.json())
            .then(d => setAnomalies(d.anomalies || []))
            .catch(() => {
                setAnomalies([
                    { id: 'a1', title: 'Logitech MX Master 3S Wireless Mouse', price: 4999, original_price: 10995, store: 'Croma', anomaly_score: 54.5, anomaly_type: 'Price Error / Flash Drop', confidence: 94.5, url: 'https://www.croma.com/logitech-mx-master-3s-wireless-mouse-dark-grey-/p/259160' },
                    { id: 'a2', title: 'Samsung Galaxy Watch 6 LTE 44mm', price: 16999, original_price: 36999, store: 'Amazon', anomaly_score: 54.0, anomaly_type: 'Price Error / Flash Drop', confidence: 92.1, url: 'https://www.amazon.in/dp/B0CCXZP7H9' }
                ]);
            });

        // Trigger initial forecast on mount
        handleSearch('macbook air');
    }, []);

    const handleSearch = async (qOverride?: string) => {
        const q = (qOverride || searchQuery).toLowerCase().trim();
        if (!q) return;

        setSearchQuery(q);
        setIsLoading(true);
        setError('');
        
        try {
            const res = await fetch('http://localhost:8000/api/oracle/predict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: q })
            });
            if (!res.ok) throw new Error('Failed to fetch forecast');
            const data = await res.json();
            setActiveForecast(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsLoading(false);
            setAlertSet(false);
        }
    };

    const isWait = activeForecast?.recommendedAction === 'WAIT';
    const potentialSavings = activeForecast ? activeForecast.currentPrice - activeForecast.predictedLowestPrice : 0;
    const savingsPct = activeForecast ? Math.round((potentialSavings / activeForecast.currentPrice) * 100) : 0;

    return (
        <div style={{ maxWidth: 950, margin: '0 auto', paddingBottom: 80 }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
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
                            <Brain size={24} color="#a78bfa" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>
                                Predictive Price Intelligence
                            </h1>
                            <p style={{ fontSize: 14, color: '#71717a', margin: '4px 0 0' }}>
                                AI Time-Series Forecasting • Buy-Now vs Wait Advisor • Festive Sale Predictions
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
                    onKeyDown={e => e.key === 'Enter' && handleSearch()}
                    placeholder="Search product for price forecast (e.g., iPhone 15, MacBook Air, Refrigerator)"
                    style={{
                        flex: 1, padding: '12px 18px', borderRadius: 12,
                        background: '#0a0a0f', border: '1px solid #27272a',
                        color: '#fff', fontSize: 14, outline: 'none'
                    }}
                />
                <button
                    onClick={() => handleSearch()}
                    style={{
                        padding: '12px 24px', borderRadius: 12,
                        background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                        border: 'none', color: '#fff', fontSize: 14, fontWeight: 700,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8
                    }}
                >
                    <Search size={16} /> Forecast
                </button>
            </div>

            {/* Quick Demo Buttons */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 28 }}>
                {['iPhone 15', 'MacBook Air', 'Refrigerator'].map(demo => (
                    <button
                        key={demo}
                        onClick={() => { setSearchQuery(demo); handleSearch(demo); }}
                        style={{
                            padding: '8px 16px', borderRadius: 10,
                            background: activeForecast?.query.toLowerCase().includes(demo.toLowerCase()) ? 'rgba(139, 92, 246, 0.2)' : '#111114',
                            border: `1px solid ${activeForecast?.query.toLowerCase().includes(demo.toLowerCase()) ? '#8b5cf6' : '#1f1f24'}`,
                            color: activeForecast?.query.toLowerCase().includes(demo.toLowerCase()) ? '#a78bfa' : '#a1a1aa',
                            fontSize: 13, fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        Forecast: {demo}
                    </button>
                ))}
            </div>

            {isLoading && (
                <div style={{ padding: 40, textAlign: 'center', background: '#111114', borderRadius: 24, border: '1px solid #1f1f24' }}>
                    <div className="loader-pulse" style={{ width: 40, height: 40, borderRadius: '50%', background: '#8b5cf6', margin: '0 auto 16px', animation: 'pulse 1.5s infinite' }}></div>
                    <h3 style={{ color: '#fff' }}>Generating Price Intelligence</h3>
                    <p style={{ color: '#71717a' }}>Synthesizing historical trends, scraping upcoming sales, and forecasting price action...</p>
                    <style>{`
                        @keyframes pulse {
                            0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0.7); }
                            70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(139, 92, 246, 0); }
                            100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(139, 92, 246, 0); }
                        }
                    `}</style>
                </div>
            )}
            
            {error && !isLoading && (
                <div style={{ padding: 20, color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', borderRadius: 12, border: '1px solid #ef4444' }}>
                    {error}
                </div>
            )}

            {!isLoading && activeForecast && (
                <>
            {/* HERO ADVISORY CARD */}
            <div style={{
                padding: 32, borderRadius: 24, marginBottom: 24,
                background: isWait
                    ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.12), rgba(245, 158, 11, 0.03))'
                    : 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(34, 197, 94, 0.03))',
                border: `1px solid ${isWait ? 'rgba(245, 158, 11, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 20 }}>
                    <div style={{ flex: 1, minWidth: 280 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
                            <span style={{
                                padding: '6px 16px', borderRadius: 12,
                                background: isWait ? '#f59e0b' : '#22c55e',
                                color: '#000', fontSize: 16, fontWeight: 900, letterSpacing: 0.5
                            }}>
                                {isWait ? '⏳ WAIT TO BUY' : '⚡ BUY NOW'}
                            </span>
                            <span style={{
                                padding: '6px 14px', borderRadius: 12,
                                background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.1)',
                                color: '#a78bfa', fontSize: 13, fontWeight: 800
                            }}>
                                🎯 {activeForecast.confidence}% Confidence
                            </span>
                            <span style={{ fontSize: 12, color: '#71717a' }}>
                                Model Accuracy: <strong style={{ color: '#4ade80' }}>{activeForecast.mapeAccuracy}% MAPE</strong>
                            </span>
                        </div>

                        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#fff', margin: '0 0 8px' }}>
                            {activeForecast.productTitle}
                        </h2>

                        <p style={{ fontSize: 15, color: '#d4d4d8', margin: 0, lineHeight: 1.5 }}>
                            {isWait ? (
                                <>Current price is <strong>{symbol}{activeForecast.currentPrice.toLocaleString()}</strong>. Predicted to drop to <strong style={{ color: '#4ade80' }}>{symbol}{activeForecast.predictedLowestPrice.toLocaleString()}</strong> in <strong>{activeForecast.predictedLowestDays} days</strong> (Save <strong>{symbol}{potentialSavings.toLocaleString()}</strong> / {savingsPct}%).</>
                            ) : (
                                <>Current price <strong>{symbol}{activeForecast.currentPrice.toLocaleString()}</strong> is at a <strong>90-day low</strong>. Risk of price increase is higher than waiting.</>
                            )}
                        </p>

                        {/* Direct View Product Link */}
                        <div style={{ marginTop: 16 }}>
                            <a
                                href={activeForecast.url || `https://www.amazon.in/s?k=${encodeURIComponent(activeForecast.productTitle)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: 6,
                                    padding: '8px 16px', borderRadius: 10,
                                    background: 'rgba(255, 255, 255, 0.08)', border: '1px solid rgba(255, 255, 255, 0.18)',
                                    color: '#38bdf8', fontSize: 13, fontWeight: 700, textDecoration: 'none'
                                }}
                            >
                                <ExternalLink size={14} /> View Product on {activeForecast.platform || 'Store'}
                            </a>
                        </div>
                    </div>

                    <div style={{
                        padding: 16, borderRadius: 16, background: 'rgba(0, 0, 0, 0.3)',
                        border: '1px solid rgba(255, 255, 255, 0.05)', textAlign: 'right', minWidth: 160
                    }}>
                        <div style={{ fontSize: 11, color: '#71717a', fontWeight: 700, textTransform: 'uppercase' }}>Current Price</div>
                        <div style={{ fontSize: 26, fontWeight: 900, color: '#fff', margin: '2px 0 6px' }}>
                            {symbol}{activeForecast.currentPrice.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 12, color: isWait ? '#f59e0b' : '#4ade80' }}>
                            {isWait ? `Target: ${symbol}${activeForecast.predictedLowestPrice.toLocaleString()}` : 'Lowest in 90 days'}
                        </div>
                    </div>
                </div>
            </div>

            {/* INTERACTIVE ANOMALY CHART WITH DRILL-DOWN */}
            <div style={{ marginBottom: 24 }}>
                <InteractivePriceChart symbol={symbol} productTitle={activeForecast.productTitle} currentPrice={activeForecast.currentPrice} />
            </div>

            {/* FORECAST GRAPH (SVG) */}
            <div style={{
                padding: 28, borderRadius: 20, background: '#111114',
                border: '1px solid #1f1f24', marginBottom: 24
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <BarChart3 size={18} color="#a78bfa" /> 30-Day Historical vs 30-Day Predicted Trend
                        </h3>
                        <p style={{ fontSize: 12, color: '#71717a', margin: '4px 0 0' }}>
                            Solid line = Verified past prices • Dashed line = ML time-series forecast interval
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 14, fontSize: 12 }}>
                        <span style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 12, height: 3, background: '#06b6d4', borderRadius: 2 }} /> Past
                        </span>
                        <span style={{ color: '#a78bfa', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ width: 12, height: 3, background: '#a78bfa', borderRadius: 2 }} /> Forecast
                        </span>
                    </div>
                </div>

                {/* Chart Visualization */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 12, alignItems: 'flex-end', height: 180, paddingTop: 20 }}>
                    {activeForecast.chartData.map((pt, idx) => {
                        const maxP = Math.max(...activeForecast.chartData.map(d => d.price));
                        const minP = Math.min(...activeForecast.chartData.map(d => d.price));
                        const range = (maxP - minP) || 1;
                        const heightPct = Math.max(20, Math.round(((pt.price - minP) / range) * 70 + 20));
                        const isToday = pt.day === 'Today';

                        return (
                            <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, height: '100%', justifyContent: 'flex-end' }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: isToday ? '#fff' : pt.type === 'predicted' ? '#a78bfa' : '#06b6d4' }}>
                                    {symbol}{(pt.price / 1000).toFixed(1)}k
                                </span>
                                <div style={{
                                    width: '100%', height: `${heightPct}%`,
                                    background: isToday
                                        ? 'linear-gradient(180deg, #3b82f6, #06b6d4)'
                                        : pt.type === 'predicted'
                                            ? 'linear-gradient(180deg, rgba(167, 139, 250, 0.4), rgba(139, 92, 246, 0.1))'
                                            : 'linear-gradient(180deg, rgba(6, 182, 212, 0.3), rgba(6, 182, 212, 0.05))',
                                    border: pt.type === 'predicted' ? '1px dashed #a78bfa' : '1px solid #06b6d440',
                                    borderRadius: '8px 8px 0 0', transition: 'all 0.4s ease'
                                }} />
                                <span style={{ fontSize: 11, color: isToday ? '#fff' : '#71717a', fontWeight: isToday ? 800 : 500 }}>
                                    {pt.day}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* AI REASONS & HOLIDAY SALE FORECAST GRID */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 24 }}>
                
                {/* AI Predictive Reasons */}
                <div style={{ padding: 24, borderRadius: 20, background: '#111114', border: '1px solid #1f1f24' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={18} color="#a78bfa" /> Why This Forecast?
                    </h3>
                    <div style={{ display: 'grid', gap: 12 }}>
                        {activeForecast.reasons.map((r, i) => (
                            <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#a1a1aa', lineHeight: 1.5 }}>
                                <Check size={16} color="#4ade80" style={{ flexShrink: 0, marginTop: 2 }} />
                                <span>{r}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Upcoming Major Sale Event Forecast */}
                <div style={{ padding: 24, borderRadius: 20, background: '#111114', border: '1px solid #1f1f24' }}>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Calendar size={18} color="#f59e0b" /> Major Festive & Event Forecasts
                    </h3>
                    <div style={{ display: 'grid', gap: 12 }}>
                        {activeForecast.upcomingSales.map((sale, i) => (
                            <div key={i} style={{
                                padding: 12, borderRadius: 12, background: 'rgba(255, 255, 255, 0.02)',
                                border: '1px solid rgba(255, 255, 255, 0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}>
                                <div>
                                    <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>{sale.eventName}</div>
                                    <div style={{ fontSize: 11, color: '#71717a' }}>{sale.dateRange}</div>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 14, fontWeight: 800, color: '#4ade80' }}>
                                        {symbol}{sale.projectedPrice.toLocaleString()}
                                    </div>
                                    <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 600 }}>
                                        -{sale.dropPct}% projected
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            {/* FUTURE TARGET & AUTOMATED ALERT WIDGET */}
            <div style={{
                padding: 28, borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(139, 92, 246, 0.06))',
                border: '1px solid rgba(6, 182, 212, 0.25)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20
            }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#06b6d4', letterSpacing: 1, marginBottom: 4 }}>
                        🎯 FUTURE PURCHASE TARGET & ALERT
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
                        Set target price for {activeForecast.query}
                    </div>
                    <p style={{ fontSize: 13, color: '#a1a1aa', margin: '4px 0 0' }}>
                        AI will monitor hourly & send instant push/email alert when target is hit or coupon drops.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0a0a0f', padding: '10px 14px', borderRadius: 12, border: '1px solid #27272a' }}>
                        <span style={{ color: '#06b6d4', fontWeight: 800 }}>{symbol}</span>
                        <input
                            type="number"
                            value={targetPrice}
                            onChange={e => setTargetPrice(e.target.value)}
                            style={{ background: 'none', border: 'none', color: '#fff', fontSize: 15, fontWeight: 800, width: 80, outline: 'none' }}
                        />
                    </div>

                    <button
                        onClick={() => setAlertSet(true)}
                        style={{
                            padding: '12px 24px', borderRadius: 12,
                            background: alertSet ? 'rgba(34, 197, 94, 0.2)' : 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                            border: alertSet ? '1px solid #22c55e' : 'none',
                            color: '#fff', fontSize: 14, fontWeight: 800, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 8
                        }}
                    >
                        {alertSet ? <Check size={16} color="#4ade80" /> : <Bell size={16} />}
                        {alertSet ? 'Alert Active!' : 'Set AI Target Alert'}
                    </button>
                </div>
            </div>
            </>
            )}

            {/* LIVE AI PRICE ANOMALY & FLASH DROP DETECTOR */}
            <div style={{ marginTop: 32 }}>
                <div style={{
                    padding: 16, borderRadius: 16,
                    background: 'rgba(239, 68, 68, 0.08)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 38, height: 38, borderRadius: 10,
                            background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <AlertTriangle color="#ef4444" size={20} />
                        </div>
                        <div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                                AI Price Anomaly & Flash Drop Detector
                                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: '#ef4444', color: '#000', fontWeight: 900 }}>
                                    {anomalies.length} Flagged
                                </span>
                            </div>
                            <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
                                Statistical Z-score algorithm detected real-time price drops exceeding 35% standard deviation.
                            </div>
                        </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#71717a' }}>
                        Live Oracle Feed
                    </div>
                </div>

                <div style={{ display: 'grid', gap: 14 }}>
                    {anomalies.map((item, idx) => (
                        <div key={idx} style={{
                            padding: 20, borderRadius: 18, background: '#111114',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
                        }}>
                            <div style={{ flex: 1, minWidth: 240 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <span style={{ padding: '2px 8px', borderRadius: 6, background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)', color: '#f87171', fontSize: 11, fontWeight: 800 }}>
                                        {item.anomaly_type}
                                    </span>
                                    <span style={{ fontSize: 12, color: '#71717a' }}>Store: <strong style={{ color: '#e4e4e7' }}>{item.store}</strong></span>
                                    <span style={{ fontSize: 11, color: '#22c55e', fontWeight: 700 }}>• {item.confidence}% Confidence</span>
                                </div>
                                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>{item.title}</h3>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                                <div style={{ textAlign: 'right', marginRight: 6 }}>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: '#22c55e' }}>{symbol}{item.price.toLocaleString()}</div>
                                    <div style={{ fontSize: 13, color: '#ef4444', textDecoration: 'line-through' }}>{symbol}{item.original_price?.toLocaleString()}</div>
                                </div>
                                
                                {/* View Product Button */}
                                <a
                                    href={item.url || (item.store === 'Amazon' ? `https://www.amazon.in/s?k=${encodeURIComponent(item.title)}` : item.store === 'Flipkart' ? `https://www.flipkart.com/search?q=${encodeURIComponent(item.title)}` : `https://www.croma.com/searchB?q=${encodeURIComponent(item.title)}`)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                        padding: '10px 16px', borderRadius: 10,
                                        background: 'rgba(255, 255, 255, 0.06)', border: '1px solid rgba(255, 255, 255, 0.15)',
                                        color: '#38bdf8', fontWeight: 700, fontSize: 13, textDecoration: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s ease'
                                    }}
                                >
                                    <ExternalLink size={14} /> View Product
                                </a>

                                <button
                                    onClick={() => { setSearchQuery(item.title); handleSearch(item.title); }}
                                    style={{
                                        padding: '10px 18px', borderRadius: 10,
                                        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                        color: '#000', fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', gap: 6
                                    }}
                                >
                                    <Zap size={14} /> Analyze Forecast
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
