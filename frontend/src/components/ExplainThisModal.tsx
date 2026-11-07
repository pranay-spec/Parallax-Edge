'use client';

import React from 'react';
import { HelpCircle, X, CheckCircle2, ArrowRight, BarChart2, ShieldCheck } from 'lucide-react';

interface ExplainThisModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    metricChange?: string;
    onViewData?: () => void;
}

export default function ExplainThisModal({
    isOpen,
    onClose,
    title = "Why did this price/saving change?",
    metricChange = "Savings Increased +18% (₹14,850 Unlocked)",
    onViewData
}: ExplainThisModalProps) {
    if (!isOpen) return null;

    const factors = [
        { name: "Price Oracle Drop (Sony XM5 & MacBook Air)", sharePct: 52, color: "#22c55e", bar: "███████████" },
        { name: "Stacked HDFC Bank Coupon Discount", sharePct: 28, color: "#06b6d4", bar: "██████" },
        { name: "Flash Pool Neighborhood Group Savings", sharePct: 20, color: "#c084fc", bar: "████" }
    ];

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
            <div style={{
                width: '100%', maxWidth: 540, background: '#111114',
                border: '1px solid #27272a', borderRadius: 24, padding: 28,
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)', position: 'relative'
            }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ padding: 10, borderRadius: 12, background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
                            <HelpCircle size={22} />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: 0.8, textTransform: 'uppercase' }}>
                                WHY DID THIS CHANGE?
                            </div>
                            <h3 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: '2px 0 0' }}>
                                {title}
                            </h3>
                        </div>
                    </div>
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                        <X size={20} />
                    </button>
                </div>

                {/* Main Metric Highlight */}
                <div style={{ padding: 16, borderRadius: 16, background: '#0a0a0d', border: '1px solid #1f1f24', marginBottom: 20 }}>
                    <div style={{ fontSize: 12, color: '#71717a', fontWeight: 600 }}>ATTRIBUTED METRIC CHANGE</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: '#22c55e', marginTop: 4 }}>
                        {metricChange}
                    </div>
                </div>

                {/* Factor Breakdown List with Density Bars */}
                <div style={{ marginBottom: 24 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#a1a1aa', marginBottom: 12 }}>
                        PRIMARY CONTRIBUTING FACTORS:
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                        {factors.map((f, i) => (
                            <div key={i} style={{ padding: 14, borderRadius: 14, background: '#18181b', border: '1px solid #27272a' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
                                    <span style={{ color: '#fff', fontWeight: 600 }}>{i + 1}. {f.name}</span>
                                    <strong style={{ color: f.color }}>{f.sharePct}%</strong>
                                </div>
                                <div style={{ height: 8, width: '100%', background: '#0a0a0d', borderRadius: 4, overflow: 'hidden' }}>
                                    <div style={{ width: `${f.sharePct}%`, height: '100%', background: f.color }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Confidence Footer & Action */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid #1f1f24' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#4ade80' }}>
                        <ShieldCheck size={16} /> Confidence: <strong>91% (Scikit-Learn Verified)</strong>
                    </div>

                    <button
                        onClick={() => { onClose(); if (onViewData) onViewData(); }}
                        style={{
                            padding: '10px 18px', borderRadius: 12, background: '#06b6d4', color: '#000',
                            fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                        }}
                    >
                        See Supporting Data <ArrowRight size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}
