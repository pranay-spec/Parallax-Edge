'use client';

import React from 'react';
import { tokens } from '@/styles/tokens';

interface CardProps {
    children: React.ReactNode;
    padding?: keyof typeof tokens.spacing;
    hoverable?: boolean;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export default function Card({
    children,
    padding = 'md',
    hoverable = false,
    style,
    onClick,
}: CardProps) {
    return (
        <div
            onClick={onClick}
            style={{
                background: tokens.colors.bgCard,
                border: `1px solid ${tokens.colors.border}`,
                borderRadius: '20px',
                padding: tokens.spacing[padding],
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
                transition: hoverable ? 'all 0.15s ease' : 'none',
                cursor: onClick || hoverable ? 'pointer' : 'default',
                ...style,
            }}
        >
            {children}
        </div>
    );
}
