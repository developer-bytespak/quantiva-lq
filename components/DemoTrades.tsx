'use client'

import React, { useState, useEffect, useRef } from 'react';
import { TrendingUp, Activity, Zap, CheckCircle, ArrowUpRight, ArrowDownRight } from 'lucide-react';

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

  const scanMessages = [
    "Analyzing Market Volatility...",
    "Scanning 128 Assets...",
    "Detecting Momentum Shifts...",
    "Evaluating Sentiment Signals..."
  ];

  const opportunities: Opportunity[] = [
    { asset: "BTC/USDT", signal: "Oversold Reversal" },
    { asset: "ETH/USDT", signal: "Breakout Pattern" },
    { asset: "SOL/USDT", signal: "Trend Acceleration" }
  ];

  const trades: Trade[] = [
    { asset: "BTC/USDT", entry: 43210, exit: 43540, pnl: "+0.81%", strategy: "Mean Reversion", duration: "38s" },
    { asset: "ETH/USDT", entry: 2190, exit: 2202, pnl: "+0.55%", strategy: "Breakout", duration: "42s" },
    { asset: "SOL/USDT", entry: 98.4, exit: 97.8, pnl: "-0.23%", strategy: "Momentum", duration: "35s" }
  ];

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  // Intersection Observer for scroll detection
  useEffect(() => {
    const startSimulation = async () => {
      if (hasAnimated) return;
      
      setHasAnimated(true);
      setVisibleOpportunities([]);
      setVisibleTrades([]);
      setScanProgress(0);
      
      // Phase 1: Scanning
      setPhase('scan');
      for (let i = 0; i < scanMessages.length; i++) {
        setScanMessage(scanMessages[i]);
        setScanProgress((i + 1) / scanMessages.length * 100);
        await sleep(500);
      }
      
      await sleep(400);
      
      // Phase 2: Opportunities
      setPhase('opportunities');
      for (let i = 0; i < opportunities.length; i++) {
        await sleep(600);
        setVisibleOpportunities(prev => [...prev, opportunities[i]]);
      }
      
      await sleep(1000);
      
      // Phase 3: Trades
      setPhase('trades');
      for (let i = 0; i < trades.length; i++) {
        await sleep(1200);
        setVisibleTrades(prev => [...prev, trades[i]]);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsIntersecting(entry.isIntersecting);
          // Start animation when section comes into view
          if (entry.isIntersecting && !hasAnimated) {
            startSimulation();
          }
        });
      },
      { 
        threshold: 0.15, // Trigger when 15% of the section is visible
        rootMargin: '0px 0px -50px 0px' // Start slightly before the section is fully visible
      }
    );

    // Observe the main section container
    const currentSection = sectionRef.current;
    if (currentSection) {
      observer.observe(currentSection);
    }

    return () => {
      if (currentSection) {
        observer.unobserve(currentSection);
      }
    };
  }, [hasAnimated]);

  const getPnlColor = (pnl: string) => {
    return pnl.startsWith('+') ? 'text-cyan-400' : 'text-rose-400';
  };

  const getPnlGlow = (pnl: string) => {
    return pnl.startsWith('+') ? 'shadow-cyan-500/30' : 'shadow-rose-500/30';
  };

  return (
    <div ref={sectionRef} className="min-h-screen bg-black relative overflow-hidden flex items-center justify-center py-20">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      {/* Gradient orbs with smoother animation */}
      <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px] animate-float"></div>
      <div className="absolute bottom-20 right-1/4 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-float-delayed"></div>
      <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-cyan-600/10 rounded-full blur-[80px] animate-float-slow"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 w-full">
        {/* Header */}
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <div className="px-6 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/20 backdrop-blur-xl">
              <span className="text-cyan-400 text-sm font-light tracking-[0.2em] uppercase">Live Trading Intelligence</span>
            </div>
          </div>
          <h1 className="text-7xl md:text-8xl font-extralight text-white mb-6 tracking-tight leading-none">
            Trading
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 animate-gradient">Intelligence</span>
          </h1>
          <p className="text-gray-500 text-xl font-light max-w-2xl mx-auto leading-relaxed">Experience autonomous execution powered by adaptive algorithms</p>
        </div>

        {/* Main Container */}
        <div ref={containerRef} className="relative min-h-[700px] flex items-center justify-center">
          
          {/* Scanning Phase */}
          {phase === 'scan' && (
            <div className="w-full max-w-4xl animate-appear">
              <div className="relative group">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-blue-500/20 rounded-[3rem] blur-2xl opacity-60 group-hover:opacity-80 transition-opacity duration-700"></div>
                
                {/* Main card */}
                <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/[0.08] rounded-[3rem] p-16 shadow-2xl overflow-hidden">
                  {/* Animated mesh background */}
                  <div className="absolute inset-0 opacity-30">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 via-transparent to-purple-500/5 animate-mesh"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex flex-col items-center gap-8 mb-12">
                      <div className="relative">
                        <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-xl animate-pulse-glow"></div>
                        <Activity className="text-cyan-400 relative z-10" size={56} strokeWidth={1.5} />
                      </div>
                      <h2 className="text-4xl font-extralight text-white tracking-wider">Analyzing Markets</h2>
                    </div>
                    
                    {/* Fluid wave visualization */}
                    <div className="relative h-64 rounded-3xl overflow-hidden mb-8 bg-gradient-to-b from-cyan-950/20 to-transparent border border-white/[0.05]">
                      <div className="absolute inset-0 flex items-end justify-center gap-1 px-4">
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
                    <div className="mb-6">
                      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full transition-all duration-500 ease-out"
                          style={{ width: `${scanProgress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-cyan-300 text-2xl font-light tracking-wide transition-all duration-500">{scanMessage}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Opportunities Phase */}
          {phase === 'opportunities' && (
            <div className="w-full max-w-4xl animate-appear">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-cyan-500/20 rounded-[3rem] blur-2xl opacity-60 transition-opacity duration-700"></div>
                
                <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/[0.08] rounded-[3rem] p-16 shadow-2xl">
                  <div className="flex flex-col items-center gap-6 mb-12">
                    <div className="relative">
                      <div className="absolute inset-0 bg-purple-400/30 rounded-full blur-xl animate-pulse-glow"></div>
                      <Zap className="text-purple-400 relative z-10" size={56} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-4xl font-extralight text-white tracking-wider">Signals Detected</h2>
                  </div>
                  
                  <div className="space-y-6">
                    {visibleOpportunities.map((opp, idx) => (
                      <div
                        key={idx}
                        className="relative group/card animate-slideUp"
                        style={{ animationDelay: `${idx * 150}ms` }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 rounded-3xl blur-xl opacity-0 group-hover/card:opacity-100 transition-all duration-500"></div>
                        <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.1] rounded-3xl p-8 hover:border-white/[0.15] transition-all duration-500 hover:scale-[1.02] transform">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-5">
                              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                                <CheckCircle className="text-purple-400" size={28} strokeWidth={1.5} />
                              </div>
                              <div>
                                <span className="text-white font-light text-2xl block mb-1">{opp.asset}</span>
                                <span className="text-gray-400 text-base font-light">{opp.signal}</span>
                              </div>
                            </div>
                            <div className="px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-400/20">
                              <span className="text-purple-300 text-sm font-light tracking-widest uppercase">Active</span>
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
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-[3rem] blur-2xl opacity-60"></div>
                
                <div className="relative backdrop-blur-2xl bg-gradient-to-br from-white/[0.07] to-white/[0.02] border border-white/[0.08] rounded-[3rem] p-16 shadow-2xl">
                  <div className="flex flex-col items-center gap-6 mb-16">
                    <div className="relative">
                      <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-xl animate-pulse-glow"></div>
                      <TrendingUp className="text-cyan-400 relative z-10" size={56} strokeWidth={1.5} />
                    </div>
                    <h2 className="text-4xl font-extralight text-white tracking-wider">Live Execution</h2>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {visibleTrades.map((trade, idx) => (
                      <div
                        key={idx}
                        className="relative group/card animate-slideUp"
                        style={{ animationDelay: `${idx * 150}ms` }}
                      >
                        <div className={`absolute inset-0 ${getPnlGlow(trade.pnl)} rounded-3xl blur-xl opacity-0 group-hover/card:opacity-100 transition-all duration-500`}></div>
                        <div className="relative backdrop-blur-xl bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/[0.1] rounded-3xl p-8 hover:border-white/[0.15] transition-all duration-500 hover:scale-[1.03] transform h-full flex flex-col">
                          {/* Header */}
                          <div className="flex items-center justify-between mb-6">
                            <h3 className="text-white font-light text-2xl">{trade.asset}</h3>
                            <div className={`p-2 rounded-xl ${trade.pnl.startsWith('+') ? 'bg-cyan-500/10' : 'bg-rose-500/10'}`}>
                              {trade.pnl.startsWith('+') ? (
                                <ArrowUpRight className="text-cyan-400" size={20} strokeWidth={1.5} />
                              ) : (
                                <ArrowDownRight className="text-rose-400" size={20} strokeWidth={1.5} />
                              )}
                            </div>
                          </div>

                          {/* Strategy */}
                          <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-light mb-8">{trade.strategy}</p>

                          {/* Waveform */}
                          <div className="h-32 flex items-end gap-0.5 mb-8">
                            {[...Array(40)].map((_, i) => (
                              <div
                                key={i}
                                className={`flex-1 rounded-t-full transition-all duration-700 ${trade.pnl.startsWith('+') ? 'bg-gradient-to-t from-cyan-500/40 to-cyan-400/20' : 'bg-gradient-to-t from-rose-500/40 to-rose-400/20'}`}
                                style={{
                                  height: `${30 + Math.sin(i * 0.3) * 40 + Math.random() * 20}%`,
                                  animationDelay: `${i * 15}ms`
                                }}
                              ></div>
                            ))}
                          </div>

                          {/* Stats */}
                          <div className="space-y-6 mb-6">
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-2 font-light">Entry Point</p>
                              <p className="text-white font-light text-xl">${trade.entry.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-2 font-light">Exit Point</p>
                              <p className="text-white font-light text-xl">${trade.exit.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-gray-500 text-xs uppercase tracking-[0.2em] mb-2 font-light">Duration</p>
                              <p className="text-white font-light text-xl">{trade.duration}</p>
                            </div>
                          </div>

                          {/* P&L */}
                          <div className="mt-auto pt-6 border-t border-white/[0.08]">
                            <div className="flex items-center justify-between">
                              <p className="text-gray-500 text-xs uppercase tracking-[0.2em] font-light">Return</p>
                              <p className={`text-3xl font-extralight ${getPnlColor(trade.pnl)} tracking-tight`}>
                                {trade.pnl}
                              </p>
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
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
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