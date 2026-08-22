'use client';
import React, { useState, useEffect } from 'react';
import { ShoppingBag, BellRing, Sparkles, History, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function BrowserExtensionDemo({ symbol }: { symbol: string }) {
    const [demoState, setDemoState] = useState<'idle' | 'playing'>('idle');
    const [notificationVisible, setNotificationVisible] = useState(false);

    const playDemo = () => {
        setDemoState('playing');
        setNotificationVisible(false);
        setTimeout(() => {
            setNotificationVisible(true);
        }, 2000);
    };

    const containerStyle: React.CSSProperties = {
        backgroundColor: '#0a0a0f',
        color: '#fff',
        padding: '3rem',
        borderRadius: '24px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '1100px',
        margin: '0 auto',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    };

    return (
        <div style={containerStyle}>
            <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', padding: '0.5rem 1rem', borderRadius: '20px', fontWeight: 600, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                    <Sparkles size={16} /> Now available for Chrome & Safari
                </div>
                <h2 style={{ fontSize: '3rem', fontWeight: 900, margin: '0 0 1rem', background: 'linear-gradient(90deg, #fff, #a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    Shopping Copilot Extension
                </h2>
                <p style={{ color: '#a1a1aa', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                    We automatically hunt for lower prices, coupons, and better variants while you browse your favorite stores.
                </p>
                <button onClick={playDemo} style={{ background: '#fff', color: '#000', padding: '1rem 2.5rem', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', transition: 'transform 0.2s' }}>
                    <Zap size={20} /> See it in action
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center' }}>
                <div style={{ position: 'relative', background: '#1a1a1e', borderRadius: '12px', border: '1px solid #3f3f46', overflow: 'hidden', height: '400px' }}>
                    {/* Browser Mockup Top Bar */}
                    <div style={{ background: '#27272a', padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid #3f3f46' }}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ef4444' }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }} />
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#22c55e' }} />
                        </div>
                        <div style={{ flex: 1, background: '#18181b', borderRadius: '6px', padding: '0.4rem 1rem', fontSize: '0.8rem', color: '#a1a1aa', display: 'flex', alignItems: 'center' }}>
                            <span style={{ color: '#fff', marginRight: '4px' }}>🔒 amazon.in</span> /iphone-15-128gb
                        </div>
                    </div>
                    
                    {/* Page Content Mockup */}
                    <div style={{ padding: '2rem', display: 'flex', gap: '2rem', opacity: demoState === 'playing' ? 1 : 0.5, transition: 'opacity 0.5s' }}>
                        <div style={{ width: '200px', height: '240px', background: '#27272a', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <ShoppingBag size={64} color="#3f3f46" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ height: '24px', width: '80%', background: '#27272a', borderRadius: '4px', marginBottom: '1rem' }} />
                            <div style={{ height: '16px', width: '60%', background: '#27272a', borderRadius: '4px', marginBottom: '2rem' }} />
                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>{symbol}62,999</div>
                            <div style={{ width: '150px', height: '40px', background: '#f59e0b', borderRadius: '20px', marginBottom: '1rem' }} />
                        </div>
                    </div>

                    {/* Extension Notification Popup */}
                    <div style={{ 
                        position: 'absolute', 
                        bottom: '20px', 
                        right: '20px', 
                        width: '300px', 
                        background: '#111114', 
                        border: '1px solid #ef4444', 
                        borderRadius: '16px', 
                        padding: '1.5rem',
                        boxShadow: '0 20px 40px -10px rgba(0,0,0,0.8), 0 0 20px rgba(239, 68, 68, 0.2)',
                        transform: notificationVisible ? 'translateX(0)' : 'translateX(120%)',
                        transition: 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        zIndex: 10
                    }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ background: 'rgba(239, 68, 68, 0.1)', padding: '0.5rem', borderRadius: '50%' }}>
                                <BellRing color="#ef4444" size={24} />
                            </div>
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem', fontWeight: 800, color: '#fff' }}>STOP! Better deal found</h4>
                                <p style={{ margin: 0, color: '#a1a1aa', fontSize: '0.9rem' }}>Buy from Flipkart instead</p>
                            </div>
                        </div>
                        <div style={{ background: 'rgba(34, 197, 94, 0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ color: '#22c55e', fontWeight: 600 }}>Save {symbol}2,145</span>
                            <span style={{ color: '#a1a1aa', fontSize: '0.9rem', textDecoration: 'line-through' }}>{symbol}62,999</span>
                            <span style={{ color: '#fff', fontWeight: 700 }}>{symbol}60,854</span>
                        </div>
                        <button style={{ width: '100%', background: '#ef4444', color: '#fff', border: 'none', padding: '0.75rem', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem' }}>
                            Switch to Flipkart <ArrowRight size={16} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'rgba(6, 182, 212, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <ShieldCheck color="#06b6d4" size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fff' }}>Auto Price Comparison</h3>
                            <p style={{ margin: 0, color: '#a1a1aa', lineHeight: 1.5 }}>Instantly checks 50+ stores while you browse to ensure you never overpay.</p>
                        </div>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'rgba(139, 92, 246, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <Zap color="#8b5cf6" size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fff' }}>Coupon Auto-Apply</h3>
                            <p style={{ margin: 0, color: '#a1a1aa', lineHeight: 1.5 }}>Tests all available promo codes at checkout and applies the best one magically.</p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <div style={{ width: '48px', height: '48px', background: 'rgba(245, 158, 11, 0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <History color="#f59e0b" size={24} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, margin: '0 0 0.5rem', color: '#fff' }}>Price History & Alerts</h3>
                            <p style={{ margin: 0, color: '#a1a1aa', lineHeight: 1.5 }}>See 6-month price trends and get notified when the price drops to your target.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
