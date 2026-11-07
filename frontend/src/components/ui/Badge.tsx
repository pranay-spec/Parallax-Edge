'use client';

import React from 'react';
import { tokens } from '@/styles/tokens';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

interface BadgeProps {
    status?: 'positive' | 'warning' | 'critical' | 'info';
    text: string;
    subText?: string;
    icon?: React.ReactNode;
}

export default function Badge({ status = 'info', text, subText, icon }: BadgeProps) {
    const getStatusTheme = () => {
        switch (status) {
            case 'positive':
                return {
                    color: tokens.colors.positive,
                    defaultIcon: <CheckCircle2 size={13} color={tokens.colors.positive.light} />,
                    symbol: '↑'
                };
            case 'warning':
                return {
                    color: tokens.colors.warning,
                    defaultIcon: <AlertTriangle size={13} color={tokens.colors.warning.light} />,
                    symbol: '⚡'
                };
            case 'critical':
                return {
                    color: tokens.colors.critical,
                    defaultIcon: <AlertCircle size={13} color={tokens.colors.critical.light} />,
                    symbol: '↓'
                };
            case 'info':
                return {
                    color: tokens.colors.info,
                    defaultIcon: <Info size={13} color={tokens.colors.info.light} />,
                    symbol: 'ℹ'
                };
        }
    };

    const theme = getStatusTheme();

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 10px',
            borderRadius: '8px',
            background: theme.color.bg,
            border: `1px solid ${theme.color.border}`,
            color: theme.color.light,
            fontSize: tokens.typography.metadata.fontSize,
            fontWeight: tokens.typography.metadata.fontWeight,
            lineHeight: 1,
        }}>
            {icon || theme.defaultIcon}
            <span>{text}</span>
            {subText && (
                <span style={{ color: tokens.colors.textMuted, fontSize: '11px', fontWeight: 500 }}>
                    • {subText}
                </span>
            )}
        </span>
    );
}
