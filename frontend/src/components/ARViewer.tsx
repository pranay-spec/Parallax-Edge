'use client';

import React, { useEffect, useRef, useState } from 'react';
import { X, Maximize, Scan, Loader2 } from 'lucide-react';

interface ARViewerProps {
    imageUrl: string;
    productTitle: string;
    onClose: () => void;
}

export default function ARViewer({ imageUrl, productTitle, onClose }: ARViewerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // Overlay position states
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const dragRef = useRef({ startX: 0, startY: 0, initialX: 0, initialY: 0 });

    useEffect(() => {
        let activeStream: MediaStream | null = null;
        
        async function startCamera() {
            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'environment' }
                });
                
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                setStream(mediaStream);
                activeStream = mediaStream;
                setIsLoading(false);
            } catch (err) {
                console.error('AR Camera Error:', err);
                setError('Camera access denied or unavailable. Please enable camera permissions to use AR.');
                setIsLoading(false);
            }
        }
        
        startCamera();

        return () => {
            if (activeStream) {
                activeStream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    // Drag handlers
    const handlePointerDown = (e: React.PointerEvent) => {
        setIsDragging(true);
        dragRef.current = {
            startX: e.clientX,
            startY: e.clientY,
            initialX: position.x,
            initialY: position.y
        };
        (e.target as HTMLElement).setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragRef.current.startX;
        const dy = e.clientY - dragRef.current.startY;
        setPosition({
            x: dragRef.current.initialX + dx,
            y: dragRef.current.initialY + dy
        });
    };

    const handlePointerUp = (e: React.PointerEvent) => {
        setIsDragging(false);
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    };

    const handleWheel = (e: React.WheelEvent) => {
        e.preventDefault();
        setScale(prev => Math.max(0.2, Math.min(prev - e.deltaY * 0.001, 3)));
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 99999, background: '#000',
            display: 'flex', flexDirection: 'column', overflow: 'hidden'
        }}>
            {/* Header / Controls */}
            <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
                padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                background: 'linear-gradient(180deg, rgba(0,0,0,0.8) 0%, transparent 100%)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                        padding: '8px', borderRadius: 8, display: 'flex'
                    }}>
                        <Scan size={20} color="#38bdf8" />
                    </div>
                    <div>
                        <div style={{ color: '#fff', fontWeight: 700, fontSize: 16 }}>AR Preview</div>
                        <div style={{ color: '#a1a1aa', fontSize: 13, maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {productTitle}
                        </div>
                    </div>
                </div>
                <button 
                    onClick={onClose}
                    style={{
                        background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                        border: 'none', padding: 8, borderRadius: '50%', color: '#fff', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Video Feed & Overlay */}
            <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {isLoading ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                        <Loader2 size={32} color="#38bdf8" className="animate-spin" />
                        <div style={{ color: '#fff', fontWeight: 600 }}>Initializing AR Environment...</div>
                    </div>
                ) : error ? (
                    <div style={{ color: '#ef4444', textAlign: 'center', padding: 40, maxWidth: 400 }}>
                        <div style={{ fontSize: 48, marginBottom: 16 }}>📷</div>
                        <h3 style={{ margin: '0 0 8px 0' }}>Camera Access Required</h3>
                        <p style={{ margin: 0, color: '#a1a1aa' }}>{error}</p>
                    </div>
                ) : (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted
                            style={{
                                position: 'absolute', inset: 0, width: '100%', height: '100%',
                                objectFit: 'cover', zIndex: 0
                            }} 
                        />
                        
                        {/* Interactive Overlay */}
                        <div 
                            style={{ position: 'absolute', inset: 0, zIndex: 1, touchAction: 'none' }}
                            onWheel={handleWheel}
                        >
                            <img 
                                src={imageUrl} 
                                alt={productTitle}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                style={{
                                    position: 'absolute',
                                    left: '50%', top: '50%',
                                    transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px)) scale(${scale})`,
                                    maxWidth: '80vw', maxHeight: '80vh', objectFit: 'contain',
                                    cursor: isDragging ? 'grabbing' : 'grab',
                                    filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.5))',
                                    touchAction: 'none'
                                }}
                                draggable={false}
                            />
                        </div>

                        {/* Instructions */}
                        <div style={{
                            position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 2,
                            background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)',
                            padding: '12px 24px', borderRadius: 24, display: 'flex', alignItems: 'center', gap: 12
                        }}>
                            <Maximize size={16} color="#38bdf8" />
                            <span style={{ color: '#fff', fontSize: 13, fontWeight: 600 }}>Drag to move • Scroll/Pinch to resize</span>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
