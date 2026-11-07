'use client';

import React, { useState, useRef } from 'react';
import { Camera, Upload, X, ScanSearch, CheckCircle2, ShoppingBag, RotateCcw, Sparkles } from 'lucide-react';

interface VisualShoppingProps {
    onClose?: () => void;
    onSearchTrigger?: (query: string) => void;
    symbol?: string;
    pincode?: string;
}

const DETECTED_PRODUCTS = [
    { name: 'Sony WH-1000XM5 Headphones', confidence: 97, category: 'Audio' },
    { name: 'Bose QuietComfort Ultra', confidence: 82, category: 'Audio' },
    { name: 'Apple AirPods Max', confidence: 71, category: 'Audio' },
];

export default function VisualShopping({ onClose, onSearchTrigger }: VisualShoppingProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [scanComplete, setScanComplete] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [selectedProduct, setSelectedProduct] = useState(DETECTED_PRODUCTS[0].name);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const processImage = (file: File) => {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setIsScanning(true);
        setScanComplete(false);

        // Simulate CV API processing
        setTimeout(() => {
            setIsScanning(false);
            setScanComplete(true);
        }, 2200);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            processImage(file);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            processImage(file);
        }
    };

    const handleSearchProduct = () => {
        onSearchTrigger?.(selectedProduct);
    };

    const resetScan = () => {
        setPreviewUrl(null);
        setIsScanning(false);
        setScanComplete(false);
        setSelectedProduct(DETECTED_PRODUCTS[0].name);
    };

    return (
        <div
            style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, width: '100%'
            }}
        >
            <div style={{
                background: '#18181b', borderRadius: 24, width: '100%', maxWidth: 520,
                border: '1px solid #27272a', overflow: 'hidden', position: 'relative',
                boxShadow: '0 25px 60px rgba(0,0,0,0.5)'
            }}>
                {/* Header */}
                <div style={{
                    padding: '20px 24px', borderBottom: '1px solid #27272a',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    background: 'linear-gradient(135deg, rgba(56,189,248,0.05), transparent)'
                }}>
                    <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
                        <Camera size={20} color="#38bdf8" />
                        Visual Search
                        {scanComplete && (
                            <span style={{
                                fontSize: 11, fontWeight: 600, color: '#22c55e',
                                background: 'rgba(34,197,94,0.1)', padding: '3px 10px',
                                borderRadius: 20, border: '1px solid rgba(34,197,94,0.2)'
                            }}>
                                ✓ Scan Complete
                            </span>
                        )}
                    </h3>
                    <button onClick={onClose} style={{
                        background: '#27272a', border: 'none', color: '#a1a1aa',
                        cursor: 'pointer', borderRadius: 8, width: 32, height: 32,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.15s'
                    }}>
                        <X size={16} />
                    </button>
                </div>

                {/* Body */}
                <div style={{ padding: 24 }}>
                    {/* Upload / Preview Area */}
                    {!previewUrl ? (
                        <div
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                            style={{
                                border: `2px dashed ${isDragging ? '#38bdf8' : '#3f3f46'}`,
                                borderRadius: 16, padding: '48px 20px', textAlign: 'center',
                                cursor: 'pointer',
                                background: isDragging ? 'rgba(56,189,248,0.05)' : 'rgba(255,255,255,0.02)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <Upload size={36} color={isDragging ? '#38bdf8' : '#52525b'} style={{ marginBottom: 14 }} />
                            <p style={{ margin: '0 0 6px 0', fontWeight: 600, fontSize: 15, color: isDragging ? '#38bdf8' : '#e4e4e7' }}>
                                Click or drag a product image
                            </p>
                            <p style={{ margin: 0, fontSize: 13, color: '#71717a', lineHeight: 1.5 }}>
                                We'll identify the product using AI vision and<br />find the best prices across all marketplaces.
                            </p>
                            <input
                                type="file" ref={fileInputRef} onChange={handleFileChange}
                                accept="image/*" style={{ display: 'none' }}
                            />
                        </div>
                    ) : (
                        <div>
                            {/* Image Preview */}
                            <div style={{
                                position: 'relative', borderRadius: 16, overflow: 'hidden',
                                background: '#000', marginBottom: scanComplete ? 20 : 0
                            }}>
                                <img
                                    src={previewUrl} alt="Preview"
                                    style={{
                                        width: '100%', maxHeight: 220, objectFit: 'contain',
                                        display: 'block', opacity: isScanning ? 0.4 : 1,
                                        transition: 'opacity 0.3s'
                                    }}
                                />
                                {isScanning && (
                                    <div style={{
                                        position: 'absolute', inset: 0, display: 'flex',
                                        flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
                                    }}>
                                        <ScanSearch size={48} color="#38bdf8" className="animate-pulse" style={{ marginBottom: 14 }} />
                                        <div style={{ color: '#fff', fontWeight: 600, fontSize: 15 }}>Scanning for matches...</div>
                                        <div style={{ color: '#38bdf8', fontSize: 12, marginTop: 4 }}>AI Vision • Analyzing features & patterns</div>
                                    </div>
                                )}
                                {scanComplete && (
                                    <button
                                        onClick={resetScan}
                                        style={{
                                            position: 'absolute', top: 10, right: 10,
                                            background: 'rgba(0,0,0,0.7)', border: '1px solid #3f3f46',
                                            color: '#a1a1aa', cursor: 'pointer', borderRadius: 8,
                                            padding: '6px 10px', fontSize: 11, fontWeight: 600,
                                            display: 'flex', alignItems: 'center', gap: 4
                                        }}
                                    >
                                        <RotateCcw size={12} /> Re-scan
                                    </button>
                                )}
                            </div>

                            {/* Detected Products List */}
                            {scanComplete && (
                                <div>
                                    <div style={{
                                        fontSize: 13, fontWeight: 700, color: '#a1a1aa',
                                        marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6
                                    }}>
                                        <Sparkles size={14} color="#f59e0b" />
                                        DETECTED PRODUCTS
                                    </div>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                        {DETECTED_PRODUCTS.map((p, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedProduct(p.name)}
                                                style={{
                                                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                                    padding: '12px 16px', borderRadius: 12,
                                                    background: selectedProduct === p.name
                                                        ? 'rgba(56,189,248,0.08)' : '#111114',
                                                    border: selectedProduct === p.name
                                                        ? '1px solid rgba(56,189,248,0.3)' : '1px solid #27272a',
                                                    cursor: 'pointer', transition: 'all 0.15s',
                                                    textAlign: 'left', width: '100%'
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    {selectedProduct === p.name ? (
                                                        <CheckCircle2 size={16} color="#38bdf8" />
                                                    ) : (
                                                        <div style={{
                                                            width: 16, height: 16, borderRadius: '50%',
                                                            border: '2px solid #3f3f46'
                                                        }} />
                                                    )}
                                                    <div>
                                                        <div style={{
                                                            fontSize: 13, fontWeight: 600,
                                                            color: selectedProduct === p.name ? '#fff' : '#d4d4d8'
                                                        }}>
                                                            {p.name}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>
                                                            {p.category}
                                                        </div>
                                                    </div>
                                                </div>
                                                <span style={{
                                                    fontSize: 12, fontWeight: 700,
                                                    color: p.confidence >= 90 ? '#22c55e' : p.confidence >= 80 ? '#f59e0b' : '#a1a1aa',
                                                    background: p.confidence >= 90 ? 'rgba(34,197,94,0.1)' : p.confidence >= 80 ? 'rgba(245,158,11,0.1)' : 'rgba(161,161,170,0.1)',
                                                    padding: '3px 8px', borderRadius: 6
                                                }}>
                                                    {p.confidence}% match
                                                </span>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Search Button */}
                                    <button
                                        onClick={handleSearchProduct}
                                        style={{
                                            width: '100%', marginTop: 16, padding: '14px 20px',
                                            borderRadius: 14, border: 'none', cursor: 'pointer',
                                            background: 'linear-gradient(135deg, #38bdf8, #6366f1)',
                                            color: '#fff', fontSize: 15, fontWeight: 700,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                            boxShadow: '0 4px 20px rgba(56,189,248,0.25)',
                                            transition: 'all 0.2s'
                                        }}
                                    >
                                        <ShoppingBag size={18} />
                                        Search &amp; Compare Prices
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
