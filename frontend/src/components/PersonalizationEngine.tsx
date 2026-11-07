'use client';

import React, { useState, useEffect } from 'react';
import { User, Sparkles, TrendingUp, Tag, ArrowRight, Zap, ShoppingBag } from 'lucide-react';
import { ProductResult, PriceBreakdown, DeliverySpeed } from '@/types';

// Mock components to render the recommendations
interface EngineProps {
    onSearchTrigger: (query: string) => void;
    currentPersona: string;
}

export default function PersonalizationEngine({ onSearchTrigger, currentPersona }: EngineProps) {
    const isLoyal = currentPersona === 'loyal';

    const renderBoughtXSavedY = () => (
        <div style={{
            background: 'linear-gradient(145deg, rgba(37,99,235,0.1), rgba(147,51,234,0.1))',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 16,
            padding: 24,
            marginTop: 24,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa', fontSize: 13, fontWeight: 600, marginBottom: 8 }}>
                    <Sparkles size={16} />
                    SOCIAL PROOF INSIGHT
                </div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#fff', margin: '0 0 4px 0' }}>
                    People who bought <span style={{ color: '#38bdf8' }}>iPhone 15</span> also saved on <span style={{ color: '#a78bfa' }}>AirPods Pro</span>
                </h3>
                <p style={{ color: '#a1a1aa', margin: 0, fontSize: 14 }}>
                    We noticed you were looking at iPhones. Bundle with AirPods now to unlock an extra ₹2,500 group-buy discount.
                </p>
            </div>
            <button 
                onClick={() => onSearchTrigger('AirPods Pro')}
                style={{
                    background: '#fff', color: '#000', border: 'none', borderRadius: 24,
                    padding: '10px 20px', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0
                }}
            >
                View Bundle <ArrowRight size={16} />
            </button>
        </div>
    );

    return (
        <div style={{ padding: '24px 40px', maxWidth: 1200, margin: '0 auto', width: '100%' }}>
            <div style={{ marginBottom: 32 }}>
                <h2 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 8px 0', letterSpacing: -0.5 }}>
                    {isLoyal ? 'Welcome back to the Edge.' : 'Discover the best prices.'}
                </h2>
                <p style={{ color: '#a1a1aa', margin: 0, fontSize: 15 }}>
                    {isLoyal 
                        ? 'Based on your recent purchases, we\'ve curated these premium tech upgrades.' 
                        : 'Explore trending deals across India\'s top marketplaces.'}
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {/* Dynamic Recommendation Card 1 */}
                <div 
                    onClick={() => onSearchTrigger(isLoyal ? 'Sony WH-1000XM5' : 'Wireless Earbuds')}
                    style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 16, padding: 20, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{
                            background: 'rgba(56, 189, 248, 0.2)', color: '#38bdf8',
                            padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700
                        }}>
                            {isLoyal ? 'PREMIUM UPGRADE' : 'TRENDING'}
                        </div>
                        <TrendingUp size={18} color="#a1a1aa" />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0' }}>
                        {isLoyal ? 'Sony WH-1000XM5' : 'Top-rated Wireless Earbuds'}
                    </h3>
                    <div style={{ color: '#4ade80', fontWeight: 600, fontSize: 14 }}>
                        {isLoyal ? 'Price dropped by ₹2,000 today' : 'Starting from ₹1,499'}
                    </div>
                </div>

                {/* Dynamic Recommendation Card 2 */}
                <div 
                    onClick={() => onSearchTrigger(isLoyal ? 'MacBook Air M3' : 'Gaming Laptops')}
                    style={{
                        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
                        borderRadius: 16, padding: 20, cursor: 'pointer', transition: 'all 0.2s'
                    }}
                >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                        <div style={{
                            background: 'rgba(250, 204, 21, 0.2)', color: '#facc15',
                            padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700
                        }}>
                            BASED ON SEARCH HISTORY
                        </div>
                        <ShoppingBag size={18} color="#a1a1aa" />
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0' }}>
                        {isLoyal ? 'MacBook Air M3 Deals' : 'High-Performance Laptops'}
                    </h3>
                    <div style={{ color: '#4ade80', fontWeight: 600, fontSize: 14 }}>
                        {isLoyal ? 'Exclusive student discounts available' : 'Save up to 40%'}
                    </div>
                </div>
            </div>

            {renderBoughtXSavedY()}
        </div>
    );
}
