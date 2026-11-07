'use client';
import React, { useState, useEffect } from 'react';
import { Upload, FileText, Loader2, TrendingDown, ShoppingCart, AlertCircle, Calendar, Wallet } from 'lucide-react';

export default function ReceiptScanner({ symbol }: { symbol: string }) {
    const [scanState, setScanState] = useState<'idle' | 'scanning' | 'done' | 'error'>('idle');
    const [scanStage, setScanStage] = useState(0);
    const [receiptData, setReceiptData] = useState<any>(null);

    const stages = ['Reading receipt...', 'Extracting items...', 'Analyzing spending...', 'Finding savings...'];

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setScanState('scanning');
        setScanStage(0);
        setReceiptData(null);

        // Read file as base64
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64data = reader.result as string;

            // Start API fetch
            const fetchPromise = fetch('http://localhost:8000/api/vision/receipt', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image_data: base64data })
            }).then(res => {
                if (!res.ok) throw new Error('API failed');
                return res.json();
            });

            // Start animation
            const runStages = () => new Promise<void>(resolve => {
                let current = 0;
                const interval = setInterval(() => {
                    current++;
                    if (current < stages.length) {
                        setScanStage(current);
                    } else {
                        clearInterval(interval);
                        resolve();
                    }
                }, 800);
            });

            try {
                const [data] = await Promise.all([fetchPromise, runStages()]);
                setReceiptData(data);
                setScanState('done');
            } catch (err) {
                console.error(err);
                setScanState('error');
            }
        };
        reader.readAsDataURL(file);
    };

    const containerStyle: React.CSSProperties = {
        backgroundColor: '#0a0a0f',
        color: '#fff',
        padding: '2rem',
        borderRadius: '20px',
        fontFamily: 'system-ui, sans-serif',
        maxWidth: '900px',
        margin: '0 auto',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
    };

    if (scanState === 'idle') {
        return (
            <div style={containerStyle}>
                <label style={{ display: 'block', cursor: 'pointer', textAlign: 'center', padding: '4rem 2rem', border: '2px dashed #3f3f46', borderRadius: '16px', background: 'linear-gradient(180deg, #111114 0%, #1a1a1e 100%)' }}>
                    <Upload size={48} color="#06b6d4" style={{ margin: '0 auto 1rem' }} />
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Upload Receipt to Find Savings</h2>
                    <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>Drag and drop your receipt image here or click to browse</p>
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: 'none' }} />
                    <div style={{ background: '#06b6d4', color: '#000', padding: '0.75rem 2rem', border: 'none', borderRadius: '8px', fontWeight: 600, display: 'inline-block', fontSize: '1rem', transition: 'all 0.2s' }}>
                        Browse Files
                    </div>
                </label>
            </div>
        );
    }

    if (scanState === 'scanning') {
        return (
            <div style={{ ...containerStyle, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
                <Loader2 size={64} color="#06b6d4" style={{ animation: 'spin 1s linear infinite', marginBottom: '2rem' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff' }}>{stages[scanStage]}</h3>
                <div style={{ width: '100%', maxWidth: '300px', height: '4px', background: '#3f3f46', borderRadius: '2px', marginTop: '2rem', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${((scanStage + 1) / stages.length) * 100}%`, background: '#06b6d4', transition: 'width 0.5s ease' }} />
                </div>
            </div>
        );
    }

    if (scanState === 'error') {
        return (
            <div style={{ ...containerStyle, textAlign: 'center' }}>
                <AlertCircle size={48} color="#ef4444" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#fff' }}>Analysis Failed</h3>
                <p style={{ color: '#a1a1aa', marginBottom: '2rem' }}>We couldn't process this receipt. Please try another image.</p>
                <button onClick={() => setScanState('idle')} style={{ background: '#3f3f46', color: '#fff', padding: '0.5rem 1.5rem', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' }}>Try Again</button>
            </div>
        );
    }

    if (!receiptData) return null;

    const { items, totalSpent, potentialSavings, storeName, date, monthlySavingsEstimate } = receiptData;

    return (
        <div style={containerStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <FileText color="#8b5cf6" size={32} />
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0 }}>{storeName} Receipt</h2>
                        <span style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>{date}</span>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{symbol}{totalSpent}</div>
                    <div style={{ color: '#22c55e', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <TrendingDown size={16} /> Saved {symbol}{potentialSavings}
                    </div>
                </div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '1rem', borderRadius: '12px', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <AlertCircle color="#f59e0b" size={24} />
                <p style={{ margin: 0, color: '#fcd34d' }}>You buy Milk regularly — consider a Blinkit subscription and save {symbol}34/month</p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem' }}>
                <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem', color: '#fff' }}>Items Analysis</h3>
                    <div style={{ background: '#111114', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: '#1a1a1e', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                    <th style={{ padding: '1rem', color: '#a1a1aa', fontWeight: 600 }}>Item</th>
                                    <th style={{ padding: '1rem', color: '#a1a1aa', fontWeight: 600 }}>Price</th>
                                    <th style={{ padding: '1rem', color: '#a1a1aa', fontWeight: 600 }}>Best Price</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item: any, idx: number) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                        <td style={{ padding: '1rem' }}>
                                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#a1a1aa' }}>Qty: {item.qty}</div>
                                        </td>
                                        <td style={{ padding: '1rem', fontWeight: 600 }}>{symbol}{item.price}</td>
                                        <td style={{ padding: '1rem' }}>
                                            {item.cheaperAt ? (
                                                <div style={{ color: '#22c55e' }}>
                                                    <div style={{ fontWeight: 600 }}>{symbol}{item.cheaperPrice}</div>
                                                    <div style={{ fontSize: '0.8rem' }}>at {item.cheaperAt} (Save {symbol}{item.price - item.cheaperPrice})</div>
                                                </div>
                                            ) : (
                                                <div style={{ color: '#a1a1aa', fontSize: '0.9rem' }}>Best Price</div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{ background: '#111114', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#a1a1aa', marginBottom: '1rem' }}>
                            <Wallet size={20} />
                            <span style={{ fontWeight: 600 }}>Monthly Projection</span>
                        </div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#fff', marginBottom: '0.5rem' }}>{symbol}18,450</div>
                        <div style={{ color: '#22c55e', fontSize: '0.9rem', fontWeight: 600 }}>Potential Annual Savings: {symbol}{monthlySavingsEstimate * 12}</div>
                    </div>
                    
                    <div style={{ background: '#111114', padding: '1.5rem', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <h4 style={{ fontWeight: 600, color: '#fff', marginBottom: '1rem' }}>Category Breakdown</h4>
                        <div style={{ display: 'flex', gap: '4px', height: '24px', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem' }}>
                            <div style={{ flex: 3, background: '#06b6d4' }}></div>
                            <div style={{ flex: 2, background: '#8b5cf6' }}></div>
                            <div style={{ flex: 2, background: '#f59e0b' }}></div>
                            <div style={{ flex: 1, background: '#22c55e' }}></div>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#a1a1aa' }}><span style={{ color: '#06b6d4' }}>●</span> Staples</span> <span>45%</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#a1a1aa' }}><span style={{ color: '#8b5cf6' }}>●</span> Beverages</span> <span>25%</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#a1a1aa' }}><span style={{ color: '#f59e0b' }}>●</span> Dairy</span> <span>15%</span></div>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#a1a1aa' }}><span style={{ color: '#22c55e' }}>●</span> Others</span> <span>15%</span></div>
                        </div>
                    </div>
                </div>
            </div>
            
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}} />
        </div>
    );
}
