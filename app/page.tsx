'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Zap,
    Terminal,
    BarChart2,
    Settings,
    Shield,
    Clock,
    ArrowRightLeft,
    DollarSign,
    TrendingUp,
    AlertTriangle
} from 'lucide-react';

// --- Type Definitions ---
type LogType = 'INFO' | 'CALC' | 'JITO' | 'SUCCESS' | 'ERROR';

interface LogEntry {
    id: number;
    type: LogType;
    message: string;
    timestamp: string;
}

interface DiscrepancyData {
    exchange: string;
    price: number;
    volatility: number;
}

// --- Helper Functions ---
const generateNowString = () => new Date().toISOString().split('T')[1].slice(0, 8);

// --- Component ---
export default function FlashLoanArbitrageDashboard() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        setLogs([
            { id: 1, type: 'INFO', message: 'System initialized. Connecting to RPC...', timestamp: generateNowString() },
            { id: 2, type: 'INFO', message: 'Address Lookup Tables (LUTs) Synced.', timestamp: generateNowString() },
        ]);
    }, []);
    const [isGasless, setIsGasless] = useState<boolean>(true);
    const [loanAmount, setLoanAmount] = useState<string>('1000');
    const [asset, setAsset] = useState<string>('USDC');
    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const [jitoTipValue, setJitoTipValue] = useState<number>(50); // 0-90%

    const logsEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const addLog = (type: LogType, message: string) => {
        setLogs((prev) => [...prev, { id: prev.length + 1, type, message, timestamp: generateNowString() }]);
    };

    const executeArbitrage = () => {
        if (isExecuting) return;
        setIsExecuting(true);
        addLog('INFO', `Scanning Liquidity Pools for ${loanAmount} ${asset} route...`);

        setTimeout(() => {
            addLog('CALC', `Route found: ${asset} -> Token X -> SOL -> ${asset}`);
            addLog('CALC', `Building V0 Message with LUT compaction...`);
        }, 1500);

        setTimeout(() => {
            addLog('JITO', `Bundle simulating: Expected Profit +0.85% (Tip: ${jitoTipValue}%)`);
            if (isGasless) {
                addLog('INFO', `Requesting Relayer Signature for Gasless Execution...`);
            }
        }, 3000);

        setTimeout(() => {
            const netProfit = (parseFloat(loanAmount) * 0.0085).toFixed(2);
            addLog('SUCCESS', `Atomic Tx Confirmed. Net Profit: $${netProfit}`);
            setIsExecuting(false);
        }, 5000);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono selection:bg-cyan-900 selection:text-cyan-50">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-slate-950"></div>

            {/* Top Navigation Bar */}
            <header className="relative z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md">
                <div className="flex items-center space-x-3">
                    <Zap className="w-6 h-6 text-cyan-400" />
                    <h1 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        FLASH<span className="text-slate-100">ARB</span>_V0
                    </h1>
                </div>

                {/* Network Status Widget */}
                <div className="flex items-center space-x-6 text-xs uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <span className="text-cyan-400">Mode: V0 Optimized</span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-700"></div>
                    <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">LUTs: Synced</span>
                    </div>
                    <div className="h-4 w-[1px] bg-slate-700"></div>
                    <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-400">ping: 12ms</span>
                    </div>
                </div>
            </header>

            {/* Main Grid Layout */}
            <main className="relative z-10 grid grid-cols-12 gap-6 p-6 h-[calc(100vh-73px)]">

                {/* LEFT COLUMN (Flash Loan Console & Analytics) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col space-y-6">

                    {/* Flash Loan Console */}
                    <div className="p-6 border rounded-xl border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col space-y-6">
                        <div className="flex items-center space-x-2 mb-2">
                            <Settings className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-lg font-semibold tracking-wide border-b border-cyan-900 pb-1 w-full text-slate-100">
                                EXECUTION_CONSOLE
                            </h2>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs text-slate-400 mb-1">LOAN AMOUNT</label>
                                <div className="flex rounded-md overflow-hidden border border-slate-700 focus-within:border-cyan-500 transition-colors">
                                    <input
                                        type="number"
                                        value={loanAmount}
                                        onChange={(e) => setLoanAmount(e.target.value)}
                                        className="w-full bg-slate-950/50 px-3 py-2 text-slate-100 outline-none"
                                    />
                                    <select
                                        value={asset}
                                        onChange={(e) => setAsset(e.target.value)}
                                        className="bg-slate-800 text-slate-300 px-3 border-l border-slate-700 outline-none"
                                    >
                                        <option value="USDC">USDC</option>
                                        <option value="SOL">SOL</option>
                                        <option value="JitoSOL">JitoSOL</option>
                                    </select>
                                </div>
                            </div>

                            {/* Jito Tip Slider */}
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-slate-400">VALIDATOR TIP (JITO)</span>
                                    <span className="text-cyan-400">{jitoTipValue}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="90"
                                    value={jitoTipValue}
                                    onChange={(e) => setJitoTipValue(Number(e.target.value))}
                                    className="w-full accent-cyan-500 h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                                />
                            </div>

                            {/* Gasless Toggle */}
                            <div className="flex items-center justify-between p-3 rounded-md bg-slate-950/50 border border-slate-800">
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium text-slate-200">Gasless Mode</span>
                                    <span className="text-xs text-slate-500">Relayer pays base fee</span>
                                </div>
                                <button
                                    onClick={() => setIsGasless(!isGasless)}
                                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ease-in-out ${isGasless ? 'bg-cyan-500' : 'bg-slate-700'
                                        }`}
                                >
                                    <motion.div
                                        className="w-4 h-4 bg-white rounded-full shadow-sm"
                                        animate={{ x: isGasless ? 24 : 0 }}
                                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                                    />
                                </button>
                            </div>
                        </div>

                        {/* Execute Button */}
                        <button
                            onClick={executeArbitrage}
                            disabled={isExecuting}
                            className={`relative w-full py-4 rounded-md overflow-hidden font-bold tracking-widest transition-all ${isExecuting
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                                }`}
                        >
                            {isExecuting ? 'EXECUTING...' : 'INITIATE ARBITRAGE'}
                            {!isExecuting && (
                                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                            )}
                        </button>
                    </div>

                    {/* Analytics Gauges */}
                    <div className="flex-1 p-6 border rounded-xl border-slate-800 bg-slate-900/50 backdrop-blur-sm flex flex-col">
                        <div className="flex items-center space-x-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-lg font-semibold tracking-wide border-b border-cyan-900 pb-1 w-full text-slate-100">
                                PROFIT_ANALYTICS
                            </h2>
                        </div>

                        <div className="flex-1 flex flex-col justify-center space-y-6">
                            {/* Formula Rendered as text */}
                            <div className="p-3 bg-slate-950 rounded-md border border-slate-800 font-mono text-[10px] sm:text-xs text-slate-400 text-center tracking-tighter">
                                P<sub className="text-[8px]">net</sub> = (R<sub className="text-[8px]">exp</sub> · (1-S)) - (A<sub className="text-[8px]">in</sub> · (1+F<sub className="text-[8px]">loan</sub>)) - T<sub className="text-[8px]">jito</sub> - F<sub className="text-[8px]">relayer</sub>
                            </div>

                            {/* Gauges Placeholder */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-slate-800/50 flex flex-col items-center justify-center border border-slate-700/50">
                                    <p className="text-xs text-slate-400 mb-1">Expected ROI</p>
                                    <p className="text-2xl font-bold text-emerald-400">0.85%</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-800/50 flex flex-col items-center justify-center border border-slate-700/50">
                                    <p className="text-xs text-slate-400 mb-1">Est. Net Profit</p>
                                    <p className="text-2xl font-bold text-cyan-400">${(parseFloat(loanAmount) * 0.0085).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (Charts & Terminal) */}
                <div className="col-span-12 lg:col-span-8 flex flex-col space-y-6">

                    {/* Discrepancy Charts (Placeholder blocks) */}
                    <div className="h-48 flex space-x-4">
                        {['ORCA', 'RAYDIUM', 'METEORA'].map((exchange, idx) => (
                            <div key={exchange} className="flex-1 p-4 border rounded-xl border-slate-800 bg-slate-900/50 backdrop-blur-sm flex flex-col relative overflow-hidden group">
                                {/* Abstract grid background */}
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMCIgaGVpZ2h0PSIyMCI+PHBhdGggZD0iTTAgMGgyMHYyMEgwem0xIDE5aDE4VjFIMXoiIGZpbGw9IiMzMzQxNTUiIGZpbGwtb3BhY2l0eT0iMC4xIi8+PC9zdmc+')] opacity-20 group-hover:opacity-40 transition-opacity"></div>

                                <div className="flex justify-between items-center mb-2 relative z-10">
                                    <span className="text-xs font-bold text-slate-400 tracking-wider">{exchange}</span>
                                    <Activity className={`w-4 h-4 ${idx === 0 ? 'text-emerald-500' : idx === 1 ? 'text-red-500' : 'text-cyan-500'}`} />
                                </div>

                                <div className="flex-1 flex items-end relative z-10">
                                    {/* Mock Chart Bars */}
                                    <div className="w-full flex justify-between items-end h-full px-2 space-x-1">
                                        {[40, 60, 30, 80, 50, 90, 45].map((height, i) => (
                                            <motion.div
                                                key={i}
                                                className={`w-full rounded-t-sm opacity-60 ${idx === 0 ? 'bg-emerald-500' : idx === 1 ? 'bg-red-500' : 'bg-cyan-500'}`}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                transition={{ duration: 1, delay: i * 0.1, repeat: Infinity, repeatType: 'reverse', repeatDelay: Math.random() * 2 }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Live Log Terminal */}
                    <div className="flex-1 p-1 border rounded-xl border-slate-800 bg-slate-950 shadow-inner overflow-hidden flex flex-col relative">
                        <div className="flex items-center space-x-2 px-4 py-2 bg-slate-900 border-b border-slate-800">
                            <Terminal className="w-4 h-4 text-slate-400" />
                            <span className="text-xs text-slate-400 tracking-widest uppercase">sys.log</span>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto font-mono text-[11px] sm:text-xs text-slate-300 space-y-2 relative">
                            <AnimatePresence>
                                {isMounted && logs.map((log) => {
                                    let colorClass = 'text-slate-300';
                                    let bgClass = 'bg-transparent';

                                    if (log.type === 'INFO') colorClass = 'text-blue-400';
                                    if (log.type === 'CALC') colorClass = 'text-cyan-400';
                                    if (log.type === 'JITO') colorClass = 'text-fuchsia-400';
                                    if (log.type === 'SUCCESS') {
                                        colorClass = 'text-emerald-400 font-bold';
                                        bgClass = 'bg-emerald-900/20 px-2 py-1 rounded';
                                    }
                                    if (log.type === 'ERROR') {
                                        colorClass = 'text-red-400 font-bold';
                                        bgClass = 'bg-red-900/20 px-2 py-1 rounded';
                                    }

                                    return (
                                        <motion.div
                                            key={log.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className={`flex items-start space-x-3 ${bgClass}`}
                                        >
                                            <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                                            <span className={`font-semibold shrink-0 ${colorClass}`}>[{log.type}]</span>
                                            <span className="text-slate-200">{log.message}</span>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                            <div ref={logsEndRef} />
                        </div>

                        {/* Terminal Scanline Overlay */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] opacity-20"></div>
                    </div>
                </div>

            </main>
        </div>
    );
}
