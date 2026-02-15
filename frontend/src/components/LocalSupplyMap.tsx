'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Truck, Zap, Clock, Wifi, WifiOff, AlertTriangle, Shield } from 'lucide-react';

/**
 * Local Supply Map — Interactive Dark Store Heatmap
 * Uses Leaflet with CartoDB Dark Matter tiles for a real interactive map.
 * Dark stores are placed around the user's geocoded pincode location.
 */

interface DarkStore {
    name: string;
    platform: string;
    distance_km: number;
    base_eta: number;
    eta_minutes: number;
    lat: number;
    lng: number;
    is_active: boolean;
    vehicle: string;
    color: string;
    // Predictive Hub Latency components
    traffic_factor: number;
    rain_factor: number;
    hub_load: number; // 0-100%
    status_label: string;
}

interface LocalSupplyMapProps {
    pincode: string;
    query: string;
}

// Approximate lat/lng from Indian pincodes (top regions + fallback)
function pincodeToLatLng(pincode: string): [number, number] {
    const pin = parseInt(pincode, 10);
    if (isNaN(pin)) return [18.5204, 73.8567]; // Pune fallback

    // Major city mapping by pincode prefix
    const PINCODE_MAP: Record<string, [number, number]> = {
        // Mumbai
        '400': [19.076, 72.8777],
        // Delhi
        '110': [28.6139, 77.209],
        // Bangalore
        '560': [12.9716, 77.5946],
        // Chennai
        '600': [13.0827, 80.2707],
        // Hyderabad
        '500': [17.385, 78.4867],
        // Kolkata
        '700': [22.5726, 88.3639],
        // Pune
        '411': [18.5204, 73.8567],
        // Ahmedabad
        '380': [23.0225, 72.5714],
        // Jaipur
        '302': [26.9124, 75.7873],
        // Lucknow
        '226': [26.8467, 80.9462],
        // Chandigarh
        '160': [30.7333, 76.7794],
        // Gurgaon
        '122': [28.4595, 77.0266],
        // Noida
        '201': [28.5355, 77.391],
        // Indore
        '452': [22.7196, 75.8577],
        // Nagpur
        '440': [21.1458, 79.0882],
        // Bhopal
        '462': [23.2599, 77.4126],
        // Kochi
        '682': [9.9312, 76.2673],
        // VIT Vellore
        '632': [12.9692, 79.1559],
        // Coimbatore
        '641': [11.0168, 76.9558],
        // Vizag
        '530': [17.6868, 83.2185],
        // Surat
        '395': [21.1702, 72.8311],
        // Goa
        '403': [15.2993, 74.124],
        // Patna
        '800': [25.6093, 85.1376],
        // Bhubaneswar
        '751': [20.2961, 85.8245],
        // Mangalore
        '575': [12.9141, 74.856],
        // Trivandrum
        '695': [8.5241, 76.9366],
    };

    // Try 3-digit prefix
    const prefix3 = pincode.substring(0, 3);
    if (PINCODE_MAP[prefix3]) return PINCODE_MAP[prefix3];

    // Approximate from first digit (postal region)
    const region = pincode[0];
    const regionMap: Record<string, [number, number]> = {
        '1': [28.6139, 77.209],   // Delhi/North
        '2': [26.8467, 80.9462],  // UP
        '3': [23.0225, 72.5714],  // Gujarat/Rajasthan
        '4': [19.076, 72.8777],   // Maharashtra
        '5': [17.385, 78.4867],   // Andhra/Telangana
        '6': [13.0827, 80.2707],  // Tamil Nadu/Kerala
        '7': [22.5726, 88.3639],  // West Bengal/East
        '8': [25.6093, 85.1376],  // Bihar/Jharkhand
        '9': [26.1445, 91.7362],  // NE India
        '0': [34.0837, 74.7973],  // J&K/Himachal
    };

    return regionMap[region] || [20.5937, 78.9629]; // Center of India
}

// Generate deterministic dark stores around a center point with predictive latency
function generateDarkStores(pincode: string): { stores: DarkStore[]; center: [number, number]; global_traffic: string; weather: string } {
    const center = pincodeToLatLng(pincode);
    const seed = pincode.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    const rng = (i: number) => ((seed * (i + 1) * 9301 + 49297) % 233280) / 233280;

    const global_traffic = rng(50) > 0.7 ? "High (Bibwewadi Traffic Spike)" : rng(50) > 0.4 ? "Moderate" : "Light";
    const weather = rng(51) > 0.85 ? "Heavy Rain" : rng(51) > 0.7 ? "Light Rain" : "Clear";

    const base_traffic_factor = global_traffic.includes("High") ? 1.6 : global_traffic.includes("Moderate") ? 1.2 : 1.0;
    const base_rain_factor = weather === "Heavy Rain" ? 1.5 : weather === "Light Rain" ? 1.2 : 1.0;

    const definitions = [
        { name: 'Blinkit Hub', platform: 'blinkit', color: '#f59e0b', vehicle: 'EV Bike' },
        { name: 'Zepto Darkstore', platform: 'zepto', color: '#a855f7', vehicle: 'Bike' },
        { name: 'BigBasket Warehouse', platform: 'bigbasket', color: '#22c55e', vehicle: 'Truck' },
        { name: 'Swiggy Instamart', platform: 'swiggy_instamart', color: '#f97316', vehicle: 'Bike' },
        { name: 'JioMart Store', platform: 'jiomart', color: '#3b82f6', vehicle: 'Van' },
        { name: 'DMart Ready', platform: 'dmart', color: '#06b6d4', vehicle: 'Truck' },
    ];

    const stores: DarkStore[] = definitions.map((def, i) => {
        const distance_km = +(0.5 + rng(i * 5 + 1) * (i < 3 ? 3 : 8)).toFixed(1);
        const base_eta = i < 3 ? Math.floor(6 + rng(i * 5 + 2) * 10) : Math.floor(25 + rng(i * 5 + 2) * 60);

        const traffic_factor = base_traffic_factor + (rng(i * 5 + 3) * 0.3);
        const rain_factor = base_rain_factor;
        const hub_load = Math.floor(20 + rng(i * 5 + 4) * 75); // 20-95%

        // Final Jittered ETA logic
        // Load Penalty: If load > 80%, add 20-50% extra time
        const load_penalty = hub_load > 85 ? 1.5 : hub_load > 70 ? 1.2 : 1.0;
        const final_eta = Math.floor(base_eta * traffic_factor * rain_factor * load_penalty);

        const status_label = hub_load > 85 ? "Overloaded" : hub_load > 70 ? "Loaded" : "Healthy";

        return {
            ...def,
            distance_km,
            base_eta,
            eta_minutes: final_eta,
            lat: center[0] + (rng(i * 5 + 6) - 0.5) * (0.02 + i * 0.005),
            lng: center[1] + (rng(i * 5 + 7) - 0.5) * (0.02 + i * 0.005),
            is_active: rng(i * 5 + 8) > 0.1,
            traffic_factor: +traffic_factor.toFixed(2),
            rain_factor: +rain_factor.toFixed(2),
            hub_load,
            status_label
        };
    });

    return { stores: stores.sort((a, b) => a.distance_km - b.distance_km), center, global_traffic, weather };
}

export default function LocalSupplyMap({ pincode, query }: LocalSupplyMapProps) {
    const [hoveredStore, setHoveredStore] = useState<string | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const markersRef = useRef<any[]>([]);

    const { stores, center, global_traffic, weather } = generateDarkStores(pincode || '560001');
    const activeCount = stores.filter(s => s.is_active).length;
    const overloadedCount = stores.filter(s => s.status_label === 'Overloaded').length;
    const nearestStore = stores[0];
    const fastestStore = stores.reduce((a, b) => a.eta_minutes < b.eta_minutes ? a : b);

    // Initialize Leaflet map
    useEffect(() => {
        let isMounted = true;
        if (!mapContainerRef.current) return;

        const initMap = async () => {
            try {
                const L = (await import('leaflet')).default;

                // Final checks before initializing
                if (!isMounted || !mapContainerRef.current) return;

                // If map already exists on this ref or container, don't re-init
                if (mapRef.current) return;
                if ((mapContainerRef.current as any)._leaflet_id) return;

                // Fix default icon path issue
                delete (L.Icon.Default.prototype as any)._getIconUrl;
                L.Icon.Default.mergeOptions({
                    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
                    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
                });

                const map = L.map(mapContainerRef.current, {
                    center: center,
                    zoom: 14,
                    zoomControl: false,
                    attributionControl: false,
                });

                // Dark theme tiles — CartoDB Dark Matter
                L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
                    maxZoom: 19,
                    subdomains: 'abcd',
                }).addTo(map);

                // Zoom control on right side
                L.control.zoom({ position: 'topright' }).addTo(map);

                // Attribution bottom-left
                L.control.attribution({ position: 'bottomleft', prefix: false })
                    .addAttribution('© <a href="https://carto.com/" style="color:#67e8f9">CARTO</a> • <a href="https://www.openstreetmap.org/" style="color:#67e8f9">OSM</a>')
                    .addTo(map);

                // ── User Location Marker ──
                const userIcon = L.divIcon({
                    className: '',
                    html: `
                        <div style="position:relative;width:40px;height:40px;">
                            <div style="position:absolute;inset:0;border-radius:50%;background:rgba(59,130,246,0.15);animation:userPulse 2s ease-in-out infinite;"></div>
                            <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:16px;height:16px;border-radius:50%;background:#3b82f6;border:3px solid #1e40af;box-shadow:0 0 20px rgba(59,130,246,0.6),0 0 40px rgba(59,130,246,0.2);"></div>
                        </div>
                    `,
                    iconSize: [40, 40],
                    iconAnchor: [20, 20],
                });

                L.marker(center, { icon: userIcon, zIndexOffset: 1000 })
                    .addTo(map)
                    .bindPopup(`
                        <div style="background:#111114;border:1px solid #3b82f640;border-radius:12px;padding:14px 18px;color:#fff;font-family:system-ui;min-width:160px;">
                            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">
                                <div style="width:8px;height:8px;border-radius:50%;background:#3b82f6;box-shadow:0 0 8px #3b82f6;"></div>
                                <span style="font-size:13px;font-weight:700;color:#60a5fa;">Your Location</span>
                            </div>
                            <div style="font-size:12px;color:#a1a1aa;">📍 Pincode: ${pincode || '560001'}</div>
                        </div>
                    `, {
                        className: 'custom-popup',
                        closeButton: false,
                        offset: [0, -8],
                    });

                // ── Delivery Radius Circles ──
                stores.filter(s => s.is_active).forEach(store => {
                    L.circle([store.lat, store.lng], {
                        radius: Math.max(300, 1200 - store.distance_km * 120),
                        color: store.status_label === 'Overloaded' ? '#fb923c' : store.color,
                        fillColor: store.status_label === 'Overloaded' ? '#fb923c' : store.color,
                        fillOpacity: 0.06,
                        weight: 1,
                        opacity: 0.25,
                        dashArray: '6 4',
                    }).addTo(map);
                });

                // ── Dark Store Markers ──
                const newMarkers: any[] = [];
                stores.forEach(store => {
                    const isOverloaded = store.status_label === 'Overloaded';
                    const pulseColor = isOverloaded ? '#fb923c' : store.color;
                    const markerIcon = L.divIcon({
                        className: '',
                        html: `
                            <div style="position:relative;width:36px;height:36px;cursor:pointer;">
                                ${store.is_active ? `<div style="position:absolute;inset:0;border-radius:50%;background:radial-gradient(circle,${pulseColor}30,transparent 70%);animation:storePulse ${isOverloaded ? '1.2s' : '2.5s'} ease-in-out infinite;"></div>` : ''}
                                <div style="
                                    position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);
                                    width:18px;height:18px;border-radius:50%;
                                    background:${store.is_active ? (isOverloaded ? '#fb923c' : store.color) : '#52525b'};
                                    border:2.5px solid #fff;
                                    box-shadow:${store.is_active ? `0 0 14px ${pulseColor}70,0 0 28px ${pulseColor}25` : 'none'};
                                    transition:all 0.3s;
                                "></div>
                            </div>
                        `,
                        iconSize: [36, 36],
                        iconAnchor: [18, 18],
                    });

                    const vehicleEmoji = store.vehicle === 'EV Bike' ? '🔋' : store.vehicle === 'Bike' ? '🏍️' : store.vehicle === 'Truck' ? '🚛' : '🚐';

                    const marker = L.marker([store.lat, store.lng], {
                        icon: markerIcon,
                        zIndexOffset: store.is_active ? 500 : 100,
                    })
                        .addTo(map)
                        .bindPopup(`
                            <div style="background:#111114;border:1px solid ${isOverloaded ? '#fb923c' : store.color}40;border-radius:14px;padding:16px 20px;color:#fff;font-family:system-ui;min-width:220px;box-shadow:0 8px 32px rgba(0,0,0,0.5);">
                                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
                                    <div style="display:flex;align-items:center;gap:8px;">
                                        <div style="width:10px;height:10px;border-radius:50%;background:${isOverloaded ? '#fb923c' : store.color};box-shadow:0 0 8px ${isOverloaded ? '#fb923c' : store.color};"></div>
                                        <span style="font-size:14px;font-weight:800;color:${isOverloaded ? '#fb923c' : store.color};">${store.name}</span>
                                    </div>
                                    <span style="font-size:10px;font-weight:900;color:${isOverloaded ? '#ef4444' : '#4ade80'};background:${isOverloaded ? '#ef444420' : '#4ade8015'};padding:3px 8px;border-radius:6px;border:1px solid ${isOverloaded ? '#ef444440' : '#4ade8030'};">
                                        ${isOverloaded ? 'DELAY RISK' : 'SMOOTH'}
                                    </span>
                                </div>
                                
                                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                                    <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:8px 10px;text-align:center;">
                                        <div style="font-size:18px;font-weight:900;color:#fff;">${store.eta_minutes}</div>
                                        <div style="font-size:9px;color:#71717a;">PREDICTED ETA</div>
                                    </div>
                                    <div style="background:rgba(255,255,255,0.03);border-radius:8px;padding:8px 10px;text-align:center;">
                                        <div style="font-size:18px;font-weight:900;color:${isOverloaded ? '#fb923c' : '#a1a1aa'};">${store.hub_load}%</div>
                                        <div style="font-size:9px;color:#71717a;">HUB LOAD</div>
                                    </div>
                                </div>

                                <div style="padding:10px;background:rgba(0,0,0,0.2);border-radius:10px;margin-bottom:12px;border:1px solid rgba(255,255,255,0.05);">
                                    <div style="font-size:9px;color:#52525b;font-weight:800;letter-spacing:1px;margin-bottom:6px;text-transform:uppercase;">LATENCY BREAKDOWN</div>
                                    <div style="display:flex;justify-content:space-between;font-size:11px;margin-bottom:4px;">
                                        <span style="color:#a1a1aa;">Traffic Jitter</span>
                                        <span style="color:#e4e4e7;font-weight:600;">+${((store.traffic_factor - 1) * 100).toFixed(0)}%</span>
                                    </div>
                                    <div style="display:flex;justify-content:space-between;font-size:11px;">
                                        <span style="color:#a1a1aa;">Weather Lag</span>
                                        <span style="color:#e4e4e7;font-weight:600;">+${((store.rain_factor - 1) * 100).toFixed(0)}%</span>
                                    </div>
                                </div>

                                <div style="display:flex;align-items:center;justify-content:space-between;padding:6px 10px;background:rgba(255,255,255,0.03);border-radius:8px;font-size:11px;color:#a1a1aa;">
                                    <span>${vehicleEmoji} ${store.vehicle}</span>
                                    <span style="color:${store.is_active ? '#4ade80' : '#ef4444'};font-weight:700;">${store.is_active ? '● Online' : '● Offline'}</span>
                                </div>
                            </div>
                        `, {
                            className: 'custom-popup',
                            closeButton: false,
                            offset: [0, -6],
                        });

                    newMarkers.push({ marker, store });
                });

                markersRef.current = newMarkers;

                // ── Fit bounds to show all markers ──
                const allPoints: [number, number][] = [center, ...stores.map(s => [s.lat, s.lng] as [number, number])];
                const bounds = L.latLngBounds(allPoints);
                map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });

                mapRef.current = map;
                setMapReady(true);
            } catch (err) {
                console.error("Leaflet initialization error:", err);
            }
        };

        initMap();

        return () => {
            isMounted = false;
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pincode]);

    // Highlight store on map when hovered in list
    useEffect(() => {
        if (!mapRef.current || !markersRef.current.length) return;
        markersRef.current.forEach(({ marker, store }) => {
            if (hoveredStore === store.name) {
                marker.openPopup();
            }
        });
    }, [hoveredStore]);

    return (
        <div>
            {/* Inject Leaflet CSS + custom popup styles + animations */}
            <link
                rel="stylesheet"
                href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
            />
            <style>{`
                .custom-popup .leaflet-popup-content-wrapper {
                    background: transparent !important;
                    box-shadow: none !important;
                    border: none !important;
                    padding: 0 !important;
                    border-radius: 14px !important;
                }
                .custom-popup .leaflet-popup-content {
                    margin: 0 !important;
                    line-height: 1.4 !important;
                }
                .custom-popup .leaflet-popup-tip-container {
                    display: none !important;
                }
                .leaflet-control-zoom a {
                    background: #111114 !important;
                    color: #e4e4e7 !important;
                    border-color: #27272a !important;
                    width: 32px !important;
                    height: 32px !important;
                    line-height: 32px !important;
                    font-size: 16px !important;
                    border-radius: 8px !important;
                }
                .leaflet-control-zoom a:hover {
                    background: #1f1f24 !important;
                    color: #fff !important;
                }
                .leaflet-control-zoom {
                    border: none !important;
                    border-radius: 10px !important;
                    overflow: hidden;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.4) !important;
                }
                .leaflet-control-attribution {
                    background: rgba(10,10,15,0.75) !important;
                    color: #52525b !important;
                    font-size: 9px !important;
                    padding: 2px 6px !important;
                    border-radius: 4px !important;
                }
                .leaflet-control-attribution a {
                    color: #67e8f9 !important;
                }
                @keyframes userPulse {
                    0%, 100% { transform: scale(1); opacity: 0.4; }
                    50% { transform: scale(1.8); opacity: 0; }
                }
                @keyframes storePulse {
                    0%, 100% { opacity: 0.5; transform: scale(1); }
                    50% { opacity: 0.9; transform: scale(1.35); }
                }
            `}</style>

            {/* Predictive Latency Stats Bar */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: 10,
                marginBottom: 20,
            }}>
                {[
                    { label: 'Local Traffic', value: global_traffic, icon: Truck, color: global_traffic.includes('High') ? '#ef4444' : '#3b82f6' },
                    { label: 'Current Weather', value: weather, icon: Clock, color: weather.includes('Rain') ? '#0ea5e9' : '#eab308' },
                    { label: 'Overloaded Hubs', value: `${overloadedCount}`, icon: AlertTriangle, color: overloadedCount > 0 ? '#fb923c' : '#71717a' },
                    { label: 'Active Pipeline', value: `${activeCount}/${stores.length}`, icon: Wifi, color: '#22c55e' },
                ].map((stat) => (
                    <div key={stat.label} style={{
                        padding: '12px 10px',
                        borderRadius: 14,
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        textAlign: 'center',
                    }}>
                        <stat.icon size={14} color={stat.color} style={{ margin: '0 auto 6px' }} />
                        <div style={{ fontSize: 13, fontWeight: 900, color: stat.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.value}</div>
                        <div style={{ fontSize: 9, fontWeight: 700, color: '#52525b', textTransform: 'uppercase', marginTop: 2 }}>{stat.label}</div>
                    </div>
                ))}
            </div>

            {/* Interactive Map */}
            <div style={{
                position: 'relative',
                height: 440,
                borderRadius: 20,
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
                background: '#0a0a0f',
            }}>
                {/* Loading skeleton */}
                {!mapReady && (
                    <div style={{
                        position: 'absolute', inset: 0, zIndex: 5,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: '#0a0a0f',
                    }}>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                border: '3px solid #27272a', borderTopColor: '#6366f1',
                                animation: 'spin 0.8s linear infinite',
                                margin: '0 auto 14px',
                            }} />
                            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                            <div style={{ fontSize: 13, color: '#52525b' }}>Synchronizing latencies...</div>
                        </div>
                    </div>
                )}
                <div
                    ref={mapContainerRef}
                    style={{ width: '100%', height: '100%' }}
                />
            </div>

            {/* Store List */}
            <div style={{ marginTop: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: '#71717a', textTransform: 'uppercase', letterSpacing: 1.5 }}>
                        REAL-TIME DARK STORE PIPELINE
                    </div>
                    <div style={{ fontSize: 10, color: '#52525b', fontStyle: 'italic' }}>
                        Updated just now
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    {stores.map((store) => {
                        const isOverloaded = store.status_label === 'Overloaded';
                        return (
                            <div
                                key={store.name}
                                onMouseEnter={() => setHoveredStore(store.name)}
                                onMouseLeave={() => setHoveredStore(null)}
                                onClick={() => {
                                    if (mapRef.current) {
                                        mapRef.current.flyTo([store.lat, store.lng], 16, { duration: 0.8 });
                                        const entry = markersRef.current.find(m => m.store.name === store.name);
                                        if (entry) setTimeout(() => entry.marker.openPopup(), 400);
                                    }
                                }}
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 8,
                                    padding: '14px',
                                    borderRadius: 14,
                                    background: hoveredStore === store.name
                                        ? 'rgba(255,255,255,0.04)'
                                        : 'rgba(255,255,255,0.015)',
                                    border: `1px solid ${hoveredStore === store.name ? (isOverloaded ? '#fb923c60' : store.color + '40') : 'rgba(255,255,255,0.04)'}`,
                                    transition: 'all 0.2s ease',
                                    cursor: 'pointer',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div style={{
                                        width: 8, height: 8, borderRadius: '50%',
                                        background: store.is_active ? (isOverloaded ? '#fb923c' : store.color) : '#52525b',
                                        boxShadow: store.is_active ? `0 0 8px ${isOverloaded ? '#fb923c' : store.color}` : 'none',
                                        marginTop: 4
                                    }} />
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: 16, fontWeight: 900, color: store.is_active ? (isOverloaded ? '#fb923c' : store.color) : '#52525b' }}>
                                            {store.eta_minutes} <span style={{ fontSize: 10, fontWeight: 500 }}>MIN</span>
                                        </div>
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: 14, fontWeight: 700, color: '#fff' }}>{store.name}</div>
                                    <div style={{ fontSize: 11, color: '#71717a' }}>{store.vehicle} • {store.distance_km} km</div>
                                </div>

                                <div style={{ marginTop: 4, height: 4, background: 'rgba(255,255,255,0.05)', borderRadius: 2, overflow: 'hidden' }}>
                                    <div style={{
                                        width: `${store.hub_load}%`, height: '100%',
                                        background: isOverloaded ? '#ef4444' : store.hub_load > 60 ? '#f59e0b' : '#22c55e',
                                        borderRadius: 2
                                    }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9 }}>
                                    <span style={{ color: '#52525b', fontWeight: 800 }}>LOAD: {store.hub_load}%</span>
                                    <span style={{ color: isOverloaded ? '#ef4444' : '#71717a', fontWeight: 800 }}>{store.status_label.toUpperCase()}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Supply-Chain Transparency Footer */}
            <div style={{
                marginTop: 20,
                padding: '16px 20px',
                borderRadius: 16,
                background: 'rgba(244, 63, 94, 0.04)',
                border: '1px solid rgba(244, 63, 94, 0.15)',
                fontSize: 12,
                color: '#a1a1aa',
                lineHeight: 1.6,
                display: 'flex',
                gap: 12,
                alignItems: 'center'
            }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(244, 63, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Shield size={20} color="#f43f5e" />
                </div>
                <div>
                    <span style={{ color: '#f43f5e', fontWeight: 800 }}>📦 SUPPLY-CHAIN TRANSPARENCY: </span>
                    Predictive Hub Latency is active. These ETAs aren&apos;t just distance-based; we jitter for <strong style={{ color: '#fff' }}>Bibwewadi Traffic</strong> and
                    <strong style={{ color: '#fff' }}> Dark Store Overload</strong>. Orange indicators suggest a hub is at {'>'}85% capacity — expect prep-time delays.
                </div>
            </div>
        </div>
    );
}
