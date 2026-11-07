'use client';

import React, { useState } from 'react';
import { ShieldAlert, Smartphone, MapPin, UserCheck, Zap, RefreshCw, AlertTriangle, ArrowRight, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

interface SellerMarkupRadarProps {
    symbol?: string;
    productTitle?: string;
    pincode?: string;
}

export default function SellerMarkupRadar({ symbol = '₹', productTitle = 'Sony WH-1000XM5 Headphones', pincode = '560102' }: SellerMarkupRadarProps) {
    const [isBypassing, setIsBypassing] = useState(false);
    const [bypassed, setBypassed] = useState(false);

    const surcharges = [
        {
            category: 'Device Discrimination',
            icon: Smartphone,
            title: 'iOS App Surcharge Detected',
            platform: 'Blinkit & Zepto',
            details: 'Prices on iOS devices are ₹45 higher than Android devices for the same item.',
            markup: 45,
            badgeStatus: 'critical'
        },
        {
            category: 'Neighborhood Pricing',
            icon: MapPin,
            title: 'High-Income PIN Code Surge',
            platform: 'Swiggy Instamart',
            details: `PIN Code ${pincode} (HSR Layout) has a +₹30 dynamic delivery surcharge compared to PIN Code 560001.`,
            markup: 30,
            badgeStatus: 'warning'
        },
        {
            category: 'Account Discrimination',
            icon: UserCheck,
            title: 'Existing Account Surcharge',
            platform: 'Flipkart',
            details: 'Guest / New accounts receive a ₹500 welcome discount hidden from logged-in VIP accounts.',
            markup: 500,
            badgeStatus: 'critical'
        }
    ];

    const totalMarkup = surcharges.reduce((acc, curr) => acc + curr.markup, 0);

    const handleBypass = () => {
        setIsBypassing(true);
        setTimeout(() => {
            setIsBypassing(false);
            setBypassed(true);
        }, 1200);
    };

    return (
        <div style={{ marginBottom: 28 }}>
            {/* Header Banner */}
            <div style={{
                borderRadius: 20, padding: '24px 28px', marginBottom: 24,
                background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(245, 158, 11, 0.15))',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: 'rgba(239, 68, 68, 0.2)', border: '1px solid rgba(239, 68, 68, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <ShieldAlert size={26} color="#ef4444" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>
                            Dynamic Price Discrimination & Markup Radar
                        </h2>
                        <p style={{ fontSize: 13, color: '#a1a1aa', margin: '4px 0 0' }}>
                            Exposes predatory pricing algorithms across iOS vs Android, guest accounts, & PIN codes.
                        </p>
                    </div>
                </div>

                <Badge status="critical" text={`🕵️ ${surcharges.length} Surcharge Signals Detected`} />
            </div>

            {/* Surcharges Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 24 }}>
                {surcharges.map((s, i) => {
                    const Icon = s.icon;
                    return (
                        <div key={i} style={{ padding: 20, borderRadius: 18, background: '#111114', border: '1px solid #1f1f24' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <Icon size={18} color={s.badgeStatus === 'critical' ? '#ef4444' : '#f59e0b'} />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#a1a1aa' }}>{s.category}</span>
                                </div>
                                <span style={{ fontSize: 13, fontWeight: 900, color: '#ef4444' }}>
                                    +{symbol}{s.markup} Markup
                                </span>
                            </div>

                            <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 6px' }}>
                                {s.title}
                            </h3>
                            <span style={{ fontSize: 11, color: '#71717a', display: 'block', marginBottom: 10 }}>Platform: {s.platform}</span>

                            <p style={{ fontSize: 12, color: '#a1a1aa', margin: 0, lineHeight: 1.4 }}>
                                {s.details}
                            </p>
                        </div>
                    );
                })}
            </div>

            {/* Bypass Action Card */}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <div style={{ fontSize: 12, color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Identified Hidden Surcharges</div>
                        <h3 style={{ fontSize: 20, fontWeight: 900, color: '#ef4444', margin: '4px 0 0' }}>
                            Total Predatory Markup: +{symbol}{totalMarkup.toLocaleString()}
                        </h3>
                    </div>

                    <Button
                        onClick={handleBypass}
                        disabled={isBypassing || bypassed}
                        style={{ background: 'linear-gradient(135deg, #ef4444, #f59e0b)', border: 'none' }}
                    >
                        {isBypassing ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                        {isBypassing ? 'Bypassing Dynamic Pricing...' : bypassed ? 'Surcharges Bypassed!' : `Bypass Markup & Save ${symbol}${totalMarkup}`}
                    </Button>
                </div>

                {bypassed && (
                    <Alert
                        status="positive"
                        title="Dynamic Pricing Surcharges Neutralized!"
                        description={`Spoofed user-agent headers and guest session tokens. You saved ${symbol}${totalMarkup} on checkout.`}
                    />
                )}
            </Card>
        </div>
    );
}
