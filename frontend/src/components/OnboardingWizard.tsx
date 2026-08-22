'use client';

import React, { useState } from 'react';
import { Sparkles, CheckCircle2, ArrowRight, Target, ShieldCheck, Zap, X } from 'lucide-react';

interface OnboardingWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: (config: { goal: string; priorityInfo: string; persona: string }) => void;
}

export default function OnboardingWizard({ isOpen, onClose, onComplete }: OnboardingWizardProps) {
    const [step, setStep] = useState(1);
    const [goal, setGoal] = useState('Lowest Price Comparison');
    const [priorityInfo, setPriorityInfo] = useState('Student Discounts & Bank Offers');

    if (!isOpen) return null;

    const handleFinish = () => {
        const persona = priorityInfo.includes('Student') ? 'Student' : 'Gamer';
        onComplete({ goal, priorityInfo, persona });
        onClose();
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.85)', backdropFilter: 'blur(10px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
        }}>
            <div style={{
                width: '100%', maxWidth: 540, background: '#111114',
                border: '1px solid #27272a', borderRadius: 24, padding: 32,
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)', position: 'relative'
            }}>
                <button onClick={onClose} style={{ position: 'absolute', top: 20, right: 20, background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                    <X size={20} />
                </button>

                {/* Interactive Progress bar with step numbers */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 28, alignItems: 'center' }}>
                    {[1, 2, 3].map(s => (
                        <button
                            key={s}
                            onClick={() => setStep(s)}
                            title={`Jump to Step ${s}`}
                            style={{
                                flex: 1, height: 28, borderRadius: 8, border: '1px solid',
                                borderColor: s <= step ? '#06b6d4' : '#27272a',
                                background: s === step ? 'rgba(6, 182, 212, 0.2)' : s < step ? '#06b6d4' : '#18181b',
                                color: s <= step ? '#fff' : '#71717a',
                                fontSize: 12, fontWeight: 800, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                                transition: 'all 0.2s'
                            }}
                        >
                            Step {s}
                        </button>
                    ))}
                </div>

                {/* STEP 1 */}
                {step === 1 && (
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: 0.8 }}>STEP 1 OF 3</div>
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '4px 0 16px' }}>
                            What are you trying to achieve?
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                            {[
                                { label: 'Lowest Price Comparison', desc: 'Aggregate instant prices across Amazon, Flipkart, Blinkit & Croma' },
                                { label: 'Bulk Group Savings', desc: 'Join neighborhood Flash Pools for wholesale bulk discounts' },
                                { label: 'Predict Price Drops', desc: 'Use Scikit-Learn Price Oracle to buy at the absolute lowest dip' }
                            ].map(opt => (
                                <div
                                    key={opt.label}
                                    onClick={() => setGoal(opt.label)}
                                    style={{
                                        padding: 16, borderRadius: 16, border: '1px solid', cursor: 'pointer',
                                        borderColor: goal === opt.label ? '#06b6d4' : '#27272a',
                                        background: goal === opt.label ? 'rgba(6, 182, 212, 0.1)' : '#18181b'
                                    }}
                                >
                                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{opt.label}</div>
                                    <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>{opt.desc}</div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => setStep(2)}
                            style={{
                                width: '100%', padding: '14px', borderRadius: 14, background: '#06b6d4', color: '#000',
                                fontWeight: 800, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                            }}
                        >
                            Next Step →
                        </button>
                    </div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: 0.8 }}>STEP 2 OF 3</div>
                        <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: '4px 0 16px' }}>
                            What information matters most to you?
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 28 }}>
                            {[
                                { label: 'Student Discounts & Bank Offers', desc: 'Stack HDFC/ICICI card discounts & student promo codes' },
                                { label: 'Verified Authentic Reviews', desc: 'Filter reviews by age & role cohort (CS Student vs Designer)' },
                                { label: 'Flash Price Error Drops', desc: 'Get instant alerts when products drop below 35% MSRP' }
                            ].map(opt => (
                                <div
                                    key={opt.label}
                                    onClick={() => setPriorityInfo(opt.label)}
                                    style={{
                                        padding: 16, borderRadius: 16, border: '1px solid', cursor: 'pointer',
                                        borderColor: priorityInfo === opt.label ? '#06b6d4' : '#27272a',
                                        background: priorityInfo === opt.label ? 'rgba(6, 182, 212, 0.1)' : '#18181b'
                                    }}
                                >
                                    <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>{opt.label}</div>
                                    <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>{opt.desc}</div>
                                </div>
                            ))}
                        </div>

                        <div style={{ display: 'flex', gap: 12 }}>
                            <button onClick={() => setStep(1)} style={{ flex: 1, padding: '14px', borderRadius: 14, background: '#18181b', color: '#a1a1aa', border: '1px solid #27272a', fontWeight: 700, cursor: 'pointer' }}>Back</button>
                            <button onClick={() => setStep(3)} style={{ flex: 2, padding: '14px', borderRadius: 14, background: '#06b6d4', color: '#000', fontWeight: 800, border: 'none', cursor: 'pointer' }}>Next Step →</button>
                        </div>
                    </div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ width: 56, height: 56, borderRadius: 20, background: 'rgba(34, 197, 94, 0.2)', border: '1px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                            <CheckCircle2 size={32} color="#22c55e" />
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#22c55e', letterSpacing: 0.8 }}>STEP 3 OF 3 • READY</div>
                        <h2 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: '4px 0 10px' }}>
                            Here's your personalized workspace!
                        </h2>
                        <p style={{ fontSize: 14, color: '#a1a1aa', marginBottom: 28 }}>
                            Parallax Edge AI has configured your dashboard for <strong>{goal}</strong> tailored to <strong>{priorityInfo}</strong>.
                        </p>

                        <button
                            onClick={handleFinish}
                            style={{
                                width: '100%', padding: '16px', borderRadius: 14, background: 'linear-gradient(135deg, #22c55e, #06b6d4)',
                                color: '#fff', fontWeight: 900, fontSize: 15, border: 'none', cursor: 'pointer',
                                boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)'
                            }}
                        >
                            Launch My Personalized Workspace →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
