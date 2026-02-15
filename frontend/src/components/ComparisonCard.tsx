'use client';

import { ProductGroup } from '@/types';
import ProductCard from './ProductCard';
import { ChevronDown, ChevronUp, TrendingDown, Clock } from 'lucide-react';
import { useState } from 'react';

interface ComparisonCardProps {
    group: ProductGroup;
    index?: number;
}

export default function ComparisonCard({ group, index = 0 }: ComparisonCardProps) {
    const [expanded, setExpanded] = useState(false);
    const extraProducts = group.products.filter(
        p => p.id !== group.best_price.id && p.id !== group.fastest_delivery.id
    );

    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

    return (
        <div
            className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden opacity-0 animate-slide-in"
            style={{ animationDelay: `${index * 100}ms` }}
        >
            {/* Header */}
            <div className="p-5 border-b border-[var(--border-color)]">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-semibold line-clamp-1">{group.canonical_title}</h3>
                        <p className="text-sm text-[var(--text-muted)] mt-1">{group.products.length} options available</p>
                    </div>

                    {/* Stats */}
                    <div className="flex gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-green)]/10 border border-[var(--accent-green)]/20">
                            <TrendingDown size={16} className="text-[var(--accent-green)]" />
                            <div>
                                <p className="text-xs text-[var(--text-muted)]">Best Price</p>
                                <p className="text-sm font-bold text-[var(--accent-green)]">
                                    {formatPrice(group.best_price.price_breakdown.total_landed_cost)}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--accent-cyan)]/10 border border-[var(--accent-cyan)]/20">
                            <Clock size={16} className="text-[var(--accent-cyan)]" />
                            <div>
                                <p className="text-xs text-[var(--text-muted)]">Fastest</p>
                                <p className="text-sm font-bold text-[var(--accent-cyan)]">{group.fastest_delivery.eta_display}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Trade-off Message */}
                {group.savings_message && (
                    <div className="mt-4 px-4 py-3 rounded-xl bg-[var(--accent-purple)]/10 border border-[var(--accent-purple)]/20">
                        <p className="text-sm">
                            <span className="text-[var(--accent-purple)] font-medium">💡 </span>
                            {group.savings_message}
                        </p>
                    </div>
                )}
            </div>

            {/* Products */}
            <div className="p-5 space-y-3">
                <ProductCard
                    product={group.best_price}
                    label="Best Price"
                    labelColor="green"
                />

                {group.best_price.id !== group.fastest_delivery.id && (
                    <ProductCard
                        product={group.fastest_delivery}
                        label="Fastest"
                        labelColor="cyan"
                    />
                )}

                {/* More Options */}
                {extraProducts.length > 0 && (
                    <>
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="w-full flex items-center justify-center gap-2 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors"
                        >
                            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                            {expanded ? 'Show less' : `Show ${extraProducts.length} more`}
                        </button>

                        {expanded && (
                            <div className="space-y-3">
                                {extraProducts.map((product) => (
                                    <ProductCard key={product.id} product={product} />
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
