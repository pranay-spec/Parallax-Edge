'use client';
import React, { useState, useEffect } from 'react';
import { Bot, Loader2, Sparkles, Zap, Trophy, ShieldCheck, Clock } from 'lucide-react';

const PLATFORM_AGENTS = [
    { id: 0, name: 'Amazon Agent', platform: 'amazon_in', emoji: '📦', color: '#f59e0b' },
    { id: 1, name: 'Flipkart Agent', platform: 'flipkart', emoji: '🛒', color: '#2874f0' },
    { id: 2, name: 'Croma Agent', platform: 'croma', emoji: '🖥️', color: '#22c55e' },
    { id: 3, name: 'Reliance Agent', platform: 'reliance', emoji: '🏪', color: '#06b6d4' },
    { id: 4, name: 'Local Shop Agent', platform: 'local', emoji: '🏠', color: '#f43f5e' },
];

const MOCK_RESULTS = [
    { agent: 0, product: 'ASUS TUF Gaming F15', price: 74999, delivery: '2 days', rating: 4.5, savings: 15001, url: 'https://www.amazon.in/dp/B08N5WRWNW' },
    { agent: 1, product: 'Acer Nitro V Gaming', price: 71999, delivery: '3 days', rating: 4.3, savings: 18001, url: 'https://www.amazon.in/dp/B08N5WRWNW' },
    { agent: 2, product: 'HP Victus 15', price: 69999, delivery: '1 day', rating: 4.4, savings: 20001, url: 'https://www.amazon.in/dp/B08N5WRWNW' },
    { agent: 3, product: 'Lenovo IdeaPad Gaming 3', price: 67999, delivery: '4 days', rating: 4.2, savings: 22001, url: 'https://www.amazon.in/dp/B08N5WRWNW' },
    { agent: 4, product: 'Local Custom Build', price: 65000, delivery: 'Same day', rating: 4.7, savings: 25000, url: 'https://www.amazon.in/dp/B08N5WRWNW' },
];

export default function AIMarketplace({ symbol, pincode }: { symbol: string; pincode: string }) {
    const [query, setQuery] = useState('');
    const [budget, setBudget] = useState('');
    const [competing, setCompeting] = useState(false);
    const [agentStatuses, setAgentStatuses] = useState<Record<number, 'waiting' | 'searching' | 'done'>>({});
    const [results, setResults] = useState(MOCK_RESULTS);
    const [winnerRevealed, setWinnerRevealed] = useState(false);

    const startCompetition = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setCompeting(true);
        setWinnerRevealed(false);
        
        const q = query.trim() || 'Gaming Laptop';
        
        let userBudget = parseInt(budget.replace(/[^0-9]/g, ''));
        if (isNaN(userBudget) || userBudget <= 0) {
            userBudget = 70000;
        }

        const basePrice = userBudget;
        
        setResults([
            { agent: 0, product: `Premium ${q} (Pro)`, price: Math.round(basePrice * 1.15), delivery: '2 days', rating: 4.5, savings: 0, url: 'https://www.amazon.in/dp/B08N5WRWNW' },
            { agent: 1, product: `Standard ${q} Edition`, price: Math.round(basePrice * 1.08), delivery: '3 days', rating: 4.3, savings: Math.round(basePrice * 0.07), url: 'https://www.amazon.in/dp/B08N5WRWNW' },
            { agent: 2, product: `Advanced ${q} v2`, price: Math.round(basePrice * 1.02), delivery: '1 day', rating: 4.4, savings: Math.round(basePrice * 0.13), url: 'https://www.amazon.in/dp/B08N5WRWNW' },
            { agent: 3, product: `Value ${q} Deal`, price: Math.round(basePrice * 0.98), delivery: '4 days', rating: 4.2, savings: Math.round(basePrice * 0.17), url: 'https://www.amazon.in/dp/B08N5WRWNW' },
            { agent: 4, product: `Local Custom ${q}`, price: Math.round(basePrice * 0.92), delivery: 'Same day', rating: 4.7, savings: Math.round(basePrice * 0.23), url: 'https://www.amazon.in/dp/B08N5WRWNW' },
        ]);
        
        const initialStatus: Record<number, 'searching'> = {};
        PLATFORM_AGENTS.forEach(a => initialStatus[a.id] = 'searching');
        setAgentStatuses(initialStatus);

        let finished = 0;
        PLATFORM_AGENTS.forEach((agent) => {
            const timeToFinish = 1500 + Math.random() * 2000;
            setTimeout(() => {
                setAgentStatuses(prev => ({ ...prev, [agent.id]: 'done' }));
                finished++;
                if (finished === PLATFORM_AGENTS.length) {
                    setTimeout(() => setWinnerRevealed(true), 500);
                }
            }, timeToFinish);
        });
    };

    const containerStyle: React.CSSProperties = {
        backgroundColor: '#0a0a0f',
        color: '#fff',
        padding: '2.5rem',
        borderRadius: '20px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '1000px',
        margin: '0 auto',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
        position: 'relative'
    };

    const winnerId = 4; // Local shop wins in mock

    return (
        <div style={containerStyle}>
            {!competing ? (
                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                    <Bot size={56} color="#06b6d4" style={{ margin: '0 auto 1.5rem' }} />
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '0 0 1rem', background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        AI Agents Marketplace
                    </h2>
                    <p style={{ color: '#a1a1aa', fontSize: '1.1rem', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
                        Describe what you need, and our platform agents will compete in real-time to find the best deal near {pincode}.
                    </p>

                    <form onSubmit={startCompetition} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxWidth: '600px', margin: '0 auto' }}>
                        <textarea 
                            placeholder="What do you need? (e.g., A gaming laptop with RTX 4060...)"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            style={{ width: '100%', padding: '1rem', background: '#111114', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', minHeight: '120px', resize: 'none', outline: 'none' }}
                        />
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <input 
                                type="number" 
                                placeholder="Max Budget"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                style={{ flex: 1, padding: '1rem', background: '#111114', border: '1px solid #3f3f46', borderRadius: '12px', color: '#fff', fontSize: '1.1rem', outline: 'none' }}
                            />
                            <button type="submit" style={{ flex: 1, background: 'linear-gradient(90deg, #06b6d4, #8b5cf6)', color: '#fff', padding: '1rem', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Zap size={20} /> Deploy Agents
                            </button>
                        </div>
                    </form>

                    <button onClick={() => { setQuery('Gaming Laptop under 1,20,000'); setBudget('120000'); setTimeout(startCompetition, 100); }} style={{ marginTop: '2rem', background: 'transparent', border: '1px solid #3f3f46', color: '#a1a1aa', padding: '0.5rem 1rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.9rem', transition: 'all 0.2s' }}>
                        Try: Gaming Laptop under {symbol}1,20,000
                    </button>
                </div>
            ) : (
                <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
                        <div>
                            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 0.5rem' }}>Agents Competing</h3>
                            <p style={{ color: '#a1a1aa', margin: 0 }}>Finding deals for "{query || 'Gaming Laptop under 1,20,000'}"</p>
                        </div>
                        {winnerRevealed && (
                            <button onClick={() => setCompeting(false)} style={{ background: '#1a1a1e', color: '#fff', border: '1px solid #3f3f46', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer' }}>
                                Reset
                            </button>
                        )}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                        {PLATFORM_AGENTS.map((agent) => {
                            const status = agentStatuses[agent.id] || 'waiting';
                            const result = results.find(r => r.agent === agent.id);
                            const isWinner = winnerRevealed && agent.id === winnerId;

                            return (
                                <div key={agent.id} style={{ 
                                    background: isWinner ? 'linear-gradient(180deg, rgba(245, 158, 11, 0.1) 0%, rgba(17, 17, 20, 1) 100%)' : '#111114', 
                                    border: isWinner ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.05)', 
                                    borderRadius: '16px', 
                                    padding: '1.5rem', 
                                    position: 'relative',
                                    transition: 'all 0.3s ease',
                                    transform: isWinner ? 'scale(1.02)' : 'scale(1)',
                                    boxShadow: isWinner ? '0 10px 30px -10px rgba(245, 158, 11, 0.3)' : 'none'
                                }}>
                                    {isWinner && (
                                        <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', color: '#000', padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
                                            <Trophy size={14} /> WINNER
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                                        <div style={{ fontSize: '2rem', width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {agent.emoji}
                                        </div>
                                        <div>
                                            <h4 style={{ margin: '0 0 0.2rem', fontWeight: 700, fontSize: '1.1rem' }}>{agent.name}</h4>
                                            <span style={{ fontSize: '0.8rem', color: agent.color, fontWeight: 600 }}>{agent.platform}</span>
                                        </div>
                                    </div>

                                    {status === 'searching' && (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2rem 0', color: '#a1a1aa' }}>
                                            <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem', color: agent.color }} />
                                            <span style={{ fontSize: '0.9rem' }}>Searching deals...</span>
                                        </div>
                                    )}

                                    {status === 'done' && result && (
                                        <div style={{ animation: 'fadeIn 0.4s ease' }}>
                                            <h5 style={{ margin: '0 0 1rem', fontSize: '1.1rem', fontWeight: 600, color: '#fff', lineHeight: 1.3 }}>{result.product}</h5>
                                            <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fff', marginBottom: '1rem' }}>
                                                {symbol}{result.price.toLocaleString()}
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa', fontSize: '0.9rem' }}>
                                                    <Clock size={16} /> Delivery: <span style={{ color: '#fff' }}>{result.delivery}</span>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa', fontSize: '0.9rem' }}>
                                                    <ShieldCheck size={16} /> Rating: <span style={{ color: '#fff' }}>{result.rating} ★</span>
                                                </div>
                                            </div>
                                            
                                            <a 
                                                href={result.url || '#'} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{
                                                    display: 'block', width: '100%', marginTop: '1.5rem',
                                                    padding: '0.75rem', textAlign: 'center', borderRadius: '10px',
                                                    background: isWinner ? '#f59e0b' : 'rgba(255,255,255,0.05)',
                                                    color: isWinner ? '#000' : '#fff', textDecoration: 'none',
                                                    fontWeight: 700, fontSize: '0.9rem',
                                                    transition: 'all 0.2s ease',
                                                    border: isWinner ? 'none' : '1px solid rgba(255,255,255,0.1)'
                                                }}
                                                onMouseOver={(e) => {
                                                    if (!isWinner) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                                }}
                                                onMouseOut={(e) => {
                                                    if (!isWinner) e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                                }}
                                            >
                                                View Deal
                                            </a>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            `}} />
        </div>
    );
}
