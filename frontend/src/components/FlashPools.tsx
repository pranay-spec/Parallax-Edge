'use client';

import React, { useState } from 'react';
import { MapPin, Users, MessageCircle, Clock, ShieldCheck, Check, X, ArrowRight, Share2, Wallet, Store, Send, Search } from 'lucide-react';

interface User {
    id: string;
    name: string;
    avatar: string;
    trustScore: number;
    distance: string;
}

interface Pool {
    id: string;
    item: string;
    store: string;
    originalPrice: number;
    discountedPrice: number;
    members: User[];
    targetMembers: number;
    timeLeftMinutes: number;
    latitude: number;
    longitude: number;
}

const MOCK_POOLS: Pool[] = [
    {
        id: 'p1',
        item: 'Aashirvaad Atta 10kg',
        store: 'Local Wholesale Mart',
        originalPrice: 450,
        discountedPrice: 380,
        members: [
            { id: 'u1', name: 'Rahul Sharma', avatar: 'RS', trustScore: 4.8, distance: '0.1 km' },
            { id: 'u2', name: 'Priya Patel', avatar: 'PP', trustScore: 4.9, distance: '0.2 km' }
        ],
        targetMembers: 5,
        timeLeftMinutes: 45,
        latitude: 28.6139,
        longitude: 77.2090
    },
    {
        id: 'p2',
        item: 'Amul Butter 500g',
        store: 'Metro Cash & Carry',
        originalPrice: 260,
        discountedPrice: 210,
        members: [
            { id: 'u3', name: 'Amit Kumar', avatar: 'AK', trustScore: 4.2, distance: '0.4 km' },
            { id: 'u4', name: 'Neha Gupta', avatar: 'NG', trustScore: 4.7, distance: '0.5 km' },
            { id: 'u5', name: 'Vikram Singh', avatar: 'VS', trustScore: 4.5, distance: '0.3 km' }
        ],
        targetMembers: 4,
        timeLeftMinutes: 15,
        latitude: 28.6145,
        longitude: 77.2105
    }
];

export default function FlashPools() {
    const [pools, setPools] = useState<Pool[]>(MOCK_POOLS);
    const [selectedPool, setSelectedPool] = useState<Pool | null>(MOCK_POOLS[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [hasJoined, setHasJoined] = useState(false);
    const [chatMessages, setChatMessages] = useState<{sender: string, text: string, isMe: boolean}[]>([
        { sender: 'Rahul Sharma', text: 'Hey neighbors! If we get 3 more people we can unlock the 15% discount.', isMe: false },
        { sender: 'Priya Patel', text: 'I just joined! I can pick it up on my way back from work.', isMe: false }
    ]);
    const [chatInput, setChatInput] = useState('');
    const [showPayment, setShowPayment] = useState(false);

    const handleCreateOrSearchPool = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;
        const query = searchQuery.trim();
        
        // Check if pool already exists
        const existing = pools.find(p => p.item.toLowerCase().includes(query.toLowerCase()));
        if (existing) {
            setSelectedPool(existing);
            setHasJoined(false);
            return;
        }

        // Otherwise start a new pool dynamically
        const newPool: Pool = {
            id: `p_${Date.now()}`,
            item: query,
            store: 'Direct Wholesaler / HSR Wholesale Hub',
            originalPrice: 15000, 
            discountedPrice: 12750, // 15% discount
            members: [
                { id: 'u_s1', name: 'Rahul Sharma', avatar: 'RS', trustScore: 4.8, distance: '0.2 km' },
                { id: 'u_s2', name: 'Priya Patel', avatar: 'PP', trustScore: 4.9, distance: '0.4 km' },
                { id: 'u_s3', name: 'Amit Kumar', avatar: 'AK', trustScore: 4.4, distance: '0.6 km' }
            ],
            targetMembers: 5,
            timeLeftMinutes: 59,
            latitude: 28.6139,
            longitude: 77.2090
        };

        setPools(prev => [newPool, ...prev]);
        setSelectedPool(newPool);
        setHasJoined(false);
        setSearchQuery('');
        
        setChatMessages([
            { sender: 'Rahul Sharma', text: `Glad you started a pool for ${query}! We only need 2 more neighbors to unlock the wholesale price!`, isMe: false },
            { sender: 'Priya Patel', text: `I'm in too! Let's get the deal unlocked.`, isMe: false }
        ]);
    };

    const handleJoin = () => {
        setHasJoined(true);
        setShowPayment(false);
        setChatMessages(prev => [...prev, { sender: 'System', text: 'You joined the pool! Escrow payment locked.', isMe: false }]);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!chatInput.trim()) return;
        setChatMessages(prev => [...prev, { sender: 'You', text: chatInput, isMe: true }]);
        setChatInput('');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, minHeight: '78vh', width: '100%', paddingBottom: 40 }}>
            
            {/* Top Stats Banner */}
            <div style={{
                borderRadius: 24,
                background: 'linear-gradient(135deg, #062038 0%, #0c0c0e 100%)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                padding: '24px 32px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexWrap: 'wrap', gap: 20,
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        padding: 14, borderRadius: 16,
                        backgroundColor: 'rgba(6, 182, 212, 0.15)',
                        border: '1px solid rgba(6, 182, 212, 0.3)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Users color="#22d3ee" size={28} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
                            Flash Pools & Group Orders
                        </h2>
                        <p style={{ color: '#a1a1aa', fontSize: 13 }}>
                            Join nearby neighbors to unlock wholesale discounts on everyday items.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                    <div style={{
                        backgroundColor: '#111114', padding: '10px 20px', borderRadius: 14,
                        border: '1px solid #27272a', textAlign: 'center'
                    }}>
                        <p style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Community Savings</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: '#4ade80', marginTop: 2 }}>₹1,450</p>
                    </div>
                    <div style={{
                        backgroundColor: '#111114', padding: '10px 20px', borderRadius: 14,
                        border: '1px solid #27272a', textAlign: 'center'
                    }}>
                        <p style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trust Score</p>
                        <p style={{ fontSize: 18, fontWeight: 800, color: '#facc15', marginTop: 2 }}>⭐️ 5.0</p>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24, flex: 1, minHeight: 520
            }}>
                {/* Left Sidebar: Radar Map & Pools List */}
                <div style={{
                    backgroundColor: '#0c0c0e', border: '1px solid #27272a',
                    borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                }}>
                    
                    {/* Radar Map Area */}
                    <div style={{
                        width: '100%', height: 160, backgroundColor: '#060608',
                        position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderBottom: '1px solid #27272a'
                    }}>
                        <div style={{
                            position: 'absolute', inset: 0, opacity: 0.15,
                            backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)',
                            backgroundSize: '20px 20px'
                        }} />
                        <div style={{ position: 'absolute', width: 14, height: 14, backgroundColor: '#38bdf8', borderRadius: '50%', opacity: 0.4 }} />
                        <div style={{ position: 'absolute', width: 8, height: 8, backgroundColor: '#38bdf8', borderRadius: '50%' }} />
                        
                        <span style={{
                            position: 'relative', zIndex: 10, fontSize: 11, fontWeight: 700,
                            color: '#38bdf8', backgroundColor: 'rgba(14, 116, 144, 0.8)',
                            padding: '4px 10px', borderRadius: 8, border: '1px solid #0284c7'
                        }}>
                            📍 HSR Layout (You are here)
                        </span>

                        <MapPin style={{ position: 'absolute', top: '25%', left: '25%', color: '#22d3ee' }} size={18} />
                        <MapPin style={{ position: 'absolute', bottom: '30%', right: '30%', color: '#22d3ee' }} size={18} />
                    </div>

                    {/* Pools List */}
                    <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14, flex: 1, overflowY: 'auto' }}>
                        <h3 style={{ fontSize: 13, fontWeight: 800, color: '#e4e4e7', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                            Active Nearby Pools (5km)
                        </h3>

                        {/* Search & Start buying pool */}
                        <form onSubmit={handleCreateOrSearchPool} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={14} color="#71717a" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)' }} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search or start pool..."
                                    style={{
                                        width: '100%', padding: '6px 8px 6px 28px', background: '#111114',
                                        border: '1px solid #27272a', borderRadius: 8, color: '#fff', fontSize: 12, outline: 'none'
                                    }}
                                />
                            </div>
                            <button
                                type="submit"
                                style={{
                                    background: '#06b6d4', border: 'none', borderRadius: 8,
                                    padding: '6px 12px', color: '#000', fontWeight: 'bold', fontSize: 12, cursor: 'pointer'
                                }}
                            >
                                Start
                            </button>
                        </form>

                        {pools.map(pool => {
                            const isSelected = selectedPool?.id === pool.id;
                            const pct = Math.round((pool.members.length / pool.targetMembers) * 100);
                            return (
                                <div 
                                    key={pool.id}
                                    onClick={() => { setSelectedPool(pool); setHasJoined(false); setShowPayment(false); }}
                                    style={{
                                        padding: 16, borderRadius: 16, cursor: 'pointer',
                                        backgroundColor: isSelected ? '#18181b' : '#0a0a0c',
                                        border: `1px solid ${isSelected ? '#06b6d4' : '#27272a'}`,
                                        boxShadow: isSelected ? '0 0 20px rgba(6, 182, 212, 0.15)' : 'none',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
                                        <h4 style={{ fontSize: 14, fontWeight: 800, color: '#ffffff' }}>{pool.item}</h4>
                                        <span style={{
                                            fontSize: 10, fontWeight: 800, color: '#f87171',
                                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                            padding: '2px 8px', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 4
                                        }}>
                                            <Clock size={10} /> {pool.timeLeftMinutes}m left
                                        </span>
                                    </div>

                                    <p style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 12 }}>{pool.store}</p>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                        <span style={{ fontSize: 16, fontWeight: 900, color: '#4ade80' }}>
                                            ₹{pool.discountedPrice} <span style={{ textDecoration: 'line-through', color: '#71717a', fontSize: 12, fontWeight: 400 }}>₹{pool.originalPrice}</span>
                                        </span>
                                        <span style={{ fontSize: 11, fontWeight: 700, color: '#e4e4e7', backgroundColor: '#27272a', padding: '3px 8px', borderRadius: 6 }}>
                                            {pool.members.length}/{pool.targetMembers} joined
                                        </span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div style={{ width: '100%', height: 6, backgroundColor: '#27272a', borderRadius: 4, overflow: 'hidden' }}>
                                        <div style={{ height: '100%', width: `${pct}%`, background: 'linear-gradient(90deg, #06b6d4, #3b82f6)', transition: 'width 0.4s ease' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Main Area: Selected Pool Detail & Neighborhood Chat */}
                <div style={{
                    backgroundColor: '#0c0c0e', border: '1px solid #27272a',
                    borderRadius: 24, overflow: 'hidden', display: 'flex', flexDirection: 'column',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4)'
                }}>
                    {selectedPool ? (
                        <>
                            {/* Pool Header Info */}
                            <div style={{
                                padding: 28, borderBottom: '1px solid #27272a',
                                background: 'linear-gradient(180deg, #18181b 0%, #0c0c0e 100%)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#ffffff', marginBottom: 4 }}>
                                            {selectedPool.item}
                                        </h2>
                                        <p style={{ fontSize: 14, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <Store size={14} color="#06b6d4" /> {selectedPool.store}
                                        </p>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <p style={{ fontSize: 32, fontWeight: 900, color: '#4ade80', lineHeight: 1 }}>
                                            ₹{selectedPool.discountedPrice}
                                        </p>
                                        <span style={{
                                            fontSize: 12, fontWeight: 800, color: '#22c55e',
                                            backgroundColor: 'rgba(34, 197, 94, 0.15)',
                                            padding: '4px 10px', borderRadius: 8, display: 'inline-block', marginTop: 6
                                        }}>
                                            Save ₹{selectedPool.originalPrice - selectedPool.discountedPrice} per person
                                        </span>
                                    </div>
                                </div>

                                {/* Roster of Verified Neighbors */}
                                <div style={{ marginTop: 24 }}>
                                    <p style={{
                                        fontSize: 11, fontWeight: 800, color: '#71717a',
                                        textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12,
                                        display: 'flex', alignItems: 'center', gap: 6
                                    }}>
                                        <ShieldCheck size={14} color="#22d3ee" />
                                        Verified Neighbors ({selectedPool.members.length + (hasJoined ? 1 : 0)})
                                    </p>

                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                                        {selectedPool.members.map(m => (
                                            <div key={m.id} style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                backgroundColor: '#18181b', border: '1px solid #27272a',
                                                padding: '8px 14px', borderRadius: 12
                                            }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 12, fontWeight: 800, color: '#ffffff'
                                                }}>
                                                    {m.avatar}
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 800, color: '#ffffff' }}>{m.name}</p>
                                                    <p style={{ fontSize: 11, color: '#a1a1aa' }}>⭐️ {m.trustScore} • {m.distance}</p>
                                                </div>
                                            </div>
                                        ))}

                                        {hasJoined && (
                                            <div style={{
                                                display: 'flex', alignItems: 'center', gap: 10,
                                                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                                                border: '1px solid rgba(6, 182, 212, 0.3)',
                                                padding: '8px 14px', borderRadius: 12
                                            }}>
                                                <div style={{
                                                    width: 32, height: 32, borderRadius: '50%',
                                                    backgroundColor: '#06b6d4',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    fontSize: 12, fontWeight: 800, color: '#000000'
                                                }}>
                                                    You
                                                </div>
                                                <div>
                                                    <p style={{ fontSize: 13, fontWeight: 800, color: '#22d3ee' }}>You</p>
                                                    <p style={{ fontSize: 11, color: '#22d3ee', opacity: 0.8 }}>⭐️ 5.0 • 0.0 km</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Escrow Join Action / Status */}
                            {!hasJoined ? (
                                <div style={{
                                    padding: '16px 28px', backgroundColor: '#141417',
                                    borderBottom: '1px solid #27272a',
                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            width: 40, height: 40, borderRadius: '50%',
                                            backgroundColor: 'rgba(59, 130, 246, 0.15)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}>
                                            <Wallet size={20} color="#60a5fa" />
                                        </div>
                                        <div>
                                            <h4 style={{ fontSize: 14, fontWeight: 800, color: '#ffffff' }}>Join this Pool</h4>
                                            <p style={{ fontSize: 12, color: '#a1a1aa' }}>Funds locked via Razorpay Escrow until target count is reached.</p>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleJoin}
                                        style={{
                                            backgroundColor: '#06b6d4', color: '#000000',
                                            fontWeight: 800, padding: '12px 24px', borderRadius: 12,
                                            border: 'none', cursor: 'pointer', fontSize: 14,
                                            boxShadow: '0 0 20px rgba(6, 182, 212, 0.3)',
                                            transition: 'transform 0.2s ease'
                                        }}
                                    >
                                        Join & Escrow ₹{selectedPool.discountedPrice}
                                    </button>
                                </div>
                            ) : (
                                <div style={{
                                    padding: 14, backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                    borderBottom: '1px solid rgba(34, 197, 94, 0.25)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                                }}>
                                    <Check size={18} color="#4ade80" />
                                    <span style={{ fontSize: 13, fontWeight: 800, color: '#4ade80' }}>
                                        Payment Escrowed! You are officially in this neighborhood pool.
                                    </span>
                                </div>
                            )}

                            {/* Neighborhood Group Chat */}
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#09090b', overflow: 'hidden' }}>
                                <div style={{ padding: '12px 28px', backgroundColor: '#111114', borderBottom: '1px solid #1f1f24' }}>
                                    <p style={{ fontSize: 12, fontWeight: 800, color: '#c084fc', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <MessageCircle size={14} /> Neighborhood Chat
                                    </p>
                                </div>

                                <div style={{ flex: 1, padding: 20, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
                                    {chatMessages.map((msg, i) => (
                                        <div key={i} style={{
                                            alignSelf: msg.isMe ? 'flex-end' : 'flex-start',
                                            maxWidth: '75%'
                                        }}>
                                            <p style={{ fontSize: 10, color: '#71717a', marginBottom: 4, textAlign: msg.isMe ? 'right' : 'left' }}>
                                                {msg.sender}
                                            </p>
                                            <div style={{
                                                padding: '10px 16px', borderRadius: 14,
                                                backgroundColor: msg.isMe ? '#06b6d4' : '#18181b',
                                                color: msg.isMe ? '#000000' : '#ffffff',
                                                fontSize: 13, border: msg.isMe ? 'none' : '1px solid #27272a',
                                                fontWeight: msg.isMe ? 700 : 400
                                            }}>
                                                {msg.text}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Chat Input */}
                                <form onSubmit={handleSendMessage} style={{ padding: '14px 20px', borderTop: '1px solid #1f1f24', display: 'flex', gap: 10, backgroundColor: '#0c0c0e' }}>
                                    <input 
                                        type="text" 
                                        value={chatInput} 
                                        onChange={(e) => setChatInput(e.target.value)}
                                        placeholder="Message pool members..." 
                                        style={{
                                            flex: 1, backgroundColor: '#18181b', border: '1px solid #27272a',
                                            borderRadius: 12, padding: '10px 16px', color: '#ffffff',
                                            fontSize: 13, outline: 'none'
                                        }}
                                    />
                                    <button type="submit" style={{
                                        backgroundColor: '#06b6d4', color: '#000000', border: 'none',
                                        borderRadius: 12, padding: '10px 16px', cursor: 'pointer',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <Send size={16} />
                                    </button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div style={{ margin: 'auto', textAlign: 'center', padding: 40 }}>
                            <Users size={48} color="#3f3f46" style={{ marginBottom: 16 }} />
                            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', marginBottom: 8 }}>Select a Flash Pool</h3>
                            <p style={{ color: '#71717a', fontSize: 14, maxWidth: 360 }}>
                                Choose a neighborhood pool from the left list to view verified members, chat, and join.
                            </p>
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
