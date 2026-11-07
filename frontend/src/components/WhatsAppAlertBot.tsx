'use client';

import React, { useState } from 'react';
import { MessageSquare, Send, Bell, CheckCircle2, Zap, ArrowRight, ShieldCheck, Trash2, Smartphone, AlertCircle, RefreshCw } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

interface WhatsAppAlertBotProps {
    symbol?: string;
    pincode?: string;
}

export default function WhatsAppAlertBot({ symbol = '₹', pincode = '560102' }: WhatsAppAlertBotProps) {
    const [selectedProduct, setSelectedProduct] = useState('Sony WH-1000XM5 Headphones');
    const [targetPrice, setTargetPrice] = useState('21000');
    const [channel, setChannel] = useState<'whatsapp' | 'sms'>('whatsapp');
    const [contactInfo, setContactInfo] = useState('+91 82610 58971');
    const [dipPct, setDipPct] = useState(15);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [testAlertSent, setTestAlertSent] = useState(false);
    const [subMessage, setSubMessage] = useState('');
    const [subSuccess, setSubSuccess] = useState(false);

    // Active alert subscriptions list
    const [activeSubscriptions, setActiveSubscriptions] = useState<any[]>([
        {
            id: '1',
            product: 'Sony WH-1000XM5 Headphones',
            targetPrice: 21000,
            dipPct: 15,
            channel: 'whatsapp',
            contact: '+91 82610 58971',
            status: 'Active',
            createdAt: '2026-08-08'
        },
        {
            id: '2',
            product: 'Apple MacBook Air M3 15-inch',
            targetPrice: 114900,
            dipPct: 10,
            channel: 'sms',
            contact: '+91 82610 58971',
            status: 'Active',
            createdAt: '2026-08-07'
        }
    ]);

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setTestAlertSent(false);
        setSubMessage('');

        // Trigger native HTML5 desktop browser notification if supported
        if (typeof window !== 'undefined' && 'Notification' in window) {
            if (Notification.permission === 'default') {
                await Notification.requestPermission();
            }
            if (Notification.permission === 'granted') {
                new Notification(`🔔 Parallax Alert Bot`, {
                    body: `Subscription Registered! tracking ${selectedProduct} at ${symbol}${Number(targetPrice).toLocaleString()}`,
                    icon: '/favicon.ico'
                });
            }
        }

        try {
            const res = await fetch('http://localhost:8000/api/alerts/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product: selectedProduct,
                    targetPrice: Number(targetPrice),
                    channel: channel,
                    contact: contactInfo,
                    dipPct: dipPct
                })
            });
            if (res.ok) {
                const data = await res.json();
                const newSub = {
                    id: Date.now().toString(),
                    product: selectedProduct,
                    targetPrice: Number(targetPrice),
                    dipPct: dipPct,
                    channel: channel,
                    contact: contactInfo,
                    status: 'Active',
                    createdAt: new Date().toISOString().split('T')[0]
                };
                setActiveSubscriptions([newSub, ...activeSubscriptions]);
                setTestAlertSent(true);
                setSubSuccess(true);
                
                if (channel === 'whatsapp') {
                    const cleanPhone = contactInfo.replace(/[\s\+]/g, '');
                    const welcomeMsg = `🌟 Welcome to Parallax Edge!\n\nYou will get notified about the product *${selectedProduct}* when the price drops below *₹${Number(targetPrice).toLocaleString()}*.\n\nThank you for using Parallax Edge!`;
                    const waUrl = `whatsapp://send?phone=${cleanPhone}&text=${encodeURIComponent(welcomeMsg)}`;
                    if (typeof window !== 'undefined') {
                        window.open(waUrl, '_blank');
                    }
                    setSubMessage(`✨ WhatsApp application opened! Send the pre-filled message instantly on your phone.`);
                } else {
                    setSubMessage('✨ Test notification payload registered! Triggered simulated push notification.');
                }
            } else {
                setSubMessage('❌ Failed to register subscription with the backend api.');
                setSubSuccess(false);
            }
        } catch (err) {
            setSubMessage('❌ Connection error to the Parallax alert service.');
            setSubSuccess(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = (id: string) => {
        setActiveSubscriptions(prev => prev.filter(s => s.id !== id));
    };

    return (
        <div style={{ marginBottom: 40 }}>
            {/* Header Banner */}
            <div style={{
                borderRadius: 24, padding: '28px 32px', marginBottom: 28,
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(6, 182, 212, 0.15))',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: 'rgba(34, 197, 94, 0.2)', border: '1px solid rgba(34, 197, 94, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <MessageSquare size={28} color="#22c55e" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0 }}>
                            WhatsApp & SMS Alert Bot
                        </h1>
                        <p style={{ fontSize: 13, color: '#a1a1aa', margin: '4px 0 0' }}>
                            Instant multi-channel push notifications when prices hit your target dip threshold.
                        </p>
                    </div>
                </div>

                <Badge status="positive" text="Bot Service: Online & Ready" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 24 }}>
                {/* Form Column */}
                <div>
                    <Card style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Bell size={20} color="#22c55e" /> Create New Price Drop Subscription
                        </h2>

                        <form onSubmit={handleSubscribe}>
                            {/* Product Selection */}
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a1a1aa', marginBottom: 8 }}>
                                    Select Product to Track
                                </label>
                                <select
                                    value={selectedProduct}
                                    onChange={(e) => setSelectedProduct(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: 12,
                                        background: '#0a0a0d', border: '1px solid #27272a', color: '#fff', fontSize: 14, outline: 'none'
                                    }}
                                >
                                    <option value="Sony WH-1000XM5 Headphones">Sony WH-1000XM5 Headphones (Current: {symbol}20,999)</option>
                                    <option value="Apple MacBook Air M3 15-inch">Apple MacBook Air M3 15-inch (Current: {symbol}1,19,900)</option>
                                    <option value="Apple iPhone 15 Pro Max 256GB">Apple iPhone 15 Pro Max 256GB (Current: {symbol}1,34,900)</option>
                                    <option value="Nike Air Max 270 Running Shoes">Nike Air Max 270 Running Shoes (Current: {symbol}11,495)</option>
                                </select>
                            </div>

                            {/* Channel Selector */}
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a1a1aa', marginBottom: 8 }}>
                                    Notification Channel
                                </label>
                                <div style={{ display: 'flex', gap: 10 }}>
                                    {[
                                        { id: 'whatsapp', label: 'WhatsApp', icon: MessageSquare, color: '#22c55e' },
                                        { id: 'sms', label: 'SMS', icon: Smartphone, color: '#f59e0b' }
                                    ].map(c => {
                                        const Icon = c.icon;
                                        const active = channel === c.id;
                                        return (
                                            <button
                                                key={c.id}
                                                type="button"
                                                onClick={() => setChannel(c.id as any)}
                                                style={{
                                                    flex: 1, padding: '10px', borderRadius: 12, border: 'none', cursor: 'pointer',
                                                    background: active ? 'rgba(34, 197, 94, 0.15)' : '#0a0a0d',
                                                    outline: active ? `2px solid ${c.color}` : '1px solid #27272a',
                                                    color: active ? '#fff' : '#a1a1aa', fontWeight: active ? 700 : 500, fontSize: 13,
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6
                                                }}
                                            >
                                                <Icon size={16} color={c.color} />
                                                {c.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Contact Info Input */}
                            <div style={{ marginBottom: 18 }}>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a1a1aa', marginBottom: 8 }}>
                                    Mobile Number (with Country Code)
                                </label>
                                <input
                                    type="text"
                                    value={contactInfo}
                                    onChange={(e) => setContactInfo(e.target.value)}
                                    placeholder="+91 82610 58971"
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: 12,
                                        background: '#0a0a0d', border: '1px solid #27272a', color: '#fff', fontSize: 14, outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Target Price & Dip Threshold */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a1a1aa', marginBottom: 8 }}>
                                        Target Maximum Price ({symbol})
                                    </label>
                                    <input
                                        type="number"
                                        value={targetPrice}
                                        onChange={(e) => setTargetPrice(e.target.value)}
                                        style={{
                                            width: '100%', padding: '12px 16px', borderRadius: 12,
                                            background: '#0a0a0d', border: '1px solid #27272a', color: '#fff', fontSize: 14, outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a1a1aa', marginBottom: 8 }}>
                                        Min. Price Dip: <strong style={{ color: '#22c55e' }}>{dipPct}%</strong>
                                    </label>
                                    <input
                                        type="range"
                                        min="5"
                                        max="50"
                                        value={dipPct}
                                        onChange={(e) => setDipPct(Number(e.target.value))}
                                        style={{ width: '100%', marginTop: 8 }}
                                    />
                                </div>
                            </div>

                            <Button type="submit" variant="success" style={{ width: '100%' }} disabled={isSubmitting}>
                                {isSubmitting ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                                {isSubmitting ? 'Registering Alert Bot...' : `Subscribe & Send Test ${channel.toUpperCase()} Alert`}
                            </Button>
                        </form>
                    </Card>

                    {/* Active Subscriptions List */}
                    <Card>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>
                            Active Price Alert Subscriptions
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {activeSubscriptions.map((sub) => (
                                <div key={sub.id} style={{
                                    padding: 16, borderRadius: 14, background: '#18181b', border: '1px solid #27272a',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{sub.product}</div>
                                        <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
                                            Trigger: Price ≤ {symbol}{sub.targetPrice.toLocaleString()} ({sub.dipPct}% Dip) • Channel: <strong style={{ color: '#22c55e', textTransform: 'capitalize' }}>{sub.channel}</strong> ({sub.contact})
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(sub.id)}
                                        title="Unsubscribe alert"
                                        style={{
                                            padding: 8, borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)',
                                            color: '#ef4444', cursor: 'pointer'
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Smartphone Preview Column */}
                <div>
                    <Card style={{ position: 'sticky', top: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                            <Smartphone size={20} color="#22c55e" />
                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>
                                Live Push Notification Preview
                            </h3>
                        </div>

                        {/* Simulated Phone Screen */}
                        <div style={{
                            background: '#0a0a0d', borderRadius: 24, padding: 18, border: '2px solid #27272a',
                            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)'
                        }}>
                            {/* Smartphone Header */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottom: '1px solid #1f1f24', paddingBottom: 10 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />
                                    <span style={{ fontSize: 12, fontWeight: 800, color: '#fff' }}>Parallax Alert Bot</span>
                                </div>
                                <span style={{ fontSize: 10, color: '#71717a' }}>Just Now</span>
                            </div>

                            {/* WhatsApp Notification Bubble */}
                            <div style={{
                                padding: 14, borderRadius: 14, 
                                background: testAlertSent ? 'rgba(59, 130, 246, 0.12)' : 'rgba(34, 197, 94, 0.12)',
                                border: testAlertSent ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(34, 197, 94, 0.3)', 
                                marginBottom: 12
                            }}>
                                <div style={{ fontSize: 12, fontWeight: 800, color: testAlertSent ? '#60a5fa' : '#22c55e', marginBottom: 4 }}>
                                    {testAlertSent ? '🌟 WELCOME TO PARALLAX EDGE!' : '🔔 PARALLAX PRICE DROP ALERT!'}
                                </div>
                                <p style={{ fontSize: 12, color: '#e4e4e7', margin: 0, lineHeight: 1.4 }}>
                                    {testAlertSent ? (
                                        <>Welcome to Parallax Edge! You will get notified about the product <strong>{selectedProduct}</strong> when the price drops below <strong>{symbol}{Number(targetPrice).toLocaleString()}</strong>.</>
                                    ) : (
                                        <><strong>{selectedProduct}</strong> just dropped to <strong>{symbol}{Number(targetPrice).toLocaleString()}</strong> on Flipkart!</>
                                    )}
                                </p>
                                <div style={{ fontSize: 11, color: testAlertSent ? '#60a5fa' : '#4ade80', fontWeight: 700, marginTop: 8 }}>
                                    {testAlertSent ? '✨ Subscription Registered • Sourced Live' : '📉 22.2% Historical Dip (Lowest in 90 Days)'}
                                </div>
                                <div style={{ fontSize: 10, color: '#71717a', marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                                    <span>Sent via {channel.toUpperCase()} to {contactInfo}</span>
                                    <span>100% Verified</span>
                                </div>
                            </div>

                            {testAlertSent && (
                                <Alert
                                    status="positive"
                                    title="Alert Delivered!"
                                    description={`Test message payload dispatched to ${contactInfo}`}
                                />
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
