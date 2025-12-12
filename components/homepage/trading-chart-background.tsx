"use client";

import { useEffect, useRef, useState, useCallback } from "react";

interface TradingChartBackgroundProps {
  className?: string;
  opacity?: number;
}

export function TradingChartBackground({ className = "", opacity = 0.45 }: TradingChartBackgroundProps) {
  const [chartPoints, setChartPoints] = useState<number[]>([]);
  const animationRef = useRef<number | null>(null);
  const timeRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const priceHistoryRef = useRef<number[]>([]);
  const currentPriceRef = useRef<number>(50);
  const trendRef = useRef<'up' | 'down'>('up');
  const trendDurationRef = useRef<number>(0);
  
  // Configuration
  const config = {
    numPoints: 100, // Number of points in the chart
    minPrice: 25,
    maxPrice: 75,
    updateInterval: 150, // How often to add new price point (ms) - slower
    trendChangeProbability: 0.02, // Chance to change trend each update
    volatility: 1.0, // How much price can jump
  };

  // Initialize price history
  useEffect(() => {
    const initialHistory: number[] = [];
    let price = 50;
    let trend: 'up' | 'down' = Math.random() > 0.5 ? 'up' : 'down';
    let trendCounter = 0;
    
    for (let i = 0; i < config.numPoints; i++) {
      // Random walk with trend bias
      const trendBias = trend === 'up' ? 0.6 : -0.6;
      const randomMove = (Math.random() - 0.5) * 2;
      const movement = (trendBias + randomMove) * config.volatility;
      
      price = Math.max(config.minPrice, Math.min(config.maxPrice, price + movement));
      initialHistory.push(price);
      
      trendCounter++;
      // Change trend randomly
      if (trendCounter > 10 && Math.random() < 0.1) {
        trend = trend === 'up' ? 'down' : 'up';
        trendCounter = 0;
      }
    }
    
    priceHistoryRef.current = initialHistory;
    currentPriceRef.current = price;
    setChartPoints([...initialHistory]);
  }, []);

  // Animation loop - adds new price points continuously
  useEffect(() => {
    let isRunning = true;
    
    const animate = (timestamp: number) => {
      if (!isRunning) return;
      
      if (lastUpdateRef.current === 0) {
        lastUpdateRef.current = timestamp;
      }
      
      const deltaTime = timestamp - lastUpdateRef.current;
      
      // Add new price point at interval
      if (deltaTime >= config.updateInterval) {
        lastUpdateRef.current = timestamp;
        trendDurationRef.current += deltaTime;
        
        // Change trend direction periodically (every 2-5 seconds)
        if (trendDurationRef.current > 2000 + Math.random() * 3000) {
          if (Math.random() < 0.5) {
            trendRef.current = trendRef.current === 'up' ? 'down' : 'up';
          }
          trendDurationRef.current = 0;
        }
        
        // Also change trend if price hits boundaries
        if (currentPriceRef.current >= config.maxPrice - 5) {
          trendRef.current = 'down';
        } else if (currentPriceRef.current <= config.minPrice + 5) {
          trendRef.current = 'up';
        }
        
        // Calculate new price with sharp movements
        const trend = trendRef.current;
        const trendBias = trend === 'up' ? 0.55 : -0.55;
        
        // Sharp random movements like real crypto
        const spike = Math.random() < 0.15 ? (Math.random() - 0.5) * 4 : 0; // Occasional spikes
        const normalMove = (Math.random() - 0.5) * 2;
        const movement = (trendBias + normalMove) * config.volatility + spike;
        
        const newPrice = Math.max(
          config.minPrice,
          Math.min(config.maxPrice, currentPriceRef.current + movement)
        );
        
        currentPriceRef.current = newPrice;
        
        // Shift array and add new point (creates flowing effect)
        const newHistory = [...priceHistoryRef.current.slice(1), newPrice];
        priceHistoryRef.current = newHistory;
        setChartPoints(newHistory);
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
  }, []);

  if (chartPoints.length === 0) return null;

  const width = 400;
  const height = 200;
  const padding = 20;

  // Generate SVG path with sharp edges (straight lines)
  const generatePath = () => {
    if (chartPoints.length < 2) return "";
    
    const points = chartPoints.map((value, index) => {
      const x = padding + (index / (chartPoints.length - 1)) * (width - padding * 2);
      const y = padding + ((config.maxPrice - value) / (config.maxPrice - config.minPrice)) * (height - padding * 2);
      return `${x},${y}`;
    });

    // Sharp edges - just connect points with straight lines
    return `M ${points.join(" L ")}`;
  };

  // Generate area fill path with sharp edges
  const generateAreaPath = () => {
    if (chartPoints.length < 2) return "";
    
    const points = chartPoints.map((value, index) => {
      const x = padding + (index / (chartPoints.length - 1)) * (width - padding * 2);
      const y = padding + ((config.maxPrice - value) / (config.maxPrice - config.minPrice)) * (height - padding * 2);
      return { x, y };
    });

    let path = `M ${padding},${height - padding}`;
    points.forEach((p) => {
      path += ` L ${p.x},${p.y}`;
    });
    path += ` L ${width - padding},${height - padding} Z`;
    
    return path;
  };

  const lastPrice = chartPoints[chartPoints.length - 1];
  const prevPrice = chartPoints[chartPoints.length - 2] || lastPrice;
  const isUp = lastPrice >= prevPrice;

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Main Flowing Line Chart - Sharp Edges - Full Background */}
      <svg
        className="absolute inset-0"
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ opacity }}
      >
        <defs>
          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fc4f02" stopOpacity="0.8" />
            <stop offset="30%" stopColor="#fc4f02" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#fc4f02" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fc4f02" stopOpacity="0.6" />
            <stop offset="50%" stopColor="#fda300" stopOpacity="1" />
            <stop offset="100%" stopColor="#ff6b35" stopOpacity="1" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Grid lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`grid-h-${i}`}
            x1={padding}
            y1={padding + (i * (height - padding * 2)) / 4}
            x2={width - padding}
            y2={padding + (i * (height - padding * 2)) / 4}
            stroke="currentColor"
            strokeWidth="0.5"
            opacity={0.08}
          />
        ))}
        {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <line
            key={`grid-v-${i}`}
            x1={padding + (i * (width - padding * 2)) / 8}
            y1={padding}
            x2={padding + (i * (width - padding * 2)) / 8}
            y2={height - padding}
            stroke="currentColor"
            strokeWidth="0.5"
            opacity={0.05}
          />
        ))}
        
        {/* Area fill under the chart */}
        <path
          d={generateAreaPath()}
          fill="url(#chartGradient)"
        />
        
        {/* Main line - Sharp edges */}
        <path
          d={generatePath()}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2.5"
          strokeLinecap="square"
          strokeLinejoin="miter"
          filter="url(#glow)"
        />
        
        {/* Current price indicator */}
        {chartPoints.length > 0 && (
          <g>
            {/* Horizontal price line */}
            <line
              x1={width - padding}
              y1={padding + ((config.maxPrice - lastPrice) / (config.maxPrice - config.minPrice)) * (height - padding * 2)}
              x2={width - padding + 15}
              y2={padding + ((config.maxPrice - lastPrice) / (config.maxPrice - config.minPrice)) * (height - padding * 2)}
              stroke={isUp ? "#10b981" : "#ef4444"}
              strokeWidth="1"
              strokeDasharray="3,2"
              opacity="0.6"
            />
            {/* Pulsing dot */}
            <circle
              cx={width - padding}
              cy={padding + ((config.maxPrice - lastPrice) / (config.maxPrice - config.minPrice)) * (height - padding * 2)}
              r="3"
              fill={isUp ? "#10b981" : "#ef4444"}
            >
              <animate
                attributeName="r"
                values="2;4;2"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
            {/* Outer pulse ring */}
            <circle
              cx={width - padding}
              cy={padding + ((config.maxPrice - lastPrice) / (config.maxPrice - config.minPrice)) * (height - padding * 2)}
              r="6"
              fill="none"
              stroke={isUp ? "#10b981" : "#ef4444"}
              strokeWidth="1"
            >
              <animate
                attributeName="r"
                values="4;10;4"
                dur="1.5s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0;0.6"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </circle>
          </g>
        )}
      </svg>

      {/* Secondary Line Chart - Full Background Overlay (Line Only) */}
      <svg
        className="absolute inset-0"
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ opacity: opacity * 0.7 }}
      >
        <defs>
          <linearGradient id="secondaryLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fda300" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#ffb347" stopOpacity="1" />
            <stop offset="100%" stopColor="#fda300" stopOpacity="1" />
          </linearGradient>
          <filter id="secondaryGlow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Line only - no shade - shifted up by margin */}
        <path
          d={(() => {
            const verticalOffset = 4; // Margin above main line
            const pts = chartPoints.map((v, i) => {
              const x = padding + (i / (chartPoints.length - 1)) * (width - padding * 2);
              const y = padding + ((config.maxPrice - v + verticalOffset) / (config.maxPrice - config.minPrice)) * (height - padding * 2);
              return `${x},${y}`;
            });
            return `M ${pts.join(" L ")}`;
          })()}
          fill="none"
          stroke="url(#secondaryLineGradient)"
          strokeWidth="1"
          strokeLinecap="square"
          strokeLinejoin="miter"
          filter="url(#secondaryGlow)"
        />
      </svg>

      {/* Third Line Chart - Full Background Overlay (Line Only) */}
      <svg
        className="absolute inset-0"
        width="100%"
        height="100%"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        style={{ opacity: opacity * 0.55 }}
      >
        <defs>
          <filter id="thirdGlow">
            <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Line only - no shade - shifted down by margin */}
        <path
          d={(() => {
            const verticalOffset = -4; // Margin below main line
            const pts = chartPoints.map((v, i) => {
              const x = padding + (i / (chartPoints.length - 1)) * (width - padding * 2);
              const y = padding + ((config.maxPrice - v + verticalOffset) / (config.maxPrice - config.minPrice)) * (height - padding * 2);
              return `${x},${y}`;
            });
            return `M ${pts.join(" L ")}`;
          })()}
          fill="none"
          stroke="#10b981"
          strokeWidth="1"
          strokeLinecap="square"
          strokeLinejoin="miter"
          filter="url(#thirdGlow)"
        />
      </svg>
    </div>
  );
}
