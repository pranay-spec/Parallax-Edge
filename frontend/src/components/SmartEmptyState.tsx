'use client';

import React from 'react';
import { Sparkles, Play, Activity, Cpu } from 'lucide-react';

interface SmartEmptyStateProps {
    country?: string;
    message?: string;
    onTryDemoData?: () => void;
}

export default function SmartEmptyState({ country = 'India', message, onTryDemoData }: SmartEmptyStateProps) {
    return (
        <div style={{
            padding: '48px 32px', borderRadius: 24, background: '#111114',
            border: '1px solid #1f1f24', textAlign: 'center', maxWidth: 640, margin: '20px auto 40px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)', position: 'relative', overflow: 'hidden'
        }}>
            <div style={{
                width: 64, height: 64, borderRadius: 20, background: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 20px'
            }}>
                <Cpu size={32} color="#06b6d4" />
            </div>

            <h3 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '0 0 8px' }}>
                {message || `No active search insights yet in ${country}`}
            </h3>

            <p style={{ fontSize: 14, color: '#a1a1aa', margin: '0 auto 24px', maxWidth: 440, lineHeight: 1.5 }}>
                Once Parallax Edge starts tracking product titles, we'll automatically identify trends, price error drops, and cohort opportunities.
            </p>

            {/* AI Calibration Progress Bar */}
            <div style={{ maxWidth: 320, margin: '0 auto 28px', padding: 14, borderRadius: 14, background: '#0a0a0d', border: '1px solid #1f1f24' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                    <span style={{ color: '#71717a', fontWeight: 600 }}>AI Calibration Engine</span>
                    <strong style={{ color: '#06b6d4' }}>72% Ready</strong>
                </div>
                <div style={{ height: 6, width: '100%', background: '#1a1a1e', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ width: '72%', height: '100%', background: 'linear-gradient(90deg, #06b6d4, #3b82f6)' }} />
                </div>
            </div>

            {/* Try Demo Data Button */}
            {onTryDemoData && (
                <button
                    onClick={onTryDemoData}
                    style={{
                        padding: '14px 28px', borderRadius: 14,
                        background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                        color: '#fff', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer',
                        display: 'inline-flex', alignItems: 'center', gap: 10,
                        boxShadow: '0 10px 30px rgba(6, 182, 212, 0.4)'
                    }}
                >
                    <Play size={18} fill="#fff" /> Try Demo Data (Instant Judge Mode)
                </button>
            )}
        </div>
    );
}
