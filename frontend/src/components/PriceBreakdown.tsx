'use client';

import { PriceBreakdown as PriceBreakdownType } from '@/types';
import { ChevronDown, ChevronUp, Tag, Truck, CreditCard, Percent } from 'lucide-react';
import { useState } from 'react';

interface PriceBreakdownProps {
    breakdown: PriceBreakdownType;
    compact?: boolean;
}

export default function PriceBreakdown({ breakdown, compact = true }: PriceBreakdownProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0,
        }).format(price);
    };

    if (compact) {
        return (
            <div className="space-y-1">
                <div className="text-2xl font-bold text-gradient-cyan">
                    {formatPrice(breakdown.total_landed_cost)}
                </div>
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-xs text-[var(--text-muted)] hover:text-[var(--accent-cyan)] 
                   flex items-center gap-1 transition-colors"
                >
                    View breakdown
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {isExpanded && (
                    <div className="mt-2 p-3 rounded-lg bg-[var(--bg-secondary)] space-y-2 animate-slide-in">
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                                <Tag size={14} />
                                Base Price
                            </span>
                            <span>{formatPrice(breakdown.base_price)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                                <Truck size={14} />
                                Delivery
                            </span>
                            <span className={breakdown.delivery_fee === 0 ? 'text-[var(--accent-green)]' : ''}>
                                {breakdown.delivery_fee === 0 ? 'FREE' : formatPrice(breakdown.delivery_fee)}
                            </span>
                        </div>
                        {breakdown.platform_fee > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                                    <CreditCard size={14} />
                                    Platform Fee
                                </span>
                                <span>{formatPrice(breakdown.platform_fee)}</span>
                            </div>
                        )}
                        {breakdown.discount > 0 && (
                            <div className="flex justify-between text-sm text-[var(--accent-green)]">
                                <span className="flex items-center gap-2">
                                    <Percent size={14} />
                                    Discount
                                </span>
                                <span>-{formatPrice(breakdown.discount)}</span>
                            </div>
                        )}
                        <div className="border-t border-[var(--border-color)] pt-2 mt-2 flex justify-between font-semibold">
                            <span>Total</span>
                            <span className="text-[var(--accent-cyan)]">{formatPrice(breakdown.total_landed_cost)}</span>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Full breakdown view
    return (
        <div className="p-4 rounded-xl bg-[var(--bg-secondary)] space-y-3">
            <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Tag size={16} />
                    Base Price
                </span>
                <span className="font-medium">{formatPrice(breakdown.base_price)}</span>
            </div>
            <div className="flex justify-between items-center">
                <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                    <Truck size={16} />
                    Delivery Fee
                </span>
                <span className={`font-medium ${breakdown.delivery_fee === 0 ? 'text-[var(--accent-green)]' : ''}`}>
                    {breakdown.delivery_fee === 0 ? 'FREE' : formatPrice(breakdown.delivery_fee)}
                </span>
            </div>
            {breakdown.platform_fee > 0 && (
                <div className="flex justify-between items-center">
                    <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                        <CreditCard size={16} />
                        Platform Fee
                    </span>
                    <span className="font-medium">{formatPrice(breakdown.platform_fee)}</span>
                </div>
            )}
            {breakdown.discount > 0 && (
                <div className="flex justify-between items-center text-[var(--accent-green)]">
                    <span className="flex items-center gap-2">
                        <Percent size={16} />
                        Discount Applied
                    </span>
                    <span className="font-medium">-{formatPrice(breakdown.discount)}</span>
                </div>
            )}
            <div className="border-t border-[var(--border-color)] pt-3 flex justify-between items-center">
                <span className="text-lg font-semibold">Total Landed Cost</span>
                <span className="text-2xl font-bold text-gradient-cyan">
                    {formatPrice(breakdown.total_landed_cost)}
                </span>
            </div>
        </div>
    );
}
