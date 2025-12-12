"use client";

import { useEffect, useState, useRef, useCallback } from "react";

interface PriceData {
  symbol: string;
  price: number;
  targetPrice: number;
  change: number;
  changePercent: number;
  trend: 'up' | 'down';
  trendDuration: number;
}

// Animated number component for smooth transitions
function AnimatedNumber({ 
  value, 
  prefix = "", 
  suffix = "",
  decimals = 2,
  className = ""
}: { 
  value: number; 
  prefix?: string; 
  suffix?: string;
  decimals?: number;
  className?: string;
}) {
  const [displayValue, setDisplayValue] = useState(value);
  const animationRef = useRef<number | null>(null);
  const startValueRef = useRef(value);
  const startTimeRef = useRef(0);
  const duration = 800; // Animation duration in ms

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = performance.now();

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      const current = startValueRef.current + (value - startValueRef.current) * easeOutQuart;
      setDisplayValue(current);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [value]);

  return (
    <span className={className}>
      {prefix}{displayValue.toFixed(decimals)}{suffix}
    </span>
  );
}

export function PriceTicker({ className = "" }: { className?: string }) {
  const [prices, setPrices] = useState<PriceData[]>([]);
  const animationRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Initialize prices
  useEffect(() => {
    const initialPrices: PriceData[] = [
      { symbol: "BTC/USD", price: 43250.50, targetPrice: 43250.50, change: 0, changePercent: 0, trend: 'up', trendDuration: 0 },
      { symbol: "ETH/USD", price: 2650.75, targetPrice: 2650.75, change: 0, changePercent: 0, trend: 'up', trendDuration: 0 },
      { symbol: "AAPL", price: 178.45, targetPrice: 178.45, change: 0, changePercent: 0, trend: 'up', trendDuration: 0 },
      { symbol: "TSLA", price: 245.80, targetPrice: 245.80, change: 0, changePercent: 0, trend: 'down', trendDuration: 0 },
      { symbol: "NVDA", price: 485.20, targetPrice: 485.20, change: 0, changePercent: 0, trend: 'up', trendDuration: 0 },
      { symbol: "MSFT", price: 378.90, targetPrice: 378.90, change: 0, changePercent: 0, trend: 'up', trendDuration: 0 },
      { symbol: "SPY", price: 452.30, targetPrice: 452.30, change: 0, changePercent: 0, trend: 'up', trendDuration: 0 },
      { symbol: "QQQ", price: 385.60, targetPrice: 385.60, change: 0, changePercent: 0, trend: 'down', trendDuration: 0 },
    ];
    setPrices(initialPrices);
  }, []);

  // Continuous smooth animation
  useEffect(() => {
    if (prices.length === 0) return;

    let isRunning = true;

    const animate = (timestamp: number) => {
      if (!isRunning) return;

      if (lastUpdateRef.current === 0) {
        lastUpdateRef.current = timestamp;
      }

      const deltaTime = timestamp - lastUpdateRef.current;
      
      // Update prices every 120ms for smooth animation
      if (deltaTime > 120) {
        lastUpdateRef.current = timestamp;

        setPrices((prev) =>
          prev.map((priceData) => {
            // Update trend duration
            let newTrendDuration = priceData.trendDuration + deltaTime;
            let newTrend = priceData.trend;

            // Change trend direction every 3-8 seconds
            const trendChangeInterval = 3000 + Math.random() * 5000;
            if (newTrendDuration > trendChangeInterval) {
              newTrend = priceData.trend === 'up' ? 'down' : 'up';
              newTrendDuration = 0;
            }

            // Calculate smooth price movement based on trend
            const volatility = priceData.symbol.includes("/") ? 0.00015 : 0.00008;
            const trendBias = newTrend === 'up' ? 0.6 : -0.6;
            const randomFactor = (Math.random() - 0.5) * 2;
            const movement = (trendBias + randomFactor * 0.4) * volatility * priceData.price;
            
            const newPrice = Math.max(
              priceData.price * 0.95,
              Math.min(priceData.price * 1.05, priceData.price + movement)
            );

            const change = newPrice - priceData.targetPrice;
            const changePercent = (change / priceData.targetPrice) * 100;

            return {
              ...priceData,
              price: newPrice,
              change,
              changePercent,
              trend: newTrend,
              trendDuration: newTrendDuration,
            };
          })
        );
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      isRunning = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [prices.length]);

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Top Price Ticker */}
      <div className="absolute top-20 left-0 right-0 flex gap-8 text-xs font-mono text-slate-500 opacity-90 overflow-hidden">
        <div className="flex gap-8 animate-scroll-left whitespace-nowrap">
          {prices.map((price, index) => (
            <div key={`top-${index}`} className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-slate-400">{price.symbol}</span>
              <span className="text-white tabular-nums">
                $<AnimatedNumber value={price.price} decimals={2} />
              </span>
              <span 
                className={`tabular-nums transition-colors duration-300 ${
                  price.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
                }`}
              >
                {price.change >= 0 ? "+" : ""}
                <AnimatedNumber value={price.changePercent} decimals={2} suffix="%" />
              </span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {prices.map((price, index) => (
            <div key={`top-dup-${index}`} className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-slate-400">{price.symbol}</span>
              <span className="text-white tabular-nums">
                $<AnimatedNumber value={price.price} decimals={2} />
              </span>
              <span 
                className={`tabular-nums transition-colors duration-300 ${
                  price.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
                }`}
              >
                {price.change >= 0 ? "+" : ""}
                <AnimatedNumber value={price.changePercent} decimals={2} suffix="%" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Price Ticker (reversed) */}
      <div className="absolute bottom-20 left-0 right-0 flex gap-8 text-xs font-mono text-slate-500 opacity-90 overflow-hidden">
        <div className="flex gap-8 animate-scroll-right whitespace-nowrap">
          {prices.slice().reverse().map((price, index) => (
            <div key={`bottom-${index}`} className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-slate-400">{price.symbol}</span>
              <span className="text-white tabular-nums">
                $<AnimatedNumber value={price.price} decimals={2} />
              </span>
              <span 
                className={`tabular-nums transition-colors duration-300 ${
                  price.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
                }`}
              >
                {price.change >= 0 ? "+" : ""}
                <AnimatedNumber value={price.changePercent} decimals={2} suffix="%" />
              </span>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
          {prices.slice().reverse().map((price, index) => (
            <div key={`bottom-dup-${index}`} className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-slate-400">{price.symbol}</span>
              <span className="text-white tabular-nums">
                $<AnimatedNumber value={price.price} decimals={2} />
              </span>
              <span 
                className={`tabular-nums transition-colors duration-300 ${
                  price.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
                }`}
              >
                {price.change >= 0 ? "+" : ""}
                <AnimatedNumber value={price.changePercent} decimals={2} suffix="%" />
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side Price Displays - Animated - Vertically Centered */}
      <div className="absolute top-1/2 -translate-y-1/2 right-4 space-y-3 text-xs font-mono opacity-80">
        {prices.slice(0, 4).map((price, index) => (
          <div 
            key={`side-${index}`} 
            className="flex flex-col items-end gap-1 transition-all duration-500"
          >
            <div className="text-slate-400">{price.symbol}</div>
            <div className="text-white font-semibold tabular-nums text-sm">
              $<AnimatedNumber value={price.price} decimals={2} />
            </div>
            <div 
              className={`flex items-center gap-1 tabular-nums transition-colors duration-300 ${
                price.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
              }`}
            >
              <span 
                className="transition-transform duration-300"
                style={{ 
                  transform: price.change >= 0 ? 'rotate(0deg)' : 'rotate(180deg)',
                  display: 'inline-block'
                }}
              >
                ▲
              </span>
              <AnimatedNumber value={Math.abs(price.changePercent)} decimals={2} suffix="%" />
            </div>
            {/* Mini sparkline indicator */}
            <div className="flex items-end gap-0.5 h-3 mt-1">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    price.change >= 0 ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                  }`}
                  style={{
                    height: `${20 + Math.sin((Date.now() / 500) + i + index) * 40 + 40}%`,
                    opacity: 0.3 + (i / 8) * 0.7,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Left Side Price Displays - Animated - Vertically Centered */}
      <div className="absolute top-1/2 -translate-y-1/2 left-4 space-y-3 text-xs font-mono opacity-80">
        {prices.slice(4).map((price, index) => (
          <div 
            key={`side-left-${index}`} 
            className="flex flex-col gap-1 transition-all duration-500"
          >
            <div className="text-slate-400">{price.symbol}</div>
            <div className="text-white font-semibold tabular-nums text-sm">
              $<AnimatedNumber value={price.price} decimals={2} />
            </div>
            <div 
              className={`flex items-center gap-1 tabular-nums transition-colors duration-300 ${
                price.change >= 0 ? "text-[#10b981]" : "text-[#ef4444]"
              }`}
            >
              <span 
                className="transition-transform duration-300"
                style={{ 
                  transform: price.change >= 0 ? 'rotate(0deg)' : 'rotate(180deg)',
                  display: 'inline-block'
                }}
              >
                ▲
              </span>
              <AnimatedNumber value={Math.abs(price.changePercent)} decimals={2} suffix="%" />
            </div>
            {/* Mini sparkline indicator */}
            <div className="flex items-end gap-0.5 h-3 mt-1">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className={`w-1 rounded-full transition-all duration-300 ${
                    price.change >= 0 ? 'bg-[#10b981]' : 'bg-[#ef4444]'
                  }`}
                  style={{
                    height: `${20 + Math.sin((Date.now() / 500) + i + index + 4) * 40 + 40}%`,
                    opacity: 0.3 + (i / 8) * 0.7,
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
