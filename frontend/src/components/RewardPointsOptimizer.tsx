'use client';

import React, { useState } from 'react';
import { CreditCard, Sparkles, Zap, RefreshCw, Edit3, Check, Eye, EyeOff, Package, Star } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

interface RewardPointsOptimizerProps {
    symbol?: string;
    productTitle?: string;
    productPrice?: number;
}

export default function RewardPointsOptimizer({ symbol = '₹', productTitle = 'Sony WH-1000XM5 Headphones', productPrice = 20999 }: RewardPointsOptimizerProps) {
    const [selectedAccount, setSelectedAccount] = useState('hdfc');
    const [isApplying, setIsApplying] = useState(false);
    const [redemptionSuccess, setRedemptionSuccess] = useState(false);
    const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
    const [tempPoints, setTempPoints] = useState<string>('');
    const [isSyncing, setIsSyncing] = useState(false);
    const [showProduct, setShowProduct] = useState(false);

    const [rewardAccounts, setRewardAccounts] = useState([
        {
            id: 'hdfc',
            bank: 'HDFC SmartBuy',
            cardName: 'HDFC Regalia Gold / Infinia',
            points: 42500,
            conversionRate: 0.50, // 1 pt = ₹0.50
            cashValue: 21250,
            color: '#3b82f6',
            badge: 'Highest Balance'
        },
        {
            id: 'icici',
            bank: 'ICICI PayWithPoints',
            cardName: 'ICICI Amazon Pay / Coral',
            points: 18200,
            conversionRate: 0.25, // 1 pt = ₹0.25
            cashValue: 4550,
            color: '#f97316'
        },
        {
            id: 'amex',
            bank: 'Amex Membership Rewards',
            cardName: 'American Express Platinum',
            points: 25000,
            conversionRate: 0.50,
            cashValue: 12500,
            color: '#a855f7'
        },
        {
            id: 'sbi',
            bank: 'SBI Card Miles',
            cardName: 'SBI Cashback Card',
            points: 12000,
            conversionRate: 0.25,
            cashValue: 3000,
            color: '#06b6d4'
        }
    ]);

    const currentAccount = rewardAccounts.find(a => a.id === selectedAccount) || rewardAccounts[0];
    const pointsNeeded = Math.min(currentAccount.points, Math.ceil(productPrice / currentAccount.conversionRate));
    const pointsValue = pointsNeeded * currentAccount.conversionRate;
    const remainingCash = Math.max(0, productPrice - pointsValue);

    const handleApplyRedemption = () => {
        setIsApplying(true);
        setTimeout(() => {
            setIsApplying(false);
            setRedemptionSuccess(true);
        }, 1200);
    };

    const startEditing = (id: string, currentVal: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingAccountId(id);
        setTempPoints(currentVal.toString());
    };

    const savePoints = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const num = parseInt(tempPoints, 10);
        if (!isNaN(num) && num >= 0) {
            setRewardAccounts(prev => prev.map(acc => {
                if (acc.id === id) {
                    return {
                        ...acc,
                        points: num,
                        cashValue: Math.round(num * acc.conversionRate)
                    };
                }
                return acc;
            }));
        }
        setEditingAccountId(null);
        setRedemptionSuccess(false);
    };

    const handleSyncLiveBalances = () => {
        setIsSyncing(true);
        setTimeout(() => {
            setIsSyncing(false);
            // Simulate minor real-time drift to verify live sync updates
            setRewardAccounts(prev => prev.map(acc => {
                const drift = Math.floor((Math.random() - 0.5) * 500);
                const updatedPoints = Math.max(0, acc.points + drift);
                return {
                    ...acc,
                    points: updatedPoints,
                    cashValue: Math.round(updatedPoints * acc.conversionRate)
                };
            }));
        }, 1500);
    };

    return (
        <div style={{ marginBottom: 28 }}>
            {/* Header Banner */}
            <div style={{
                borderRadius: 20, padding: '24px 28px', marginBottom: 24,
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(168, 85, 247, 0.15))',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{
                        width: 48, height: 48, borderRadius: 14,
                        background: 'rgba(59, 130, 246, 0.2)', border: '1px solid rgba(59, 130, 246, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <CreditCard size={26} color="#3b82f6" />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: 0 }}>
                            Credit Card Reward Points-to-Cash Converter
                        </h2>
                        <p style={{ fontSize: 13, color: '#a1a1aa', margin: '4px 0 0' }}>
                            Adjust points manually or sync with real-time credit card accounts to pay zero out-of-pocket cash.
                        </p>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Button size="sm" variant="secondary" onClick={handleSyncLiveBalances} disabled={isSyncing}>
                        <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? 'Syncing accounts...' : 'Sync Card Balances'}
                    </Button>
                    <Badge status="positive" text="💳 4 Connected Accounts" />
                </div>
            </div>

            {/* Reward Balances Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14, marginBottom: 24 }}>
                {rewardAccounts.map((acc) => {
                    const active = selectedAccount === acc.id;
                    const isEditing = editingAccountId === acc.id;
                    return (
                        <div
                            key={acc.id}
                            onClick={() => { if (!isEditing) { setSelectedAccount(acc.id); setRedemptionSuccess(false); } }}
                            style={{
                                padding: 18, borderRadius: 16, cursor: isEditing ? 'default' : 'pointer',
                                background: active ? 'rgba(59, 130, 246, 0.12)' : '#111114',
                                border: active ? `2px solid ${acc.color}` : '1px solid #1f1f24',
                                transition: 'all 0.15s ease'
                            }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                <span style={{ fontSize: 12, fontWeight: 700, color: '#a1a1aa' }}>{acc.bank}</span>
                                {isEditing ? (
                                    <button onClick={(e) => savePoints(acc.id, e)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#4ade80', padding: 2 }}>
                                        <Check size={14} />
                                    </button>
                                ) : (
                                    <button onClick={(e) => startEditing(acc.id, acc.points, e)} style={{ border: 'none', background: 'transparent', cursor: 'pointer', color: '#71717a', padding: 2 }}>
                                        <Edit3 size={12} />
                                    </button>
                                )}
                            </div>
                            
                            {isEditing ? (
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                    <input
                                        type="number"
                                        value={tempPoints}
                                        onChange={(e) => setTempPoints(e.target.value)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ width: '80%', padding: '4px 8px', background: '#0a0a0f', border: '1px solid #3f3f46', borderRadius: 6, color: '#fff', fontSize: 14 }}
                                    />
                                    <span style={{ fontSize: 12, color: '#71717a' }}>pts</span>
                                </div>
                            ) : (
                                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff' }}>
                                    {acc.points.toLocaleString()} <span style={{ fontSize: 12, color: '#71717a' }}>pts</span>
                                </div>
                            )}

                            <div style={{ fontSize: 13, color: '#4ade80', fontWeight: 700, marginTop: 4 }}>
                                Cash Value: {symbol}{acc.cashValue.toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Points Stacker Calculation Card */}
            <Card>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
                    <div>
                        <div style={{ fontSize: 12, color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.5 }}>Target Checkout Product</div>
                        <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '4px 0 0' }}>
                            {productTitle} ({symbol}{productPrice.toLocaleString()})
                        </h3>
                        <div style={{ marginTop: 8 }}>
                            <button
                                onClick={() => setShowProduct(!showProduct)}
                                style={{
                                    background: 'rgba(59, 130, 246, 0.1)',
                                    border: '1px solid rgba(59, 130, 246, 0.25)',
                                    borderRadius: 8,
                                    padding: '5px 12px',
                                    color: '#60a5fa',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    outline: 'none',
                                    transition: 'all 0.15s ease'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.18)'}
                                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)'}
                            >
                                {showProduct ? <EyeOff size={14} /> : <Eye size={14} />}
                                {showProduct ? 'Hide Product View' : 'View Product Details'}
                            </button>
                        </div>
                    </div>

                    {remainingCash === 0 ? (
                        <Badge status="positive" text="🎉 ZERO OUT-OF-POCKET CASH REQUIRED" />
                    ) : (
                        <Badge status="warning" text={`Partial Points (${symbol}${remainingCash.toLocaleString()} Cash)`} />
                    )}
                </div>

                {/* DYNAMIC PRODUCT PREVIEW PANEL */}
                {showProduct && (
                    <div style={{
                        padding: 16, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24',
                        marginBottom: 20, display: 'flex', gap: 16, flexWrap: 'wrap', animation: 'fadeIn 0.3s ease'
                    }}>
                        <div style={{
                            width: 100, height: 100, borderRadius: 12,
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(168, 85, 247, 0.15))',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                        }}>
                            <Package size={42} color="#60a5fa" />
                        </div>
                        <div style={{ flex: 1, minWidth: 200 }}>
                            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
                                {productTitle}
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                                <Star size={14} fill="#f59e0b" color="#f59e0b" />
                                <span style={{ fontSize: 13, fontWeight: 700, color: '#f59e0b' }}>4.7</span>
                                <span style={{ fontSize: 12, color: '#71717a' }}>(1,850 verified reviews • 94% authentic)</span>
                            </div>
                            <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 8, lineHeight: 1.4 }}>
                                Premium performance model with dynamic frequency response, multi-device connectivity, and active noise control. Eligible for instant credit card reward redemption.
                            </div>
                            
                            <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <Badge status="positive" text="Platform Lowest" />
                                <Badge status="info" text="In Stock" />
                            </div>
                        </div>
                    </div>
                )}

                {/* Calculation Matrix */}
                <div style={{ padding: 20, borderRadius: 16, background: '#0a0a0d', border: '1px solid #27272a', marginBottom: 20 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                            <span style={{ color: '#a1a1aa' }}>Original Product Price:</span>
                            <strong style={{ color: '#fff' }}>{symbol}{productPrice.toLocaleString()}</strong>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14 }}>
                            <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Sparkles size={16} /> Redeeming {pointsNeeded.toLocaleString()} {currentAccount.bank} Points:
                            </span>
                            <strong style={{ color: '#3b82f6' }}>-{symbol}{pointsValue.toLocaleString()}</strong>
                        </div>

                        <div style={{ height: 1, background: '#27272a', margin: '4px 0' }} />

                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 900 }}>
                            <span style={{ color: '#fff' }}>Final Cash Out-of-Pocket:</span>
                            <strong style={{ color: remainingCash === 0 ? '#4ade80' : '#f59e0b' }}>
                                {symbol}{remainingCash.toLocaleString()}
                            </strong>
                        </div>
                    </div>
                </div>

                {/* Redemption Action Button */}
                <Button
                    onClick={handleApplyRedemption}
                    disabled={isApplying}
                    style={{ width: '100%', background: 'linear-gradient(135deg, #3b82f6, #a855f7)', border: 'none' }}
                >
                    {isApplying ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                    {isApplying ? 'Applying Reward Points...' : `Apply ${currentAccount.bank} Points & Checkout for ${symbol}${remainingCash} Cash`}
                </Button>

                {redemptionSuccess && (
                    <div style={{ marginTop: 16 }}>
                        <Alert
                            status="positive"
                            title="Points Successfully Applied!"
                            description={`${pointsNeeded.toLocaleString()} ${currentAccount.bank} Points redeemed. Remaining cash payable: ${symbol}${remainingCash}.`}
                        />
                    </div>
                )}
            </Card>
        </div>
    );
}
