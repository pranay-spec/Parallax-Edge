'use client';

import React from 'react';
import { Home, Brain, Users, ShoppingCart } from 'lucide-react';
import { tokens } from '@/styles/tokens';

interface MobileNavProps {
    activeSection: string;
    onNavigate: (section: string) => void;
    totalCartItems?: number;
}

export default function MobileNav({ activeSection, onNavigate, totalCartItems = 0 }: MobileNavProps) {
    const navItems = [
        { id: 'home', label: 'Overview', icon: Home },
        { id: 'oracle', label: 'Oracle', icon: Brain },
        { id: 'community', label: 'Pools', icon: Users },
        { id: 'cart', label: 'Cart', icon: ShoppingCart, badge: totalCartItems > 0 ? totalCartItems : undefined },
    ];

    return (
        <nav
            aria-label="Mobile Bottom Navigation"
            className="mobile-only-nav"
            style={{
                position: 'fixed', bottom: 16, left: 16, right: 16, zIndex: 9990,
                background: tokens.colors.bgCard, border: `1px solid ${tokens.colors.borderLight}`,
                borderRadius: 20, padding: '8px 12px', boxShadow: '0 10px 40px rgba(0, 0, 0, 0.6)',
                display: 'flex', justifyContent: 'space-around', alignItems: 'center'
            }}
        >
            {navItems.map(item => {
                const IconComp = item.icon;
                const isActive = activeSection === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        aria-label={item.label}
                        style={{
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            minHeight: 48, minWidth: 48, background: 'transparent', border: 'none',
                            color: isActive ? tokens.colors.info.main : tokens.colors.textMuted,
                            cursor: 'pointer', position: 'relative'
                        }}
                    >
                        <IconComp size={20} color={isActive ? tokens.colors.info.main : tokens.colors.textMuted} />
                        <span style={{ fontSize: 11, fontWeight: isActive ? 800 : 500, marginTop: 2 }}>
                            {item.label}
                        </span>
                        {item.badge !== undefined && (
                            <span style={{
                                position: 'absolute', top: 2, right: 8,
                                background: tokens.colors.critical.main, color: '#fff',
                                fontSize: 10, fontWeight: 900, borderRadius: '50%',
                                width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                {item.badge}
                            </span>
                        )}
                    </button>
                );
            })}
        </nav>
    );
}
