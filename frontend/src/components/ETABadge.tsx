'use client';

import { Clock, Zap, Truck } from 'lucide-react';
import { DeliverySpeed } from '@/types';

interface ETABadgeProps {
    etaDisplay: string;
    etaMinutes: number;
    deliverySpeed: DeliverySpeed;
}

export default function ETABadge({ etaDisplay, etaMinutes, deliverySpeed }: ETABadgeProps) {
    const isExpress = deliverySpeed === 'express';
    const isQuick = etaMinutes <= 30;

    const getIcon = () => {
        if (isQuick) return <Zap size={14} className="fill-current" />;
        if (isExpress) return <Clock size={14} />;
        return <Truck size={14} />;
    };

    const getStyles = () => {
        if (isQuick) {
            return 'bg-gradient-to-r from-[var(--accent-green)] to-[var(--accent-cyan)] text-black animate-pulse-glow';
        }
        if (isExpress) {
            return 'bg-[var(--accent-cyan)]/20 text-[var(--accent-cyan)] border border-[var(--accent-cyan)]/30';
        }
        return 'bg-[var(--bg-card)] text-[var(--text-secondary)] border border-[var(--border-color)]';
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${getStyles()}`}
        >
            {getIcon()}
            <span>{etaDisplay}</span>
        </span>
    );
}
