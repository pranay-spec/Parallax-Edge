'use client';

import React from 'react';
import { Keyboard, X } from 'lucide-react';
import { tokens } from '@/styles/tokens';

interface KeyboardShortcutsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
    if (!isOpen) return null;

    const shortcuts = [
        { keys: ['/'], description: 'Focus main search bar' },
        { keys: ['G', 'H'], description: 'Go to Home overview' },
        { keys: ['G', 'A'], description: 'Go to Price Oracle / Analytics' },
        { keys: ['⌘', 'K'], description: 'Open Command Palette' },
        { keys: ['?'], description: 'Open Keyboard Shortcuts legend' },
        { keys: ['Esc'], description: 'Close open modals / reset view' },
    ];

    return (
        <div
            role="dialog"
            aria-label="Keyboard Shortcuts"
            style={{
                position: 'fixed', inset: 0, zIndex: 9999,
                background: 'rgba(0, 0, 0, 0.8)', backdropFilter: 'blur(8px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
            }}
        >
            <div style={{
                width: '100%', maxWidth: 480, background: tokens.colors.bgCard,
                border: `1px solid ${tokens.colors.borderLight}`, borderRadius: 24, padding: 28,
                boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)', position: 'relative'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ padding: 8, borderRadius: 10, background: tokens.colors.info.bg, color: tokens.colors.info.main }}>
                            <Keyboard size={20} />
                        </div>
                        <h3 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>
                            Keyboard Shortcuts
                        </h3>
                    </div>
                    <button
                        onClick={onClose}
                        aria-label="Close shortcuts modal"
                        style={{ background: 'transparent', border: 'none', color: tokens.colors.textMuted, cursor: 'pointer', minHeight: 44, minWidth: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <X size={20} />
                    </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {shortcuts.map((sc, i) => (
                        <div
                            key={i}
                            style={{
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                padding: '10px 14px', borderRadius: 12, background: tokens.colors.bgSurface,
                                border: `1px solid ${tokens.colors.border}`
                            }}
                        >
                            <span style={{ fontSize: 14, color: tokens.colors.textSecondary, fontWeight: 500 }}>
                                {sc.description}
                            </span>
                            <div style={{ display: 'flex', gap: 4 }}>
                                {sc.keys.map((k, kIdx) => (
                                    <kbd
                                        key={kIdx}
                                        style={{
                                            padding: '4px 8px', borderRadius: 6, background: '#0a0a0d',
                                            border: `1px solid ${tokens.colors.borderLight}`, color: '#fff',
                                            fontSize: 12, fontWeight: 800, fontFamily: 'monospace'
                                        }}
                                    >
                                        {k}
                                    </kbd>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
