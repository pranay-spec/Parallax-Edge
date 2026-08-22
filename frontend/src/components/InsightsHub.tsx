'use client';

import React from 'react';
import { Newspaper, TrendingUp, MapPin, Share2, Bookmark } from 'lucide-react';

const ARTICLES = [
    {
        id: 1,
        title: "Weekly Tech Deals in Bangalore",
        excerpt: "Laptops are seeing a massive 15% average price drop across platforms this week. Check out the top 5 deals on M2 MacBooks.",
        category: "Local Deals",
        readTime: "3 min read",
        image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&q=80&w=400&h=250",
        date: "Today"
    },
    {
        id: 2,
        title: "Grocery Price Trends: Inflation Hit?",
        excerpt: "Data from our Parallax Engine shows a slight increase in daily essentials. Here's how to use bundled cart optimization to beat the hike.",
        category: "Insights",
        readTime: "5 min read",
        image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400&h=250",
        date: "Yesterday"
    },
    {
        id: 3,
        title: "Flash Pools: How 50 Neighbors Bought a TV",
        excerpt: "A look into how the community in HSR Layout grouped up to unlock a wholesale discount on Sony Bravia TVs.",
        category: "Community",
        readTime: "4 min read",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&q=80&w=400&h=250",
        date: "Aug 4"
    }
];

export default function InsightsHub() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32, paddingBottom: 40, width: '100%' }}>
            
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{
                    padding: 14, borderRadius: 16,
                    backgroundColor: 'rgba(168, 85, 247, 0.15)',
                    border: '1px solid rgba(168, 85, 247, 0.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Newspaper color="#c084fc" size={28} />
                </div>
                <div>
                    <h1 style={{ fontSize: 28, fontWeight: 900, color: '#ffffff', marginBottom: 4 }}>
                        Parallax Insights Hub
                    </h1>
                    <p style={{ color: '#a1a1aa', fontSize: 15 }}>
                        Data-driven shopping guides, local deals, and community stories.
                    </p>
                </div>
            </div>

            {/* Featured Article Hero */}
            <div style={{
                position: 'relative', borderRadius: 24, overflow: 'hidden',
                border: '1px solid #27272a', height: 340,
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)', cursor: 'pointer'
            }}>
                <img 
                    src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&q=80&w=1200&h=400" 
                    alt="Featured" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Gradient Overlay */}
                <div style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(to top, rgba(9,9,11,0.95) 0%, rgba(9,9,11,0.4) 50%, transparent 100%)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    padding: 32
                }}>
                    <span style={{
                        padding: '6px 14px', backgroundColor: '#ef4444', color: '#ffffff',
                        fontSize: 11, fontWeight: 800, borderRadius: 20,
                        textTransform: 'uppercase', letterSpacing: '1px',
                        alignSelf: 'flex-start', marginBottom: 12
                    }}>
                        HOT TRENDS
                    </span>
                    
                    <h2 style={{ fontSize: 32, fontWeight: 900, color: '#ffffff', marginBottom: 10, lineHeight: 1.2 }}>
                        The Great Smartphone Price Crash of 2026
                    </h2>
                    
                    <p style={{ color: '#d4d4d8', fontSize: 15, maxWidth: 700, marginBottom: 16, lineHeight: 1.5 }}>
                        Our real-time web scrapers have detected a massive anomaly in flagship smartphone pricing across 5 major retailers...
                    </p>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 13, color: '#a1a1aa' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <TrendingUp size={14} color="#38bdf8" /> 12k views
                        </span>
                        <span>•</span>
                        <span>8 min read</span>
                    </div>
                </div>
            </div>

            {/* Grid of Articles */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
                {ARTICLES.map(article => (
                    <div key={article.id} style={{
                        backgroundColor: '#0c0c0e', border: '1px solid #27272a',
                        borderRadius: 20, overflow: 'hidden', cursor: 'pointer',
                        display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
                        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)', transition: 'all 0.2s ease'
                    }}>
                        <div>
                            <div style={{ position: 'relative', height: 160, overflow: 'hidden' }}>
                                <img 
                                    src={article.image} 
                                    alt={article.title}
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                />
                                <div style={{
                                    position: 'absolute', top: 12, left: 12,
                                    padding: '4px 10px', backgroundColor: 'rgba(0, 0, 0, 0.75)',
                                    backdropFilter: 'blur(8px)', borderRadius: 8,
                                    fontSize: 11, fontWeight: 700, color: '#ffffff',
                                    border: '1px solid rgba(255, 255, 255, 0.1)'
                                }}>
                                    {article.category}
                                </div>
                            </div>
                            
                            <div style={{ padding: 20 }}>
                                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#ffffff', marginBottom: 8, lineHeight: 1.3 }}>
                                    {article.title}
                                </h3>
                                <p style={{ fontSize: 13, color: '#a1a1aa', lineHeight: 1.5, marginBottom: 16 }}>
                                    {article.excerpt}
                                </p>
                            </div>
                        </div>

                        <div style={{
                            padding: '16px 20px', borderTop: '1px solid #1f1f24',
                            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                            fontSize: 12, color: '#71717a'
                        }}>
                            <span>{article.date} • {article.readTime}</span>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                                    <Bookmark size={15} />
                                </button>
                                <button style={{ background: 'none', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                                    <Share2 size={15} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Popular Local Searches Footer */}
            <div style={{
                marginTop: 20, paddingTop: 28, borderTop: '1px solid #27272a',
                textAlign: 'center'
            }}>
                <p style={{ color: '#71717a', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 16 }}>
                    Popular Local Searches
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
                    {['Best TV deals in Bangalore', 'iPhone 15 prices Delhi', 'Grocery offers Mumbai', 'Laptops under 50k Hyderabad'].map(term => (
                        <span key={term} style={{
                            padding: '8px 16px', borderRadius: 20,
                            backgroundColor: '#0c0c0e', border: '1px solid #27272a',
                            fontSize: 12, color: '#a1a1aa', cursor: 'pointer',
                            display: 'inline-flex', alignItems: 'center', gap: 6
                        }}>
                            <MapPin size={12} color="#38bdf8" /> {term}
                        </span>
                    ))}
                </div>
            </div>

        </div>
    );
}
