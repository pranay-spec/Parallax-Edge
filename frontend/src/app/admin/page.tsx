'use client';

import React, { useEffect, useState } from 'react';
import { Database, Activity, Server, Zap, RefreshCw, BarChart3, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [runningETL, setRunningETL] = useState(false);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

    const fetchMetrics = async () => {
        try {
            const res = await fetch(`${apiUrl}/admin/metrics`);
            if (res.ok) {
                const data = await res.json();
                setMetrics(data);
            }
        } catch (err) {
            console.error('Failed to fetch metrics:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMetrics();
        const interval = setInterval(fetchMetrics, 5000); // Polling for real-time feel
        return () => clearInterval(interval);
    }, []);

    const triggerETL = async () => {
        setRunningETL(true);
        try {
            await fetch(`${apiUrl}/admin/etl-run`, { method: 'POST' });
            // ETL runs in background; metrics will update via polling
        } catch (err) {
            console.error('ETL Trigger failed:', err);
        } finally {
            setTimeout(() => setRunningETL(false), 2000);
        }
    };

    if (loading && !metrics) {
        return <div className="min-h-screen bg-black flex items-center justify-center text-white"><RefreshCw className="animate-spin" /></div>;
    }

    return (
        <div className="min-h-screen bg-[#050505] text-white p-8 font-sans">
            <header className="flex justify-between items-center mb-8 pb-4 border-b border-[#27272a]">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 hover:bg-[#27272a] rounded-lg transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <Database size={28} className="text-[#06b6d4]" />
                    <h1 className="text-2xl font-bold">Data Operations Control Center</h1>
                </div>
                <div className="flex items-center gap-4">
                    <span className="flex items-center gap-2 text-sm text-green-400">
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        Warehouse Active
                    </span>
                </div>
            </header>

            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-[#111114] border border-[#27272a] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4 text-[#a1a1aa]">
                        <span className="text-sm font-semibold">Warehouse Products</span>
                        <Server size={18} />
                    </div>
                    <div className="text-3xl font-bold">{metrics?.warehouse_total?.toLocaleString() || 0}</div>
                    <div className="text-xs text-[#06b6d4] mt-2">+ Active SKU Index</div>
                </div>

                <div className="bg-[#111114] border border-[#27272a] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4 text-[#a1a1aa]">
                        <span className="text-sm font-semibold">Pending in Staging</span>
                        <Activity size={18} />
                    </div>
                    <div className="text-3xl font-bold text-yellow-500">{metrics?.staging_pending?.toLocaleString() || 0}</div>
                    <div className="text-xs text-yellow-500/70 mt-2">Awaiting validation...</div>
                </div>

                <div className="bg-[#111114] border border-[#27272a] rounded-xl p-6 md:col-span-2">
                    <div className="flex items-center justify-between mb-4 text-[#a1a1aa]">
                        <span className="text-sm font-semibold">ETL Pipeline Controls</span>
                        <Zap size={18} className="text-purple-400" />
                    </div>
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-[#a1a1aa] max-w-[200px]">Trigger manual extraction and load from raw scrapers to warehouse.</p>
                        <button 
                            onClick={triggerETL}
                            disabled={runningETL}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all
                                ${runningETL ? 'bg-purple-500/50 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-500'}`}
                        >
                            {runningETL ? <RefreshCw size={16} className="animate-spin" /> : <Database size={16} />}
                            {runningETL ? 'Processing...' : 'Run Incremental Load'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Tables */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Scrape Metrics */}
                <div className="bg-[#111114] border border-[#27272a] rounded-xl p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <BarChart3 size={18} className="text-[#06b6d4]" /> Scrape Success Metrics
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[#a1a1aa] border-b border-[#27272a]">
                                <tr>
                                    <th className="pb-3 font-medium">Timestamp</th>
                                    <th className="pb-3 font-medium">Platform</th>
                                    <th className="pb-3 font-medium">Items</th>
                                    <th className="pb-3 font-medium">Success</th>
                                    <th className="pb-3 font-medium text-right">Latency</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272a]">
                                {metrics?.recent_metrics?.length === 0 ? (
                                    <tr><td colSpan={5} className="py-8 text-center text-[#a1a1aa]">No ETL runs recorded yet.</td></tr>
                                ) : metrics?.recent_metrics?.map((m: any) => (
                                    <tr key={m.id}>
                                        <td className="py-3 text-[#a1a1aa]">{new Date(m.timestamp).toLocaleTimeString()}</td>
                                        <td className="py-3 font-medium">{m.platform}</td>
                                        <td className="py-3">{m.items_scraped}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded text-xs ${m.success_rate > 90 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {m.success_rate.toFixed(1)}%
                                            </span>
                                        </td>
                                        <td className="py-3 text-right">{m.latency_ms}ms</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* A/B Test Logs */}
                <div className="bg-[#111114] border border-[#27272a] rounded-xl p-6">
                    <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <AlertTriangle size={18} className="text-yellow-400" /> A/B Testing Results
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="text-[#a1a1aa] border-b border-[#27272a]">
                                <tr>
                                    <th className="pb-3 font-medium">Variant ID</th>
                                    <th className="pb-3 font-medium text-right">Total Impressions / Events</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[#27272a]">
                                {metrics?.ab_test_stats?.length === 0 ? (
                                    <tr><td colSpan={2} className="py-8 text-center text-[#a1a1aa]">No A/B test data collected yet.</td></tr>
                                ) : metrics?.ab_test_stats?.map((stat: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${stat.variant_id === 'A' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'}`}>
                                                Variant {stat.variant_id}
                                            </span>
                                        </td>
                                        <td className="py-4 text-right font-bold text-lg">{stat.c}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
