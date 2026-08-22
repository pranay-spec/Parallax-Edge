'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronRight, ChevronLeft, X, Sparkles, CheckCircle2, Zap, Brain, ShieldCheck, ArrowRight, Layers, Target, AlertTriangle } from 'lucide-react';

interface JudgeDemoStoryProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (section: string) => void;
    onSearch: (query: string) => void;
    onOptimizeCart: () => void;
}

const DEMO_STEPS = [
    {
        stage: "PROBLEM",
        title: "The Fragmented Commerce Problem",
        subtitle: "Consumers overpay by up to 24% across e-commerce apps.",
        description: "Prices, coupons, delivery fees, and seller credibility are scattered across Amazon, Flipkart, Blinkit, and Croma. Users miss hidden price drops and fall for fake reviews.",
        icon: AlertTriangle,
        color: "#ef4444",
        highlight: "Fragmented Pricing & Fake Reviews"
    },
    {
        stage: "DATA",
        stageNum: "2 of 7",
        title: "Multi-Platform Real-Time Ingestion",
        subtitle: "Parallax Edge ingests pricing, delivery, and coupon matrices.",
        description: "Our ETL data pipeline aggregates hyper-local prices, inventory status, and promo codes across 7 e-commerce platforms simultaneously.",
        icon: Layers,
        color: "#06b6d4",
        highlight: "7 Platforms Connected Real-Time"
    },
    {
        stage: "AI DETECTS ISSUE",
        stageNum: "3 of 7",
        title: "Scikit-Learn Anomaly & Bot Detection",
        subtitle: "ML models flag price drops and purge suspicious bot reviews.",
        description: "Our Scikit-Learn Z-score detector identified a 23% flash drop on Sony WH-1000XM5 and purged 5 fake bot reviews to maintain a 94% Trust Index.",
        icon: Brain,
        color: "#c084fc",
        highlight: "23% Drop Flagged • 5 Bots Blocked"
    },
    {
        stage: "INSIGHT",
        stageNum: "4 of 7",
        title: "Actionable AI Insight Generation",
        subtitle: "Translating raw charts into clear driver explanations.",
        description: "Rather than displaying passive graphs, Parallax AI calculates that Flipkart's weekend flash sale ends in 3h 45m and can be stacked with HDFC card discounts.",
        icon: Sparkles,
        color: "#f59e0b",
        highlight: "Flipkart Flash Sale Ending in 3h 45m"
    },
    {
        stage: "RECOMMENDATION",
        stageNum: "5 of 7",
        title: "Automated Cart Split Recommendation",
        subtitle: "Calculating mathematical minimum landed cost.",
        description: "The Integer Linear Programming (ILP) solver determines the optimal multi-vendor split: Headphones on Flipkart, Laptop Accessories on Amazon.",
        icon: Target,
        color: "#3b82f6",
        highlight: "Optimal Multi-Vendor Split"
    },
    {
        stage: "ACTION",
        stageNum: "6 of 7",
        title: "One-Tap Execution",
        subtitle: "Executing cart optimization in 0.4 seconds.",
        description: "One-click execution applies instant card coupons, adjusts shipping thresholds, and locks in the lowest historical price before flash expiry.",
        icon: Zap,
        color: "#22c55e",
        highlight: "Executed in 0.4 Seconds"
    },
    {
        stage: "RESULT",
        stageNum: "7 of 7",
        title: "Quantifiable User Value Delivered",
        subtitle: "₹6,000 Total Instant Savings Unlocked!",
        description: "The user achieved a 24% net discount with 94% Scikit-Learn verified authentic trust. Complete problem-to-solution cycle delivered in seconds.",
        icon: CheckCircle2,
        color: "#22c55e",
        highlight: "₹6,000 Instant Savings • 24% Off"
    }
];

export default function JudgeDemoStory({ isOpen, onClose, onNavigate, onSearch, onOptimizeCart }: JudgeDemoStoryProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        let timer: any;
        if (isPlaying && isOpen) {
            timer = setInterval(() => {
                setCurrentStep(prev => {
                    if (prev >= DEMO_STEPS.length - 1) {
                        setIsPlaying(false);
                        return prev;
                    }
                    return prev + 1;
                });
            }, 3000);
        }
        return () => clearInterval(timer);
    }, [isPlaying, isOpen]);

    if (!isOpen) return null;

    const stepData = DEMO_STEPS[currentStep];
    const IconComp = stepData.icon;

    const handleNext = () => {
        if (currentStep < DEMO_STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onClose();
            onNavigate('oracle');
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(12px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
            <div style={{
                width: '100%', maxWidth: 640, background: '#111114',
                border: '1px solid #27272a', borderRadius: 24, padding: 32,
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)', position: 'relative'
            }}>
                {/* Header controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ padding: '4px 10px', borderRadius: 8, background: stepData.color, color: '#000', fontSize: 11, fontWeight: 900, letterSpacing: 0.5 }}>
                            {stepData.stage}
                        </span>
                        <span style={{ fontSize: 12, color: '#71717a', fontWeight: 600 }}>
                            Step {currentStep + 1} of {DEMO_STEPS.length}
                        </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            style={{
                                padding: '6px 14px', borderRadius: 8, background: isPlaying ? 'rgba(239, 68, 68, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                                color: isPlaying ? '#ef4444' : '#06b6d4', border: '1px solid transparent',
                                fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6
                            }}
                        >
                            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                            {isPlaying ? 'Pause Auto-Play' : 'Auto-Play Demo'}
                        </button>

                        <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Progress bar line */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 28 }}>
                    {DEMO_STEPS.map((s, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentStep(idx)}
                            style={{
                                flex: 1, height: 4, borderRadius: 2, cursor: 'pointer',
                                background: idx <= currentStep ? stepData.color : '#27272a',
                                transition: 'all 0.2s'
                            }}
                        />
                    ))}
                </div>

                {/* Main Card Content */}
                <div style={{ padding: 24, borderRadius: 20, background: '#0a0a0d', border: '1px solid #1f1f24', marginBottom: 28 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 14 }}>
                        <div style={{
                            width: 52, height: 52, borderRadius: 16,
                            background: `rgba(${stepData.color === '#ef4444' ? '239,68,68' : stepData.color === '#06b6d4' ? '6,182,212' : stepData.color === '#c084fc' ? '192,132,252' : stepData.color === '#f59e0b' ? '245,158,11' : stepData.color === '#3b82f6' ? '59,130,246' : '34,197,94'}, 0.2)`,
                            border: `1px solid ${stepData.color}`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <IconComp size={28} color={stepData.color} />
                        </div>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: stepData.color }}>{stepData.subtitle}</div>
                            <h2 style={{ fontSize: 20, fontWeight: 900, color: '#fff', margin: '2px 0 0' }}>{stepData.title}</h2>
                        </div>
                    </div>

                    <p style={{ fontSize: 14, color: '#a1a1aa', margin: '0 0 16px', lineHeight: 1.6 }}>
                        {stepData.description}
                    </p>

                    <div style={{ padding: 12, borderRadius: 12, background: '#111114', border: '1px solid #27272a', fontSize: 13, fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Sparkles size={16} color={stepData.color} />
                        <span>Key Highlight: <strong style={{ color: stepData.color }}>{stepData.highlight}</strong></span>
                    </div>
                </div>

                {/* Footer Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        style={{
                            padding: '12px 20px', borderRadius: 12, background: '#18181b', color: currentStep === 0 ? '#52525b' : '#fff',
                            border: '1px solid #27272a', fontWeight: 700, fontSize: 13, cursor: currentStep === 0 ? 'default' : 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6
                        }}
                    >
                        <ChevronLeft size={16} /> Previous
                    </button>

                    <button
                        onClick={handleNext}
                        style={{
                            padding: '12px 24px', borderRadius: 12,
                            background: currentStep === DEMO_STEPS.length - 1 ? 'linear-gradient(135deg, #22c55e, #06b6d4)' : '#06b6d4',
                            color: currentStep === DEMO_STEPS.length - 1 ? '#fff' : '#000',
                            fontWeight: 900, fontSize: 14, border: 'none', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: 6,
                            boxShadow: '0 6px 20px rgba(6, 182, 212, 0.3)'
                        }}
                    >
                        {currentStep === DEMO_STEPS.length - 1 ? (
                            <> Launch Full App Experience <ArrowRight size={16} /> </>
                        ) : (
                            <> Next Step <ChevronRight size={16} /> </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
