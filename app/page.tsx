'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    Zap,
    Terminal,
    Settings,
    Shield,
    Clock,
    TrendingUp,
    Wallet,
    Server,
    Globe,
    Play
} from 'lucide-react';

// --- Platform Data ---
const DEX_PLATFORMS = ['Orca', 'Raydium', 'Meteora', 'Kamino', 'Phoenix', 'OpenBook', 'Lifinity', 'Drift', 'Jupiter', 'Aldrin', 'Saros', 'Crema'];
const CEX_PLATFORMS = ['Binance', 'Coinbase', 'Kraken', 'OKX', 'Bybit', 'KuCoin', 'HTX', 'Gate.io', 'Bitget', 'MEXC', 'Bitfinex', 'Crypto.com'];
const ASSET_LIST = ['USDC', 'USDT', 'SOL', 'JitoSOL', 'wBTC', 'ETH', 'BONK', 'WIF', 'JUP', 'PYTH', 'HNT', 'RNDR'];
const FLASH_LOAN_PROVIDERS = ['Solend', 'Marginfi', 'Kamino Finance', 'Meteora Flash', 'Drift Protocol'];

// --- Type Definitions ---
type LogType = 'INFO' | 'CALC' | 'JITO' | 'SUCCESS' | 'ERROR';

interface LogEntry {
    id: number;
    type: LogType;
    message: string;
    timestamp: string;
}

interface Opportunity {
    id: string;
    asset: string;
    buyExchange: string;
    buyType: 'CEX' | 'DEX';
    sellExchange: string;
    sellType: 'CEX' | 'DEX';
    spread: number;
    timestamp: number;
}

// --- Helper Functions ---
const generateNowString = () => new Date().toISOString().split('T')[1].slice(0, 8);

// --- Component ---
export default function FlashLoanArbitrageDashboard() {
    const [logs, setLogs] = useState<LogEntry[]>([]);
    const [isMounted, setIsMounted] = useState(false);
    const [opportunities, setOpportunities] = useState<Opportunity[]>([]);

    // Configuration State
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [provider, setProvider] = useState<string>('Solend');
    const [isGasless, setIsGasless] = useState<boolean>(true);
    const [loanAmount, setLoanAmount] = useState<string>('1000');
    const [asset, setAsset] = useState<string>('USDC');
    const [jitoTipValue, setJitoTipValue] = useState<number>(50); // 0-90%

    const [isExecuting, setIsExecuting] = useState<boolean>(false);
    const logsEndRef = useRef<HTMLDivElement>(null);

    // Initial Mount & Mock Scanner
    useEffect(() => {
        setIsMounted(true);
        setLogs([
            { id: 1, type: 'INFO', message: 'System initialized. Connecting to RPC...', timestamp: generateNowString() },
            { id: 2, type: 'INFO', message: 'Address Lookup Tables (LUTs) Synced.', timestamp: generateNowString() },
            { id: 3, type: 'INFO', message: 'Connected to 24+ global DEX/CEX liquidity streams.', timestamp: generateNowString() }
        ]);

        // Simulate live scanning of 24 exchanges
        const interval = setInterval(() => {
            const newOpp: Opportunity = {
                id: Math.random().toString(36).substring(7),
                asset: ASSET_LIST[Math.floor(Math.random() * ASSET_LIST.length)],
                buyExchange: [...DEX_PLATFORMS, ...CEX_PLATFORMS][Math.floor(Math.random() * 24)],
                buyType: Math.random() > 0.5 ? 'DEX' : 'CEX',
                sellExchange: [...DEX_PLATFORMS, ...CEX_PLATFORMS][Math.floor(Math.random() * 24)],
                sellType: Math.random() > 0.5 ? 'DEX' : 'CEX',
                spread: Number((Math.random() * 2.5 + 0.1).toFixed(2)),
                timestamp: Date.now()
            };

            // Don't add if buy and sell exchange are exactly the same
            if (newOpp.buyExchange !== newOpp.sellExchange) {
                setOpportunities(prev => [newOpp, ...prev].slice(0, 8)); // Keep last 8
            }
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    // Auto-scroll logs
    useEffect(() => {
        logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [logs]);

    const addLog = (type: LogType, message: string) => {
        setLogs((prev) => [...prev, { id: prev.length + 1, type, message, timestamp: generateNowString() }]);
    };

    const handleExecuteOpportunity = (opp: Opportunity) => {
        setAsset(opp.asset);
        // We simulate that selecting an opportunity auto-fills the best parameters
        addLog('INFO', `Selected Route: ${opp.buyExchange} -> ${opp.sellExchange} (${opp.spread}% spread)`);
        executeArbitrage(opp);
    }

    const executeArbitrage = (opp?: Opportunity) => {
        if (!walletAddress) {
            addLog('ERROR', 'Execution failed: No Wallet Address provided.');
            return;
        }
        if (isExecuting) return;

        setIsExecuting(true);
        const routeString = opp
            ? `${opp.asset} -> ${opp.buyExchange} -> ${opp.sellExchange} -> ${opp.asset}`
            : `${asset} -> Token X -> SOL -> ${asset}`;

        const expectedSpread = opp ? opp.spread : 0.85;

        addLog('INFO', `Requesting Flash Loan of ${loanAmount} ${asset} from ${provider}...`);

        setTimeout(() => {
            addLog('CALC', `Route locked: ${routeString}`);
            addLog('CALC', `Building V0 Message with LUT compaction...`);
        }, 1500);

        setTimeout(() => {
            addLog('JITO', `Bundle simulating: Expected Profit +${expectedSpread}% (Tip: ${jitoTipValue}%)`);
            if (isGasless) {
                addLog('INFO', `Requesting Relayer Signature for Gasless Execution...`);
            }
        }, 3000);

        setTimeout(() => {
            const netProfit = (parseFloat(loanAmount) * (expectedSpread / 100)).toFixed(2);
            addLog('SUCCESS', `Atomic Tx Confirmed. Net Profit: $${netProfit} sent to ${walletAddress.slice(0, 4)}...${walletAddress.slice(-4)}`);
            setIsExecuting(false);
        }, 5000);
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200 font-mono selection:bg-cyan-900 selection:text-cyan-50">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-950/20 via-slate-950 to-slate-950"></div>

            {/* Top Navigation Bar */}
            <header className="relative z-10 flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-b border-slate-800/60 bg-slate-900/40 backdrop-blur-md">
                <div className="flex items-center space-x-3 mb-4 sm:mb-0">
                    <Zap className="w-6 h-6 text-cyan-400" />
                    <h1 className="text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        FLASH<span className="text-slate-100">ARB</span>_V2
                    </h1>
                </div>

                {/* Network Status Widget */}
                <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs uppercase tracking-wider">
                    <div className="flex items-center space-x-2">
                        <Globe className="w-4 h-4 text-purple-400" />
                        <span className="text-purple-400">Streams: 24 active</span>
                    </div>
                    <div className="hidden sm:block h-4 w-[1px] bg-slate-700"></div>
                    <div className="flex items-center space-x-2">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
                        </span>
                        <span className="text-cyan-400">Mode: V0 Optimized</span>
                    </div>
                    <div className="hidden sm:block h-4 w-[1px] bg-slate-700"></div>
                    <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">LUTs: Synced</span>
                    </div>
                </div>
            </header>

            {/* Main Grid Layout */}
            <main className="relative z-10 grid grid-cols-12 gap-6 p-6 min-h-[calc(100vh-73px)]">

                {/* LEFT COLUMN (Flash Loan Console & Analytics) */}
                <div className="col-span-12 xl:col-span-4 flex flex-col space-y-6">

                    {/* CONFIGURATION CONSOLE */}
                    <div className="p-6 border rounded-xl border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-[0_0_15px_rgba(0,0,0,0.5)] flex flex-col space-y-5">
                        <div className="flex items-center space-x-2 mb-2">
                            <Settings className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-lg font-semibold tracking-wide border-b border-cyan-900 pb-1 w-full text-slate-100">
                                CONFIGURATION
                            </h2>
                        </div>

                        {/* Top Inputs */}
                        <div className="space-y-4">
                            {/* Wallet Address */}
                            <div>
                                <label className="block text-[10px] text-slate-400 mb-1 flex items-center"><Wallet className="w-3 h-3 mr-1" /> RECEIVER WALLET (PUBKEY)</label>
                                <input
                                    type="text"
                                    placeholder="Enter Solana Wallet Address (e.g. 7X...)"
                                    value={walletAddress}
                                    onChange={(e) => setWalletAddress(e.target.value)}
                                    className="w-full bg-slate-950/50 px-3 py-2 text-sm text-cyan-100 border border-slate-700 rounded-md focus:border-cyan-500 outline-none transition-colors"
                                />
                            </div>

                            {/* Flash Loan Provider */}
                            <div>
                                <label className="block text-[10px] text-slate-400 mb-1 flex items-center"><Server className="w-3 h-3 mr-1" /> FLASH LOAN PROVIDER</label>
                                <select
                                    value={provider}
                                    onChange={(e) => setProvider(e.target.value)}
                                    className="w-full bg-slate-950/50 px-3 py-2 text-sm text-slate-200 border border-slate-700 rounded-md focus:border-cyan-500 outline-none transition-colors"
                                >
                                    {FLASH_LOAN_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
                                </select>
                            </div>

                            {/* Loan Amount & Asset */}
                            <div>
                                <label className="block text-[10px] text-slate-400 mb-1">LOAN AMOUNT & ASSET</label>
                                <div className="flex rounded-md overflow-hidden border border-slate-700 focus-within:border-cyan-500 transition-colors">
                                    <input
                                        type="number"
                                        value={loanAmount}
                                        onChange={(e) => setLoanAmount(e.target.value)}
                                        className="w-full bg-slate-950/50 px-3 py-2 text-sm text-slate-100 outline-none"
                                    />
                                    <select
                                        value={asset}
                                        onChange={(e) => setAsset(e.target.value)}
                                        className="bg-slate-800 text-sm text-slate-300 px-3 border-l border-slate-700 outline-none"
                                    >
                                        {ASSET_LIST.map(a => <option key={a} value={a}>{a}</option>)}
                                    </select>
                                </div>
                            </div>

                            {/* Jito Tip Slider */}
                            <div>
                                <div className="flex justify-between text-[10px] mb-1">
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
                            onClick={() => executeArbitrage()}
                            disabled={isExecuting || !walletAddress}
                            className={`relative w-full py-4 mt-2 rounded-md overflow-hidden font-bold tracking-widest transition-all ${isExecuting || !walletAddress
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_30px_rgba(6,182,212,0.6)]'
                                }`}
                        >
                            {isExecuting ? 'EXECUTING...' : 'MANUAL OVERRIDE'}
                            {(!isExecuting && walletAddress) && (
                                <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                            )}
                        </button>
                    </div>

                    {/* Analytics Gauges */}
                    <div className="p-6 border rounded-xl border-slate-800 bg-slate-900/50 backdrop-blur-sm flex flex-col">
                        <div className="flex items-center space-x-2 mb-4">
                            <TrendingUp className="w-5 h-5 text-cyan-400" />
                            <h2 className="text-lg font-semibold tracking-wide border-b border-cyan-900 pb-1 w-full text-slate-100">
                                PROFIT_ANALYTICS
                            </h2>
                        </div>

                        <div className="flex-1 flex flex-col justify-center space-y-5">
                            <div className="p-3 bg-slate-950 rounded-md border border-slate-800 font-mono text-[10px] sm:text-xs text-slate-400 text-center tracking-tighter">
                                P<sub className="text-[8px]">net</sub> = (R<sub className="text-[8px]">exp</sub> · (1-S)) - (A<sub className="text-[8px]">in</sub> · (1+F<sub className="text-[8px]">loan</sub>)) - T<sub className="text-[8px]">jito</sub> - F<sub className="text-[8px]">relayer</sub>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-slate-800/50 flex flex-col items-center justify-center border border-slate-700/50">
                                    <p className="text-[10px] text-slate-400 mb-1 tracking-wider uppercase">Baseline ROI</p>
                                    <p className="text-xl font-bold text-emerald-400">0.85%</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-800/50 flex flex-col items-center justify-center border border-slate-700/50">
                                    <p className="text-[10px] text-slate-400 mb-1 tracking-wider uppercase">Est. Net Profit</p>
                                    <p className="text-xl font-bold text-cyan-400">${(parseFloat(loanAmount) * 0.0085).toFixed(2)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN (Scanner & Terminal) */}
                <div className="col-span-12 xl:col-span-8 flex flex-col space-y-6 max-h-[calc(100vh-100px)]">

                    {/* Global Opportunity Scanner */}
                    <div className="flex-1 flex flex-col p-1 border rounded-xl border-slate-800 bg-slate-950 shadow-inner overflow-hidden relative min-h-[300px]">
                        <div className="flex justify-between items-center px-4 py-3 bg-slate-900 border-b border-slate-800">
                            <div className="flex items-center space-x-2">
                                <Activity className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold text-slate-300 tracking-widest uppercase">Global Opportunity Scanner</span>
                            </div>
                            <span className="text-[10px] text-slate-500 bg-slate-800 px-2 py-1 rounded">24 Platform Matrix</span>
                        </div>

                        {/* Table Header */}
                        <div className="grid grid-cols-5 gap-4 px-6 py-2 text-[10px] text-slate-500 border-b border-slate-800 uppercase tracking-widest bg-slate-950/80 sticky top-0 z-10">
                            <div className="col-span-1">Asset</div>
                            <div className="col-span-1">Buy At</div>
                            <div className="col-span-1">Sell At</div>
                            <div className="col-span-1 text-right">Spread</div>
                            <div className="col-span-1 text-right">Action</div>
                        </div>

                        {/* Scanner Feed */}
                        <div className="flex-1 overflow-y-hidden p-2 relative">
                            <AnimatePresence>
                                {isMounted && opportunities.map((opp) => (
                                    <motion.div
                                        key={opp.id}
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3 }}
                                        className="grid grid-cols-5 gap-4 px-4 py-3 mb-2 rounded border border-slate-800 bg-slate-900/40 hover:bg-slate-800/60 items-center text-xs transition-colors"
                                    >
                                        <div className="col-span-1 font-bold text-slate-200 flex items-center">
                                            <span className="w-2 h-2 rounded-full bg-cyan-500 mr-2 blink"></span>
                                            {opp.asset}
                                        </div>
                                        <div className="col-span-1 text-red-300 flex items-center">
                                            {opp.buyExchange} <span className="text-[9px] ml-1 bg-red-900/30 px-1 rounded text-red-500">{opp.buyType}</span>
                                        </div>
                                        <div className="col-span-1 text-emerald-300 flex items-center">
                                            {opp.sellExchange} <span className="text-[9px] ml-1 bg-emerald-900/30 px-1 rounded text-emerald-500">{opp.sellType}</span>
                                        </div>
                                        <div className="col-span-1 text-right font-mono text-cyan-400 font-bold">
                                            +{opp.spread}%
                                        </div>
                                        <div className="col-span-1 flex justify-end">
                                            <button
                                                onClick={() => handleExecuteOpportunity(opp)}
                                                disabled={isExecuting || !walletAddress}
                                                className={`flex items-center space-x-1 px-3 py-1.5 rounded text-[10px] font-bold tracking-wider transition-all ${isExecuting || !walletAddress
                                                        ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700'
                                                        : 'bg-emerald-900/40 text-emerald-400 hover:bg-emerald-500 hover:text-slate-950 border border-emerald-800 hover:border-emerald-400'
                                                    }`}
                                            >
                                                <Play className="w-3 h-3" />
                                                <span>EXECUTE</span>
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                        {/* Scanline */}
                        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] opacity-30 z-20"></div>
                    </div>

                    {/* Live Log Terminal */}
                    <div className="h-64 flex flex-col p-1 border rounded-xl border-slate-800 bg-slate-950 shadow-inner overflow-hidden relative shrink-0">
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
