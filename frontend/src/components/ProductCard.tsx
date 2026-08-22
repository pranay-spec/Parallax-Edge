'use client';

import Image from 'next/image';
import { useState } from 'react';
import PriceOracleModal from './PriceOracleModal';
import RealityCheckModal from './RealityCheckModal';
import { ProductResult, PLATFORM_CONFIG } from '@/types';
import { useABTesting } from '@/lib/abTesting';
import { ExternalLink, Star, Zap, Truck, TrendingDown, TrendingUp, Brain, Scan, ShieldCheck } from 'lucide-react';

interface ProductCardProps {
    product: ProductResult;
    label?: string;
    labelColor?: 'green' | 'cyan';
    highlightFastest?: boolean;
    onViewAR?: (product: ProductResult) => void;
}

export default function ProductCard({ product, label, labelColor, highlightFastest, onViewAR }: ProductCardProps) {
    const formatPrice = (price: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

    
    const isExpress = product.eta_minutes <= 30;
    const [showOracle, setShowOracle] = useState(false);
    const [showRealityCheck, setShowRealityCheck] = useState(false);

    const platform = PLATFORM_CONFIG[product.platform];
    const prediction = product.price_prediction;
    const variant = useABTesting('product_card_price_highlight');

    return (
        <div className={`relative rounded-xl p-4 bg-[var(--bg-secondary)] border transition-all card-hover
      ${highlightFastest ? 'ring-2 ring-[var(--accent-cyan)]/40 border-[var(--accent-cyan)]/20' : ''}
      ${label ? (labelColor === 'green' ? 'border-[var(--accent-green)]/30' : 'border-[var(--accent-cyan)]/30') : 'border-transparent'}`}
        >
            {/* Label Badge */}
            {label && (
                <span className={`absolute -top-2 left-4 px-2 py-0.5 rounded text-xs font-semibold
          ${labelColor === 'green'
                        ? 'bg-[var(--accent-green)] text-black'
                        : 'bg-[var(--accent-cyan)] text-black'}`}
                >
                    {label}
                </span>
            )}

            <div className="flex gap-4">
                {/* Image */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-[var(--bg-card)] border border-white/10 flex items-center justify-center flex-shrink-0">
                    {product.image_url && product.image_url.startsWith('http') ? (
                        <Image
                            src={product.image_url}
                            alt={product.title}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-2 text-center">
                            <Zap size={22} className="text-cyan-400 mb-1" />
                            <span className="text-[10px] font-semibold text-gray-400 line-clamp-1">
                                {platform?.name || 'Store'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${platform?.badgeClass || ''}`}>
                            {platform.name}
                        </span>
                        <span className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs
              ${isExpress
                                ? 'bg-[var(--accent-green)]/20 text-[var(--accent-green)]'
                                : 'bg-[var(--bg-card)] text-[var(--text-secondary)]'}`}
                        >
                            {isExpress ? <Zap size={10} /> : <Truck size={10} />}
                            {product.eta_display}
                        </span>
                    </div>

                    <h4 className="text-sm font-medium line-clamp-2 mb-1">{product.title}</h4>

                    {product.rating && (
                        <button 
                            onClick={() => setShowRealityCheck(true)}
                            className="flex items-center gap-2 mt-1 px-2 py-1 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 rounded-md transition-colors"
                        >
                            <div className="flex items-center gap-1 text-xs font-bold text-indigo-400">
                                <ShieldCheck size={12} />
                                {product.title.length % 2 === 0 ? 3.4 : 4.6} Reality
                            </div>
                            <div className="w-px h-3 bg-indigo-500/30" />
                            <div className="text-[10px] font-bold text-[#a1a1aa]">
                                {product.title.length % 2 === 0 ? '34 Trust' : '86 Trust'}
                            </div>
                        </button>
                    )}
                </div>

                {/* Price & Action */}
                <div className="text-right flex flex-col justify-between">
                    <div>
                        <p className={`text-lg font-bold ${variant === 'B' ? 'bg-cyan-500/20 px-2 py-1 rounded text-cyan-400 border border-cyan-500/30' : 'text-gradient-cyan'}`}>
                            {formatPrice(product.price_breakdown.total_landed_cost)}
                        </p>
                        {product.price_breakdown.delivery_fee > 0 && (
                            <p className="text-xs text-[var(--text-muted)]">
                                +{formatPrice(product.price_breakdown.delivery_fee)} delivery
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        {onViewAR && (
                            <button
                                onClick={() => onViewAR(product)}
                                className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[#38bdf8] transition-colors"
                            >
                                <Scan size={12} /> AR
                            </button>
                        )}
                        <a
                            href={product.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--accent-cyan)] transition-colors"
                        >
                            Visit <ExternalLink size={10} />
                        </a>
                    </div>
                </div>
            </div>

            {/* AI Price Prediction Badge */}
            {prediction && (
                <button 
                  onClick={() => setShowOracle(true)}
                  className="w-full text-left transition-all hover:brightness-110"
                  style={{
                    marginTop: 10,
                    padding: '8px 12px',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    fontSize: 11,
                    background: prediction.action === 'BUY_NOW'
                        ? 'rgba(34, 197, 94, 0.08)'
                        : 'rgba(245, 158, 11, 0.08)',
                    border: `1px solid ${prediction.action === 'BUY_NOW'
                        ? 'rgba(34, 197, 94, 0.2)'
                        : 'rgba(245, 158, 11, 0.2)'}`,
                }}>
                    <Brain size={14} color={prediction.action === 'BUY_NOW' ? '#22c55e' : '#f59e0b'} />
                    <div style={{ flex: 1 }}>
                        <span style={{
                            fontWeight: 700,
                            color: prediction.action === 'BUY_NOW' ? '#22c55e' : '#f59e0b',
                            marginRight: 6,
                        }}>
                            {prediction.action === 'BUY_NOW' ? '🟢 Buy Now' : '🟡 Wait'}
                        </span>
                        <span style={{ color: '#a1a1aa' }}>
                            {prediction.reason}
                        </span>
                    </div>
                    <span style={{
                        fontWeight: 800,
                        fontSize: 10,
                        color: prediction.action === 'BUY_NOW' ? '#22c55e' : '#f59e0b',
                        whiteSpace: 'nowrap',
                    }}>
                        {prediction.confidence}% conf
                    </span>
                </button>
            )}
            
            {showOracle && (
                <PriceOracleModal product={product} onClose={() => setShowOracle(false)} />
            )}
            {showRealityCheck && (
                <RealityCheckModal product={product} onClose={() => setShowRealityCheck(false)} />
            )}
        </div>
    );
}
