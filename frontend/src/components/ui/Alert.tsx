'use client';

import React from 'react';
import { tokens } from '@/styles/tokens';
import { ShieldCheck, AlertTriangle, AlertCircle, Sparkles } from 'lucide-react';

interface AlertProps {
    status?: 'positive' | 'warning' | 'critical' | 'info';
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export default function Alert({
    status = 'info',
    title,
    description,
    actionLabel,
    onAction,
}: AlertProps) {
    const getStatusTheme = () => {
        switch (status) {
            case 'positive':
                return { color: tokens.colors.positive, icon: <ShieldCheck size={20} color={tokens.colors.positive.light} />, badgeText: 'VERIFIED SUCCESS' };
            case 'warning':
                return { color: tokens.colors.warning, icon: <AlertTriangle size={20} color={tokens.colors.warning.light} />, badgeText: 'ATTENTION REQUIRED' };
            case 'critical':
                return { color: tokens.colors.critical, icon: <AlertCircle size={20} color={tokens.colors.critical.light} />, badgeText: 'CRITICAL ANOMALY' };
            case 'info':
                return { color: tokens.colors.info, icon: <Sparkles size={20} color={tokens.colors.info.light} />, badgeText: 'AI INSIGHT' };
        }
    };

    const theme = getStatusTheme();

    return (
        <div style={{
            padding: tokens.spacing.sm,
            borderRadius: '16px',
            background: theme.color.bg,
            border: `1px solid ${theme.color.border}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: tokens.spacing.sm,
            flexWrap: 'wrap',
        }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ marginTop: '2px' }}>{theme.icon}</div>
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: 800, color: theme.color.light, letterSpacing: '0.6px' }}>
                            {theme.badgeText}
                        </span>
                    </div>
                    <div style={{ fontSize: tokens.typography.body.fontSize, fontWeight: 700, color: tokens.colors.textPrimary, marginTop: '2px' }}>
                        {title}
                    </div>
                    <div style={{ fontSize: tokens.typography.metadata.fontSize, color: tokens.colors.textSecondary, marginTop: '2px' }}>
                        {description}
                    </div>
                </div>
            </div>

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    style={{
                        padding: '8px 16px',
                        borderRadius: '10px',
                        background: theme.color.main,
                        color: '#000',
                        fontSize: tokens.typography.metadata.fontSize,
                        fontWeight: 800,
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    {actionLabel}
                </button>
            )}
        </div>
    );
}
