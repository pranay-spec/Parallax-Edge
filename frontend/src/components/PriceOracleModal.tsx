'use client';

import React, { useState, useEffect } from 'react';
import { X, TrendingDown, TrendingUp, AlertTriangle, CheckCircle, Brain, Loader2 } from 'lucide-react';
import { ProductResult } from '@/types';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface PriceOracleModalProps {
    product: ProductResult | null;
    onClose: () => void;
}

export default function PriceOracleModal({ product, onClose }: PriceOracleModalProps) {
    const [oracleData, setOracleData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!product) return;

        const fetchOracle = async () => {
            setLoading(true);
            try {
                const res = await fetch('http://localhost:8000/oracle/forecast', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(product)
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.error) {
                        setError(data.error);
                    } else {
                        // Format dates for chart
                        const formatted = data.chart_data.map((d: any) => ({
                            ...d,
                            dateStr: new Date(d.timestamp * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                        }));
                        setOracleData({ ...data, chart_data: formatted });
                    }
                } else {
                    setError('Failed to fetch ML forecast');
                }
            } catch (err) {
                setError('Network error connecting to Price Oracle');
            } finally {
                setLoading(false);
            }
        };

        fetchOracle();
    }, [product]);

    if (!product) return null;

    const symbol = product.price_breakdown.currency_symbol || '$';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-2xl bg-[#0a0a0c] border border-[#27272a] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#27272a] bg-[#111114] rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <Brain size={24} className="text-purple-400" />
                        <h2 className="text-lg font-bold text-white">AI Price Oracle Forecast</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-[#27272a] rounded-full text-[#a1a1aa] transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 text-[#a1a1aa]">
                            <Loader2 size={32} className="animate-spin mb-4 text-purple-500" />
                            <p>Loading historical data & calculating regression...</p>
                        </div>
                    ) : error ? (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
                            <AlertTriangle size={20} />
                            <p>{error}</p>
                        </div>
                    ) : oracleData ? (
                        <div className="space-y-6">
                            
                            {/* Product Summary */}
                            <div className="flex gap-4 items-center bg-[#111114] p-4 rounded-xl border border-[#27272a]">
                                <img src={product.image_url} alt="Product" className="w-16 h-16 object-cover rounded-lg bg-black" />
                                <div>
                                    <h3 className="text-sm font-semibold text-white line-clamp-1">{product.title}</h3>
                                    <p className="text-2xl font-bold text-gradient-cyan mt-1">
                                        {symbol}{oracleData.current_price.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            {/* Prediction Banner */}
                            <div className={`p-5 rounded-xl border flex flex-col gap-2
                                ${oracleData.prediction.action === 'BUY_NOW' ? 'bg-green-500/10 border-green-500/30' : 'bg-yellow-500/10 border-yellow-500/30'}`}>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {oracleData.prediction.action === 'BUY_NOW' ? <CheckCircle className="text-green-400" /> : <AlertTriangle className="text-yellow-400" />}
                                        <h4 className={`text-lg font-bold ${oracleData.prediction.action === 'BUY_NOW' ? 'text-green-400' : 'text-yellow-400'}`}>
                                            {oracleData.prediction.action === 'BUY_NOW' ? 'Strong Buy Recommendation' : 'Wait for Price Drop'}
                                        </h4>
                                    </div>
                                    <span className="text-sm font-bold text-[#e2e8f0] bg-black/30 px-3 py-1 rounded-full">
                                        {oracleData.prediction.confidence}% Confidence
                                    </span>
                                </div>
                                <p className="text-[#e2e8f0] mt-1">{oracleData.prediction.reason}</p>
                                {oracleData.prediction.potential_savings > 0 && (
                                    <p className="text-sm font-semibold text-green-400 mt-2">
                                        Potential Savings: {symbol}{oracleData.prediction.potential_savings.toLocaleString()}
                                    </p>
                                )}
                            </div>

                            {/* Chart */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="text-sm font-bold text-[#a1a1aa]">30-Day Historical & 7-Day Forecast</h4>
                                    <span className="text-xs text-[#71717a]">RMSE: {oracleData.rmse}</span>
                                </div>
                                <div className="h-64 w-full bg-[#111114] p-4 rounded-xl border border-[#27272a]">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={oracleData.chart_data}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                                            <XAxis dataKey="dateStr" stroke="#71717a" fontSize={10} tickMargin={10} minTickGap={30} />
                                            <YAxis stroke="#71717a" fontSize={10} domain={['auto', 'auto']} tickFormatter={(v) => `${symbol}${v}`} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#111114', borderColor: '#27272a', borderRadius: '8px' }}
                                                itemStyle={{ color: '#fff' }}
                                                formatter={(value: any) => [`${symbol}${value}`, 'Price']}
                                            />
                                            {/* Historic Line */}
                                            <Line 
                                                type="monotone" 
                                                dataKey="price" 
                                                stroke="#a855f7" 
                                                strokeWidth={3}
                                                dot={false}
                                                activeDot={{ r: 6 }}
                                            />
                                            {/* Current Day Line */}
                                            <ReferenceLine x={oracleData.chart_data.find((d:any) => d.is_forecast)?.dateStr} stroke="#38bdf8" strokeDasharray="3 3" label={{ position: 'top', value: 'Today', fill: '#38bdf8', fontSize: 10 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </div>
                                <p className="text-xs text-center text-[#71717a] mt-3">
                                    Forecast generated using Scikit-Learn Linear Regression over normalized time-series data.
                                </p>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
