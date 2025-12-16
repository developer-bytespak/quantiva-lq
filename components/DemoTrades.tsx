'use client'

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Activity, Zap, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  AnimatedCard,
  CardBody,
  CardDescription,
  CardTitle,
  CardVisual,
} from "@/components/ui/animated-card-chart";
import { Visual3 } from "@/components/ui/animated-card-chart";

interface Trade {
  asset: string;
  entry: number;
  exit: number;
  pnl: string;
  strategy: string;
  duration: string;
}

interface Opportunity {
  asset: string;
  signal: string;
}

const TradingReplay: React.FC = () => {
  const [phase, setPhase] = useState<'idle' | 'scan' | 'opportunities' | 'trades' | 'summary'>('idle');
  const [scanMessage, setScanMessage] = useState('');
  const [scanProgress, setScanProgress] = useState(0);
  const [visibleOpportunities, setVisibleOpportunities] = useState<Opportunity[]>([]);
  const [visibleTrades, setVisibleTrades] = useState<Trade[]>([]);
  const [hasAnimated, setHasAnimated] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const simulationAbortRef = useRef<{ aborted: boolean }>({ aborted: false });
  const simulationRunningRef = useRef(false);

  const scanMessages = [
    "Analyzing Market Volatility...",
    "Scanning 128 Assets...",
    "Detecting Momentum Shifts...",
    "Evaluating Sentiment Signals..."
  ];

  const opportunities: Opportunity[] = [
    { asset: "BTC/USDT", signal: "Oversold reversal — high conviction" },
    { asset: "ETH/USDT", signal: "Breakout pattern — volume surge" },
    { asset: "AAPL/USD", signal: "Earnings beat — sustained momentum" },
    { asset: "NVDA/USD", signal: "Analyst upgrade — strong directional bias" }
  ];

  const trades: Trade[] = [
    { asset: "BTC/USDT", entry: 43210, exit: 43540, pnl: "+0.81%", strategy: "Mean Reversion", duration: "38s" },
    { asset: "ETH/USDT", entry: 2190, exit: 2202, pnl: "+0.55%", strategy: "Breakout", duration: "42s" },
    { asset: "NVDA/USD", entry: 410.5, exit: 420.8, pnl: "+2.49%", strategy: "Event-Driven", duration: "2h" }
  ];

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Intersection Observer for scroll detection — allow replay on every entry
  useEffect(() => {
    const startSimulation = async () => {
      if (simulationRunningRef.current) return;
      simulationRunningRef.current = true;
      setHasAnimated(true);
      simulationAbortRef.current.aborted = false;

      setVisibleOpportunities([]);
      setVisibleTrades([]);
      setScanProgress(0);
      setScanMessage('');

      // Phase 1: Scanning
      setPhase('scan');
      for (let i = 0; i < scanMessages.length; i++) {
        if (simulationAbortRef.current.aborted) { simulationRunningRef.current = false; return; }
        setScanMessage(scanMessages[i]);
        setScanProgress((i + 1) / scanMessages.length * 100);
        await sleep(500);
      }
      if (simulationAbortRef.current.aborted) { simulationRunningRef.current = false; return; }
      await sleep(400);

      // Phase 2: Opportunities
      setPhase('opportunities');
      for (let i = 0; i < opportunities.length; i++) {
        if (simulationAbortRef.current.aborted) { simulationRunningRef.current = false; return; }
        await sleep(600);
        setVisibleOpportunities(prev => [...prev, opportunities[i]]);
      }
      if (simulationAbortRef.current.aborted) { simulationRunningRef.current = false; return; }
      await sleep(1000);

      // Phase 3: Trades
      setPhase('trades');
      for (let i = 0; i < trades.length; i++) {
        if (simulationAbortRef.current.aborted) { simulationRunningRef.current = false; return; }
        await sleep(1200);
        setVisibleTrades(prev => [...prev, trades[i]]);
      }

      simulationRunningRef.current = false;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
          if (entry.isIntersecting) {
            startSimulation();
          } else {
            // Abort running simulation and reset so it can replay on next entry
            simulationAbortRef.current.aborted = true;
            simulationRunningRef.current = false;
            setHasAnimated(false);
            setPhase('idle');
            setVisibleOpportunities([]);
            setVisibleTrades([]);
            setScanProgress(0);
            setScanMessage('');
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    const currentSection = sectionRef.current;
    if (currentSection) observer.observe(currentSection);

    return () => {
      if (currentSection) observer.unobserve(currentSection);
      simulationAbortRef.current.aborted = true;
    };
  }, []);

  const getPnlColor = (pnl: string) => {
    return pnl.startsWith('+') ? 'text-cyan-400' : 'text-rose-400';
  };

  const getPnlGlow = (pnl: string) => {
    return pnl.startsWith('+') ? 'shadow-cyan-500/30' : 'shadow-rose-500/30';
  };

  return (
      <div ref={sectionRef} className="min-h-screen relative overflow-hidden flex items-center justify-center py-8 sm:py-10 md:py-12">
      {/* Space-themed background matching HowItWorks and Footer */}
      <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to bottom, #000000 0%, #0a0a1a 30%, #0a0a1a 50%, #050505 70%, #000000 90%, #000000 100%)' }}>
        {/* Stars layer */}
        <div className="absolute inset-0 space-stars" />
        {/* Deep space gradient overlay - vertical only for consistency */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-blue-900/10" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extralight text-white tracking-tight leading-none">
            Trading
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f86c24] via-[#ffa500] to-[#ffd700] animate-gradient">  Intelligence</span>
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm md:text-lg lg:text-xl font-light max-w-2xl mx-auto leading-relaxed mt-2 sm:mt-3 px-2">Experience autonomous execution powered by adaptive algorithms</p>
        </div>

        {/* Main Container */}
        <div ref={containerRef} className="relative min-h-[520px] flex items-center justify-center">
          
          {/* Scanning Phase */}
          {phase === 'scan' && (
            <div className="w-full max-w-6xl animate-appear">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
                
                {/* Main card */}
                <div className="relative backdrop-blur-xl bg-white/2 border border-transparent/10 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-8 md:p-10 shadow-xl">
                  {/* Animated mesh background */}
                  <div className="absolute inset-0 opacity-30 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem]">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 animate-mesh"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-xl animate-pulse-glow"></div>
                        <Activity className="text-cyan-400 relative z-10" size={40} strokeWidth={1.5} />
                      </div>
                      <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extralight text-white tracking-wider text-center">Analyzing Markets</h2>
                    </div>
                    
                    {/* Fluid wave visualization */}
                    <div className="relative h-48 sm:h-56 md:h-64 rounded-2xl sm:rounded-3xl overflow-hidden mb-6 sm:mb-8 bg-gradient-to-b from-cyan-950/20 to-transparent border border-white/[0.05]">
                      <div className="absolute inset-0 flex items-end justify-center gap-0.5 sm:gap-1 px-2 sm:px-4">
                        {[...Array(80)].map((_, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-gradient-to-t from-cyan-500/40 via-cyan-400/30 to-transparent rounded-full transition-all duration-700 ease-out"
                            style={{
                              height: `${20 + Math.sin(i * 0.3 + Date.now() * 0.002) * 40}%`,
                              animationDelay: `${i * 20}ms`
                            }}
                          ></div>
                        ))}
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/10 to-cyan-500/5 animate-wave"></div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4 sm:mb-6">
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${scanProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-cyan-300 text-base sm:text-lg md:text-2xl font-light tracking-wide transition-all duration-500">{scanMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Opportunities Phase */}
          {phase === 'opportunities' && (
            <div className="w-full max-w-6xl  animate-appear">
              <div className="relative group">
                <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-r from-purple-500/5 via-pink-500/5 to-cyan-500/5 blur-3xl opacity-40 pointer-events-none" />

                <div className="relative backdrop-blur-xl bg-white/2 border border-transparent/10 rounded-[3rem] p-6 sm:p-8 md:p-10 shadow-xl">
                    <div className="flex items-center justify-center gap-2 sm:gap-4 mb-4 sm:mb-6 flex-wrap">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-xl animate-pulse-glow" />
                        <Zap className="text-purple-400 relative z-10" size={40} strokeWidth={1.5} />
                      </div>
                      <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extralight text-white tracking-wider text-center">Actionable Market Signals</h2>
                    </div>
                    <p className="text-gray-400 text-xs sm:text-sm md:text-base max-w-2xl text-center mx-auto mb-4 sm:mb-6 px-2">High‑conviction setups surfaced by adaptive algorithms — real‑time, prioritized insights ready for execution.</p>

                  {/* Fixed-height container prevents reflow when cards append */}
                  <div className="min-h-[420px] gap-8  space-y-6">
                    {/* Provide placeholder (fixed size) so the layout is stable while items load */}
                    {visibleOpportunities.length === 0 && (
                      <div className="w-full flex items-center justify-center h-40">
                        <div className="text-gray-400">Scanning markets for high‑conviction setups...</div>
                      </div>
                    )}

                    {visibleOpportunities.map((opp, idx) => (
                        <div
                        key={opp.asset}
                        className="relative animate-slideUp transform-gpu"
                        style={{ animationDelay: `${idx * 160}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/8 to-cyan-500/8 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
                        <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.05] to-white/[0.02] border border-white/[0.06] rounded-2xl p-3 sm:p-4 hover:scale-[1.01] transform transition-transform duration-300 flex items-center">
                          <div className="flex items-center justify-between w-full gap-2">
                            <div className="flex items-center gap-2 sm:gap-4 flex-1">
                              <div className="p-1.5 sm:p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 flex-shrink-0">
                                <CheckCircle className="text-purple-400" size={20} strokeWidth={1.4} />
                              </div>
                              <div className="min-w-0">
                                <span className="text-white font-light text-sm sm:text-lg block mb-0.5">{opp.asset}</span>
                                <span className="text-gray-400 text-xs sm:text-sm font-light line-clamp-1 sm:line-clamp-none">{opp.signal}</span>
                              </div>
                            </div>

                            <div className="px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-gradient-to-r from-purple-500/8 to-cyan-500/8 border border-purple-400/20 flex-shrink-0">
                              <span className="text-purple-300 text-[0.65rem] sm:text-xs font-medium tracking-widest uppercase">Active</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Trading Phase */}
          {phase === 'trades' && (
            <div className="w-full max-w-6xl animate-appear">
              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] bg-white/2 blur-xl opacity-20 pointer-events-none"></div>
                
                <div className="relative backdrop-blur-xl bg-white/2 border border-transparent/10 rounded-[2rem] sm:rounded-[2.5rem] md:rounded-[3rem] p-6 sm:p-8 md:p-10 shadow-xl">
                  <div className="flex items-center justify-center gap-2 sm:gap-4 mb-6 sm:mb-8 flex-wrap">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-xl animate-pulse-glow"></div>
                      <TrendingUp className="text-cyan-400 relative z-10" size={40} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-extralight text-white tracking-wider text-center">Live Execution</h2>
                  </div>
                  
                  <div className="min-h-[420px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 justify-items-center items-start">
                    {visibleTrades.map((trade, idx) => {
                      const isPositive = trade.pnl.startsWith('+');
                      
                      // Different color schemes for each card with darker colors
                      const colorSchemes = [
                        {
                          main: '#0891b2',      // cyan-600 (darker)
                          secondary: '#06b6d4',  // cyan-500
                          bg: 'bg-cyan-600/10',
                          icon: 'text-cyan-500',
                          text: 'text-cyan-500',
                          percentage1: '+12.4%',
                          percentage2: '+15.8%'
                        },
                        {
                          main: '#9333ea',      // purple-600 (darker)
                          secondary: '#a855f7',  // purple-500
                          bg: 'bg-purple-600/10',
                          icon: 'text-purple-500',
                          text: 'text-purple-500',
                          percentage1: '+18.2%',
                          percentage2: '+22.1%'
                        },
                        {
                          main: '#d97706',      // amber-600 (darker)
                          secondary: '#f59e0b',  // amber-500
                          bg: 'bg-amber-600/10',
                          icon: 'text-amber-500',
                          text: 'text-amber-500',
                          percentage1: '+9.7%',
                          percentage2: '+13.5%'
                        }
                      ];
                      
                      const colors = colorSchemes[idx % colorSchemes.length];
                      const mainColor = isPositive ? colors.main : '#dc2626'; // red-600 for negative (darker)
                      const secondaryColor = isPositive ? colors.secondary : '#ef4444'; // red-500 for negative
                      
                      return (
                        <div
                          key={idx}
                          className="animate-slideUp w-full flex justify-center"
                          style={{ animationDelay: `${idx * 200}ms` }}
                        >
                          <AnimatedCard className="w-full max-w-[280px] sm:max-w-[320px] md:max-w-[356px] border-white/[0.1] bg-gradient-to-br from-white/[0.08] to-white/[0.03] backdrop-blur-xl dark:border-white/[0.1] dark:bg-gradient-to-br dark:from-white/[0.08] dark:to-white/[0.03]">
                            <CardVisual className="w-full">
                              <Visual3 
                                mainColor={mainColor} 
                                secondaryColor={secondaryColor}
                                gridColor="#80808015"
                                percentage1={colors.percentage1}
                                percentage2={colors.percentage2}
                              />
                            </CardVisual>
                            <CardBody className="border-white/[0.08] dark:border-white/[0.08] p-3 sm:p-4 md:p-5">
                              <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <CardTitle className="text-white dark:text-white text-base sm:text-lg md:text-xl lg:text-2xl font-semibold tracking-tight">
                                    {trade.asset}
                                  </CardTitle>
                                  <div className={`px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-lg ${isPositive ? colors.bg : 'bg-rose-500/10'} border ${isPositive ? 'border-cyan-500/20' : 'border-rose-500/20'}`}>
                                    {isPositive ? (
                                      <ArrowUpRight className={colors.icon} size={15} strokeWidth={2} />
                                    ) : (
                                      <ArrowDownRight className="text-rose-400" size={15} strokeWidth={2} />
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="inline-flex items-center px-2 sm:px-2.5 md:px-3 py-0.5 sm:py-1 md:py-1.5 rounded-full bg-gradient-to-r from-white/[0.05] to-white/[0.02] border border-white/[0.1] mb-3 sm:mb-5">
                                <CardDescription className="text-gray-300 dark:text-gray-300 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.1em] sm:tracking-[0.12em] md:tracking-[0.15em] font-medium">
                                  {trade.strategy}
                                </CardDescription>
                              </div>
                              
                              <div className="space-y-2 sm:space-y-2.5 md:space-y-3.5 mb-3 sm:mb-5">
                                <div className="flex justify-between items-center group/item">
                                  <span className="text-gray-400 dark:text-gray-400 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.09em] sm:tracking-[0.1em] md:tracking-[0.12em] font-medium">Entry</span>
                                  <span className="text-white dark:text-white text-xs sm:text-sm md:text-base font-semibold tracking-tight">${trade.entry.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center group/item">
                                  <span className="text-gray-400 dark:text-gray-400 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.09em] sm:tracking-[0.1em] md:tracking-[0.12em] font-medium">Exit</span>
                                  <span className="text-white dark:text-white text-xs sm:text-sm md:text-base font-semibold tracking-tight">${trade.exit.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between items-center group/item">
                                  <span className="text-gray-400 dark:text-gray-400 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.09em] sm:tracking-[0.1em] md:tracking-[0.12em] font-medium">Duration</span>
                                  <div className="flex items-center gap-1">
                                    <Activity className="text-gray-500" size={12} strokeWidth={2} />
                                    <span className="text-white dark:text-white text-xs sm:text-sm md:text-base font-semibold tracking-tight">{trade.duration}</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="pt-2.5 sm:pt-4 md:pt-5 border-t border-white/[0.1] dark:border-white/[0.1]">
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400 dark:text-gray-400 text-[9px] sm:text-[10px] md:text-[11px] uppercase tracking-[0.09em] sm:tracking-[0.1em] md:tracking-[0.12em] font-medium">Return</span>
                                  <div className="flex items-baseline gap-0.5 sm:gap-1">
                                    <span className={`text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold ${isPositive ? colors.text : 'text-rose-400'} tracking-tight`}>
                                      {trade.pnl}
                                    </span>
                                    <div className={`h-0.5 w-0.5 sm:h-1 sm:w-1 md:h-1.5 md:w-1.5 rounded-full ${isPositive ? colors.text : 'text-rose-400'} ${isPositive ? 'bg-cyan-500' : 'bg-rose-400'} opacity-60`}></div>
                                  </div>
                                </div>
                              </div>
                            </CardBody>
                          </AnimatedCard>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -30px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }

        @keyframes float-delayed {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-30px, 30px) scale(1.05); }
          66% { transform: translate(20px, -20px) scale(0.95); }
        }

        @keyframes float-slow {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(15px, 15px) scale(1.08); }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-float-slow {
          animation: float-slow 30s ease-in-out infinite;
        }

        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease infinite;
        }

        @keyframes mesh {
          0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.3; }
          50% { transform: translate(10px, 10px) scale(1.05); opacity: 0.5; }
        }

        .animate-mesh {
          animation: mesh 10s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.2); }
        }

        .animate-pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        @keyframes wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        .animate-wave {
          animation: wave 4s ease-in-out infinite;
        }

        @keyframes appear {
          from {
            opacity: 0;
            transform: scale(0.96) translateY(20px);
            filter: blur(10px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
            filter: blur(0);
          }
        }

        .animate-appear {
          animation: appear 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1);
          animation-fill-mode: both;
          will-change: transform, opacity;
          backface-visibility: hidden;
        }

        @keyframes scaleUp {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scaleUp {
          animation: scaleUp 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .stars, .stars2, .stars3 {
          position: absolute;
          width: 100%;
          height: 100%;
          background: transparent;
        }

        .stars {
          background-image: 
            radial-gradient(1px 1px at 20px 30px, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 60px 70px, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 50px 50px, rgba(255,255,255,0.2), transparent),
            radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.3), transparent);
          background-repeat: repeat;
          background-size: 200px 200px;
          animation: starsMove 200s linear infinite;
        }

        .stars2 {
          background-image: 
            radial-gradient(1px 1px at 100px 120px, rgba(100,200,255,0.3), transparent),
            radial-gradient(1px 1px at 150px 160px, rgba(150,100,255,0.3), transparent);
          background-repeat: repeat;
          background-size: 300px 300px;
          animation: starsMove 300s linear infinite;
        }

        .stars3 {
          background-image: 
            radial-gradient(1px 1px at 75px 75px, rgba(139, 92, 246, 0.4), transparent);
          background-repeat: repeat;
          background-size: 400px 400px;
          animation: starsMove 400s linear infinite;
        }

        @keyframes starsMove {
          from { transform: translateY(0); }
          to { transform: translateY(-2000px); }
        }
      `}</style>
    </div>
  );
};

export default TradingReplay;