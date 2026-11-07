'use client';

import { useState } from 'react';
import {
    Menu, Home, Search, Tag, Clock, Leaf, MessageSquare, MapPin,
    Users, History, Bookmark, ShoppingCart, TrendingUp, Sparkles,
    ChevronRight, Shield, BarChart3, Star, Activity, Brain, Eye, Cpu,
    FileText, HeartPulse, Newspaper, Trophy, Monitor, GraduationCap, Compass,
    Fingerprint, Library, ChevronDown, Bot, CreditCard, ShieldAlert
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
    badge?: number;
    badgeColor?: string;
    dot?: boolean;
    liveIndicator?: boolean;
}

function NavItem({
    icon: Icon,
    label,
    id,
    active,
    expanded,
    onClick,
    badge,
    badgeColor,
    dot,
    liveIndicator
}: NavItemProps) {
    return (
        <button
            onClick={onClick}
            title={!expanded ? label : undefined}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                width: '100%',
                padding: expanded ? '10px 14px' : '10px 0',
                borderRadius: 12,
                border: 'none',
                cursor: 'pointer',
                background: active
                    ? 'rgba(6, 182, 212, 0.12)'
                    : 'transparent',
                color: active ? '#fff' : '#a1a1aa',
                fontSize: 13,
                fontWeight: active ? 700 : 500,
                textAlign: 'left',
                transition: 'all 0.15s ease',
                justifyContent: expanded ? 'flex-start' : 'center',
                position: 'relative',
            }}
            onMouseEnter={(e) => {
                if (!active) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#e4e4e7';
                }
            }}
            onMouseLeave={(e) => {
                if (!active) {
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = '#a1a1aa';
                }
            }}
        >
            {/* Active Cyan Left Accent Bar */}
            {active && (
                <div style={{
                    position: 'absolute', left: 0, top: 4, bottom: 4, width: 3,
                    background: '#06b6d4', borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 10px rgba(6, 182, 212, 0.8)'
                }} />
            )}

            <div style={{ position: 'relative', flexShrink: 0, width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} strokeWidth={active ? 2.5 : 1.8} color={active ? '#06b6d4' : undefined} />
                {!expanded && badge && (
                    <span style={{
                        position: 'absolute', top: -4, right: -6,
                        width: 15, height: 15, borderRadius: '50%',
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
                            <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#ef4444' }} />
                        </span>
                    )}

                    {badge && (
                        <span style={{
                            minWidth: 18, height: 18, borderRadius: 9,
                            background: badgeColor || '#f59e0b',
                            color: '#000', fontSize: 10, fontWeight: 800,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            padding: '0 5px',
                        }}>
                            {badge}
                        </span>
                    )}

                    {dot && (
                        <span style={{
                            width: 5, height: 5, borderRadius: '50%',
                            background: '#06b6d4', flexShrink: 0,
                        }} />
                    )}
                </>
            )}
        </button>
    );
}

function SectionDivider() {
    return <div style={{ height: 1, background: '#1f1f24', margin: '8px 12px' }} />;
}

function SectionTitle({ title, expanded }: { title: string; expanded: boolean }) {
    if (!expanded) return <div style={{ height: 6 }} />;
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            padding: '12px 12px 6px',
            fontSize: 11, fontWeight: 700, color: '#71717a',
            letterSpacing: 0.8, textTransform: 'uppercase'
        }}>
            {title}
        </div>
    );
}

export default function Sidebar({
    isExpanded,
    onToggle,
    activeSection,
    onSectionChange,
    hasResults,
    couponCount = 0,
    searchHistory = [],
    systemHealth,
    userPersona
}: SidebarProps) {
    const [isLibraryOpen, setIsLibraryOpen] = useState(false);

    return (
        <aside
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                bottom: 0,
                width: isExpanded ? 260 : 72,
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
                gap: 14,
                padding: '18px 16px 14px',
                flexShrink: 0,
                cursor: 'pointer'
            }}
                onClick={onSectionChange ? () => onSectionChange('home') : undefined}
            >
                {isExpanded ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 34, height: 34, borderRadius: 10,
                            background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, fontWeight: 800, color: '#fff',
                            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
                        }}>
                            <Fingerprint size={20} strokeWidth={2.5} />
                        </div>
                        <div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: '#fff', letterSpacing: -0.5, lineHeight: 1 }}>PARALLAX</div>
                            <div style={{ fontSize: 11, fontWeight: 700, color: '#06b6d4', letterSpacing: 2 }}>EDGE OS</div>
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
                        <Fingerprint size={22} strokeWidth={2.5} />
                    </div>
                )}
            </div>

            {/* Navigation Items */}
            <div style={{ padding: '0 8px' }}>
                <NavItem
                    icon={Home} label="Overview" id="home"
                    active={activeSection === 'home'}
                    expanded={isExpanded}
                    onClick={() => onSectionChange('home')}
                />
            </div>

            <SectionDivider />

            {/* Group 1: Core AI Engines */}
            <SectionTitle title="⭐ Core AI Engines" expanded={isExpanded} />
            <div style={{ padding: '0 8px' }}>
                <NavItem
                    icon={Bot} label="AI Auto-Checkout" id="auto_checkout"
                    active={activeSection === 'auto_checkout'}
                    expanded={isExpanded}
                    onClick={() => onSectionChange('auto_checkout')}
                    liveIndicator={true}
                />
                <NavItem
                    icon={Brain} label="Price Oracle & ML" id="oracle"
                    active={activeSection === 'oracle'}
                    expanded={isExpanded}
                    onClick={() => onSectionChange('oracle')}
                    liveIndicator={true}
                />
                <NavItem
                    icon={Eye} label="Vision & Trust Suite" id="vision_trust"
                    active={activeSection === 'vision_trust' || activeSection === 'visual' || activeSection === 'receipts' || activeSection === 'reviews'}
                    expanded={isExpanded}
                    onClick={() => onSectionChange('vision_trust')}
                    liveIndicator={true}
                />
                <NavItem
                    icon={Sparkles} label="Shopping Agent" id="agent"
                    active={activeSection === 'agent'}
                    expanded={isExpanded}
                    onClick={() => onSectionChange('agent')}
                    dot={true}
                />
            </div>

            <SectionDivider />

            {/* Group 2: Intelligence & Audit */}
            <SectionTitle title="Intelligence & Savings" expanded={isExpanded} />
            <div style={{ padding: '0 8px' }}>
                <NavItem
                    icon={HeartPulse} label="Health Score Oracle" id="health_score"
                    active={activeSection === 'health_score'}
                    expanded={isExpanded}
                    onClick={() => onSectionChange('health_score')}
                    dot={true}
                />
                <NavItem
                    icon={Tag} label="Coupons & Negotiator" id="coupons"
                    active={activeSection === 'coupons'}
                    expanded={isExpanded}
                    onClick={() => onSectionChange('coupons')}
                    badge={couponCount > 0 ? couponCount : undefined}
                    badgeColor="#f59e0b"
                />
                <NavItem
                    icon={Users} label="Community & Pools" id="community"
                    active={activeSection === 'community' || activeSection === 'flash_pools'}
                    expanded={isExpanded}
                    onClick={() => onSectionChange('community')}
                    liveIndicator={true}
                />
                <NavItem
                    icon={MessageSquare} label="WhatsApp & SMS Bot" id="whatsapp_bot"
                    active={activeSection === 'whatsapp_bot'}
                    expanded={isExpanded}
                    onClick={() => onSectionChange('whatsapp_bot')}
                    dot={true}
                />
            </div>

            {/* Toggle Collapse Button at bottom */}
            <div style={{ marginTop: 'auto', padding: '12px 16px', borderTop: '1px solid #1a1a1e' }}>
                <button
                    onClick={onToggle}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                        padding: '10px', borderRadius: 10, background: '#18181b',
                        border: '1px solid #27272a', color: '#a1a1aa', cursor: 'pointer',
                        justifyContent: isExpanded ? 'flex-start' : 'center'
                    }}
                >
                    <Menu size={16} />
                    {isExpanded && <span style={{ fontSize: 12, fontWeight: 600 }}>Collapse Sidebar</span>}
                </button>
            </div>
        </aside>
    );
}
