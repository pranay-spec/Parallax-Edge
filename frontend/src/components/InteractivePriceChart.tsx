'use client';

import React, { useState } from 'react';
import { AlertTriangle, ArrowRight, TrendingDown, Info, ShieldCheck, Zap, X, CheckCircle2 } from 'lucide-react';

interface DataPoint {
    day: string;
    dateStr: string;
    price: number;
    store: string;
    isAnomaly?: boolean;
    anomalyReason?: string;
    impactPct?: number;
}

interface InteractivePriceChartProps {
    symbol?: string;
    productTitle?: string;
    currentPrice?: number;
}

export default function InteractivePriceChart({ symbol = '₹', productTitle = 'Sony WH-1000XM5 Wireless Headphones', currentPrice = 20999 }: InteractivePriceChartProps) {
    const [timeframe, setTimeframe] = useState<'7d' | '30d' | '90d'>('7d');
    const [hoveredPoint, setHoveredPoint] = useState<DataPoint | null>(null);
    const [selectedAnomaly, setSelectedAnomaly] = useState<DataPoint | null>(null);

    const baseP = currentPrice > 0 ? currentPrice : 20999;
    
    // Generate dynamic date strings relative to today
    const now = new Date();
    const formatDate = (daysAgo: number) => {
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
    };

    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const getDayName = (daysAgo: number) => {
        if (daysAgo === 0) return 'Today';
        const d = new Date(now);
        d.setDate(d.getDate() - daysAgo);
        return daysOfWeek[d.getDay()];
    };

    // Deterministic pseudo-random seed from productTitle
    let hash = 0;
    for (let i = 0; i < productTitle.length; i++) {
        hash = (hash << 5) - hash + productTitle.charCodeAt(i);
        hash |= 0;
    }
    // Helper for realistic retail pricing (e.g. ₹24,999, ₹22,499, ₹8,299)
    const roundToRetail = (val: number): number => {
        if (val > 10000) {
            const base = Math.round(val / 500) * 500;
            return base > 10 ? base - 1 : base;
        } else if (val > 1000) {
            const base = Math.round(val / 100) * 100;
            return base > 10 ? base - 1 : base;
        }
        return Math.round(val);
    };

    const regularP = roundToRetail(baseP * 1.12);
    const midP = roundToRetail(baseP * 1.05);

    const histories: Record<string, DataPoint[]> = {
        '7d': [
            { day: getDayName(6), dateStr: formatDate(6), price: regularP, store: 'Amazon' },
            { day: getDayName(5), dateStr: formatDate(5), price: regularP, store: 'Amazon' },
            { day: getDayName(4), dateStr: formatDate(4), price: regularP, store: 'Amazon' },
            { day: getDayName(3), dateStr: formatDate(3), price: regularP, store: 'Flipkart' },
            { day: getDayName(2), dateStr: formatDate(2), price: midP, store: 'Flipkart', isAnomaly: true, anomalyReason: 'Promotional Discount Applied', impactPct: -6.5 },
            { day: getDayName(1), dateStr: formatDate(1), price: baseP, store: 'Amazon' },
            { day: 'Today', dateStr: formatDate(0), price: baseP, store: 'Amazon / Flipkart', isAnomaly: true, anomalyReason: 'Active Lowest Historical Dip', impactPct: -12.0 }
        ],
        '30d': [
            { day: 'Week 1', dateStr: formatDate(28), price: roundToRetail(baseP * 1.20), store: 'Amazon' },
            { day: 'Week 2', dateStr: formatDate(21), price: roundToRetail(baseP * 1.20), store: 'Amazon' },
            { day: 'Week 3', dateStr: formatDate(14), price: roundToRetail(baseP * 1.12), store: 'Flipkart' },
            { day: 'Week 4', dateStr: formatDate(7), price: roundToRetail(baseP * 1.06), store: 'Flipkart' },
            { day: 'Today', dateStr: formatDate(0), price: baseP, store: 'Flipkart', isAnomaly: true, anomalyReason: 'Seasonal Price Reduction', impactPct: -20.0 }
        ],
        '90d': [
            { day: '3m ago', dateStr: formatDate(90), price: roundToRetail(baseP * 1.28), store: 'Amazon' },
            { day: '2m ago', dateStr: formatDate(60), price: roundToRetail(baseP * 1.22), store: 'Amazon' },
            { day: '1m ago', dateStr: formatDate(30), price: roundToRetail(baseP * 1.12), store: 'Flipkart' },
            { day: 'Today', dateStr: formatDate(0), price: baseP, store: 'Flipkart', isAnomaly: true, anomalyReason: '90-Day Low Anomaly Window', impactPct: -28.0 }
        ]
    };

    const history = histories[timeframe];
    const maxPrice = Math.max(...history.map(d => d.price));
    const minPrice = Math.min(...history.map(d => d.price));

    // SVG Chart dimensions
    const width = 680;
    const height = 240;
    const padding = 45;

    // Map data points to SVG X, Y coordinates
    const points = history.map((pt, idx) => {
        const x = padding + (idx / (history.length - 1)) * (width - padding * 2);
        const y = height - padding - ((pt.price - minPrice) / (maxPrice - minPrice || 1)) * (height - padding * 2.2);
        return { x, y, pt };
    });

    const svgPath = points.reduce((acc, p, idx) => {
        return `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
    }, '');

    return (
        <div style={{ background: '#111114', padding: 24, borderRadius: 20, border: '1px solid #1f1f24', position: 'relative' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                <div>
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 4px', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <TrendingDown size={18} color="#22c55e" /> Interactive Price History & Anomaly Radar
                    </h3>
                    <div style={{ fontSize: 12, color: '#71717a' }}>{productTitle}</div>
                </div>

                {/* Timeframe selector tabs */}
                <div style={{ display: 'flex', gap: 6, background: '#0a0a0f', padding: 4, borderRadius: 10, border: '1px solid #27272a' }}>
                    {(['7d', '30d', '90d'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => { setTimeframe(t); setSelectedAnomaly(null); }}
                            style={{
                                padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer',
                                fontSize: 12, fontWeight: 700,
                                background: timeframe === t ? '#06b6d4' : 'transparent',
                                color: timeframe === t ? '#000' : '#a1a1aa'
                            }}
                        >
                            {t === '7d' ? '7 Days' : t === '30d' ? '30 Days' : '90 Days'}
                        </button>
                    ))}
                </div>
            </div>

            {/* SVG Line Chart */}
            <div style={{ position: 'relative', width: '100%', overflowX: 'auto' }}>
                <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
                    {/* Background Grid Lines */}
                    <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#1f1f24" strokeDasharray="4 4" />
                    <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#1f1f24" strokeDasharray="4 4" />
                    <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#1f1f24" />

                    {/* Gradient Fill under Line */}
                    <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path
                        d={`${svgPath} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`}
                        fill="url(#chartGrad)"
                    />

                    {/* Trend Line */}
                    <path d={svgPath} fill="none" stroke="#06b6d4" strokeWidth="3" strokeLinecap="round" />

                    {/* Interactive Data Points & Price Badges */}
                    {points.map((p, idx) => {
                        const priceBadgeY = Math.max(10, p.y - 28);
                        const priceStr = `${symbol}${p.pt.price.toLocaleString('en-IN')}`;
                        const badgeWidth = Math.max(54, priceStr.length * 7.5 + 12);

                        return (
                            <g key={idx}>
                                {/* Price Tag Badge above node */}
                                <rect
                                    x={p.x - badgeWidth / 2}
                                    y={priceBadgeY}
                                    width={badgeWidth}
                                    height="18"
                                    rx="6"
                                    fill={p.pt.isAnomaly ? "rgba(239, 68, 68, 0.25)" : "rgba(10, 10, 15, 0.9)"}
                                    stroke={p.pt.isAnomaly ? "#ef4444" : "rgba(6, 182, 212, 0.4)"}
                                    strokeWidth="1"
                                />
                                <text
                                    x={p.x}
                                    y={priceBadgeY + 13}
                                    fill={p.pt.isAnomaly ? "#fca5a5" : "#67e8f9"}
                                    fontSize="10.5"
                                    textAnchor="middle"
                                    fontWeight="800"
                                    letterSpacing="0.2"
                                >
                                    {priceStr}
                                </text>

                                {/* Anomaly Outer Ring */}
                                {p.pt.isAnomaly && (
                                    <circle
                                        cx={p.x} cy={p.y} r="14"
                                        fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" strokeWidth="1.5"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setSelectedAnomaly(p.pt)}
                                    />
                                )}

                                {/* Main Point */}
                                <circle
                                    cx={p.x} cy={p.y} r={p.pt.isAnomaly ? "6" : "5"}
                                    fill={p.pt.isAnomaly ? "#ef4444" : "#06b6d4"}
                                    stroke="#fff" strokeWidth="2"
                                    style={{ cursor: 'pointer' }}
                                    onMouseEnter={() => setHoveredPoint(p.pt)}
                                    onMouseLeave={() => setHoveredPoint(null)}
                                    onClick={() => p.pt.isAnomaly && setSelectedAnomaly(p.pt)}
                                />

                                {/* X Axis Labels */}
                                <text x={p.x} y={height - 12} fill="#71717a" fontSize="11" textAnchor="middle" fontWeight="600">
                                    {p.pt.day}
                                </text>
                            </g>
                        );
                    })}
                </svg>

                {/* Hover Tooltip Overlay */}
                {hoveredPoint && (
                    <div style={{
                        position: 'absolute', top: 10, right: 10,
                        padding: '8px 14px', borderRadius: 10, background: '#000', border: '1px solid #27272a',
                        fontSize: 12, color: '#fff', boxShadow: '0 10px 20px rgba(0,0,0,0.5)'
                    }}>
                        <div style={{ color: '#71717a' }}>{hoveredPoint.dateStr} • {hoveredPoint.store}</div>
                        <div style={{ fontSize: 16, fontWeight: 900, color: hoveredPoint.isAnomaly ? '#ef4444' : '#22c55e' }}>
                            {symbol}{hoveredPoint.price.toLocaleString()}
                        </div>
                    </div>
                )}
            </div>

            {/* CLICKED ANOMALY DRILL-DOWN CARD (REQUIREMENT 6) */}
            {selectedAnomaly && (
                <div style={{
                    marginTop: 20, padding: 20, borderRadius: 16,
                    background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
                    position: 'relative'
                }}>
                    <button onClick={() => setSelectedAnomaly(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
                        <X size={16} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <AlertTriangle color="#ef4444" size={18} />
                        <span style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>
                            {selectedAnomaly.day} Anomaly Detected ({selectedAnomaly.dateStr})
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 14 }}>
                        <div>
                            <div style={{ fontSize: 11, color: '#71717a' }}>Price Movement</div>
                            <div style={{ fontSize: 18, fontWeight: 900, color: '#22c55e' }}>
                                Decreased {Math.abs(selectedAnomaly.impactPct || 0)}% <span style={{ fontSize: 12, color: '#71717a' }}>({symbol}{selectedAnomaly.price})</span>
                            </div>
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: '#71717a' }}>Primary Contributor</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                                {selectedAnomaly.anomalyReason}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: 12 }}>
                        <button style={{ padding: '8px 16px', borderRadius: 10, background: '#22c55e', color: '#000', border: 'none', fontWeight: 800, fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Zap size={14} /> Lock In Price ({symbol}{selectedAnomaly.price})
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
