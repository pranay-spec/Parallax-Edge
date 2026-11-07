'use client';

export default function LoadingSkeleton() {
    return (
        <div className="space-y-6">
            {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] overflow-hidden">
                    <div className="p-5 border-b border-[var(--border-color)]">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="h-5 w-64 rounded shimmer mb-2" />
                                <div className="h-4 w-32 rounded shimmer" />
                            </div>
                            <div className="flex gap-3">
                                <div className="h-14 w-28 rounded-xl shimmer" />
                                <div className="h-14 w-28 rounded-xl shimmer" />
                            </div>
                        </div>
                    </div>
                    <div className="p-5 space-y-3">
                        {[1, 2].map((j) => (
                            <div key={j} className="rounded-xl p-4 bg-[var(--bg-secondary)]">
                                <div className="flex gap-4">
                                    <div className="w-20 h-20 rounded-lg shimmer" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 w-24 rounded shimmer" />
                                        <div className="h-4 w-full rounded shimmer" />
                                        <div className="h-3 w-20 rounded shimmer" />
                                    </div>
                                    <div className="w-20 h-12 rounded shimmer" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
