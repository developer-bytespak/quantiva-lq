'use client'

import React, { useEffect, useRef, useState } from 'react';

const SplitCardScroll: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const stickyRef = useRef<HTMLDivElement>(null);
  const [isGapAnimated, setIsGapAnimated] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!stickyRef.current) return;

      const stickyRect = stickyRef.current.getBoundingClientRect();
      const triggerHeight = window.innerHeight * 4;
      const scrollStart = stickyRect.top + window.scrollY - window.innerHeight;
      const scrollEnd = scrollStart + triggerHeight;
      const currentScroll = window.scrollY;

      if (currentScroll >= scrollStart && currentScroll <= scrollEnd) {
        const progress = (currentScroll - scrollStart) / triggerHeight;
        setScrollProgress(Math.max(0, Math.min(1, progress)));
      } else if (currentScroll < scrollStart) {
        setScrollProgress(0);
      } else {
        setScrollProgress(1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsGapAnimated(scrollProgress >= 0.35);
    setIsFlipped(scrollProgress >= 0.7);
  }, [scrollProgress]);

  const getHeaderOpacity = () => {
    if (scrollProgress < 0.1) return 0;
    if (scrollProgress > 0.25) return 1;
    return (scrollProgress - 0.1) / 0.15;
  };

  const getHeaderY = () => {
    if (scrollProgress < 0.1) return 40;
    if (scrollProgress > 0.25) return 0;
    return 40 - (40 * (scrollProgress - 0.1) / 0.15);
  };

  const getContainerWidth = () => {
    if (scrollProgress <= 0.25) {
      return 75 - (15 * scrollProgress / 0.25);
    }
    return 60;
  };

  return (
    <div className="font-serif bg-[#0f0f0f] text-white">
      {/* Sticky Section */}
      <div ref={stickyRef} className="relative h-[500vh]">
        <section className="sticky top-0 h-screen px-8 flex items-center justify-center">
          {/* Header */}
          <div
            className="absolute top-[20%] left-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500"
            style={{
              opacity: getHeaderOpacity(),
              transform: `translate(-50%, calc(-50% + ${getHeaderY()}px))`,
            }}
          >
            <h1 className="text-5xl md:text-6xl font-medium text-center">
              <span className="text-white">Powerful Features for</span><br />
              <span className="text-orange-500">Modern Traders</span>
            </h1>
          </div>

          {/* Card Container */}
          <div
            className="hidden lg:flex translate-y-10 transition-all duration-500"
            style={{
              width: `${getContainerWidth()}%`,
              gap: isGapAnimated ? '48px' : '0px',
              perspective: '1000px',
            }}
          >
            {/* Card 1 */}
            <div
              className="relative flex-1 transition-all duration-700"
              style={{
                aspectRatio: '5/7',
                transformStyle: 'preserve-3d',
                transform: isFlipped
                  ? 'rotateY(180deg)'
                  : 'rotateY(0deg) translateY(0px) rotateZ(0deg)',
                borderRadius: isGapAnimated ? '20px' : '20px 0 0 20px',
              }}
            >
              <div className="absolute w-full h-full overflow-hidden rounded-inherit" style={{ backfaceVisibility: 'hidden' }}>
                <img src="/features/card_cover_1.jpg" alt="" className="w-full h-full object-cover" />
              </div>
              <div
                className="absolute w-full h-full flex flex-col items-start justify-center text-left p-8 text-white overflow-hidden rounded-inherit relative"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  backgroundImage: 'url(/features/card1.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-0"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-orange-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6 border border-orange-500/30">
                    <svg className="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">AI-Driven Trading Strategies</h3>
                  <p className="text-gray-100 text-sm leading-relaxed font-light drop-shadow-md">
                    Leverage advanced machine learning algorithms to optimize portfolios across crypto and stocks. Our AI continuously learns from market patterns to deliver superior trading strategies.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div
              className="relative flex-1 transition-all duration-700"
              style={{
                aspectRatio: '5/7',
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                borderRadius: isGapAnimated ? '20px' : '0px',
              }}
            >
              <div className="absolute w-full h-full overflow-hidden rounded-inherit" style={{ backfaceVisibility: 'hidden' }}>
                <img src="/features/card_cover_2.jpg" alt="" className="w-full h-full object-cover" />
              </div>
              <div
                className="absolute w-full h-full flex flex-col items-start justify-center text-left p-8 text-white overflow-hidden rounded-inherit relative"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  backgroundImage: 'url(/features/card2.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-0"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6 border border-blue-500/30">
                    <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">Real-Time Sentiment Analysis</h3>
                  <p className="text-gray-100 text-sm leading-relaxed font-light drop-shadow-md">
                    Harness the power of sentiment intelligence from news, social media, and market data. Make informed decisions backed by comprehensive real-time market analysis.
                  </p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div
              className="relative flex-1 transition-all duration-700"
              style={{
                aspectRatio: '5/7',
                transformStyle: 'preserve-3d',
                transform: isFlipped
                  ? 'rotateY(180deg)'
                  : 'rotateY(0deg) translateY(0px) rotateZ(0deg)',
                borderRadius: isGapAnimated ? '20px' : '0 20px 20px 0',
              }}
            >
              <div className="absolute w-full h-full overflow-hidden rounded-inherit" style={{ backfaceVisibility: 'hidden' }}>
                <img src="/features/card_cover_3.jpg" alt="" className="w-full h-full object-cover" />
              </div>
              <div
                className="absolute w-full h-full flex flex-col items-start justify-center text-left p-8 text-white overflow-hidden rounded-inherit relative"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                  backgroundImage: 'url(/features/card3.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 z-0"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-green-500/20 backdrop-blur-sm rounded-lg flex items-center justify-center mb-6 border border-green-500/30">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-white drop-shadow-lg">Portfolio Optimization</h3>
                  <p className="text-gray-100 text-sm leading-relaxed font-light drop-shadow-md">
                    Automatically optimize risk and return across your entire portfolio. Our system continuously rebalances positions to maximize gains while minimizing exposure.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden flex flex-col gap-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-medium">
                <span className="text-white">Powerful Features for</span>{' '}
                <span className="text-orange-500">Modern Traders</span>
              </h1>
            </div>
            
            <div className="space-y-6">
              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">AI-Driven Trading Strategies</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Leverage advanced machine learning algorithms to optimize portfolios across crypto and stocks. Our AI continuously learns from market patterns to deliver superior trading strategies.
                </p>
              </div>

              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Real-Time Sentiment Analysis</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Harness the power of sentiment intelligence from news, social media, and market data. Make informed decisions backed by comprehensive real-time market analysis.
                </p>
              </div>

              <div className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-6">
                <div className="w-12 h-12 bg-orange-900/30 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-3">Portfolio Optimization</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Automatically optimize risk and return across your entire portfolio. Our system continuously rebalances positions to maximize gains while minimizing exposure.
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SplitCardScroll;