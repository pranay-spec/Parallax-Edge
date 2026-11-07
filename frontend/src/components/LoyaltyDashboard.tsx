'use client';

import React, { useState } from 'react';
import { Gift, Copy, Users, Trophy, ChevronRight, CheckCircle2, TrendingUp, Sparkles, Crown } from 'lucide-react';

export default function LoyaltyDashboard() {
    const [copied, setCopied] = useState(false);
    const referralCode = 'EDGE-X79K2';

    const handleCopy = () => {
        navigator.clipboard.writeText(`https://parallax.edge/join?ref=${referralCode}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40, width: '100%' }}>
            
            {/* Header Hero Section */}
            <div style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 24,
                background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '36px 40px',
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)'
            }}>
                {/* Glow Accents */}
                <div style={{
                    position: 'absolute', top: -50, right: -50, width: 250, height: 250,
                    background: 'rgba(99, 102, 241, 0.15)', filter: 'blur(80px)', borderRadius: '50%',
                    pointerEvents: 'none'
                }} />
                
                <div style={{
                    position: 'relative', zIndex: 10,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    flexWrap: 'wrap', gap: 20
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div style={{
                            padding: 16, borderRadius: 20,
                            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                            boxShadow: '0 0 25px rgba(99, 102, 241, 0.4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Trophy color="#ffffff" size={32} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', marginBottom: 6, letterSpacing: '-0.5px' }}>
                                Parallax Rewards
                            </h1>
                            <p style={{ color: '#c7d2fe', fontSize: 16, opacity: 0.9 }}>
                                Earn points, unlock exclusive flash pools, and shop smarter.
                            </p>
                        </div>
                    </div>

                    <div style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        backgroundColor: 'rgba(12, 12, 14, 0.6)', backdropFilter: 'blur(12px)',
                        padding: '10px 18px', borderRadius: 14,
                        border: '1px solid rgba(99, 102, 241, 0.4)'
                    }}>
                        <Crown color="#facc15" size={18} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', letterSpacing: '1px', textTransform: 'uppercase' }}>
                            Premium Member
                        </span>
                    </div>
                </div>
            </div>

            {/* Grid for Points & Referral */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
                
                {/* Points Card */}
                <div style={{
                    padding: 32, borderRadius: 24,
                    backgroundColor: '#0c0c0e', border: '1px solid #27272a',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                    position: 'relative', overflow: 'hidden',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div style={{
                        position: 'absolute', right: -20, bottom: -20, opacity: 0.04, color: '#6366f1', pointerEvents: 'none'
                    }}>
                        <TrendingUp size={180} />
                    </div>

                    <div style={{ position: 'relative', zIndex: 10 }}>
                        <p style={{
                            color: '#a1a1aa', textTransform: 'uppercase', letterSpacing: '1.5px',
                            fontWeight: 700, fontSize: 12, marginBottom: 12,
                            display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <Sparkles size={16} color="#818cf8" /> Available Edge Points
                        </p>

                        <h3 style={{
                            fontSize: 56, fontWeight: 900,
                            background: 'linear-gradient(135deg, #818cf8, #c084fc, #f472b6)',
                            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                            marginBottom: 20, lineHeight: 1
                        }}>
                            2,450
                        </h3>

                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: 8,
                            padding: '8px 16px', backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            border: '1px solid rgba(34, 197, 94, 0.25)', borderRadius: 10
                        }}>
                            <CheckCircle2 size={16} color="#4ade80" />
                            <span style={{ fontSize: 13, fontWeight: 700, color: '#4ade80' }}>
                                +350 earned this week
                            </span>
                        </div>
                    </div>
                </div>

                {/* Referral Card */}
                <div style={{
                    padding: 32, borderRadius: 24,
                    backgroundColor: '#0c0c0e', border: '1px solid #27272a',
                    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'space-between'
                }}>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                            <div style={{
                                padding: 8, backgroundColor: 'rgba(6, 182, 212, 0.15)',
                                borderRadius: 10, color: '#22d3ee'
                            }}>
                                <Users size={20} />
                            </div>
                            <h3 style={{ fontSize: 20, fontWeight: 800, color: '#ffffff' }}>
                                Invite Friends, Earn ₹500
                            </h3>
                        </div>

                        <p style={{ color: '#a1a1aa', fontSize: 14, lineHeight: 1.6, marginBottom: 24 }}>
                            Share your link. When a friend signs up and completes their first purchase, you both instantly receive 5,000 Edge points.
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            flex: 1, backgroundColor: '#18181b', border: '1px solid #27272a',
                            borderRadius: 12, padding: '14px 16px', fontSize: 13,
                            color: '#e4e4e7', fontFamily: 'monospace',
                            whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                        }}>
                            https://parallax.edge/join?ref={referralCode}
                        </div>
                        <button
                            onClick={handleCopy}
                            style={{
                                backgroundColor: '#06b6d4', color: '#000000', fontWeight: 800,
                                padding: '14px 20px', borderRadius: 12, border: 'none',
                                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s ease', flexShrink: 0
                            }}
                        >
                            {copied ? <CheckCircle2 size={20} /> : <Copy size={20} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Redeem Points Section */}
            <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h3 style={{ fontSize: 22, fontWeight: 800, color: '#ffffff' }}>Redeem Points</h3>
                    <button style={{
                        background: 'none', border: 'none', color: '#818cf8',
                        fontSize: 14, fontWeight: 700, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', gap: 4
                    }}>
                        View All Rewards <ChevronRight size={16} />
                    </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
                    {[
                        { title: '₹100 Cashback', desc: 'Direct credit to wallet', cost: 1000, theme: '#22c55e' },
                        { title: 'Free Delivery Pass', desc: 'Valid for 30 days', cost: 1500, theme: '#3b82f6' },
                        { title: 'Exclusive Flash Pool', desc: 'Unlock wholesale tier', cost: 2000, theme: '#a855f7' },
                    ].map((reward, i) => (
                        <div key={i} style={{
                            padding: 24, borderRadius: 20,
                            backgroundColor: '#0c0c0e', border: '1px solid #27272a',
                            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
                        }}>
                            <div style={{ marginBottom: 24 }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    backgroundColor: `${reward.theme}15`,
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    marginBottom: 16, border: `1px solid ${reward.theme}30`
                                }}>
                                    <Gift size={22} color={reward.theme} />
                                </div>
                                <h4 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', marginBottom: 4 }}>
                                    {reward.title}
                                </h4>
                                <p style={{ fontSize: 13, color: '#a1a1aa' }}>
                                    {reward.desc}
                                </p>
                            </div>

                            <button style={{
                                width: '100%', padding: '12px 16px',
                                backgroundColor: `${reward.theme}15`,
                                border: `1px solid ${reward.theme}40`,
                                color: reward.theme, borderRadius: 12,
                                fontSize: 13, fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.2s ease'
                            }}>
                                Redeem {reward.cost} pts
                            </button>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
