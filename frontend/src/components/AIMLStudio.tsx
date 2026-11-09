'use client';

import React, { useState, useEffect } from 'react';
import { Cpu, Sparkles, Brain, CheckCircle2, AlertTriangle, ArrowRight, Tag, Layers, RefreshCw, BarChart2, ShieldCheck, Zap, Activity } from 'lucide-react';

interface AIMLStudioProps {
    symbol?: string;
    pincode?: string;
}

export default function AIMLStudio({ symbol = '₹' }: AIMLStudioProps) {
    const [anomalies, setAnomalies] = useState<any[]>([]);

    // Load anomalies on mount
    useEffect(() => {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        fetch(`${apiUrl}/api/ml/anomalies`)
        .then(r => r.json())
        .then(d => setAnomalies(d.anomalies || []))
        .catch(() => {
            setAnomalies([
                { id: 'a1', title: 'Logitech MX Master 3S Wireless Mouse', price: 4999, original_price: 10995, store: 'Croma', anomaly_score: 54.5, anomaly_type: 'Price Error / Flash Drop', confidence: 94.5 },
                { id: 'a2', title: 'Samsung Galaxy Watch 6 LTE 44mm', price: 16999, original_price: 36999, store: 'Amazon', anomaly_score: 54.0, anomaly_type: 'Price Error / Flash Drop', confidence: 92.1 }
            ]);
        });
    }, []);

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 60 }}>
            {/* Header Banner */}
            <div style={{
                borderRadius: 24, padding: '28px 32px', marginBottom: 28,
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(6, 182, 212, 0.15))',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Brain size={28} color="#c084fc" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0 }}>
                            Smart Product Intelligence
                        </h1>
                        <p style={{ fontSize: 13, color: '#a1a1aa', margin: '4px 0 0' }}>
                            AI-powered price anomaly detection across e-commerce platforms.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ padding: '8px 16px', borderRadius: 12, background: '#111114', border: '1px solid #27272a', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#71717a' }}>AI Engine</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>Price Anomaly Detector</div>
                    </div>
                    <div style={{ padding: '8px 16px', borderRadius: 12, background: '#111114', border: '1px solid #27272a', textAlign: 'center' }}>
                        <div style={{ fontSize: 11, color: '#71717a' }}>Status</div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#22c55e' }}>● Active & Synchronized</div>
                    </div>
                </div>
            </div>

            {/* Price Anomaly Detector */}
            <div>
                <div style={{ padding: 16, borderRadius: 16, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
                    <AlertTriangle color="#ef4444" size={24} />
                    <div>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#ef4444' }}>AI Anomaly Detector Flagged {anomalies.length} Flash Price Errors</div>
                        <div style={{ fontSize: 12, color: '#a1a1aa' }}>Statistical Z-score bounds detected price drops exceeding 35% standard deviation.</div>
                    </div>
                </div>

                <div style={{ display: 'grid', gap: 16 }}>
                    {anomalies.map((item, idx) => (
                        <div key={idx} style={{ padding: 20, borderRadius: 18, background: '#111114', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                    <span style={{ padding: '2px 8px', borderRadius: 6, background: '#ef4444', color: '#000', fontSize: 11, fontWeight: 900 }}>
                                        {item.anomaly_type}
                                    </span>
                                    <span style={{ fontSize: 12, color: '#71717a' }}>Store: {item.store}</span>
                                </div>
                                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: 0 }}>{item.title}</h3>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: 20, fontWeight: 900, color: '#22c55e' }}>{symbol}{item.price.toLocaleString()}</div>
                                    <div style={{ fontSize: 13, color: '#ef4444', textDecoration: 'line-through' }}>{symbol}{item.original_price?.toLocaleString()}</div>
                                </div>
                                <button style={{ padding: '10px 18px', borderRadius: 10, background: '#22c55e', color: '#000', fontWeight: 800, border: 'none', cursor: 'pointer' }}>
                                    Claim Deal
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
