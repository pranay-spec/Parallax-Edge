'use client';

import { Search, PackageX, RefreshCw } from 'lucide-react';

interface EmptyStateProps {
    type: 'initial' | 'no-results' | 'error';
    query?: string;
    onRetry?: () => void;
}

export default function EmptyState({ type, query, onRetry }: EmptyStateProps) {
    if (type === 'initial') {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--accent-cyan)]/20 to-[var(--accent-purple)]/20 
                      flex items-center justify-center mx-auto mb-6">
                    <Search size={28} className="text-[var(--accent-cyan)]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Start Your Search</h3>
                <p className="text-[var(--text-muted)] text-sm max-w-sm mx-auto">
                    Enter a product and pincode to compare prices across platforms
                </p>
            </div>
        );
    }

    if (type === 'no-results') {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 rounded-2xl bg-[var(--bg-card)] flex items-center justify-center mx-auto mb-6">
                    <PackageX size={28} className="text-[var(--text-muted)]" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Results</h3>
                <p className="text-[var(--text-muted)] text-sm">
                    No products found for &quot;{query}&quot;
                </p>
            </div>
        );
    }

    return (
        <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">⚠️</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Something Went Wrong</h3>
            <p className="text-[var(--text-muted)] text-sm mb-4">Please try again</p>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg
                   bg-[var(--accent-cyan)] text-black font-medium text-sm"
                >
                    <RefreshCw size={16} />
                    Retry
                </button>
            )}
        </div>
    );
}
