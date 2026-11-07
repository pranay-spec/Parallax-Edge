'use client';

import React from 'react';
import { tokens } from '@/styles/tokens';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
    size?: 'sm' | 'md' | 'lg';
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export default function Button({
    variant = 'primary',
    size = 'md',
    icon,
    children,
    style,
    ...props
}: ButtonProps) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return {
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(6, 182, 212, 0.3)',
                };
            case 'secondary':
                return {
                    background: tokens.colors.bgSurface,
                    color: tokens.colors.textPrimary,
                    border: `1px solid ${tokens.colors.borderLight}`,
                };
            case 'success':
                return {
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    color: '#fff',
                    border: 'none',
                    boxShadow: '0 4px 14px rgba(34, 197, 94, 0.3)',
                };
            case 'danger':
                return {
                    background: tokens.colors.critical.bg,
                    color: tokens.colors.critical.light,
                    border: `1px solid ${tokens.colors.critical.border}`,
                };
            case 'ghost':
                return {
                    background: 'transparent',
                    color: tokens.colors.textSecondary,
                    border: 'none',
                };
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return { padding: '6px 12px', fontSize: '12px', borderRadius: '8px' };
            case 'md':
                return { padding: '10px 18px', fontSize: '14px', borderRadius: '12px' };
            case 'lg':
                return { padding: '14px 24px', fontSize: '16px', borderRadius: '14px' };
        }
    };

    return (
        <button
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontWeight: 700,
                cursor: props.disabled ? 'not-allowed' : 'pointer',
                opacity: props.disabled ? 0.6 : 1,
                transition: 'all 0.15s ease',
                ...getVariantStyles(),
                ...getSizeStyles(),
                ...style,
            }}
            {...props}
        >
            {icon}
            {children}
        </button>
    );
}
