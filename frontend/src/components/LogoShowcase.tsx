'use client';
import React, { useState } from 'react';
import * as LucideIcons from 'lucide-react';

export default function LogoShowcase() {
    const [isOpen, setIsOpen] = useState(true);
    if (!isOpen) return null;

    const iconsToSuggest = [
        'Hexagon', 'Box', 'Flame', 'Command', 'Cpu', 'Ghost', 'Gem', 'Anchor', 'Dna',
        'Aperture', 'Asterisk', 'Activity', 'Radar', 'Terminal', 'Triangle', 'Compass', 
        'Globe', 'Rocket', 'Target', 'Fingerprint', 'Infinity', 'Layers', 'Package', 
        'Boxes', 'Origami', 'Sprout', 'Crosshair', 'Atom', 'Tent', 'Mountain', 'Zap'
    ];

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40,
            overflowY: 'auto'
        }}>
            <div style={{
                background: '#18181b', borderRadius: 24, padding: 32, width: '100%', maxWidth: 800,
                border: '1px solid #27272a', position: 'relative'
            }}>
                <button onClick={() => setIsOpen(false)} style={{
                    position: 'absolute', top: 16, right: 16, background: '#3f3f46', 
                    border: 'none', color: '#fff', cursor: 'pointer', padding: '6px 12px', borderRadius: 8
                }}>Close</button>
                <h2 style={{ color: '#fff', textAlign: 'center', marginBottom: 24, fontSize: 24, fontWeight: 'bold' }}>Choose a Logo for Parallax Edge OS</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: 24 }}>
                    {iconsToSuggest.map(name => {
                        const Icon = (LucideIcons as any)[name];
                        if (!Icon) return null;
                        return (
                            <div key={name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, color: '#fff' }}>
                                <div style={{
                                    width: 44, height: 44, borderRadius: 12,
                                    background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
                                }}>
                                    <Icon size={24} strokeWidth={2.5} color="#fff" />
                                </div>
                                <span style={{ fontSize: 13, color: '#a1a1aa' }}>{name}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
