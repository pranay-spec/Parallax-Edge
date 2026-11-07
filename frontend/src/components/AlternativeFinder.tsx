'use client';
import { useState } from 'react';
import { Search, ArrowRight, Star, Shield, TrendingDown, Zap, Loader2, Package, Award, ThumbsUp } from 'lucide-react';
import { PLATFORM_CONFIG } from '@/types';

interface AlternativeFinderProps {
    symbol: string;
    pincode: string;
}

const MOCK_ALTERNATIVES: Record<string, Array<{
    name: string; brand: string; price: number; originalProductPrice: number;
    rating: number; reviews: number; platform: string;
    tag: 'cheaper' | 'better_quality' | 'best_value' | 'local';
    tagLabel: string; tagColor: string; matchScore: number; image: string; url: string;
}>> = {
    'nike shoes': [
        { name: 'Adidas Ultraboost Light', brand: 'Adidas', price: 8999, originalProductPrice: 12999, rating: 4.6, reviews: 23400, platform: 'Amazon', tag: 'cheaper', tagLabel: '31% Cheaper', tagColor: '#22c55e', matchScore: 94, image: '👟', url: 'https://www.amazon.in/dp/B08N5WRWNW' },
        { name: 'New Balance 990v6', brand: 'New Balance', price: 14999, originalProductPrice: 12999, rating: 4.8, reviews: 8900, platform: 'Amazon', tag: 'better_quality', tagLabel: 'Better Quality', tagColor: '#8b5cf6', matchScore: 91, image: '👟', url: 'https://www.amazon.in/dp/B08N5WRWNW' },
        { name: 'Puma RS-X', brand: 'Puma', price: 6999, originalProductPrice: 12999, rating: 4.3, reviews: 15600, platform: 'Amazon', tag: 'best_value', tagLabel: 'Best Value', tagColor: '#f59e0b', matchScore: 88, image: '👟', url: 'https://www.amazon.in/dp/B08N5WRWNW' },
        { name: 'Campus Running Pro', brand: 'Campus', price: 2499, originalProductPrice: 12999, rating: 4.1, reviews: 45000, platform: 'Amazon', tag: 'local', tagLabel: 'Locally Available', tagColor: '#06b6d4', matchScore: 72, image: '👟', url: 'https://www.amazon.in/dp/B08N5WRWNW' },
    ],
    'default': [
        { name: 'Pro Alternative A', brand: 'BrandX', price: 5999, originalProductPrice: 8999, rating: 4.5, reviews: 1200, platform: 'Amazon', tag: 'cheaper', tagLabel: 'Cheaper', tagColor: '#22c55e', matchScore: 89, image: '📦', url: 'https://www.amazon.in/dp/B08N5WRWNW' },
        { name: 'Premium Alternative B', brand: 'BrandY', price: 10999, originalProductPrice: 8999, rating: 4.9, reviews: 850, platform: 'Amazon', tag: 'better_quality', tagLabel: 'Better Quality', tagColor: '#8b5cf6', matchScore: 92, image: '📦', url: 'https://www.amazon.in/dp/B08N5WRWNW' },
        { name: 'Value Alternative C', brand: 'BrandZ', price: 6499, originalProductPrice: 8999, rating: 4.4, reviews: 3200, platform: 'Myntra', tag: 'best_value', tagLabel: 'Best Value', tagColor: '#f59e0b', matchScore: 85, image: '📦', url: 'https://www.myntra.com/' },
    ]
};

export default function AlternativeFinder({ symbol, pincode }: AlternativeFinderProps) {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<any[] | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'cheaper' | 'better_quality' | 'best_value' | 'local'>('all');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;
        
        setLoading(true);
        setResults(null);
        
        setTimeout(() => {
            const key = query.toLowerCase().includes('nike') ? 'nike shoes' : 'default';
            setResults(MOCK_ALTERNATIVES[key]);
            setLoading(false);
        }, 1500);
    };

    const filteredResults = results ? (activeFilter === 'all' ? results : results.filter(r => r.tag === activeFilter)) : [];

    const getIconForTag = (tag: string, color: string) => {
        switch (tag) {
            case 'cheaper': return <TrendingDown size={14} color={color} />;
            case 'better_quality': return <Star size={14} color={color} />;
            case 'best_value': return <Zap size={14} color={color} />;
            case 'local': return <Package size={14} color={color} />;
            default: return <Award size={14} color={color} />;
        }
    };

    return (
        <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', color: '#fff', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
            <div style={{ marginBottom: '32px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                    <div style={{ background: 'rgba(139, 92, 246, 0.1)', padding: '16px', borderRadius: '50%' }}>
                        <Search size={32} style={{ color: '#8b5cf6' }} />
                    </div>
                </div>
                <h1 style={{ fontSize: '36px', fontWeight: 'bold', margin: '0 0 12px 0' }}>AI Alternative Finder</h1>
                <p style={{ color: '#a1a1aa', margin: 0, fontSize: '18px', maxWidth: '600px', marginLeft: 'auto', marginRight: 'auto' }}>
                    Don't settle. Find cheaper, better, or more accessible alternatives for any product instantly.
                </p>
            </div>

            <form onSubmit={handleSearch} style={{ maxWidth: '700px', margin: '0 auto 40px auto', position: 'relative' }}>
                <input 
                    type="text" 
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Enter product name (e.g., Nike Shoes)" 
                    style={{
                        width: '100%',
                        padding: '20px 24px',
                        paddingRight: '140px',
                        background: '#111114',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '16px',
                        fontSize: '18px',
                        color: 'white',
                        outline: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                    }}
                />
                <button 
                    type="submit"
                    disabled={loading || !query.trim()}
                    style={{
                        position: 'absolute',
                        right: '8px',
                        top: '8px',
                        bottom: '8px',
                        background: '#8b5cf6',
                        color: 'white',
                        border: 'none',
                        padding: '0 24px',
                        borderRadius: '10px',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
                        opacity: loading || !query.trim() ? 0.7 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    {loading ? <Loader2 className="animate-spin" size={20} style={{ animation: 'spin 1s linear infinite' }} /> : 'Find'}
                </button>
            </form>

            {loading && (
                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                    <Loader2 size={40} style={{ color: '#8b5cf6', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} className="animate-spin" />
                    <p style={{ color: '#a1a1aa', fontSize: '18px' }}>Scanning millions of products for the best alternatives...</p>
                </div>
            )}

            {results && !loading && (
                <div>
                    <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginBottom: '32px' }}>
                        {[
                            { id: 'all', label: 'All Alternatives' },
                            { id: 'cheaper', label: 'Cheaper' },
                            { id: 'better_quality', label: 'Better Quality' },
                            { id: 'best_value', label: 'Best Value' },
                            { id: 'local', label: 'Locally Available' }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveFilter(tab.id as any)}
                                style={{
                                    background: activeFilter === tab.id ? '#1a1a2e' : 'transparent',
                                    border: `1px solid ${activeFilter === tab.id ? '#8b5cf6' : 'rgba(255,255,255,0.1)'}`,
                                    color: activeFilter === tab.id ? '#8b5cf6' : '#a1a1aa',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '14px',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                        {filteredResults.map((item, index) => (
                            <div key={index} style={{
                                background: '#111114',
                                border: '1px solid rgba(255,255,255,0.05)',
                                borderRadius: '16px',
                                padding: '24px',
                                display: 'flex',
                                flexDirection: 'column',
                                transition: 'transform 0.2s, box-shadow 0.2s',
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)';
                                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.3)';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                            }}
                            >
                                <div style={{ 
                                    position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
                                    background: item.tagColor
                                }} />
                                
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                    <div style={{
                                        background: `${item.tagColor}15`,
                                        color: item.tagColor,
                                        padding: '4px 12px',
                                        borderRadius: '12px',
                                        fontSize: '12px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '6px'
                                    }}>
                                        {getIconForTag(item.tag, item.tagColor)}
                                        {item.tagLabel}
                                    </div>
                                    
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '4px 8px', borderRadius: '8px' }}>
                                        <div style={{ position: 'relative', width: '20px', height: '20px' }}>
                                            <svg viewBox="0 0 36 36" style={{ width: '100%', height: '100%', transform: 'rotate(-90deg)' }}>
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke={item.tagColor} strokeWidth="3" strokeDasharray={`${item.matchScore}, 100`} />
                                            </svg>
                                        </div>
                                        <span style={{ fontSize: '12px', fontWeight: 'bold' }}>{item.matchScore}%</span>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
                                    <div style={{ width: '64px', height: '64px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>
                                        {item.image}
                                    </div>
                                    <div>
                                        <h3 style={{ margin: '0 0 4px 0', fontSize: '18px', fontWeight: '600' }}>{item.name}</h3>
                                        <p style={{ margin: 0, color: '#a1a1aa', fontSize: '14px' }}>by {item.brand}</p>
                                    </div>
                                </div>

                                <div style={{ marginTop: 'auto' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                                        <h4 style={{ margin: 0, fontSize: '24px', fontWeight: 'bold', color: item.price < item.originalProductPrice ? '#22c55e' : '#fff' }}>
                                            {symbol}{item.price.toLocaleString()}
                                        </h4>
                                        {item.price < item.originalProductPrice && (
                                            <span style={{ color: '#a1a1aa', textDecoration: 'line-through', fontSize: '14px' }}>
                                                {symbol}{item.originalProductPrice.toLocaleString()}
                                            </span>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#a1a1aa', fontSize: '14px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Star size={14} color="#f59e0b" fill="#f59e0b" />
                                            <span style={{ color: '#fff', fontWeight: '500' }}>{item.rating}</span>
                                            <span>({item.reviews.toLocaleString()})</span>
                                        </div>
                                        <div>via {item.platform}</div>
                                    </div>
                                    
                                    <a 
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                        width: '100%',
                                        marginTop: '16px',
                                        background: 'rgba(255,255,255,0.05)',
                                        color: 'white',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        padding: '12px',
                                        borderRadius: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        gap: '8px',
                                        cursor: 'pointer',
                                        transition: 'background 0.2s',
                                        textDecoration: 'none',
                                        boxSizing: 'border-box'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    >
                                        View Deal <ArrowRight size={16} />
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
