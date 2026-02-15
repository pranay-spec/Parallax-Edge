'use client';

import { useState } from 'react';
import {
    Menu, Home, Search, Tag, Clock, Leaf, MessageSquare, MapPin,
    Users, History, Bookmark, ShoppingCart, TrendingUp, Sparkles,
    ChevronRight, Zap, Shield, BarChart3, Star, Activity, Brain
} from 'lucide-react';
import { SystemHealthData } from '@/types';

interface SidebarProps {
    isExpanded: boolean;
    onToggle: () => void;
    activeSection: string;
    onSectionChange: (section: string) => void;
    hasResults: boolean;
    couponCount?: number;
    searchHistory?: string[];
    systemHealth?: SystemHealthData | null;
    userPersona?: string | null;
}

interface NavItemProps {
    icon: React.ElementType;
    label: string;
    id: string;
    active: boolean;
    expanded: boolean;
    onClick: () => void;
    badge?: number | string;
    badgeColor?: string;
    liveIndicator?: boolean;
    dot?: boolean;
}

function NavItem({ icon: Icon, label, id, active, expanded, onClick, badge, badgeColor, liveIndicator, dot }: NavItemProps) {
    const [hovered, setHovered] = useState(false);

    return (
        <button
            id={`sidebar-${id}`}
            onClick={onClick}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            title={!expanded ? label : undefined}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: expanded ? 24 : 0,
                width: '100%',
                padding: expanded ? '10px 12px 10px 16px' : '10px 0',
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: active
                    ? 'rgba(255, 255, 255, 0.08)'
                    : hovered
                        ? 'rgba(255, 255, 255, 0.04)'
                        : 'transparent',
                color: active ? '#fff' : '#aaaaaa',
                fontSize: 14,
                fontWeight: active ? 600 : 400,
                textAlign: 'left',
                transition: 'all 0.15s ease',
                justifyContent: expanded ? 'flex-start' : 'center',
                position: 'relative',
            }}
        >
            <div style={{ position: 'relative', flexShrink: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                {!expanded && badge && (
                    <span style={{
                        position: 'absolute', top: -4, right: -6,
                        width: 16, height: 16, borderRadius: '50%',
                        background: badgeColor || '#f43f5e',
                        color: '#fff', fontSize: 9, fontWeight: 800,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                        {badge}
                    </span>
                )}
            </div>

            {expanded && (
                <>
                    <span style={{
                        flex: 1, overflow: 'hidden', textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap', lineHeight: 1.3,
                    }}>
                        {label}
                    </span>

                    {liveIndicator && (
                        <span style={{
                            display: 'flex', alignItems: 'center', gap: 4,
                            color: '#ef4444', fontSize: 11, fontWeight: 700,
                        }}>
                            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'livePulse 1.5s ease-in-out infinite' }} />
                        </span>
                    )}

                    {badge && (
                        <span style={{
                            minWidth: 20, height: 20, borderRadius: 10,
                            background: badgeColor || '#f43f5e',
                            color: '#fff', fontSize: 10, fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0 6px',
                        }}>
                            {badge}
                        </span>
                    )}

                    {dot && (
                        <span style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: '#3b82f6', flexShrink: 0,
                        }} />
                    )}
                </>
            )}
        </button>
    );
}

function SectionDivider() {
    return <div style={{ height: 1, background: '#1f1f24', margin: '12px 16px' }} />;
}

function SectionTitle({ title, expanded }: { title: string; expanded: boolean }) {
    if (!expanded) return <div style={{ height: 8 }} />;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '16px 16px 8px',
            fontSize: 14, fontWeight: 600, color: '#fff',
        }}>
            {title}
            <ChevronRight size={16} color="#71717a" />
        </div>
    );
}

export default function Sidebar({
    isExpanded, onToggle, activeSection, onSectionChange,
    hasResults, couponCount = 0, searchHistory = [],
    systemHealth, userPersona,
}: SidebarProps) {
    return (
        <>
            {/* Animation Keyframes */}
            <style>{`
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
      `}</style>

            <aside
                id="sidebar"
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    width: isExpanded ? 240 : 72,
                    background: '#0f0f12',
                    borderRight: '1px solid #1a1a1e',
                    zIndex: 100,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                    overflowX: 'hidden',
                    overflowY: 'auto',
                }}
            >
                {/* Header: Hamburger + Logo */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    padding: '18px 16px 14px',
                    flexShrink: 0,
                    cursor: 'pointer'
                }}
                    onClick={onSectionChange ? () => onSectionChange('home') : undefined}
                >
                    {isExpanded ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{
                                width: 32, height: 32, borderRadius: 10,
                                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: 18, fontWeight: 800, color: '#fff',
                                boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
                            }}>
                                <Zap size={20} fill="currentColor" />
                            </div>
                            <div>
                                <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: -0.5, lineHeight: 1 }}>PARALLAX</div>
                                <div style={{ fontSize: 12, fontWeight: 600, color: '#06b6d4', letterSpacing: 2 }}>EDGE</div>
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            width: 40, height: 40, borderRadius: 12,
                            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff',
                            boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)'
                        }}
                            title="Parallax Edge"
                        >
                            <Zap size={22} fill="currentColor" />
                        </div>
                    )}
                </div>

                {/* Main Navigation */}
                <div style={{ padding: '0 8px' }}>
                    <NavItem
                        icon={Home} label="Home" id="home"
                        active={activeSection === 'home'}
                        expanded={isExpanded}
                        onClick={() => onSectionChange('home')}
                    />
                    <NavItem
                        icon={Search} label="Search" id="search"
                        active={activeSection === 'search'}
                        expanded={isExpanded}
                        onClick={() => onSectionChange('search')}
                    />
                </div>

                <SectionDivider />

                {/* Smart Savings Section */}
                <SectionTitle title="Smart Savings" expanded={isExpanded} />
                <div style={{ padding: '0 8px' }}>
                    <NavItem
                        icon={Tag} label="Coupons & Rewards" id="coupons"
                        active={activeSection === 'coupons'}
                        expanded={isExpanded}
                        onClick={() => onSectionChange('coupons')}
                        badge={couponCount > 0 ? couponCount : undefined}
                        badgeColor="#f59e0b"
                        liveIndicator={hasResults}
                    />
                    <NavItem
                        icon={Brain} label="AI Price Oracle" id="oracle"
                        active={activeSection === 'oracle'}
                        expanded={isExpanded}
                        onClick={() => onSectionChange('oracle')}
                        dot={hasResults}
                    />
                    <NavItem
                        icon={Leaf} label="Green Edge Score" id="carbon"
                        active={activeSection === 'carbon'}
                        expanded={isExpanded}
                        onClick={() => onSectionChange('carbon')}
                        dot={hasResults}
                    />
                    <NavItem
                        icon={Shield} label="Review Sentinel" id="reviews"
                        active={activeSection === 'reviews'}
                        expanded={isExpanded}
                        onClick={() => onSectionChange('reviews')}
                        dot={hasResults}
                    />
                    <NavItem
                        icon={MapPin} label="Campus Deals" id="campus"
                        active={activeSection === 'campus'}
                        expanded={isExpanded}
                        onClick={() => onSectionChange('campus')}
                        dot={hasResults}
                    />
                    <NavItem
                        icon={Activity} label="Local Supply Map" id="supplymap"
                        active={activeSection === 'supplymap'}
                        expanded={isExpanded}
                        onClick={() => onSectionChange('supplymap')}
                        dot={hasResults}
                    />
                </div>

                <SectionDivider />

                {/* You Section */}
                <SectionTitle title="You" expanded={isExpanded} />
                <div style={{ padding: '0 8px' }}>
                    <NavItem
                        icon={History} label="Search History" id="history"
                        active={activeSection === 'history'}
                        expanded={isExpanded}
                        onClick={() => onSectionChange('history')}
                    />
                    <NavItem
                        icon={Bookmark} label="Saved Compares" id="saved"
                        active={activeSection === 'saved'}
                        expanded={isExpanded}
                        onClick={() => onSectionChange('saved')}
                    />
                    <NavItem
                        icon={ShoppingCart} label="Cart Optimizer" id="cart"
                        active={activeSection === 'cart'}
                        expanded={isExpanded}
                        onClick={() => onSectionChange('cart')}
                    />
                    <NavItem
                        icon={TrendingUp} label="Price Alerts" id="alerts"
                        active={activeSection === 'alerts'}
                        expanded={isExpanded}
                        onClick={() => onSectionChange('alerts')}
                    />
                    <NavItem
                        icon={Star} label="Favourites" id="favourites"
                        active={activeSection === 'favourites'}
                        expanded={isExpanded}
                        onClick={() => onSectionChange('favourites')}
                    />
                </div>

                {/* Recent Searches (expanded only) */}
                {isExpanded && searchHistory.length > 0 && (
                    <>
                        <SectionDivider />
                        <SectionTitle title="Recent" expanded={isExpanded} />
                        <div style={{ padding: '0 8px 16px' }}>
                            {searchHistory.slice(0, 5).map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => onSectionChange('search')}
                                    style={{
                                        display: 'flex', alignItems: 'center', gap: 14,
                                        width: '100%', padding: '8px 16px', borderRadius: 8,
                                        border: 'none', cursor: 'pointer',
                                        background: 'transparent', color: '#71717a',
                                        fontSize: 13, textAlign: 'left',
                                    }}
                                >
                                    <History size={14} />
                                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                        {q}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </>
                )}

                {/* System Health Pulse + User Persona */}
                <div style={{ marginTop: 'auto', padding: '12px', flexShrink: 0 }}>
                    {/* System Health */}
                    {isExpanded ? (
                        <div style={{
                            padding: '12px', borderRadius: 10,
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid rgba(255,255,255,0.05)',
                            marginBottom: userPersona ? 8 : 0,
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: systemHealth?.pulse_color || '#22c55e',
                                    boxShadow: `0 0 8px ${systemHealth?.pulse_color || '#22c55e'}60`,
                                    animation: 'livePulse 2s ease-in-out infinite',
                                }} />
                                <span style={{ fontSize: 10, fontWeight: 600, color: systemHealth?.pulse_color || '#22c55e' }}>
                                    {systemHealth?.pulse_label || 'All Systems Operational'}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, color: '#52525b' }}>
                                <span>Live: {systemHealth?.data_sources?.live_percentage?.toFixed(0) ?? 100}%</span>
                                <span>Searches: {systemHealth?.total_searches ?? 0}</span>
                            </div>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                            <div style={{
                                width: 10, height: 10, borderRadius: '50%',
                                background: systemHealth?.pulse_color || '#22c55e',
                                boxShadow: `0 0 8px ${systemHealth?.pulse_color || '#22c55e'}40`,
                                animation: 'livePulse 2s ease-in-out infinite',
                            }} />
                        </div>
                    )}

                    {/* User Persona Badge */}
                    {userPersona && userPersona !== 'New User' && isExpanded && (
                        <div style={{
                            padding: '10px 12px', borderRadius: 10,
                            background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(6, 182, 212, 0.05))',
                            border: '1px solid rgba(139, 92, 246, 0.15)',
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <Brain size={12} color="#a78bfa" />
                                <span style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa' }}>AI PERSONA</span>
                            </div>
                            <div style={{ fontSize: 12, fontWeight: 600, color: '#e4e4e7', marginTop: 4 }}>
                                {userPersona}
                            </div>
                        </div>
                    )}

                    {/* Branding (collapsed) */}
                    {!isExpanded && (
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
                            <Sparkles size={14} color="#3f3f46" />
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
}
