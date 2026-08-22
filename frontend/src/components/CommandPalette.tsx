'use client';

import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Brain, Zap, Users, ArrowRight, X, Command, Tag, ShieldCheck, Terminal } from 'lucide-react';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onNavigate: (section: string) => void;
    onSearch: (query: string) => void;
    onOptimizeCart?: () => void;
}

export default function CommandPalette({ isOpen, onClose, onNavigate, onSearch, onOptimizeCart }: CommandPaletteProps) {
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const COMMANDS = [
        {
            id: 'c1',
            icon: Brain,
            title: "Show me today's biggest price drop",
            category: "AI Insight",
            action: () => { onNavigate('oracle'); onClose(); }
        },
        {
            id: 'c2',
            icon: Zap,
            title: "Compare this week's savings with last week",
            category: "Analytics",
            action: () => { onNavigate('oracle'); onClose(); }
        },
        {
            id: 'c3',
            icon: Sparkles,
            title: "Why did Sony XM5 price drop by 23%?",
            category: "Anomaly Explanation",
            action: () => { onNavigate('oracle'); onClose(); }
        },
        {
            id: 'c4',
            icon: Tag,
            title: "Run One-Tap Cart Optimization",
            category: "Savings Action",
            action: () => { if (onOptimizeCart) onOptimizeCart(); else onNavigate('cart'); onClose(); }
        },
        {
            id: 'c5',
            icon: Users,
            title: "Find nearby neighborhood Flash Pools",
            category: "Group Deals",
            action: () => { onNavigate('community'); onClose(); }
        },
        {
            id: 'c6',
            icon: Search,
            title: "Find student laptop deals under ₹80,000",
            category: "Smart Search",
            action: () => { onSearch("MacBook Air M2"); onClose(); }
        }
    ];

    const filteredCommands = COMMANDS.filter(c =>
        c.title.toLowerCase().includes(query.toLowerCase()) ||
        c.category.toLowerCase().includes(query.toLowerCase())
    );

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;
            if (e.key === 'Escape') {
                onClose();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % (filteredCommands.length || 1));
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % (filteredCommands.length || 1));
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                } else if (query.trim()) {
                    onSearch(query);
                    onClose();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selectedIndex, filteredCommands, query]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0, 0, 0, 0.75)', backdropFilter: 'blur(8px)',
            display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
            paddingTop: '12vh'
        }}>
            <div style={{
                width: '100%', maxWidth: 640, background: '#111114',
                border: '1px solid #27272a', borderRadius: 20,
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)', overflow: 'hidden'
            }}>
                {/* Input Header */}
                <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #1f1f24', gap: 12 }}>
                    <Command size={20} color="#06b6d4" />
                    <input
                        autoFocus
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setSelectedIndex(0); }}
                        placeholder="⌘ Search or ask Parallax anything..."
                        style={{
                            flex: 1, background: 'transparent', border: 'none',
                            color: '#fff', fontSize: 16, outline: 'none', fontWeight: 500
                        }}
                    />
                    <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#71717a', cursor: 'pointer' }}>
                        <X size={18} />
                    </button>
                </div>

                {/* Command List */}
                <div style={{ maxHeight: 360, overflowY: 'auto', padding: 8 }}>
                    <div style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, color: '#71717a', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        SUGGESTED INTELLIGENCE COMMANDS
                    </div>

                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, idx) => {
                            const IconComp = cmd.icon;
                            const isSelected = idx === selectedIndex;
                            return (
                                <div
                                    key={cmd.id}
                                    onClick={cmd.action}
                                    onMouseEnter={() => setSelectedIndex(idx)}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                        padding: '12px 16px', borderRadius: 12, cursor: 'pointer',
                                        background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                                        border: isSelected ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                                        transition: 'all 0.15s'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <div style={{
                                            padding: 8, borderRadius: 10,
                                            background: isSelected ? '#06b6d4' : '#1a1a1e',
                                            color: isSelected ? '#000' : '#a1a1aa'
                                        }}>
                                            <IconComp size={16} />
                                        </div>
                                        <div>
                                            <div style={{ fontSize: 14, fontWeight: 600, color: isSelected ? '#fff' : '#e4e4e7' }}>
                                                {cmd.title}
                                            </div>
                                            <div style={{ fontSize: 11, color: '#71717a' }}>{cmd.category}</div>
                                        </div>
                                    </div>
                                    <ArrowRight size={14} color={isSelected ? '#06b6d4' : '#52525b'} />
                                </div>
                            );
                        })
                    ) : (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#a1a1aa', fontSize: 14 }}>
                            Press <kbd style={{ background: '#1a1a1e', padding: '2px 6px', borderRadius: 4, color: '#fff' }}>Enter</kbd> to search for "{query}"
                        </div>
                    )}
                </div>

                {/* Footer instructions */}
                <div style={{
                    padding: '10px 20px', background: '#0a0a0d', borderTop: '1px solid #1f1f24',
                    display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#71717a'
                }}>
                    <span>Use ↑ ↓ to navigate</span>
                    <span>↵ to select</span>
                    <span>ESC to close</span>
                </div>
            </div>
        </div>
    );
}
