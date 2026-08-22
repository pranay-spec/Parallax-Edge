'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, AlertCircle, Sparkles, X, ArrowRight } from 'lucide-react';
import { ProductResult } from '@/types';

interface AbandonedCartRecoveryProps {
    cartItems: any[];
    onCheckout: () => void;
}

export default function AbandonedCartRecovery({ cartItems, onCheckout }: AbandonedCartRecoveryProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [hasFired, setHasFired] = useState(false);

    useEffect(() => {
        if (cartItems.length > 0 && !hasFired) {
            // ML Timing Simulation: Trigger after user has items in cart for some time (simulated as 10s here)
            const timer = setTimeout(() => {
                setIsVisible(true);
                setHasFired(true);
            }, 10000);
            return () => clearTimeout(timer);
        } else if (cartItems.length === 0) {
            setIsVisible(false);
            setHasFired(false);
        }
    }, [cartItems, hasFired]);

    if (!isVisible || cartItems.length === 0) return null;

    const topItem = cartItems[0]?.product;

    return (
        <div style={{
            position: 'fixed', bottom: 24, left: 24, zIndex: 9999,
            background: '#18181b', border: '1px solid #3f3f46',
            borderRadius: 16, width: 360, boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            overflow: 'hidden', animation: 'slideUp 0.3s ease-out'
        }}>
            <style>{`
                @keyframes slideUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
            
            <div style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', background: 'linear-gradient(90deg, rgba(37,99,235,0.1), rgba(147,51,234,0.1))' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                        width: 40, height: 40, borderRadius: '50%', background: '#fff',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Sparkles size={20} color="#9333ea" />
                    </div>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>Wait! Don't miss out.</div>
                        <div style={{ color: '#a1a1aa', fontSize: 13 }}>Dynamic pricing event triggered.</div>
                    </div>
                </div>
                <button onClick={() => setIsVisible(false)} style={{ background: 'none', border: 'none', color: '#a1a1aa', cursor: 'pointer' }}>
                    <X size={18} />
                </button>
            </div>

            <div style={{ padding: '20px' }}>
                <p style={{ margin: '0 0 16px 0', color: '#d4d4d8', fontSize: 14, lineHeight: 1.5 }}>
                    You left <strong style={{ color: '#fff' }}>{topItem?.title || 'items'}</strong> in your cart. 
                    Complete your purchase now and we'll apply an <strong style={{ color: '#4ade80' }}>extra 10% personalized discount</strong>!
                </p>

                <div style={{ display: 'flex', gap: 12 }}>
                    <button 
                        onClick={() => setIsVisible(false)}
                        style={{
                            flex: 1, padding: '10px 0', background: 'transparent', border: '1px solid #3f3f46',
                            borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer'
                        }}
                    >
                        Dismiss
                    </button>
                    <button 
                        onClick={() => {
                            setIsVisible(false);
                            onCheckout();
                        }}
                        style={{
                            flex: 2, padding: '10px 0', background: '#3b82f6', border: 'none',
                            borderRadius: 8, color: '#fff', fontWeight: 600, cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                        }}
                    >
                        Checkout & Save <ArrowRight size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
