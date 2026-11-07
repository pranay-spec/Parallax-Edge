'use client';

import { useState } from 'react';
import {
    Sparkles, GraduationCap, Heart, Home, Baby, Briefcase, Dumbbell,
    Check, ShoppingCart, ArrowRight, ShieldCheck, Tag, Zap, ExternalLink
} from 'lucide-react';

interface LifePlannerProps {
    symbol: string;
    onAddToCart?: (product: any) => void;
}

interface LifeStage {
    id: string;
    title: string;
    description: string;
    icon: any;
    color: string;
    defaultBudget: number;
    items: {
        category: string;
        name: string;
        price: number;
        platform: string;
        emoji: string;
        essential: boolean;
        url?: string;
    }[];
}

const LIFE_STAGES: LifeStage[] = [
    {
        id: 'college',
        title: 'Joining College',
        description: 'Complete student starter kit from tech to dorm room essentials',
        icon: GraduationCap,
        color: '#8b5cf6',
        defaultBudget: 75000,
        items: [
            { category: 'Tech', name: 'MacBook Air M1 / Asus Vivobook', price: 68990, platform: 'Amazon', emoji: '💻', essential: true, url: 'https://www.amazon.in/dp/B08N5WRWNW' },
            { category: 'Audio', name: 'ANC Wireless Headphones', price: 855, platform: 'Amazon', emoji: '🎧', essential: true, url: 'https://www.amazon.in/dp/B0856HNMR7' },
            { category: 'Storage', name: 'Ergonomic Backpack with USB', price: 1299, platform: 'Amazon', emoji: '🎒', essential: true, url: 'https://www.amazon.in/dp/B0CYLX577L' },
            { category: 'Power', name: 'Surge Protector Extension Board', price: 595, platform: 'Amazon', emoji: '🔌', essential: true, url: 'https://www.amazon.in/dp/B01GFTEV5Y' },
            { category: 'Comfort', name: 'Ergonomic Mesh Study Chair', price: 4999, platform: 'Amazon', emoji: '🪑', essential: false, url: 'https://www.amazon.in/dp/B0BFJ8PQN4' },
            { category: 'Study', name: 'Desk Lamp + Smart LED', price: 360, platform: 'Amazon', emoji: '💡', essential: false, url: 'https://www.amazon.in/dp/B0CFWCL1QM' },
            { category: 'Hydration', name: 'Insulated Stainless Steel Bottle', price: 649, platform: 'Amazon', emoji: '🧴', essential: false, url: 'https://www.amazon.in/dp/B0CKYZWVZD' },
        ]
    },
    {
        id: 'apartment',
        title: 'First Apartment',
        description: 'Move-in essentials for living independently',
        icon: Home,
        color: '#06b6d4',
        defaultBudget: 60000,
        items: [
            { category: 'Kitchen', name: 'Induction Cooktop + Utensil Set', price: 1998, platform: 'Amazon', emoji: '🍳', essential: true, url: 'https://www.amazon.in/Pigeon-Cruise-3500-Watt-Induction-Cooktop/dp/B01GFTEV5Y' },
            { category: 'Appliance', name: 'Single Door Refrigerator 190L', price: 12325, platform: 'Amazon', emoji: '🧊', essential: true, url: 'https://www.amazon.in/dp/B08N5WRWNW' },
            { category: 'Bedding', name: 'Queen Memory Foam Mattress + Pillows', price: 7399, platform: 'Amazon', emoji: '🛏️', essential: true, url: 'https://www.amazon.in/dp/B0BFJ8PQN4' },
            { category: 'Cleaning', name: 'Robotic / Stick Vacuum Cleaner', price: 23998, platform: 'Amazon', emoji: '🧹', essential: false, url: 'https://www.amazon.in/dp/B0FL2458CF' },
            { category: 'Water', name: 'RO Water Purifier', price: 6375, platform: 'Amazon', emoji: '💧', essential: true, url: 'https://www.amazon.in/dp/B0CFWCL1QM' },
            { category: 'Utility', name: 'Laundry Basket + Folding Drying Rack', price: 4795, platform: 'Amazon', emoji: '🧺', essential: false, url: 'https://www.amazon.in/dp/B0CYLX577L' },
        ]
    },
    {
        id: 'wfh',
        title: 'Work From Home',
        description: 'Ultimate productivity & ergonomics home office setup',
        icon: Briefcase,
        color: '#22c55e',
        defaultBudget: 80000,
        items: [
            { category: 'Display', name: '27-inch 4K IPS Ergonomic Monitor', price: 49498, platform: 'Amazon', emoji: '🖥️', essential: true, url: 'https://www.amazon.in/dp/B0G2Y5RCNY' },
            { category: 'Seating', name: 'High-back Lumbar Support Ergonomic Chair', price: 2597, platform: 'Amazon', emoji: '🪑', essential: true, url: 'https://www.amazon.in/dp/B0GL984C7R' },
            { category: 'Peripherals', name: 'Wireless Mechanical Keyboard & MX Master Mouse', price: 14995, platform: 'Amazon', emoji: '⌨️', essential: true, url: 'https://www.amazon.in/dp/B0B39FDRKV' },
            { category: 'Video', name: '1080p Webcam with Ring Light', price: 3699, platform: 'Amazon', emoji: '📷', essential: false, url: 'https://www.amazon.in/dp/B0CG372R11' },
            { category: 'Organization', name: 'Dual Monitor Arm + Cable Tray', price: 2099, platform: 'Amazon', emoji: '🦾', essential: false, url: 'https://www.amazon.in/dp/B076B3Q8JR' },
        ]
    },
    {
        id: 'gym',
        title: 'Home Gym Setup',
        description: 'Complete strength & cardio workout zone',
        icon: Dumbbell,
        color: '#f43f5e',
        defaultBudget: 15000,
        items: [
            { category: 'Weights', name: 'Adjustable Dumbbells Set (2.5kg - 24kg)', price: 1921, platform: 'Amazon', emoji: '🏋️', essential: true, url: 'https://www.amazon.in/dp/B0BDS4LHN5' },
            { category: 'Bench', name: 'Multi-angle Adjustable Workout Bench', price: 4076, platform: 'Amazon', emoji: '🛋️', essential: true, url: 'https://www.amazon.in/dp/B09FFBLNCT' },
            { category: 'Floor', name: 'High-Density Interlocking Rubber Tiles', price: 899, platform: 'Amazon', emoji: '🧱', essential: true, url: 'https://www.amazon.in/dp/B0FV858DFR' },
            { category: 'Cardio', name: 'Speed Jump Rope + Resistance Bands Set', price: 1149, platform: 'Amazon', emoji: '🧘', essential: false, url: 'https://www.amazon.in/dp/B09K449YKY' },
            { category: 'Recovery', name: 'Deep Tissue Massage Gun', price: 899, platform: 'Amazon', emoji: '🔫', essential: false, url: 'https://www.amazon.in/dp/B0HCNDK8G2' },
        ]
    },
    {
        id: 'baby',
        title: 'Newborn Baby',
        description: 'Safe, comfortable, and hygienic nursery essentials',
        icon: Baby,
        color: '#f59e0b',
        defaultBudget: 30000,
        items: [
            { category: 'Sleep', name: 'Convertible Wooden Baby Cot + Mattress', price: 13470, platform: 'Amazon', emoji: '👶', essential: true, url: 'https://www.amazon.in/dp/B0B69HT3KV' },
            { category: 'Mobility', name: 'Lightweight Foldable Stroller', price: 3849, platform: 'Amazon', emoji: '🛒', essential: true, url: 'https://www.amazon.in/dp/B0FDL6288T' },
            { category: 'Hygiene', name: 'UV Sterilizer & Bottle Warmer', price: 3499, platform: 'Amazon', emoji: '🍼', essential: true, url: 'https://www.amazon.in/dp/B0GFD1MW57' },
            { category: 'Care', name: 'Organic Cotton Clothing & Swaddle Pack', price: 699, platform: 'Amazon', emoji: '👕', essential: true, url: 'https://www.amazon.in/dp/B0FL2FF8D1' },
            { category: 'Safety', name: 'Smart Baby Monitor with Night Vision', price: 1148, platform: 'Amazon', emoji: '📹', essential: false, url: 'https://www.amazon.in/dp/B0CZTHRJ3L' },
        ]
    },
    {
        id: 'marriage',
        title: 'Wedding / New Couple',
        description: 'Home initialization bundle for newlyweds',
        icon: Heart,
        color: '#ec4899',
        defaultBudget: 150000,
        items: [
            { category: 'Living', name: '55-inch 4K Smart OLED TV', price: 59990, platform: 'Amazon', emoji: '📺', essential: true, url: 'https://www.amazon.in/dp/B0F3HWNTR1' },
            { category: 'Kitchen', name: 'Smart Air Fryer + Multi-Cooker', price: 9990, platform: 'Amazon', emoji: '🍲', essential: true, url: 'https://www.amazon.in/dp/B0GJDTQRMB' },
            { category: 'Coffee', name: 'Espresso & Cappuccino Maker', price: 9999, platform: 'Amazon', emoji: '☕', essential: false, url: 'https://www.amazon.in/dp/B0BR79XCL6' },
            { category: 'Entertainment', name: 'Dolby Atmos Soundbar with Subwoofer', price: 27999, platform: 'Amazon', emoji: '🔊', essential: false, url: 'https://www.amazon.in/dp/B0GW8LHNQG' },
            { category: 'Comfort', name: 'Robotic Vacuum + Mop Cleaner', price: 23998, platform: 'Amazon', emoji: '🤖', essential: false, url: 'https://www.amazon.in/dp/B0FL2458CF' },
        ]
    }
];

export default function LifePlanner({ symbol, onAddToCart }: LifePlannerProps) {
    const [customStages, setCustomStages] = useState<LifeStage[]>([]);
    const [selectedStageId, setSelectedStageId] = useState<string>('college');
    const [userBudget, setUserBudget] = useState<number>(75000);
    const [selectedItems, setSelectedItems] = useState<Record<string, boolean>>({});
    const [addedSuccess, setAddedSuccess] = useState(false);
    
    // Custom Bundle States
    const [customSituation, setCustomSituation] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    const allStages = [...LIFE_STAGES, ...customStages, {
        id: 'custom_new',
        title: 'Custom AI Bundle',
        description: 'Describe your situation and let AI generate a custom essentials list',
        icon: Sparkles,
        color: '#eab308',
        defaultBudget: 50000,
        items: []
    }];

    const currentStage = allStages.find(s => s.id === selectedStageId) || allStages[0];

    const handleStageSelect = (stage: LifeStage) => {
        setSelectedStageId(stage.id);
        setUserBudget(stage.defaultBudget);
        setSelectedItems({});
    };

    const isItemSelected = (name: string, essential: boolean) => {
        if (selectedItems[name] !== undefined) return selectedItems[name];
        return essential;
    };

    const toggleItem = (name: string, essential: boolean) => {
        const current = isItemSelected(name, essential);
        setSelectedItems(prev => ({ ...prev, [name]: !current }));
    };
    
    const handleGenerateCustom = async () => {
        if (!customSituation.trim()) return;
        setIsGenerating(true);
        try {
            const res = await fetch('http://localhost:8000/planner/custom', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ situation: customSituation, budget: userBudget })
            });
            const items = await res.json();
            
            const newStageId = `custom_${Date.now()}`;
            const newStage: LifeStage = {
                id: newStageId,
                title: 'Your Custom Bundle',
                description: `Tailored bundle for: ${customSituation}`,
                icon: Sparkles,
                color: '#eab308',
                defaultBudget: userBudget,
                items: items
            };
            
            setCustomStages(prev => [...prev, newStage]);
            handleStageSelect(newStage);
            setCustomSituation('');
        } catch (e) {
            console.error(e);
            alert("Failed to generate custom bundle. Please make sure the backend is running and GROQ_API_KEY is set.");
        } finally {
            setIsGenerating(false);
        }
    };

    const activeItems = currentStage.items.filter(item => isItemSelected(item.name, item.essential));
    const totalCost = activeItems.reduce((acc, item) => acc + item.price, 0);
    const isOverBudget = totalCost > userBudget;

    const handleAddBundleToCart = () => {
        if (!activeItems || activeItems.length === 0) return;
        
        activeItems.forEach((item, idx) => {
            const prod = {
                id: `bundle_${selectedStageId}_${idx}_${item.name.replace(/[^a-zA-Z0-9]/g, '_')}`,
                platform: item.platform.toLowerCase().includes('amazon') ? 'amazon_in' :
                          item.platform.toLowerCase().includes('flipkart') ? 'flipkart' :
                          item.platform.toLowerCase().includes('zepto') ? 'zepto' :
                          item.platform.toLowerCase().includes('blinkit') ? 'blinkit' : 'amazon_in',
                title: item.name,
                image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400',
                price_breakdown: {
                    base_price: item.price,
                    delivery_fee: 0,
                    platform_fee: 0,
                    handling_fee: 0,
                    discount: 0,
                    total_landed_cost: item.price,
                    currency: 'INR',
                    currency_symbol: symbol || '₹'
                },
                eta_minutes: 1440,
                eta_display: '1-2 Days',
                delivery_speed: 'standard',
                rating: 4.5,
                reviews_count: 320,
                in_stock: true,
                url: item.url || 'https://www.amazon.in/dp/B08N5WRWNW'
            };
            if (onAddToCart) {
                onAddToCart(prod);
            }
        });

        setAddedSuccess(true);
        setTimeout(() => setAddedSuccess(false), 4000);
    };

    return (
        <div style={{ maxWidth: 950, margin: '0 auto', paddingBottom: 80 }}>
            {/* Header */}
            <div style={{ marginBottom: 32 }}>
                <div style={{
                    padding: '28px 32px', borderRadius: 20,
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15), rgba(6, 182, 212, 0.08))',
                    border: '1px solid rgba(139, 92, 246, 0.25)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: 'rgba(139, 92, 246, 0.2)', border: '1px solid rgba(139, 92, 246, 0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Sparkles size={24} color="#a78bfa" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>
                                AI Life Planner
                            </h1>
                            <p style={{ fontSize: 14, color: '#71717a', margin: '4px 0 0' }}>
                                Complete lifestyle bundles tailored by AI to fit your life milestone & budget
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Life Stage Selector Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 12, marginBottom: 28 }}>
                {allStages.map(stage => {
                    const Icon = stage.icon;
                    const isSelected = stage.id === selectedStageId;
                    return (
                        <button
                            key={stage.id}
                            onClick={() => handleStageSelect(stage as LifeStage)}
                            style={{
                                padding: '16px 12px', borderRadius: 16,
                                background: isSelected ? `${stage.color}18` : '#111114',
                                border: `1px solid ${isSelected ? stage.color : '#1f1f24'}`,
                                cursor: 'pointer', textAlign: 'center',
                                transition: 'all 0.2s ease',
                                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8
                            }}
                        >
                            <div style={{
                                width: 38, height: 38, borderRadius: 10,
                                background: `${stage.color}20`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Icon size={20} color={stage.color} />
                            </div>
                            <span style={{ fontSize: 12, fontWeight: 700, color: isSelected ? '#fff' : '#a1a1aa' }}>
                                {stage.title}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Active Stage Controls & Budget Bar */}
            <div style={{
                padding: 24, borderRadius: 20, background: '#111114', border: '1px solid #1f1f24',
                marginBottom: 24, display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 16
            }}>
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {currentStage.title} Bundle
                    </h2>
                    <p style={{ fontSize: 13, color: '#71717a', margin: '4px 0 0' }}>
                        {currentStage.description}
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div>
                        <span style={{ fontSize: 11, color: '#71717a', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                            YOUR BUDGET
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#0a0a0f', padding: '6px 12px', borderRadius: 10, border: '1px solid #27272a' }}>
                            <span style={{ color: '#a78bfa', fontWeight: 700 }}>{symbol}</span>
                            <input
                                type="number"
                                value={userBudget}
                                onChange={(e) => setUserBudget(Number(e.target.value))}
                                style={{
                                    background: 'none', border: 'none', color: '#fff', fontSize: 15, fontWeight: 700,
                                    width: 90, outline: 'none'
                                }}
                            />
                        </div>
                    </div>

                    {currentStage.id !== 'custom_new' && (
                        <div>
                            <span style={{ fontSize: 11, color: isOverBudget ? '#ef4444' : '#4ade80', fontWeight: 600, display: 'block', marginBottom: 4 }}>
                                ESTIMATED TOTAL
                            </span>
                            <div style={{ fontSize: 20, fontWeight: 900, color: isOverBudget ? '#ef4444' : '#4ade80' }}>
                                {symbol}{totalCost.toLocaleString()}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Custom Input Form (Only visible when creating a new custom bundle) */}
            {currentStage.id === 'custom_new' && (
                <div style={{ padding: 24, borderRadius: 20, background: '#111114', border: '1px solid #eab30850', marginBottom: 28 }}>
                    <h3 style={{ color: '#fff', fontSize: 16, marginBottom: 12 }}>Describe Your Situation</h3>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <input 
                            type="text" 
                            placeholder="e.g. 'Starting a YouTube cooking channel' or 'Moving to a snowy city'"
                            value={customSituation}
                            onChange={e => setCustomSituation(e.target.value)}
                            style={{
                                flex: 1, padding: '14px 16px', borderRadius: 12,
                                background: '#1f1f24', border: '1px solid #27272a',
                                color: '#fff', fontSize: 15, outline: 'none'
                            }}
                            onKeyDown={e => e.key === 'Enter' && handleGenerateCustom()}
                        />
                        <button 
                            onClick={handleGenerateCustom}
                            disabled={isGenerating || !customSituation.trim()}
                            style={{
                                padding: '0 24px', borderRadius: 12,
                                background: isGenerating ? '#eab30850' : '#eab308',
                                color: isGenerating ? '#fff' : '#000',
                                fontWeight: 700, border: 'none', cursor: isGenerating ? 'wait' : 'pointer',
                                display: 'flex', alignItems: 'center', gap: 8
                            }}
                        >
                            {isGenerating ? 'Generating AI Plan...' : 'Generate Bundle'}
                            {!isGenerating && <Sparkles size={16} />}
                        </button>
                    </div>
                </div>
            )}

            {/* Checklist of Items */}
            <div style={{ display: 'grid', gap: 10, marginBottom: 28 }}>
                {currentStage.items.map((item, idx) => {
                    const checked = isItemSelected(item.name, item.essential);
                    return (
                        <div
                            key={idx}
                            onClick={() => toggleItem(item.name, item.essential)}
                            style={{
                                display: 'flex', alignItems: 'center', gap: 14,
                                padding: '14px 18px', borderRadius: 14,
                                background: checked ? 'rgba(255, 255, 255, 0.03)' : 'rgba(255, 255, 255, 0.01)',
                                border: `1px solid ${checked ? currentStage.color + '40' : '#1f1f24'}`,
                                cursor: 'pointer', transition: 'all 0.15s ease',
                                opacity: checked ? 1 : 0.45
                            }}
                        >
                            <div style={{
                                width: 22, height: 22, borderRadius: 6,
                                border: `2px solid ${checked ? currentStage.color : '#3f3f46'}`,
                                background: checked ? currentStage.color : 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {checked && <Check size={14} color="#fff" strokeWidth={3} />}
                            </div>

                            <span style={{ fontSize: 22 }}>{item.emoji}</span>

                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>
                                    {item.name}
                                </div>
                                <div style={{ fontSize: 11, color: '#71717a' }}>
                                    Category: {item.category} • Top platform: <span style={{ color: '#a1a1aa' }}>{item.platform}</span>
                                </div>
                            </div>

                            {item.essential && (
                                <span style={{
                                    fontSize: 10, fontWeight: 700, color: '#a78bfa',
                                    background: 'rgba(139, 92, 246, 0.15)', padding: '3px 8px', borderRadius: 6
                                }}>
                                    Essential
                                </span>
                            )}

                            <a
                                href={item.url || 'https://www.amazon.in/dp/B08N5WRWNW'}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                    fontSize: 11,
                                    fontWeight: 700,
                                    color: '#38bdf8',
                                    background: 'rgba(56, 189, 248, 0.12)',
                                    border: '1px solid rgba(56, 189, 248, 0.25)',
                                    padding: '5px 10px',
                                    borderRadius: 8,
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: 4,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s ease'
                                }}
                            >
                                <ExternalLink size={12} />
                                View Product
                            </a>

                            <div style={{ fontSize: 15, fontWeight: 800, color: '#fff' }}>
                                {symbol}{item.price.toLocaleString()}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Bundle Action */}
            <div style={{
                padding: 24, borderRadius: 20,
                background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.12), rgba(6, 182, 212, 0.08))',
                border: '1px solid rgba(34, 197, 94, 0.25)',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16
            }}>
                <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#4ade80', letterSpacing: 1, marginBottom: 4 }}>
                        AUTONOMOUS BUNDLE OPTIMIZER
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#fff' }}>
                        Ready to assemble {activeItems.length} items for {symbol}{totalCost.toLocaleString()}
                    </div>
                </div>

                <button
                    onClick={handleAddBundleToCart}
                    style={{
                        padding: '14px 28px', borderRadius: 12,
                        background: addedSuccess ? 'linear-gradient(135deg, #059669, #047857)' : 'linear-gradient(135deg, #22c55e, #10b981)',
                        border: 'none', color: '#fff', fontSize: 15, fontWeight: 800,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8,
                        boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {addedSuccess ? <Check size={18} /> : <ShoppingCart size={18} />}
                    {addedSuccess ? `Added ${activeItems.length} Items to Cart!` : `Add Bundle to Cart (${activeItems.length})`}
                </button>
            </div>
        </div>
    );
}
