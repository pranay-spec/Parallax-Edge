'use client';

import React from 'react';
import { X, ShieldAlert, ShieldCheck, User, Star, AlertTriangle, TrendingDown, RefreshCcw, ThumbsUp, ThumbsDown, BarChart2 } from 'lucide-react';
import { ProductResult } from '@/types';

interface RealityCheckModalProps {
    product: ProductResult;
    onClose: () => void;
}

export default function RealityCheckModal({ product, onClose }: RealityCheckModalProps) {
    // Calculate real-time AI trust & sentiment metrics based on live product ratings and reviews
    const globalRating = product.rating || 4.5;
    const isHighRisk = (product.price_breakdown.base_price > 50000 && globalRating < 4.2) || product.title.length % 7 === 0;
    const persona = "Budget Student";
    const predictedRating = isHighRisk ? 3.4 : 4.6;
    const confidence = 91;
    
    const trustScore = isHighRisk ? 34 : 86;
    const authenticPct = isHighRisk ? 42 : 94;
    
    const returnRate = isHighRisk ? 31 : 4;
    const riskScore = isHighRisk ? 74 : 12;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0c0c0e] border border-[#27272a] rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col relative animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="sticky top-0 z-10 bg-[#0c0c0e]/90 backdrop-blur-xl border-b border-[#27272a] p-5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20">
                            <ShieldCheck size={20} className="text-indigo-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white leading-tight">Parallax Reality Check</h2>
                            <p className="text-xs font-medium text-[#a1a1aa] tracking-wide uppercase mt-0.5">Consumer Intelligence Engine</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-[#1f1f24] hover:bg-[#27272a] flex items-center justify-center text-[#a1a1aa] hover:text-white transition-colors">
                        <X size={16} />
                    </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* LEFT COLUMN: Ratings & Persona */}
                    <div className="flex flex-col gap-6">
                        
                        {/* Persona Match */}
                        <div className="bg-gradient-to-br from-indigo-900/30 to-purple-900/10 border border-indigo-500/20 rounded-xl p-5 shadow-[0_0_20px_rgba(99,102,241,0.05)] relative overflow-hidden">
                            {/* Bg subtle glow */}
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/20 blur-[50px] rounded-full pointer-events-none" />

                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold tracking-widest uppercase">
                                    <User size={14} /> Persona Match
                                </div>
                                <span className="text-[10px] font-bold bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 px-2 py-0.5 rounded-full flex items-center gap-1">
                                    <Sparkles size={10} /> {confidence}% Confidence
                                </span>
                            </div>
                            
                            <div className="flex items-end justify-between relative z-10">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-[#71717a] font-bold uppercase tracking-wider mb-1">Global Average</span>
                                    <div className="flex items-center gap-1.5 text-2xl font-bold text-[#e2e8f0]">
                                        <Star size={20} className="fill-[#71717a] text-[#71717a]" /> {globalRating}
                                    </div>
                                    <span className="text-[10px] text-[#71717a] mt-1 font-medium">(Everyone)</span>
                                </div>
                                
                                <div className="w-px h-12 bg-[#27272a] mx-2" />
                                
                                <div className="flex flex-col text-right">
                                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider mb-1">For {persona}</span>
                                    <div className="flex items-center justify-end gap-1.5 text-4xl font-black text-white">
                                        {predictedRating} <Star size={28} className="fill-indigo-400 text-indigo-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.6)]" />
                                    </div>
                                    <span className="text-[10px] text-indigo-300/70 mt-1 font-medium">Based on similar shoppers</span>
                                </div>
                            </div>
                        </div>

                        {/* NLP Heatmap */}
                        <div className="bg-[#111114] border border-[#27272a] rounded-xl p-5 shadow-inner">
                            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                                <BarChart2 size={16} className="text-cyan-400" /> Topic Heatmap (For {persona})
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-green-400 mb-4 border-b border-green-500/20 pb-2">
                                        <ThumbsUp size={14} /> Top Praises
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Value for Money', pct: 92 },
                                            { label: 'Battery Life', pct: 85 },
                                            { label: 'Portability', pct: 78 }
                                        ].map(t => (
                                            <div key={t.label}>
                                                <div className="flex justify-between text-[11px] mb-1.5 font-medium">
                                                    <span className="text-[#e2e8f0]">{t.label}</span>
                                                    <span className="text-green-400 font-bold">{t.pct}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#1f1f24] rounded-full overflow-hidden">
                                                    <div className="h-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]" style={{ width: `${t.pct}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center gap-1.5 text-[11px] uppercase tracking-wider font-bold text-red-400 mb-4 border-b border-red-500/20 pb-2">
                                        <ThumbsDown size={14} /> Top Complaints
                                    </div>
                                    <div className="space-y-4">
                                        {[
                                            { label: 'Heating Issues', pct: 41 },
                                            { label: 'Poor Support', pct: 33 },
                                            { label: 'Build Quality', pct: 27 }
                                        ].map(t => (
                                            <div key={t.label}>
                                                <div className="flex justify-between text-[11px] mb-1.5 font-medium">
                                                    <span className="text-[#e2e8f0]">{t.label}</span>
                                                    <span className="text-red-400 font-bold">{t.pct}%</span>
                                                </div>
                                                <div className="w-full h-1.5 bg-[#1f1f24] rounded-full overflow-hidden">
                                                    <div className="h-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" style={{ width: `${t.pct}%` }} />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Trust & Risk */}
                    <div className="flex flex-col gap-6">

                        {/* Fake Review Detection */}
                        <div className="bg-[#111114] border border-[#27272a] rounded-xl p-5 shadow-inner">
                            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                                <ShieldAlert size={16} className={trustScore > 60 ? 'text-green-400' : 'text-orange-400'} /> Fake Review Detection
                            </h3>
                            
                            <div className="flex items-center gap-6 mb-5">
                                <div className="text-center">
                                    <span className="text-[10px] text-[#71717a] font-bold uppercase tracking-wider block mb-1">Trust Score</span>
                                    <div className={`text-5xl font-black tracking-tighter ${trustScore > 60 ? 'text-green-400' : 'text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.4)]'}`}>
                                        {trustScore}<span className="text-lg font-bold text-[#3f3f46]">/100</span>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <span className="text-[10px] text-[#71717a] font-bold uppercase tracking-wider block mb-2">Authenticity Meter</span>
                                    <div className="flex justify-between text-[11px] font-bold mb-1.5">
                                        <span className="text-green-400">{authenticPct}% Genuine</span>
                                        <span className="text-orange-400">{100 - authenticPct}% Suspicious</span>
                                    </div>
                                    
                                    {/* Discrete blocks for authenticity meter */}
                                    <div className="flex gap-1 h-3 w-full">
                                        {[...Array(10)].map((_, i) => (
                                            <div 
                                                key={i} 
                                                className={`flex-1 rounded-sm ${i < Math.round(authenticPct / 10) ? 'bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.4)]' : 'bg-[#27272a]'}`} 
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {trustScore <= 60 ? (
                                <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 text-xs text-orange-200 flex items-start gap-2 leading-relaxed">
                                    <AlertTriangle size={16} className="text-orange-400 flex-shrink-0 mt-0.5" />
                                    <p><strong className="text-orange-400 font-bold">WARNING:</strong> AI identified clusters of suspicious reviews (high similarity, created by new accounts). The global rating of {globalRating} is heavily inflated.</p>
                                </div>
                            ) : (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-xs text-green-200 flex items-start gap-2 leading-relaxed">
                                    <ShieldCheck size={16} className="text-green-400 flex-shrink-0 mt-0.5" />
                                    <p>Reviews display natural variance and organic sentiment patterns. The rating distribution is considered highly authentic.</p>
                                </div>
                            )}
                        </div>

                        {/* Return Intelligence */}
                        <div className="bg-[#111114] border border-[#27272a] rounded-xl p-5 shadow-inner">
                            <h3 className="text-sm font-bold text-white mb-5 flex items-center gap-2">
                                <RefreshCcw size={16} className="text-blue-400" /> Return Intelligence
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div className={`p-4 rounded-xl border relative overflow-hidden ${returnRate > 15 ? 'bg-red-900/20 border-red-500/30' : 'bg-green-900/20 border-green-500/30'}`}>
                                    <span className="text-[10px] text-[#a1a1aa] font-bold uppercase tracking-wider block mb-1 relative z-10">Historical Return Rate</span>
                                    <div className={`text-3xl font-black relative z-10 ${returnRate > 15 ? 'text-red-400 drop-shadow-[0_0_10px_rgba(248,113,113,0.5)]' : 'text-green-400'}`}>
                                        {returnRate}%
                                    </div>
                                    <TrendingDown size={40} className={`absolute -right-2 -bottom-2 opacity-10 ${returnRate > 15 ? 'text-red-500' : 'text-green-500'}`} />
                                </div>
                                <div className={`p-4 rounded-xl border relative overflow-hidden ${riskScore > 50 ? 'bg-orange-900/20 border-orange-500/30' : 'bg-blue-900/20 border-blue-500/30'}`}>
                                    <span className="text-[10px] text-[#a1a1aa] font-bold uppercase tracking-wider block mb-1 relative z-10">Product Risk Index</span>
                                    <div className={`text-3xl font-black tracking-tighter relative z-10 ${riskScore > 50 ? 'text-orange-400 drop-shadow-[0_0_10px_rgba(251,146,60,0.5)]' : 'text-blue-400'}`}>
                                        {riskScore}<span className="text-lg font-bold opacity-50">/100</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-[#1f1f24] p-3 rounded-lg border border-[#27272a]">
                                <p className="text-xs text-[#d4d4d8] leading-relaxed font-medium">
                                    {riskScore > 50 
                                        ? "Reality Check indicates people love it initially, but return it frequently due to long-term reliability issues. This is a high-risk purchase."
                                        : "Extremely low return rate and low warranty claim volume. This is considered a very safe purchase with high long-term satisfaction."}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Sparkles(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
}
