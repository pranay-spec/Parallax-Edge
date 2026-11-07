'use client';

import React, { useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, CheckCircle2, ArrowRight, X } from 'lucide-react';

interface WhatChangedBannerProps {
    onReviewChanges: () => void;
}

export default function WhatChangedBanner({ onReviewChanges }: WhatChangedBannerProps) {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <div style={{
            padding: '20px 24px', borderRadius: 20, marginBottom: 24,
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(99, 102, 241, 0.12) 100%)',
            border: '1px solid rgba(6, 182, 212, 0.3)', position: 'relative'
        }}>
            <button
                onClick={() => setDismissed(true)}
                style={{ position: 'absolute', top: 16, right: 16, background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}
            >
                <X size={16} />
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                        <Sparkles size={16} color="#06b6d4" />
                        <span style={{ fontSize: 13, fontWeight: 800, color: '#06b6d4', letterSpacing: 0.5 }}>
                            👋 SINCE YOUR LAST VISIT
                        </span>
                        <span style={{ fontSize: 11, background: 'rgba(6, 182, 212, 0.2)', color: '#fff', padding: '2px 8px', borderRadius: 10, fontWeight: 700 }}>
                            3 New Updates
                        </span>
                    </div>

                    <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginTop: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#e4e4e7' }}>
                            <TrendingUp size={14} color="#22c55e" /> Total Savings: <strong style={{ color: '#22c55e' }}>+18% (₹14,850)</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#e4e4e7' }}>
                            <AlertTriangle size={14} color="#ef4444" /> New Anomaly: <strong style={{ color: '#ef4444' }}>Sony XM5 (23% Drop)</strong>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#e4e4e7' }}>
                            <CheckCircle2 size={14} color="#06b6d4" /> Goal Met: <strong style={{ color: '#fff' }}>MacBook Air M2 Alert</strong>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onReviewChanges}
                    style={{
                        padding: '10px 20px', borderRadius: 12, background: '#06b6d4', color: '#000',
                        fontWeight: 800, fontSize: 13, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                    }}
                >
                    Review Changes <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}
