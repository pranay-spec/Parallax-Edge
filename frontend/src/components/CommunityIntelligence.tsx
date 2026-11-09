'use client';

import { useState } from 'react';
import {
    AlertCircle, Award, CheckCircle2, Clock, ExternalLink, Filter, Flame, Heart, MessageSquare, Plus, Share2, ShieldCheck, ShoppingCart, Sparkles, Star, Store, Tag, ThumbsDown, ThumbsUp, TrendingUp, Users, Search, Loader2
} from 'lucide-react';
import FlashPools from './FlashPools';
import Button from '@/components/ui/Button';

interface CommunityIntelligenceProps {
    symbol: string;
    pincode?: string;
    insights?: any;
    query?: string;
}

interface CohortReview {
    userCohort: { age: number; role: string; field: string; usageDuration: string; };
    productName: string;
    satisfactionPct: number;
    topPros: string[];
    topCons: string[];
    verifiedCount: number;
    verdict: string;
}

interface GroupDeal {
    id: string;
    title: string;
    category: string;
    originalPrice: number;
    unlockedPrice: number;
    targetBuyers: number;
    currentBuyers: number;
    timeLeft: string;
    image: string;
    store: string;
    storeColor: string;
    userJoined?: boolean;
}

interface CommunityDeal {
    id: string;
    title: string;
    store: string;
    price: number;
    originalPrice: number;
    couponCode?: string;
    votes: number;
    userVote?: 'up' | 'down';
    postedBy: string;
    timeAgo: string;
    commentsCount: number;
    tag: 'Verified' | 'Hot' | 'Price Error' | 'Cashback';
    tagColor: string;
}



const COHORT_REVIEWS: CohortReview[] = [
    {
        userCohort: { age: 20, role: 'Student', field: 'Computer Science', usageDuration: '1 Year' },
        productName: 'MacBook Air M2 / M3',
        satisfactionPct: 94,
        topPros: ['14hr+ actual battery life in lectures', 'Silent operation, no fan noise', 'Runs VS Code, Docker, MATLAB easily'],
        topCons: ['Only 8GB base RAM can swap heavily', 'Single external monitor limit'],
        verifiedCount: 1420,
        verdict: 'Must-buy for CS & STEM students'
    },
    {
        userCohort: { age: 24, role: 'Designer', field: 'UI/UX & 3D', usageDuration: '6 Months' },
        productName: 'ASUS ROG Zephyrus G14 (OLED)',
        satisfactionPct: 89,
        topPros: ['OLED 120Hz color accuracy is insane', 'RTX 4060 renders Figma & Blender fast', 'Compact lightweight chassis'],
        topCons: ['Gets hot under load (keyboard area)', 'Battery drops to 3.5 hrs on dGPU'],
        verifiedCount: 890,
        verdict: 'Best portable creative powerhouse'
    },
    {
        userCohort: { age: 27, role: 'Engineer', field: 'Backend & DevOps', usageDuration: '1.5 Years' },
        productName: 'Dell UltraSharp 27" 4K Monitor (U2723QE)',
        satisfactionPct: 97,
        topPros: ['IPS Black contrast ratio makes text ultra crisp', 'Built-in KVM switch & 90W USB-C hub', 'Zero eye strain during 10hr coding sessions'],
        topCons: ['60Hz refresh rate only', 'Slightly bulky stand'],
        verifiedCount: 2150,
        verdict: 'Top rated productivity monitor for Developers'
    },
    {
        userCohort: { age: 22, role: 'Gamer', field: 'Esports & Streaming', usageDuration: '8 Months' },
        productName: 'Sony WH-1000XM5 Headphones',
        satisfactionPct: 96,
        topPros: ['Best-in-class noise isolation for noisy dorms', 'Multi-device pairing is seamless', 'Microphone quality is great for Discord'],
        topCons: ['Ear cups get warm during long gaming sessions', 'Doesn’t fold into compact case'],
        verifiedCount: 2310,
        verdict: 'Unmatched focus & gaming tool'
    },
    {
        userCohort: { age: 19, role: 'Student', field: 'Design & Arts', usageDuration: '5 Months' },
        productName: 'iPad Air M2 (11-inch) + Apple Pencil',
        satisfactionPct: 92,
        topPros: ['GoodNotes & Procreate feel natural', 'Ultra portable for campus lectures', 'Smooth 60 FPS drawing response'],
        topCons: ['Pencil Pro sold separately', 'Base 128GB fills fast with 4K video'],
        verifiedCount: 1840,
        verdict: 'Essential digital notebook for students'
    },
    {
        userCohort: { age: 29, role: 'Engineer', field: 'System Architecture', usageDuration: '2 Years' },
        productName: 'Keychron K2 Pro Mechanical Keyboard',
        satisfactionPct: 95,
        topPros: ['Hot-swappable switches with VIA custom remapping', 'Solid aluminum frame feels indestructible', 'Seamless Bluetooth switching across 3 devices'],
        topCons: ['High key profile requires wrist rest', 'RGB battery drain'],
        verifiedCount: 1670,
        verdict: 'Best mechanical keyboard for daily coding'
    },
    {
        userCohort: { age: 26, role: 'Gamer', field: 'Competitive FPS', usageDuration: '1 Year' },
        productName: 'Logitech G Pro X Superlight 2 Wireless',
        satisfactionPct: 98,
        topPros: ['60g weight feels weightless in flicks', 'HERO 2 sensor tracking is flawless', '95-hour battery life'],
        topCons: ['Micro-USB on older batches', 'Minimalist design has no RGB'],
        verifiedCount: 3100,
        verdict: 'Gold standard for FPS gamers'
    }
];

const MOCK_GROUP_DEALS: GroupDeal[] = [
    {
        id: 'g1',
        title: 'iPhone 15 128GB (Black/Blue) - Bulk Import Deal',
        category: 'Smartphones',
        originalPrice: 62999,
        unlockedPrice: 54999,
        targetBuyers: 50,
        currentBuyers: 42,
        timeLeft: '04h : 18m : 32s',
        image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&q=80',
        store: 'Amazon India',
        storeColor: '#f59e0b',
    },
    {
        id: 'g2',
        title: 'Sony WH-1000XM5 Noise Cancelling Headphones',
        category: 'Audio',
        originalPrice: 26990,
        unlockedPrice: 20999,
        targetBuyers: 30,
        currentBuyers: 27,
        timeLeft: '01h : 45m : 10s',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&q=80',
        store: 'Flipkart',
        storeColor: '#2874f0',
    },
    {
        id: 'g3',
        title: 'Ergonomic High-Back Mesh Desk Chair with Lumbar Support',
        category: 'Furniture',
        originalPrice: 12999,
        unlockedPrice: 7999,
        targetBuyers: 20,
        currentBuyers: 19,
        timeLeft: '08h : 12m : 00s',
        image: 'https://images.unsplash.com/photo-1580481072645-022f9a6d83d0?w=400&q=80',
        store: 'Local Hub',
        storeColor: '#22c55e',
    },
];

const MOCK_COMMUNITY_DEALS: CommunityDeal[] = [
    {
        id: 'c1',
        title: 'Samsung Galaxy Watch 6 44mm LTE - Lowest Price Ever + Card Off',
        store: 'Amazon',
        price: 16999,
        originalPrice: 36999,
        couponCode: 'WATCHCARD2000',
        votes: 342,
        postedBy: 'TechHunter_99',
        timeAgo: '25m ago',
        commentsCount: 48,
        tag: 'Hot',
        tagColor: '#ef4444',
    },
    {
        id: 'c2',
        title: 'MacBook Air M2 8GB/256GB - Student Discount Stacked with HDFC',
        store: 'Flipkart',
        price: 74990,
        originalPrice: 99900,
        couponCode: 'APPLEHDFC5K',
        votes: 512,
        postedBy: 'DealsMaster',
        timeAgo: '1h ago',
        commentsCount: 89,
        tag: 'Verified',
        tagColor: '#22c55e',
    },
    {
        id: 'c3',
        title: 'Logitech MX Master 3S Wireless Mouse - Price Mistake?',
        store: 'Croma',
        price: 4999,
        originalPrice: 10995,
        votes: 189,
        postedBy: 'AlexDev',
        timeAgo: '2h ago',
        commentsCount: 31,
        tag: 'Price Error',
        tagColor: '#f59e0b',
    },
];



export default function CommunityIntelligence({ symbol, pincode, insights, query }: CommunityIntelligenceProps) {
    const [mainTab, setMainTab] = useState<'reviews' | 'group'>('reviews');
    const [ageFilter, setAgeFilter] = useState('20-24');
    const [roleFilter, setRoleFilter] = useState('Student');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedReviews, setSearchedReviews] = useState<CohortReview[]>([]);
    const [loadingReview, setLoadingReview] = useState(false);

    const handleSearchReview = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!searchQuery.trim()) return;
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
        try {
            const res = await fetch(`${apiUrl}/api/vision/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_title: searchQuery })
            });
            if (res.ok) {
                const data = await res.json();
                const newReview: CohortReview = {
                    userCohort: { age: 22, role: roleFilter, field: 'Product Target Cohort', usageDuration: '6 Months' },
                    productName: data.productTitle || searchQuery,
                    satisfactionPct: data.trustScore || 85,
                    topPros: data.verifiedPros?.slice(0, 3) || ['High performance spec', 'Verified user satisfaction'],
                    topCons: data.flaggedRedFlags?.slice(0, 2) || ['Minor pricing premium'],
                    verifiedCount: data.totalReviews || 1200,
                    verdict: data.reasoning || 'Highly recommended model for this buyer group.'
                };
                setSearchedReviews(prev => [newReview, ...prev]);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingReview(false);
            setSearchQuery('');
        }
    };

    
    const [activeTab, setActiveTab] = useState<'group' | 'feed' | 'merchant'>('group');
    const [groupDeals, setGroupDeals] = useState<GroupDeal[]>(MOCK_GROUP_DEALS);
    const [communityDeals, setCommunityDeals] = useState<CommunityDeal[]>(MOCK_COMMUNITY_DEALS);
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [newDealTitle, setNewDealTitle] = useState('');
    const [newDealPrice, setNewDealPrice] = useState('');
    const [newDealStore, setNewDealStore] = useState('Amazon');

    const handleJoinGroup = (id: string) => {
        setGroupDeals(prev => prev.map(deal => {
            if (deal.id === id) {
                const joined = !deal.userJoined;
                return {
                    ...deal,
                    userJoined: joined,
                    currentBuyers: joined ? deal.currentBuyers + 1 : deal.currentBuyers - 1
                };
            }
            return deal;
        }));
    };

    const handleVote = (id: string, dir: 'up' | 'down') => {
        setCommunityDeals(prev => prev.map(deal => {
            if (deal.id === id) {
                const current = deal.userVote;
                let change = 0;
                let newVote: 'up' | 'down' | undefined = dir;

                if (current === dir) {
                    newVote = undefined;
                    change = dir === 'up' ? -1 : 1;
                } else if (current) {
                    change = dir === 'up' ? 2 : -2;
                } else {
                    change = dir === 'up' ? 1 : -1;
                }

                return { ...deal, votes: deal.votes + change, userVote: newVote };
            }
            return deal;
        }));
    };

    const handleAddDeal = () => {
        if (!newDealTitle.trim() || !newDealPrice) return;
        const p = parseFloat(newDealPrice);
        const created: CommunityDeal = {
            id: `c_${Date.now()}`,
            title: newDealTitle,
            store: newDealStore,
            price: p,
            originalPrice: Math.round(p * 1.3),
            votes: 1,
            userVote: 'up',
            postedBy: 'You',
            timeAgo: 'Just now',
            commentsCount: 0,
            tag: 'Hot',
            tagColor: '#ef4444'
        };
        setCommunityDeals(prev => [created, ...prev]);
        setNewDealTitle('');
        setNewDealPrice('');
        setShowSubmitModal(false);
    };

    return (
        <div style={{ maxWidth: 1100, margin: '0 auto', paddingBottom: 80 }}>
            {/* Unified Header */}
            <div style={{ marginBottom: 24 }}>
                <div style={{
                    padding: '28px 32px', borderRadius: 20,
                    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(34, 197, 94, 0.08))',
                    border: '1px solid rgba(6, 182, 212, 0.25)',
                    position: 'relative', overflow: 'hidden'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                        <div style={{
                            width: 48, height: 48, borderRadius: 14,
                            background: 'rgba(6, 182, 212, 0.2)', border: '1px solid rgba(6, 182, 212, 0.3)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <Users size={24} color="#06b6d4" />
                        </div>
                        <div>
                            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#fff', margin: 0 }}>
                                Community Intelligence
                            </h1>
                            <p style={{ fontSize: 14, color: '#71717a', margin: '4px 0 0' }}>
                                Real cohort reviews, group discounts, and verified hot deals.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Tab Switcher */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 28, background: '#111114', padding: 8, borderRadius: 16, border: '1px solid #1f1f24' }}>
                <button
                    onClick={() => setMainTab('reviews')}
                    style={{
                        flex: 1, padding: '12px', borderRadius: 12,
                        background: mainTab === 'reviews' ? 'rgba(6, 182, 212, 0.1)' : 'transparent',
                        color: mainTab === 'reviews' ? '#06b6d4' : '#71717a',
                        border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                >
                    <MessageSquare size={18} /> Cohort Reviews
                </button>
                <button
                    onClick={() => setMainTab('group')}
                    style={{
                        flex: 1, padding: '12px', borderRadius: 12,
                        background: mainTab === 'group' ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
                        color: mainTab === 'group' ? '#22c55e' : '#71717a',
                        border: 'none', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                    }}
                >
                    <ShoppingCart size={18} /> Group & Hot Deals
                </button>
            </div>

            {mainTab === 'reviews' ? (
                <div>
                    {/* Cohort Search Bar */}
                    <form onSubmit={handleSearchReview} style={{
                        display: 'flex', gap: 12, marginBottom: 20,
                        padding: 16, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24',
                    }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} color="#71717a" style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                placeholder="Search any product for real cohort sentiment reviews (e.g. boAt Airdopes, iPhone 15, Dosa Tawa)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                style={{
                                    width: '100%', padding: '12px 14px 12px 42px', borderRadius: 12,
                                    background: '#0a0a0f', border: '1px solid #27272a',
                                    color: '#fff', fontSize: 13, outline: 'none',
                                }}
                            />
                        </div>
                        <Button type="submit" disabled={loadingReview}>
                            {loadingReview ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            Cohort Analysis
                        </Button>
                    </form>

                    {/* Persona Matching Filter */}
                    <div style={{
                        padding: 20, borderRadius: 16, background: '#111114', border: '1px solid #1f1f24',
                        marginBottom: 28, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#06b6d4', fontWeight: 700, fontSize: 13 }}>
                            <Filter size={16} /> YOUR COHORT:
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#71717a' }}>Age:</span>
                            {['18-21', '20-24', '25-30'].map(a => (
                                <button
                                    key={a}
                                    onClick={() => setAgeFilter(a)}
                                    style={{
                                        padding: '4px 10px', borderRadius: 8,
                                        background: ageFilter === a ? '#06b6d4' : '#1a1a1e',
                                        color: ageFilter === a ? '#000' : '#a1a1aa',
                                        border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <span style={{ fontSize: 12, color: '#71717a' }}>Role:</span>
                            {['Student', 'Designer', 'Engineer', 'Gamer'].map(r => (
                                <button
                                    key={r}
                                    onClick={() => setRoleFilter(r)}
                                    style={{
                                        padding: '4px 10px', borderRadius: 8,
                                        background: roleFilter === r ? '#06b6d4' : '#1a1a1e',
                                        color: roleFilter === r ? '#000' : '#a1a1aa',
                                        border: 'none', fontSize: 12, fontWeight: 700, cursor: 'pointer'
                                    }}
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Review Cards */}
                    <div style={{ display: 'grid', gap: 20 }}>
                        {/* Dynamic Searched Reviews */}
                        {searchedReviews.map((review, i) => (
                            <div key={`searched_${i}`} style={{ padding: 28, borderRadius: 20, background: '#0e1726', border: '1px solid #1e3a8a', position: 'relative', overflow: 'hidden' }}>
                                {/* Cohort Header Badge */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        padding: '6px 14px', borderRadius: 10,
                                        background: 'rgba(30, 58, 138, 0.5)', border: '1px solid rgba(59, 130, 246, 0.4)',
                                        fontSize: 12, fontWeight: 700, color: '#60a5fa'
                                    }}>
                                        <Sparkles size={14} color="#60a5fa" />
                                        Live Search Match: Cohort {review.userCohort.role} ({review.userCohort.field})
                                    </div>
                                    <span style={{ fontSize: 12, color: '#a1a1aa', fontWeight: 600 }}>
                                        {review.verifiedCount.toLocaleString()} Verified Reviews Sourced Live
                                    </span>
                                </div>
                                {/* Product Title & Satisfaction Score */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
                                        {review.productName}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e' }}>{review.satisfactionPct}%</div>
                                        <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.2 }}>Happy after<br /><strong style={{ color: '#e4e4e7' }}>{review.userCohort.usageDuration}</strong></div>
                                    </div>
                                </div>
                                {/* Pros and Cons split */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
                                    <div style={{ padding: 14, borderRadius: 12, background: 'rgba(34, 197, 94, 0.04)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <ThumbsUp size={12} /> TOP REAL-WORLD PROS
                                        </div>
                                        {review.topPros.map((pro, idx) => (
                                            <div key={idx} style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 4, display: 'flex', gap: 6 }}>
                                                <span style={{ color: '#22c55e' }}>✓</span> {pro}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ padding: 14, borderRadius: 12, background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            ⚠️ HONEST CONS
                                        </div>
                                        {review.topCons.map((con, idx) => (
                                            <div key={idx} style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 4, display: 'flex', gap: 6 }}>
                                                <span style={{ color: '#ef4444' }}>•</span> {con}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Verdict */}
                                <div style={{ padding: '10px 14px', borderRadius: 10, background: '#0a0a0f', border: '1px solid #1f1f24', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                    <ShieldCheck size={16} color="#4ade80" />
                                    <span style={{ color: '#71717a' }}>Cohort Verdict:</span>
                                    <strong style={{ color: '#fff' }}>{review.verdict}</strong>
                                </div>
                            </div>
                        ))}

                        {COHORT_REVIEWS
                            .filter(review => {
                                const roleMatch = review.userCohort.role.toLowerCase().includes(roleFilter.toLowerCase());
                                const ageVal = review.userCohort.age;
                                let ageMatch = true;
                                if (ageFilter === '18-21') ageMatch = ageVal >= 18 && ageVal <= 21;
                                else if (ageFilter === '20-24') ageMatch = ageVal >= 20 && ageVal <= 24;
                                else if (ageFilter === '25-30') ageMatch = ageVal >= 25 && ageVal <= 30;
                                return roleMatch || ageMatch;
                            })
                            .map((review, i) => (
                            <div key={i} style={{ padding: 28, borderRadius: 20, background: '#111114', border: '1px solid #1f1f24', position: 'relative', overflow: 'hidden' }}>
                                {/* Cohort Header Badge */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                                    <div style={{
                                        display: 'inline-flex', alignItems: 'center', gap: 8,
                                        padding: '6px 14px', borderRadius: 10,
                                        background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.2)',
                                        fontSize: 12, fontWeight: 700, color: '#06b6d4'
                                    }}>
                                        <Users size={14} />
                                        People like YOU: Age {review.userCohort.age} • {review.userCohort.role} ({review.userCohort.field})
                                    </div>
                                    <span style={{ fontSize: 12, color: '#71717a', fontWeight: 600 }}>
                                        {review.verifiedCount.toLocaleString()} Verified Owners
                                    </span>
                                </div>
                                {/* Product Title & Satisfaction Score */}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 16 }}>
                                    <h3 style={{ fontSize: 20, fontWeight: 800, color: '#fff', margin: 0 }}>
                                        {review.productName}
                                    </h3>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                        <div style={{ fontSize: 24, fontWeight: 900, color: '#22c55e' }}>{review.satisfactionPct}%</div>
                                        <div style={{ fontSize: 11, color: '#71717a', lineHeight: 1.2 }}>Happy after<br /><strong style={{ color: '#e4e4e7' }}>{review.userCohort.usageDuration}</strong></div>
                                    </div>
                                </div>
                                {/* Pros and Cons split */}
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 16 }}>
                                    <div style={{ padding: 14, borderRadius: 12, background: 'rgba(34, 197, 94, 0.04)', border: '1px solid rgba(34, 197, 94, 0.15)' }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#22c55e', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <ThumbsUp size={12} /> TOP REAL-WORLD PROS
                                        </div>
                                        {review.topPros.map((pro, idx) => (
                                            <div key={idx} style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 4, display: 'flex', gap: 6 }}>
                                                <span style={{ color: '#22c55e' }}>✓</span> {pro}
                                            </div>
                                        ))}
                                    </div>
                                    <div style={{ padding: 14, borderRadius: 12, background: 'rgba(239, 68, 68, 0.04)', border: '1px solid rgba(239, 68, 68, 0.15)' }}>
                                        <div style={{ fontSize: 12, fontWeight: 700, color: '#ef4444', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
                                            ⚠️ HONEST CONS
                                        </div>
                                        {review.topCons.map((con, idx) => (
                                            <div key={idx} style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 4, display: 'flex', gap: 6 }}>
                                                <span style={{ color: '#ef4444' }}>•</span> {con}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                {/* Verdict */}
                                <div style={{ padding: '10px 14px', borderRadius: 10, background: '#0a0a0f', border: '1px solid #1f1f24', display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                                    <ShieldCheck size={16} color="#4ade80" />
                                    <span style={{ color: '#71717a' }}>Cohort Verdict:</span>
                                    <strong style={{ color: '#fff' }}>{review.verdict}</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : mainTab === 'group' ? (
                <div style={{ marginTop: 0 }}>
                    <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                        <button onClick={() => setActiveTab('group')} style={{ padding: '8px 16px', borderRadius: 8, background: activeTab === 'group' ? 'rgba(34, 197, 94, 0.15)' : '#1a1a1e', color: activeTab === 'group' ? '#22c55e' : '#a1a1aa', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Target Group Buys</button>
                        <button onClick={() => setActiveTab('feed')} style={{ padding: '8px 16px', borderRadius: 8, background: activeTab === 'feed' ? 'rgba(239, 68, 68, 0.15)' : '#1a1a1e', color: activeTab === 'feed' ? '#ef4444' : '#a1a1aa', border: 'none', fontWeight: 600, cursor: 'pointer' }}>Community Hot Deals</button>
                    </div>
                    {activeTab === 'group' && (
                        <div style={{ marginTop: 16 }}>
                            <FlashPools />
                        </div>
                    )}
                    {activeTab === 'feed' && (
                        <div style={{ display: 'grid', gap: 16 }}>
                            {communityDeals.map(deal => (
                                <div key={deal.id} style={{ padding: 16, borderRadius: 12, background: '#111114', border: '1px solid #1f1f24', display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                        <button onClick={() => handleVote(deal.id, 'up')} style={{ background: 'transparent', border: 'none', color: deal.userVote === 'up' ? '#ef4444' : '#71717a', cursor: 'pointer' }}><TrendingUp size={20} /></button>
                                        <span style={{ color: deal.userVote ? '#fff' : '#a1a1aa', fontWeight: 'bold' }}>{deal.votes}</span>
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                            <span style={{ padding: '2px 8px', borderRadius: 4, background: `${deal.tagColor}20`, color: deal.tagColor, fontSize: 11, fontWeight: 'bold' }}>{deal.tag}</span>
                                            <span style={{ color: '#71717a', fontSize: 12 }}>{deal.store} • {deal.timeAgo}</span>
                                        </div>
                                        <h3 style={{ color: '#fff', margin: '0 0 8px', fontSize: 15 }}>{deal.title}</h3>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <span style={{ color: '#22c55e', fontWeight: 'bold', fontSize: 16 }}>{symbol}{deal.price}</span>
                                            <span style={{ color: '#71717a', textDecoration: 'line-through', fontSize: 14 }}>{symbol}{deal.originalPrice}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            ) : null}
        </div>
    );
}
