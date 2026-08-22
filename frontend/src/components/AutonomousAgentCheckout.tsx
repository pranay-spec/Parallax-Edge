'use client';

import React, { useState } from 'react';
import { Bot, Zap, ShieldCheck, CreditCard, MapPin, CheckCircle2, ArrowRight, RefreshCw, Terminal, AlertTriangle, Trash2, Clock, Lock, ExternalLink } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Alert from '@/components/ui/Alert';

interface AutonomousAgentCheckoutProps {
    symbol?: string;
    pincode?: string;
}

export default function AutonomousAgentCheckout({ symbol = '₹', pincode = '560102' }: AutonomousAgentCheckoutProps) {
    const [selectedProduct, setSelectedProduct] = useState('Sony WH-1000XM5 Headphones');
    const [targetBudget, setTargetBudget] = useState('21000');
    const [inputMode, setInputMode] = useState<'preset' | 'custom'>('preset');
    const [customProductQuery, setCustomProductQuery] = useState('');
    const [isCheckingLivePrice, setIsCheckingLivePrice] = useState(false);
    const [livePriceResult, setLivePriceResult] = useState<any>(null);

    // Extract a clean product name from Amazon/Flipkart URLs, or return the raw query if not a URL
    // Returns multiple search queries to try (progressively shorter) for better hit rates
    const extractSearchQueriesFromInput = (input: string): { queries: string[]; isUrl: boolean; platform: string } => {
        const trimmed = input.trim();

        // Amazon URL: extract product name from the slug before /dp/
        const amazonMatch = trimmed.match(/amazon\.\w+(?:\.\w+)?\/([^\/]+)\/dp\/([A-Z0-9]{10})/i);
        if (amazonMatch) {
            const words = amazonMatch[1].replace(/-/g, ' ').split(/\s+/).filter(w => w.length > 1);
            // Try: first 3 words, first 2 words (progressively shorter for better search hit rate)
            const queries: string[] = [];
            if (words.length >= 3) queries.push(words.slice(0, 3).join(' '));
            if (words.length >= 2) queries.push(words.slice(0, 2).join(' '));
            if (words.length >= 1) queries.push(words[0]);
            return { queries, isUrl: true, platform: 'Amazon' };
        }

        // Amazon short URL: /dp/ASIN only - can't extract name, use ASIN as fallback
        const amazonShort = trimmed.match(/amazon\.\w+(?:\.\w+)?\/dp\/([A-Z0-9]{10})/i);
        if (amazonShort) {
            return { queries: [amazonShort[1]], isUrl: true, platform: 'Amazon' };
        }

        // Flipkart URL: extract product name from slug
        const flipkartMatch = trimmed.match(/flipkart\.com\/([^\/]+)\/p\//i);
        if (flipkartMatch && flipkartMatch[1] !== 'product') {
            const words = flipkartMatch[1].replace(/-/g, ' ').split(/\s+/).filter(w => w.length > 1);
            const queries: string[] = [];
            if (words.length >= 3) queries.push(words.slice(0, 3).join(' '));
            if (words.length >= 2) queries.push(words.slice(0, 2).join(' '));
            if (words.length >= 1) queries.push(words[0]);
            return { queries, isUrl: true, platform: 'Flipkart' };
        }

        // Generic URL detection
        if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
            return { queries: [trimmed], isUrl: true, platform: 'Web' };
        }

        return { queries: [trimmed], isUrl: false, platform: '' };
    };

    // Safely extract a numeric price from the API's nested response structure
    const extractNumericPrice = (priceVal: any): number => {
        if (typeof priceVal === 'number' && !isNaN(priceVal) && priceVal > 0) return priceVal;
        if (typeof priceVal === 'string') {
            const parsed = parseFloat(priceVal.replace(/[^0-9.]/g, ''));
            if (!isNaN(parsed) && parsed > 0) return parsed;
        }
        if (priceVal && typeof priceVal === 'object') {
            // best_price is a full product object with nested price_breakdown
            if (priceVal.price_breakdown && typeof priceVal.price_breakdown === 'object') {
                const pb = priceVal.price_breakdown;
                if (typeof pb.base_price === 'number' && pb.base_price > 0) return pb.base_price;
                if (typeof pb.total_landed_cost === 'number' && pb.total_landed_cost > 0) return pb.total_landed_cost;
            }
            // Direct price fields
            if (typeof priceVal.base_price === 'number' && priceVal.base_price > 0) return priceVal.base_price;
            if (typeof priceVal.total_landed_cost === 'number' && priceVal.total_landed_cost > 0) return priceVal.total_landed_cost;
            if (typeof priceVal.price === 'number' && priceVal.price > 0) return priceVal.price;
        }
        return 0;
    };

    // Extract the best platform name from the API response
    const extractPlatformName = (bestPriceObj: any): string => {
        if (bestPriceObj && typeof bestPriceObj === 'object') {
            if (typeof bestPriceObj.platform === 'string' && bestPriceObj.platform) {
                return bestPriceObj.platform.charAt(0).toUpperCase() + bestPriceObj.platform.slice(1);
            }
        }
        return 'Amazon';
    };

    // Extract the best product title from the API response
    const extractProductTitle = (group: any, fallback: string): string => {
        if (group.canonical_title && group.canonical_title.length > 3) return group.canonical_title;
        if (group.best_price && typeof group.best_price === 'object' && group.best_price.title) return group.best_price.title;
        if (group.products && group.products.length > 0 && group.products[0].title) return group.products[0].title;
        return fallback;
    };

    // Try to fetch search results, attempting multiple queries progressively
    const fetchSearchResults = async (queries: string[]): Promise<{ group: any; usedQuery: string } | null> => {
        for (const q of queries) {
            try {
                const res = await fetch(`http://localhost:8000/search?query=${encodeURIComponent(q)}&pincode=${pincode}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.product_groups && data.product_groups.length > 0) {
                        const group = data.product_groups[0];
                        // Verify we got a real price
                        const price = extractNumericPrice(group.best_price);
                        if (price > 0) return { group, usedQuery: q };
                        // Also check products array
                        if (group.products && group.products.length > 0) {
                            for (const prod of group.products) {
                                const p = extractNumericPrice(prod.price_breakdown || prod);
                                if (p > 0) return { group, usedQuery: q };
                            }
                        }
                    }
                }
            } catch (e) {
                // Try next query
            }
        }
        return null;
    };

    const handleCheckLivePrice = async () => {
        const rawInput = inputMode === 'custom' ? customProductQuery : selectedProduct;
        if (!rawInput || !rawInput.trim()) return;

        setIsCheckingLivePrice(true);
        setLivePriceResult(null);

        const { queries, isUrl, platform: urlPlatform } = extractSearchQueriesFromInput(rawInput);

        try {
            const result = await fetchSearchResults(queries);

            if (result) {
                const { group, usedQuery } = result;

                // Extract price from best_price object
                let bestPrice = extractNumericPrice(group.best_price);

                // Fallback: check products array
                if (bestPrice <= 0 && group.products && group.products.length > 0) {
                    for (const prod of group.products) {
                        const p = extractNumericPrice(prod.price_breakdown || prod);
                        if (p > 0) { bestPrice = p; break; }
                    }
                }

                if (bestPrice <= 0) bestPrice = 1299; // Final fallback

                const autoTarget = Math.round(bestPrice * 0.9);
                const title = extractProductTitle(group, usedQuery);
                const platform = extractPlatformName(group.best_price) || urlPlatform || 'Amazon';
                const imageUrl = (group.best_price && typeof group.best_price === 'object' && group.best_price.image_url) || (group.products && group.products[0] && group.products[0].image_url) || '';
                const productUrl = (group.best_price && typeof group.best_price === 'object' && group.best_price.url) || (group.products && group.products[0] && group.products[0].url) || '';

                setSelectedProduct(title);
                setTargetBudget(autoTarget.toString());
                setLivePriceResult({
                    title,
                    bestPrice,
                    highestPrice: Math.round(bestPrice * 1.25),
                    autoTarget,
                    bestPlatform: platform,
                    imageUrl,
                    productUrl
                });
            } else {
                // No results found after all retries
                const displayName = queries[0] || rawInput;
                setSelectedProduct(displayName);
                setLivePriceResult({
                    title: displayName,
                    bestPrice: 0,
                    highestPrice: 0,
                    autoTarget: 0,
                    bestPlatform: urlPlatform || 'Amazon / Flipkart',
                    noResults: true
                });
            }
        } catch (e) {
            const displayName = queries[0] || rawInput;
            setSelectedProduct(displayName);
            setLivePriceResult({
                title: displayName,
                bestPrice: 0,
                highestPrice: 0,
                autoTarget: 0,
                bestPlatform: 'Amazon / Flipkart',
                noResults: true
            });
        } finally {
            setIsCheckingLivePrice(false);
        }
    };
    const [paymentMethod, setPaymentMethod] = useState('hdfc_virtual');
    const [address, setAddress] = useState('Home: 102 MG Road, Indiranagar, Bangalore 560102');
    const [requireOtp, setRequireOtp] = useState(true);
    const [maxDays, setMaxDays] = useState(14);

    const [isSimulating, setIsSimulating] = useState(false);
    const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
    const [fulfilledOrder, setFulfilledOrder] = useState<any>(null);

    // Active delegated AI agents list
    const [delegatedAgents, setDelegatedAgents] = useState<any[]>([
        {
            id: 'agent-101',
            product: 'Sony WH-1000XM5 Headphones',
            maxBudget: 21000,
            card: 'HDFC Virtual Card •••• 8842',
            status: 'Monitoring Feeds',
            marketPrice: 26990,
            createdAt: '2026-08-08 10:15'
        },
        {
            id: 'agent-102',
            product: 'Apple MacBook Air M3 15-inch',
            maxBudget: 114900,
            card: 'ICICI Coral Virtual Card •••• 4120',
            status: 'Monitoring Feeds',
            marketPrice: 119900,
            createdAt: '2026-08-07 16:30'
        }
    ]);

    const runSimulation = () => {
        setIsSimulating(true);
        setTerminalLogs([]);
        setFulfilledOrder(null);

        const logs: { text: string; delay: number }[] = [
            { text: `[11:31:02.102] 🤖 Agent Worker #AG-9942 Launched for "${selectedProduct}"`, delay: 300 },
            { text: `[11:31:02.340] 📡 Establishing encrypted WebSocket feeds to Flipkart, Amazon, Croma...`, delay: 700 },
            { text: `[11:31:02.890] 🔍 Evaluating price trends & landed fee breakdowns across 7 platforms...`, delay: 1100 },
            { text: `[11:31:03.210] ⚡ ANOMALY DETECTED: Flipkart Flash Dip triggered price to ${symbol}${Number(targetBudget) - 1} (-22.2%)`, delay: 1600 },
            { text: `[11:31:03.450] ✅ CONDITION MET: Price (${symbol}${Number(targetBudget) - 1}) ≤ Target Budget (${symbol}${Number(targetBudget).toLocaleString()})`, delay: 2000 },
            { text: `[11:31:03.780] 💳 Tokenizing Virtual Payment Card (${paymentMethod.toUpperCase()})... Token: tok_sec_9842...`, delay: 2500 },
            { text: `[11:31:04.010] 📦 Injecting shipping address: ${address.slice(0, 30)}...`, delay: 2900 },
            { text: `[11:31:04.340] 🚀 Executing automated checkout payload... HTTP 200 OK`, delay: 3400 },
            { text: `[11:31:04.600] 🎉 ORDER AUTONOMOUSLY FULFILLED! Order ID: #PX-884920`, delay: 3800 }
        ];

        logs.forEach(log => {
            setTimeout(() => {
                setTerminalLogs(prev => [...prev, log.text]);
            }, log.delay);
        });

        setTimeout(() => {
            setIsSimulating(false);
            setFulfilledOrder({
                orderId: 'PX-884920',
                product: selectedProduct,
                finalPrice: Number(targetBudget) - 1,
                savings: 5991,
                platform: 'Flipkart (Flash Dip)',
                cardUsed: 'HDFC Virtual Card •••• 8842',
                eta: 'Tomorrow, 2:00 PM'
            });

            // Add new agent to list
            const newAgent = {
                id: `agent-${Date.now().toString().slice(-3)}`,
                product: selectedProduct,
                maxBudget: Number(targetBudget),
                card: 'HDFC Virtual Card •••• 8842',
                status: 'Fulfilled (#PX-884920)',
                marketPrice: Number(targetBudget) - 1,
                createdAt: new Date().toISOString().split('T')[0]
            };
            setDelegatedAgents(prev => [newAgent, ...prev]);
        }, 4000);
    };

    const handleDeleteAgent = (id: string) => {
        setDelegatedAgents(prev => prev.filter(a => a.id !== id));
    };

    return (
        <div style={{ marginBottom: 40 }}>
            {/* Header Banner */}
            <div style={{
                borderRadius: 24, padding: '28px 32px', marginBottom: 28,
                background: 'linear-gradient(135deg, rgba(147, 51, 234, 0.15), rgba(6, 182, 212, 0.15))',
                border: '1px solid rgba(168, 85, 247, 0.3)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: 'rgba(168, 85, 247, 0.2)', border: '1px solid rgba(168, 85, 247, 0.4)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <Bot size={28} color="#c084fc" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: 24, fontWeight: 900, color: '#fff', margin: 0 }}>
                            Autonomous AI Shopping Agent
                        </h1>
                        <p style={{ fontSize: 13, color: '#a1a1aa', margin: '4px 0 0' }}>
                            Delegated background checkout execution via tokenized virtual card APIs.
                        </p>
                    </div>
                </div>

                <Badge status="positive" text="🤖 Autonomous Background Worker: Running" />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: 24 }}>
                {/* Column 1: Configurator & Active List */}
                <div>
                    <Card style={{ marginBottom: 24 }}>
                        <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Bot size={20} color="#c084fc" /> Delegate Autonomous AI Checkout Worker
                        </h2>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                            {/* Product Selector Mode Tabs */}
                            <div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                                    <label style={{ fontSize: 12, fontWeight: 700, color: '#a1a1aa' }}>
                                        Select Product to Monitor & Delegate
                                    </label>
                                    <div style={{ display: 'flex', gap: 6 }}>
                                        <button
                                            type="button"
                                            onClick={() => setInputMode('preset')}
                                            style={{
                                                padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                                background: inputMode === 'preset' ? 'rgba(168, 85, 247, 0.25)' : '#0a0a0d',
                                                border: inputMode === 'preset' ? '1px solid #a855f7' : '1px solid #27272a',
                                                color: inputMode === 'preset' ? '#c084fc' : '#71717a'
                                            }}
                                        >
                                            📦 Presets
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setInputMode('custom')}
                                            style={{
                                                padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                                                background: inputMode === 'custom' ? 'rgba(168, 85, 247, 0.25)' : '#0a0a0d',
                                                border: inputMode === 'custom' ? '1px solid #a855f7' : '1px solid #27272a',
                                                color: inputMode === 'custom' ? '#c084fc' : '#71717a'
                                            }}
                                        >
                                            🔍 Search / Paste URL
                                        </button>
                                    </div>
                                </div>

                                {inputMode === 'preset' ? (
                                    <select
                                        value={selectedProduct}
                                        onChange={(e) => setSelectedProduct(e.target.value)}
                                        style={{
                                            width: '100%', padding: '12px 16px', borderRadius: 12,
                                            background: '#0a0a0d', border: '1px solid #27272a', color: '#fff', fontSize: 14, outline: 'none'
                                        }}
                                    >
                                        <option value="Sony WH-1000XM5 Headphones">Sony WH-1000XM5 Headphones (Market Avg: {symbol}26,990)</option>
                                        <option value="Apple MacBook Air M3 15-inch">Apple MacBook Air M3 15-inch (Market Avg: {symbol}1,19,900)</option>
                                        <option value="Apple iPhone 15 Pro Max 256GB">Apple iPhone 15 Pro Max 256GB (Market Avg: {symbol}1,34,900)</option>
                                        <option value="Nike Air Max 270 Running Shoes">Nike Air Max 270 Running Shoes (Market Avg: {symbol}11,495)</option>
                                        <option value="LG 27-inch 4K IPS Ergonomic Monitor">LG 27-inch 4K IPS Ergonomic Monitor (Market Avg: {symbol}49,498)</option>
                                        <option value="Pigeon Cruise 1800W Induction Cooktop">Pigeon Cruise 1800W Induction Cooktop (Market Avg: {symbol}1,998)</option>
                                    </select>
                                ) : (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                        <div style={{ display: 'flex', gap: 10 }}>
                                            <input
                                                type="text"
                                                placeholder="Type product name or paste Amazon/Flipkart URL..."
                                                value={customProductQuery}
                                                onChange={(e) => {
                                                    setCustomProductQuery(e.target.value);
                                                    setSelectedProduct(e.target.value);
                                                }}
                                                style={{
                                                    flex: 1, padding: '12px 16px', borderRadius: 12,
                                                    background: '#0a0a0d', border: '1px solid #27272a', color: '#fff', fontSize: 14, outline: 'none'
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={handleCheckLivePrice}
                                                disabled={isCheckingLivePrice || !customProductQuery.trim()}
                                                style={{
                                                    padding: '12px 18px', borderRadius: 12,
                                                    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)', border: 'none', color: '#fff',
                                                    fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                                                    display: 'flex', alignItems: 'center', gap: 6, opacity: !customProductQuery.trim() ? 0.6 : 1
                                                }}
                                            >
                                                {isCheckingLivePrice ? <RefreshCw size={14} className="animate-spin" /> : <Zap size={14} />}
                                                {isCheckingLivePrice ? 'Checking Feeds...' : 'Check Live Price'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* Live Price Result Card */}
                                {livePriceResult && !livePriceResult.noResults && (
                                    <div style={{
                                        marginTop: 12, padding: '14px 16px', borderRadius: 14,
                                        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))',
                                        border: '1px solid rgba(59, 130, 246, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 14
                                    }}>
                                        {livePriceResult.imageUrl && (
                                            <img
                                                src={livePriceResult.imageUrl}
                                                alt={livePriceResult.title}
                                                style={{ width: 48, height: 48, objectFit: 'contain', borderRadius: 8, background: '#18181b', padding: 4, border: '1px solid #27272a', flexShrink: 0 }}
                                            />
                                        )}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ fontSize: 11, color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <span>⚡ Live Price Intelligence Verified</span>
                                                {livePriceResult.productUrl && (
                                                    <a
                                                        href={livePriceResult.productUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{ color: '#60a5fa', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 11 }}
                                                    >
                                                        View Product <ExternalLink size={10} />
                                                    </a>
                                                )}
                                            </div>
                                            <div style={{ fontSize: 14, color: '#fff', fontWeight: 700, marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                {livePriceResult.title}
                                            </div>
                                            <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 4 }}>
                                                Current Lowest: <span style={{ color: '#4ade80', fontWeight: 800 }}>{symbol}{livePriceResult.bestPrice.toLocaleString('en-IN')}</span> on {livePriceResult.bestPlatform}
                                            </div>
                                        </div>
                                        <div style={{ textAlign: 'right', flexShrink: 0, marginLeft: 16 }}>
                                            <div style={{ fontSize: 11, color: '#c084fc', fontWeight: 700 }}>Auto Target Budget</div>
                                            <div style={{ fontSize: 18, color: '#c084fc', fontWeight: 900 }}>{symbol}{livePriceResult.autoTarget.toLocaleString('en-IN')}</div>
                                        </div>
                                    </div>
                                )}
                                {livePriceResult && livePriceResult.noResults && (
                                    <div style={{
                                        marginTop: 12, padding: '14px 16px', borderRadius: 14,
                                        background: 'rgba(239, 68, 68, 0.08)',
                                        border: '1px solid rgba(239, 68, 68, 0.3)'
                                    }}>
                                        <div style={{ fontSize: 12, color: '#f87171', fontWeight: 700 }}>
                                            ⚠️ No live price data found for "{livePriceResult.title}". Try a different product name.
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Target Budget & Payment Token */}
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a1a1aa', marginBottom: 8 }}>
                                        Target Maximum Budget ({symbol})
                                    </label>
                                    <input
                                        type="number"
                                        value={targetBudget}
                                        onChange={(e) => setTargetBudget(e.target.value)}
                                        style={{
                                            width: '100%', padding: '12px 16px', borderRadius: 12,
                                            background: '#0a0a0d', border: '1px solid #27272a', color: '#fff', fontSize: 14, outline: 'none'
                                        }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a1a1aa', marginBottom: 8 }}>
                                        Tokenized Payment Card
                                    </label>
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                        style={{
                                            width: '100%', padding: '12px 16px', borderRadius: 12,
                                            background: '#0a0a0d', border: '1px solid #27272a', color: '#fff', fontSize: 14, outline: 'none'
                                        }}
                                    >
                                        <option value="hdfc_virtual">HDFC Virtual Card •••• 8842</option>
                                        <option value="icici_virtual">ICICI Coral Virtual Card •••• 4120</option>
                                        <option value="amazon_pay">Amazon Pay Balance ({symbol}15,000)</option>
                                    </select>
                                </div>
                            </div>

                            {/* Address & Safeguards */}
                            <div>
                                <label style={{ display: 'block', fontSize: 12, fontWeight: 700, color: '#a1a1aa', marginBottom: 8 }}>
                                    Automated Shipping Destination
                                </label>
                                <input
                                    type="text"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                    style={{
                                        width: '100%', padding: '12px 16px', borderRadius: 12,
                                        background: '#0a0a0d', border: '1px solid #27272a', color: '#fff', fontSize: 14, outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Safeguard Options */}
                            <div style={{ padding: 14, borderRadius: 14, background: '#0a0a0d', border: '1px solid #27272a', display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <div style={{ fontSize: 12, fontWeight: 700, color: '#c084fc', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Lock size={14} /> AI Safety & Governance Controls
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#e4e4e7', cursor: 'pointer' }}>
                                    <input
                                        type="checkbox"
                                        checked={requireOtp}
                                        onChange={(e) => setRequireOtp(e.target.checked)}
                                    />
                                    Require 1-Tap OTP approval if price exceeds {symbol}25,000
                                </label>
                            </div>

                            <Button
                                onClick={runSimulation}
                                disabled={isSimulating}
                                style={{ width: '100%', background: 'linear-gradient(135deg, #a855f7, #06b6d4)', border: 'none' }}
                            >
                                {isSimulating ? <RefreshCw size={16} className="animate-spin" /> : <Zap size={16} />}
                                {isSimulating ? 'Executing Autonomous AI Worker...' : 'Delegate & Run Autonomous Agent Simulation'}
                            </Button>
                        </div>
                    </Card>

                    {/* Delegated Agents List */}
                    <Card>
                        <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: '0 0 16px' }}>
                            Active Delegated AI Workers
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {delegatedAgents.map((agent) => (
                                <div key={agent.id} style={{
                                    padding: 16, borderRadius: 14, background: '#18181b', border: '1px solid #27272a',
                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                }}>
                                    <div>
                                        <div style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{agent.product}</div>
                                        <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 2 }}>
                                            Max Target: {symbol}{agent.maxBudget.toLocaleString()} • Card: {agent.card}
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        {agent.status.includes('Fulfilled') ? (
                                            <Badge status="positive" text={agent.status} />
                                        ) : (
                                            <Badge status="info" text="📡 Polling Feeds..." />
                                        )}
                                        <button
                                            onClick={() => handleDeleteAgent(agent.id)}
                                            style={{ padding: 6, borderRadius: 8, background: '#0a0a0d', border: '1px solid #27272a', color: '#ef4444', cursor: 'pointer' }}
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                {/* Column 2: Live AI Execution Terminal Simulator */}
                <div>
                    <Card style={{ position: 'sticky', top: 20 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <Terminal size={18} color="#c084fc" />
                                <h3 style={{ fontSize: 16, fontWeight: 800, color: '#fff', margin: 0 }}>
                                    AI Agent Terminal Log
                                </h3>
                            </div>
                            {isSimulating && <span style={{ fontSize: 11, color: '#c084fc', fontWeight: 700 }}>● LIVE EXECUTING</span>}
                        </div>

                        {/* Dark Hacker Terminal Window */}
                        <div style={{
                            background: '#050508', borderRadius: 18, padding: 16, border: '1px solid #27272a',
                            fontFamily: 'monospace', fontSize: 11, height: 320, overflowY: 'auto',
                            boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.8)'
                        }}>
                            {terminalLogs.length === 0 ? (
                                <div style={{ color: '#52525b', textAlign: 'center', paddingTop: 110 }}>
                                    Click "Delegate & Run Autonomous Agent Simulation" to watch background AI execution.
                                </div>
                            ) : (
                                terminalLogs.map((log, index) => (
                                    <div key={index} style={{
                                        color: log.includes('ANOMALY') ? '#f59e0b' : log.includes('FULFILLED') || log.includes('CONDITION MET') ? '#4ade80' : '#a1a1aa',
                                        marginBottom: 8, lineHeight: 1.4
                                    }}>
                                        {log}
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Order Fulfillment Card */}
                        {fulfilledOrder && (
                            <div style={{ marginTop: 20 }}>
                                <Alert
                                    status="positive"
                                    title={`Order ${fulfilledOrder.orderId} Autonomously Placed!`}
                                    description={`Bought ${fulfilledOrder.product} for ${symbol}${fulfilledOrder.finalPrice.toLocaleString()} on ${fulfilledOrder.platform} (Saved ${symbol}${fulfilledOrder.savings.toLocaleString()})`}
                                />
                            </div>
                        )}
                    </Card>
                </div>
            </div>
        </div>
    );
}
