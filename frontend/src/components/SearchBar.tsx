'use client';

import { useState } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';

interface SearchBarProps {
    onSearch: (query: string, pincode: string) => void;
    isLoading?: boolean;
}

export default function SearchBar({ onSearch, isLoading }: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [pincode, setPincode] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        if (!/^\d{6}$/.test(pincode)) {
            setError('Enter valid 6-digit pincode');
            return;
        }
        setError('');
        onSearch(query, pincode);
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="bg-[var(--bg-card)] rounded-2xl p-2 border border-[var(--border-color)] glow-cyan">
                <div className="flex flex-col sm:flex-row gap-2">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search products..."
                            className="w-full bg-[var(--bg-secondary)] text-white placeholder-[var(--text-muted)] 
                       pl-11 pr-4 py-3.5 rounded-xl border border-transparent
                       focus:border-[var(--accent-cyan)]/50 focus:bg-[var(--bg-card)]
                       transition-all text-sm"
                        />
                    </div>

                    {/* Pincode Input */}
                    <div className="relative sm:w-40">
                        <MapPin size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            type="text"
                            value={pincode}
                            onChange={(e) => {
                                setPincode(e.target.value.replace(/\D/g, '').slice(0, 6));
                                setError('');
                            }}
                            placeholder="Pincode"
                            className={`w-full bg-[var(--bg-secondary)] text-white placeholder-[var(--text-muted)]
                        pl-11 pr-4 py-3.5 rounded-xl border transition-all text-sm
                        ${error ? 'border-red-500' : 'border-transparent focus:border-[var(--accent-green)]/50'}`}
                        />
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading || !query.trim()}
                        className="bg-gradient-to-r from-[var(--accent-cyan)] to-[var(--accent-blue)]
                     text-black font-semibold px-6 py-3.5 rounded-xl text-sm
                     hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed
                     transition-all flex items-center justify-center gap-2 min-w-[120px]"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" size={18} />
                        ) : (
                            'Compare'
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <p className="text-red-400 text-xs mt-2 ml-2">{error}</p>
            )}

            {/* Quick Suggestions */}
            <div className="flex items-center gap-2 mt-4 justify-center flex-wrap">
                <span className="text-[var(--text-muted)] text-xs">Try:</span>
                {['Milk', 'Bread', 'Coffee', 'Chips'].map((item) => (
                    <button
                        key={item}
                        type="button"
                        onClick={() => setQuery(item)}
                        className="px-3 py-1 rounded-full bg-[var(--bg-secondary)] text-[var(--text-secondary)]
                     hover:text-[var(--accent-cyan)] border border-[var(--border-color)]
                     text-xs transition-colors"
                    >
                        {item}
                    </button>
                ))}
            </div>
        </form>
    );
}
