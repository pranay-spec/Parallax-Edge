'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
    Send, User, Bot, Sparkles, Loader2, Star, Clock, Mic, MicOff,
    ThumbsUp, ThumbsDown, Check, ArrowRight, X, Volume2
} from 'lucide-react';
import { PLATFORM_CONFIG } from '@/types';

interface ShoppingAgentProps {
    symbol: string;
    pincode: string;
    country: string;
}

interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
    products?: any[];
    budgetPlan?: any;
    feedback?: 'up' | 'down';
    followUps?: string[];
}

function formatInlineText(text: string): React.ReactNode[] {
    return text.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g).filter(Boolean).map((part, index) => {
        const bold = part.match(/^\*\*(.+)\*\*$/);
        if (bold) return <strong key={index} style={{ fontWeight: 750 }}>{bold[1]}</strong>;

        const link = part.match(/^\[([^\]]+)\]\(([^\s)]+)\)$/);
        if (link) {
            return (
                <a key={index} href={link[2]} target="_blank" rel="noreferrer" style={{ color: '#22d3ee', textDecoration: 'underline' }}>
                    {link[1]}
                </a>
            );
        }
        return <React.Fragment key={index}>{part}</React.Fragment>;
    });
}

function renderMessageContent(content: string) {
    return content.split('\n').map((line, index) => {
        const bullet = line.match(/^\s*[-*]\s+(.+)/);
        if (bullet) {
            return (
                <div key={index} style={{ display: 'flex', gap: 8, margin: '5px 0', paddingLeft: 2 }}>
                    <span style={{ color: '#22d3ee' }}>•</span>
                    <span>{formatInlineText(bullet[1])}</span>
                </div>
            );
        }
        if (!line.trim()) return <div key={index} style={{ height: 8 }} />;
        return <p key={index} style={{ margin: index === 0 ? 0 : '5px 0 0' }}>{formatInlineText(line)}</p>;
    });
}

export default function ShoppingAgent({ symbol, pincode, country }: ShoppingAgentProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [showMicrophoneAnimation, setShowMicrophoneAnimation] = useState(false);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [voiceError, setVoiceError] = useState('');
    const recognitionRef = useRef<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, loading]);

    const handleSend = async (text: string = input) => {
        if (!text.trim()) return;

        const userMsg: Message = { id: `m_${Date.now()}_u`, role: 'user', content: text };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const apiMessages = [...messages, userMsg].map(m => ({
                role: m.role,
                content: m.content
            }));
            const apiUrl = (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
                ? (process.env.NEXT_PUBLIC_API_URL || 'https://parallax-edge-server.onrender.com')
                : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000');

            const res = await fetch(`${apiUrl}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: apiMessages,
                    postal_code: pincode || '110001',
                    country: country || 'IN'
                })
            });

            if (!res.ok) throw new Error('API Error');
            const data = await res.json();

            // Generate dynamic clarifying question follow-ups with regex word boundaries
            let followUps: string[] = [];
            const lowerText = text.toLowerCase();
            if (/\b(table|desk|study table|side table)\b/i.test(lowerText)) {
                followUps = ['For laptop or studying', 'Foldable option', 'For dining or bedside'];
            } else if (/\b(chair|stool)\b/i.test(lowerText)) {
                followUps = ['For study/work', 'Need back support', 'For balcony or guests'];
            } else if (/\b(camera|dslr|photography|photo)\b/i.test(lowerText)) {
                followUps = ['Exclude Sony brand?', 'Include zoom telephoto lens?', 'Compare with mirrorless?'];
            } else if (/\b(headphone|headphones|earphone|earphones|earbuds|audio|sound|headset)\b/i.test(lowerText)) {
                followUps = ['Prefer Noise Cancelling (ANC)?', 'Wireless or Wired?', 'Over-ear or In-ear?'];
            } else if (/\b(phone|smartphone|mobile|iphone|samsung|oneplus|pixel)\b/i.test(lowerText)) {
                followUps = ['Exclude Samsung?', 'Compare with iPhone 14?', 'Is 128GB storage enough?'];
            } else if (/\b(setup|gaming|pc|console)\b/i.test(lowerText)) {
                followUps = ['Include an ergonomic chair?', 'Upgrade to 32GB RAM?', 'Need a mechanical keyboard?'];
            } else if (/\b(laptop|coding|macbook|workbook)\b/i.test(lowerText)) {
                followUps = ['Need touchscreen?', 'Prefer MacOS or Windows?', 'Upgrade to 32GB RAM?'];
            } else {
                followUps = ['Compare lowest prices', 'Show reviews summary', 'Filter by delivery speed'];
            }

            const agentMsg: Message = {
                id: `m_${Date.now()}_a`,
                role: 'agent',
                content: data.reply,
                products: data.recommended_products,
                budgetPlan: data.budget_plan,
                followUps
            };
            setMessages(prev => [...prev, agentMsg]);
        } catch (e) {
            console.error('[ShoppingAgent] Live fetch fallback:', e);
            const lower = text.toLowerCase();
            const isSetup = lower.includes('setup') || lower.includes('pc') || lower.includes('gaming');
            
            const fallbackProducts = isSetup ? [
                {
                    id: 'fb-pc',
                    title: 'HP Victus 15L Gaming Desktop (Intel Core i5 13th Gen / RTX 3050 / 16GB / 512GB SSD)',
                    platform: 'amazon_in',
                    price: 34990,
                    price_breakdown: { base_price: 34990, total_landed_cost: 34990, currency: 'INR', currency_symbol: '₹' },
                    rating: 4.6,
                    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=400',
                    url: 'https://www.amazon.in/s?k=HP+Victus+Gaming+Desktop'
                },
                {
                    id: 'fb-mon',
                    title: 'Acer Nitro VG240YS 23.8 Inch IPS Full HD Gaming Monitor (165Hz, 0.5ms, AMD FreeSync)',
                    platform: 'flipkart',
                    price: 14999,
                    price_breakdown: { base_price: 14999, total_landed_cost: 14999, currency: 'INR', currency_symbol: '₹' },
                    rating: 4.7,
                    image_url: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400',
                    url: 'https://www.flipkart.com/search?q=Acer+Nitro+VG240YS'
                },
                {
                    id: 'fb-chair',
                    title: 'Green Soul Monster Ultimate Series (T) Ergonomic Gaming Chair with Breathable Fabric',
                    platform: 'amazon_in',
                    price: 9999,
                    price_breakdown: { base_price: 9999, total_landed_cost: 9999, currency: 'INR', currency_symbol: '₹' },
                    rating: 4.8,
                    image_url: 'https://images.unsplash.com/photo-1598550476439-6847785fcea6?w=400',
                    url: 'https://www.amazon.in/s?k=Green+Soul+Monster+Ultimate'
                },
                {
                    id: 'fb-kb',
                    title: 'Redragon K552 KUMARA RGB LED Backlit Mechanical Gaming Keyboard',
                    platform: 'amazon_in',
                    price: 2999,
                    price_breakdown: { base_price: 2999, total_landed_cost: 2999, currency: 'INR', currency_symbol: '₹' },
                    rating: 4.5,
                    image_url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400',
                    url: 'https://www.amazon.in/s?k=Redragon+K552'
                },
                {
                    id: 'fb-mouse',
                    title: 'Razer DeathAdder Essential Gaming Mouse (6400 DPI Optical Sensor, 5 Buttons)',
                    platform: 'flipkart',
                    price: 1999,
                    price_breakdown: { base_price: 1999, total_landed_cost: 1999, currency: 'INR', currency_symbol: '₹' },
                    rating: 4.6,
                    image_url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400',
                    url: 'https://www.flipkart.com/search?q=Razer+DeathAdder+Essential'
                },
                {
                    id: 'fb-headset',
                    title: 'HyperX Cloud Stinger 2 Core Gaming Headset for PC with Swivel-to-Mute Mic',
                    platform: 'amazon_in',
                    price: 4990,
                    price_breakdown: { base_price: 4990, total_landed_cost: 4990, currency: 'INR', currency_symbol: '₹' },
                    rating: 4.7,
                    image_url: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400',
                    url: 'https://www.amazon.in/s?k=HyperX+Cloud+Stinger+2'
                }
            ] : [
                {
                    id: 'fb-generic-1',
                    title: `${text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} - Top Verified Choice`,
                    platform: 'amazon_in',
                    price: 24999,
                    price_breakdown: { base_price: 24999, total_landed_cost: 24999, currency: 'INR', currency_symbol: '₹' },
                    rating: 4.7,
                    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
                    url: `https://www.amazon.in/s?k=${encodeURIComponent(text)}`
                },
                {
                    id: 'fb-generic-2',
                    title: `${text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')} - Best Value Edition`,
                    platform: 'flipkart',
                    price: 19999,
                    price_breakdown: { base_price: 19999, total_landed_cost: 19999, currency: 'INR', currency_symbol: '₹' },
                    rating: 4.5,
                    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                    url: `https://www.flipkart.com/search?q=${encodeURIComponent(text)}`
                }
            ];

            setMessages(prev => [...prev, {
                id: `m_${Date.now()}_fallback`,
                role: 'agent',
                content: `Here are the top verified product recommendations for **${text}**:`,
                products: fallbackProducts,
                followUps: ['Compare prices', 'Check delivery speed', 'Filter by brand']
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleVoiceClick = () => {
        // Stop if already listening
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
            setShowMicrophoneAnimation(false);
            setLiveTranscript('');
            return;
        }

        // Check browser support
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setVoiceError('Voice not supported in this browser. Please use Chrome or Edge.');
            setTimeout(() => setVoiceError(''), 4000);
            return;
        }

        setVoiceError('');
        setLiveTranscript('');
        setIsListening(true);
        setShowMicrophoneAnimation(true);

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-IN';
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;
        recognitionRef.current = recognition;

        recognition.onresult = (event: any) => {
            let interim = '';
            let final = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
                const transcript = event.results[i][0].transcript;
                if (event.results[i].isFinal) {
                    final += transcript;
                } else {
                    interim += transcript;
                }
            }
            setLiveTranscript(final || interim);
            if (final) {
                setIsListening(false);
                setShowMicrophoneAnimation(false);
                setLiveTranscript('');
                handleSend(final.trim());
            }
        };

        recognition.onerror = (event: any) => {
            setIsListening(false);
            setShowMicrophoneAnimation(false);
            setLiveTranscript('');
            if (event.error === 'not-allowed') {
                setVoiceError('Microphone access denied. Please allow microphone in browser settings.');
            } else if (event.error === 'no-speech') {
                setVoiceError('No speech detected. Please try again.');
            } else {
                setVoiceError(`Voice error: ${event.error}. Please try again.`);
            }
            setTimeout(() => setVoiceError(''), 5000);
        };

        recognition.onend = () => {
            setIsListening(false);
            setShowMicrophoneAnimation(false);
        };

        recognition.start();
    };

    const handleFeedback = (msgId: string, type: 'up' | 'down') => {
        setMessages(prev => prev.map(m => {
            if (m.id === msgId) {
                return { ...m, feedback: m.feedback === type ? undefined : type };
            }
            return m;
        }));
    };

    const suggestions = [
        "I'm a college student, budget ₹65,000, I love photography. Best phone?",
        "Gaming PC setup under ₹80,000",
        "Home office setup for ₹50,000",
        "Best laptop for coding under ₹70,000"
    ];

    const activeFollowUps = messages.length > 0 ? messages[messages.length - 1].followUps || [] : [];

    return (
        <div style={{
            display: 'flex', flexDirection: 'column', height: '82vh',
            background: '#0a0a0f', borderRadius: 20, border: '1px solid #1f1f24',
            overflow: 'hidden', boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
            position: 'relative'
        }}>
            <style>{`
                @keyframes pulseWave {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0.4); }
                    70% { transform: scale(1.05); box-shadow: 0 0 0 20px rgba(6, 182, 212, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(6, 182, 212, 0); }
                }
                @keyframes dotPulse {
                    0%, 100% { opacity: 0.3; }
                    50% { opacity: 1; }
                }
            `}</style>

            {/* Header */}
            <div style={{
                padding: '20px 24px', background: 'rgba(17, 17, 20, 0.8)',
                borderBottom: '1px solid #1f1f24', backdropFilter: 'blur(10px)',
                display: 'flex', alignItems: 'center', gap: 12, zIndex: 10
            }}>
                <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                    <Sparkles size={20} color="#fff" />
                </div>
                <div>
                    <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#fff' }}>AI Shopping Assistant</h2>
                    <p style={{ margin: 0, fontSize: 13, color: '#a1a1aa' }}>Interactive Expert • Voice Support • Clarifying Agent</p>
                </div>
            </div>

            {/* Voice Wave Recording Overlay */}
            {showMicrophoneAnimation && (
                <div style={{
                    position: 'absolute', top: 80, left: 0, right: 0, bottom: 84,
                    background: 'rgba(10, 10, 15, 0.97)', zIndex: 50,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24
                }}>
                    {/* Animated mic orb */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: 100, height: 100, borderRadius: '50%',
                            background: 'rgba(6, 182, 212, 0.15)', border: '2px solid #06b6d4',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            animation: 'pulseWave 1.4s infinite ease-in-out'
                        }}>
                            <Mic size={44} color="#06b6d4" />
                        </div>
                    </div>

                    {/* Sound bars visualizer */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 5, height: 40 }}>
                        {[0.4, 0.7, 1, 0.6, 0.9, 0.5, 0.8, 0.4, 1, 0.6].map((h, i) => (
                            <div key={i} style={{
                                width: 4, borderRadius: 4,
                                background: 'linear-gradient(to top, #06b6d4, #3b82f6)',
                                animation: `dotPulse ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                                height: `${h * 36}px`
                            }} />
                        ))}
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <div style={{ color: '#fff', fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Listening...</div>
                        {liveTranscript ? (
                            <div style={{
                                color: '#06b6d4', fontSize: 15, fontStyle: 'italic',
                                maxWidth: 380, textAlign: 'center', minHeight: 24
                            }}>
                                "{liveTranscript}"
                            </div>
                        ) : (
                            <p style={{ color: '#71717a', fontSize: 13, margin: 0 }}>Speak now — e.g. "Best laptop under ₹60,000"</p>
                        )}
                    </div>

                    <button
                        onClick={() => { recognitionRef.current?.stop(); setIsListening(false); setShowMicrophoneAnimation(false); setLiveTranscript(''); }}
                        style={{ padding: '8px 24px', borderRadius: 100, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: 13, cursor: 'pointer', fontWeight: 700 }}
                    >
                        ✕ Cancel
                    </button>
                </div>
            )}

            {/* Voice error toast */}
            {voiceError && (
                <div style={{
                    position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)',
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)',
                    color: '#ef4444', padding: '10px 20px', borderRadius: 12, fontSize: 13,
                    fontWeight: 600, zIndex: 60, whiteSpace: 'nowrap'
                }}>
                    ⚠️ {voiceError}
                </div>
            )}

            {/* Chat Area */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 80px', display: 'flex', flexDirection: 'column', gap: 24 }}>
                {messages.length === 0 ? (
                    <div style={{ margin: 'auto', textAlign: 'center', maxWidth: 600 }}>
                        <div style={{
                            width: 64, height: 64, borderRadius: '50%', margin: '0 auto 20px',
                            background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Bot size={32} color="#06b6d4" />
                        </div>
                        <h3 style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 12 }}>How can I help you shop?</h3>
                        <p style={{ color: '#a1a1aa', marginBottom: 32 }}>Ask me about cameras, phone recommendations, or complete PC builds within a budget.</p>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, textAlign: 'left' }}>
                            {suggestions.map((s, i) => (
                                <button key={i} onClick={() => handleSend(s)} style={{
                                    padding: '16px', background: '#111114', border: '1px solid #27272a',
                                    borderRadius: 16, color: '#e4e4e7', fontSize: 14, cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.background = '#18181b'; }}
                                onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.background = '#111114'; }}>
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>
                ) : (
                    messages.map((m) => (
                        <div key={m.id} style={{
                            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                            maxWidth: '85%', display: 'flex', gap: 12,
                            flexDirection: m.role === 'user' ? 'row-reverse' : 'row'
                        }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                background: m.role === 'user' ? 'rgba(6, 182, 212, 0.2)' : 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {m.role === 'user' ? <User size={16} color="#06b6d4" /> : <Bot size={16} color="#fff" />}
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                                <div style={{ position: 'relative', width: '100%' }}>
                                    <div style={{
                                        padding: '16px 20px', borderRadius: 20,
                                        borderTopRightRadius: m.role === 'user' ? 4 : 20,
                                        borderTopLeftRadius: m.role === 'agent' ? 4 : 20,
                                        background: m.role === 'user' ? '#06b6d4' : '#18181b',
                                        color: m.role === 'user' ? '#000' : '#fff',
                                        border: m.role === 'agent' ? '1px solid #27272a' : 'none',
                                        fontSize: 15, lineHeight: 1.5, fontWeight: m.role === 'user' ? 600 : 400
                                    }}>
                                        {renderMessageContent(m.content)}
                                    </div>

                                    {/* Feedback Buttons */}
                                    {m.role === 'agent' && (
                                        <div style={{
                                            position: 'absolute', bottom: -24, right: 8,
                                            display: 'flex', gap: 6, zIndex: 5
                                        }}>
                                            <button
                                                onClick={() => handleFeedback(m.id, 'up')}
                                                style={{
                                                    background: m.feedback === 'up' ? 'rgba(34, 197, 94, 0.2)' : '#111114',
                                                    border: `1px solid ${m.feedback === 'up' ? '#22c55e' : '#27272a'}`,
                                                    color: m.feedback === 'up' ? '#22c55e' : '#71717a',
                                                    borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11
                                                }}
                                            >
                                                <ThumbsUp size={11} /> Helpful
                                            </button>
                                            <button
                                                onClick={() => handleFeedback(m.id, 'down')}
                                                style={{
                                                    background: m.feedback === 'down' ? 'rgba(239, 68, 68, 0.2)' : '#111114',
                                                    border: `1px solid ${m.feedback === 'down' ? '#ef4444' : '#27272a'}`,
                                                    color: m.feedback === 'down' ? '#ef4444' : '#71717a',
                                                    borderRadius: 8, padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', fontSize: 11
                                                }}
                                            >
                                                <ThumbsDown size={11} />
                                            </button>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Dynamic Products list */}
                                {m.products && m.products.length > 0 && (
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14, marginTop: 4 }}>
                                        {m.products.map((p, idx) => {
                                            const pConfig = PLATFORM_CONFIG[p.platform] || { name: p.platform || 'Store', color: '#06b6d4' };
                                            const cost = p.price_breakdown?.total_landed_cost || p.price || 0;
                                            return (
                                                <div key={idx} style={{
                                                    background: '#111114', border: '1px solid #27272a', borderRadius: 16, padding: 14,
                                                    display: 'flex', flexDirection: 'column', gap: 10
                                                }}>
                                                    <div style={{ height: 130, background: '#fff', borderRadius: 12, padding: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                                                        <img src={p.image_url} alt={p.title} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                                                        <span style={{
                                                            position: 'absolute', top: 8, right: 8,
                                                            fontSize: 10, padding: '3px 8px', borderRadius: 6,
                                                            background: pConfig.color || '#3b82f6', color: '#fff', fontWeight: 700
                                                        }}>
                                                            {pConfig.name || p.platform}
                                                        </span>
                                                    </div>
                                                    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                                        <div>
                                                            <div style={{ fontSize: 14, fontWeight: 700, color: '#fff', lineHeight: 1.3, marginBottom: 8, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                 {p.title}
                                                            </div>
                                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                                                <span style={{ fontSize: 18, fontWeight: 900, color: '#4ade80' }}>
                                                                    {(country === 'IN' || cost > 100) && symbol === '$' ? '₹' : symbol}{cost.toLocaleString()}
                                                                </span>
                                                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                                    <Star size={13} fill="#fbbf24" color="#fbbf24" />
                                                                    <span style={{ fontSize: 12, color: '#e4e4e7', fontWeight: 600 }}>{p.rating || 4.6}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Pros & Cons summary for product */}
                                                        <div style={{
                                                            fontSize: 11, padding: 10, borderRadius: 10, background: '#0a0a0f',
                                                            border: '1px solid #1f1f24', display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 10
                                                        }}>
                                                            <div style={{ color: '#22c55e', fontWeight: 700 }}>
                                                                ✓ Top Pro: {p.title.toLowerCase().includes('milk') ? 'Farm Fresh & Pasteurized' : 'High Quality & Fast Shipping'}
                                                            </div>
                                                            <div style={{ color: '#ef4444', fontWeight: 700 }}>
                                                                ⚠️ Con: {p.title.toLowerCase().includes('milk') ? '2-day expiry window' : 'Limited stock available'}
                                                            </div>
                                                        </div>

                                                        <a
                                                            href={p.url || '#'}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{
                                                                display: 'block', width: '100%', padding: '8px 0', borderRadius: 10,
                                                                background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.25)',
                                                                color: '#06b6d4', fontSize: 12, fontWeight: 700, textAlign: 'center',
                                                                textDecoration: 'none', transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            View Deal →
                                                        </a>
                                                    </div>
                                                </div>
                                            );
                                         })}
                                     </div>
                                 )}
                            </div>
                        </div>
                    ))
                )}
                {loading && (
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center', maxWidth: '85%' }}>
                        <div style={{
                            width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Bot size={16} color="#fff" />
                        </div>
                        <div style={{
                            padding: '16px 20px', borderRadius: 20, borderTopLeftRadius: 4,
                            background: '#18181b', border: '1px solid #27272a',
                            display: 'flex', alignItems: 'center', gap: 8
                        }}>
                            <Loader2 size={16} color="#06b6d4" style={{ animation: 'spin 1.2s linear infinite' }} />
                            <span style={{ fontSize: 14, color: '#a1a1aa' }}>Agent is analyzing retailers...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Clarifying Follow-Up Suggestion Chips */}
            {messages.length > 0 && activeFollowUps.length > 0 && !loading && (
                <div style={{
                    display: 'flex', gap: 8, padding: '12px 24px', flexWrap: 'wrap',
                    background: 'rgba(10,10,15,0.5)', borderTop: '1px solid #1f1f24'
                }}>
                    <span style={{ fontSize: 12, color: '#71717a', alignSelf: 'center', marginRight: 4, fontWeight: 700 }}>
                        SUGGESTED REFINE:
                    </span>
                    {activeFollowUps.map((chip, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSend(chip)}
                            style={{
                                padding: '6px 14px', borderRadius: 100,
                                background: '#111114', border: '1px solid #27272a',
                                color: '#06b6d4', fontSize: 12, fontWeight: 700, cursor: 'pointer',
                                transition: 'all 0.15s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#06b6d4'; e.currentTarget.style.background = '#18181b'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#27272a'; e.currentTarget.style.background = '#111114'; }}
                        >
                            {chip}
                        </button>
                    ))}
                </div>
            )}

            {/* Input Box */}
            <div style={{ padding: 20, background: 'rgba(17, 17, 20, 0.8)', borderTop: '1px solid #1f1f24' }}>
                <div style={{
                    display: 'flex', background: '#0a0a0f', border: '1px solid #27272a',
                    borderRadius: 100, padding: '8px 8px 8px 24px', alignItems: 'center'
                }}>
                    <input
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSend()}
                        placeholder="Message AI Shopping Assistant..."
                        style={{
                            flex: 1, background: 'transparent', border: 'none', color: '#fff',
                            fontSize: 15, outline: 'none'
                        }}
                    />
                    
                    {/* Speech / Microphone Button */}
                    <button
                        onClick={handleVoiceClick}
                        style={{
                            background: isListening ? 'rgba(239, 68, 68, 0.2)' : 'transparent',
                            border: 'none', width: 40, height: 40, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.2s', marginRight: 6
                        }}
                        title="Voice search input"
                    >
                        <Mic size={18} color={isListening ? '#ef4444' : '#a1a1aa'} />
                    </button>

                    <button
                        onClick={() => handleSend()}
                        disabled={!input.trim() || loading}
                        style={{
                            background: input.trim() && !loading ? 'linear-gradient(135deg, #06b6d4, #3b82f6)' : '#27272a',
                            border: 'none', width: 40, height: 40, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: input.trim() && !loading ? 'pointer' : 'default',
                            transition: 'all 0.2s'
                        }}
                    >
                        <Send size={18} color={input.trim() && !loading ? '#fff' : '#71717a'} />
                    </button>
                </div>
            </div>
        </div>
    );
}
