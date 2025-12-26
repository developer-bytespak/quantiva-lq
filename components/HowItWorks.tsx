'use client';

import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const DeepJudgeScroll = () => {
  const spotlightRef = useRef<HTMLElement>(null);
  const spotlightContentRef = useRef<HTMLDivElement>(null);
  const headerContentRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const searchBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const featureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const featureBgRefs = useRef<(HTMLDivElement | null)[]>([]);
  const featureContentRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleSubmit = () => {
    if (email && email.includes('@')) {
      setIsSubmitted(true);
      console.log('Email submitted:', email);
      // TODO: Add your email submission logic here (API call, etc.)
      setTimeout(() => {
        setEmail('');
        setIsSubmitted(false);
      }, 3000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  useEffect(() => {
    // Inject styles to avoid hydration errors
    const styleId = 'how-it-works-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&family=Instrument+Serif:ital@0;1&family=Manrope:wght@200..800&display=swap');
        
        body {
          font-family: 'Instrument Serif', serif;
        }
        
        .font-serif {
          font-family: 'Instrument Serif', serif;
        }
        
        .font-mono {
          font-family: 'DM Mono', monospace;
        }
        
        .font-sans {
          font-family: 'Manrope', sans-serif;
        }
        
        @keyframes twinkle {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        
        .space-stars {
          background-image: 
            radial-gradient(2px 2px at 20% 30%, white, transparent),
            radial-gradient(2px 2px at 60% 70%, white, transparent),
            radial-gradient(1px 1px at 50% 50%, white, transparent),
            radial-gradient(1px 1px at 80% 10%, white, transparent),
            radial-gradient(2px 2px at 90% 40%, white, transparent),
            radial-gradient(1px 1px at 33% 60%, white, transparent),
            radial-gradient(1px 1px at 66% 20%, white, transparent),
            radial-gradient(2px 2px at 15% 80%, white, transparent),
            radial-gradient(1px 1px at 45% 90%, white, transparent),
            radial-gradient(2px 2px at 75% 15%, white, transparent),
            radial-gradient(1px 1px at 10% 20%, white, transparent),
            radial-gradient(1px 1px at 85% 60%, white, transparent),
            radial-gradient(2px 2px at 40% 80%, white, transparent),
            radial-gradient(1px 1px at 25% 40%, white, transparent),
            radial-gradient(1px 1px at 70% 30%, white, transparent);
          background-size: 100% 100%;
          animation: twinkle 8s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }

    gsap.registerPlugin(ScrollTrigger);

    const features = featureRefs.current;
    const featureBgs = featureBgRefs.current;

    // Detect mobile device
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

    // Adjust animation settings based on device
    const scrollEndMultiplier = isMobile ? 1.5 : 3; // Less scroll needed on mobile
    
    const featureStartPositions = isMobile 
      ? [
          { top: 5, left: 50 },    //sign up
          { top: 17.5, left: 75 }, //market sentiment
          { top: 17.5, left: 25 }, //AI trading
          { top: 30, left: 50 },   //receive trades
          { top: 65, left: 50 },   //approve and execute trade
          { top: 90, left: 50 },   //optimize portfolio
          { top: 77.5, left: 73 }, //monitor performance
          { top: 77.5, left: 23 }, //AI voice assistant
        ]
      : [
          { top: 25, left: 15 },
          { top: 12.5, left: 50 },
          { top: 22.5, left: 75 },
          { top: 50, left: 20 },
          { top: 75, left: 50 },
          { top: 80, left: 75 },
          { top: 80, left: 15 }, 
          { top: 50, left: 85 }, 
        ];
    
    const featureMergePosition = isMobile 
      ? { top: 50, left: 69 }  // Center for mobile
      : { top: 50, left: 57 }; // Desktop position

    features.forEach((feature, index) => {
      if (feature) {
        const featurePos = featureStartPositions[index];
        gsap.set(feature, {
          top: `${featurePos.top}%`,
          left: `${featurePos.left}%`,
          xPercent: -50,
          yPercent: -50,
        });
      }
    });

    // Read dimensions from feature containers (they size to content naturally)
    // Use a small delay to ensure DOM has rendered
    const featureStartDimensions: Array<{ width: number; height: number }> = [];
    
    // Read dimensions immediately first
    features.forEach((feature) => {
      if (feature) {
        const rect = feature.getBoundingClientRect();
        featureStartDimensions.push({
          width: Math.max(rect.width, 50), // Ensure minimum width
          height: Math.max(rect.height, 20), // Ensure minimum height
        });
      }
    });
    
    // Re-read after a short delay to get accurate dimensions after render
    setTimeout(() => {
      features.forEach((feature, index) => {
        if (feature && featureStartDimensions[index]) {
          const rect = feature.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            featureStartDimensions[index] = {
              width: rect.width,
              height: rect.height,
            };
            // Update the background to match
            const bg = featureBgs[index];
            if (bg) {
              gsap.set(bg, {
                width: `${rect.width}px`,
                height: `${rect.height}px`,
              });
            }
          }
        }
      });
      ScrollTrigger.refresh();
    }, 50);

    const remInPixels = parseFloat(
      getComputedStyle(document.documentElement).fontSize
    );
    const targetWidth = isMobile ? 2.5 * remInPixels : 3 * remInPixels;  // Slightly smaller on mobile
    const targetHeight = isMobile ? 2.5 * remInPixels : 3 * remInPixels;

    const getSearchBarFinalWidth = () => {
      const width = window.innerWidth;
      if (width < 768) return 22;        // Mobile - smaller
      if (width < 1024) return 20;       // Tablet
      if (width < 1440) return 26;       // Laptop
      return 22;                         // Desktop
    };

    let searchBarFinalWidth = getSearchBarFinalWidth();

    const handleResize = () => {
      searchBarFinalWidth = getSearchBarFinalWidth();
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    const scrollTrigger = ScrollTrigger.create({
      trigger: spotlightRef.current,
      start: 'top top',
      end: `+=${window.innerHeight * scrollEndMultiplier}px`,
      pin: true,
      pinSpacing: true,
      pinType: 'transform',  // Use transform-based pinning to prevent DOM manipulation
      scrub: isMobile ? 0.5 : 1,  // Faster animation on mobile (less scrub = faster)
      onUpdate: (self) => {
        const progress = self.progress;

        // Check if input is focused - if so, don't manipulate it
        const inputIsFocused = document.activeElement === inputRef.current;

        if (progress <= 0.3333) {
          const spotlightHeaderProgress = progress / 0.3333;
          gsap.set(spotlightContentRef.current, {
            y: `${-100 * spotlightHeaderProgress}%`,
          });
        } else {
          gsap.set(spotlightContentRef.current, {
            y: '-100%',
          });
        }

        // Features merge and fade out: 0 - 0.7
        if (progress >= 0 && progress <= 0.7) {
          const featureProgress = progress / 0.7;

          features.forEach((feature, index) => {
            if (feature) {
              const original = featureStartPositions[index];
              const currentTop =
                original.top + (featureMergePosition.top - original.top) * featureProgress;
              const currentLeft =
                original.left + (featureMergePosition.left - original.left) * featureProgress;

              gsap.set(feature, {
                top: `${currentTop}%`,
                left: `${currentLeft}%`,
                xPercent: -50,
                yPercent: -50,
              });
            }
          });

          featureBgs.forEach((bg, index) => {
            if (bg && featureStartDimensions[index]) {
              const featureDim = featureStartDimensions[index];
              // Allow boxes to shrink from natural size to target size during transition
              const currentWidth = featureDim.width + (targetWidth - featureDim.width) * featureProgress;
              const currentHeight = featureDim.height + (targetHeight - featureDim.height) * featureProgress;
              const currentBorderRadius = 0.5 + (25 - 0.5) * featureProgress;
              const currentBorderWidth = 0.125 + (0.35 - 0.125) * featureProgress;

              gsap.set(bg, {
                width: `${currentWidth}px`,
                height: `${currentHeight}px`,
                borderRadius: `${currentBorderRadius}rem`,
                borderWidth: `${currentBorderWidth}rem`,
              });
            }
          });

          // Fade out feature text in first 10% of scroll
          if (progress >= 0 && progress <= 0.1) {
            const featureTextProgress = progress / 0.1;
            featureContentRefs.current.forEach((content) => {
              if (content) {
                gsap.set(content, {
                  opacity: 1 - featureTextProgress,
                });
              }
            });
          } else if (progress > 0.1) {
            featureContentRefs.current.forEach((content) => {
              if (content) {
                gsap.set(content, {
                  opacity: 0,
                });
              }
            });
          }
        }

        // Hide features after 0.7
        if (progress >= 0.7) {
          gsap.set(featuresRef.current, {
            opacity: 0,
          });
        } else {
          gsap.set(featuresRef.current, {
            opacity: 1,
          });
        }

        // Email input bar animation (0.7 - 1.0)
        if (progress >= 0.7 && progress <= 0.9) {
          const searchBarProgress = (progress - 0.7) / 0.2;

          const width = 2.2 + (searchBarFinalWidth - 2.2) * searchBarProgress;
          const height = 2.2 + (3.5 - 2.2) * searchBarProgress;
          const translateY = -50 + (200 - -50) * searchBarProgress;
          
          // Fade in the entire container
          const containerOpacity = Math.min(searchBarProgress * 2, 1);

          if (searchBarRef.current && !inputIsFocused) {
            gsap.set(searchBarRef.current, {
              width: `${width}rem`,
              height: `${height}rem`,
              transform: `translate(-50%, ${translateY}%)`,
              opacity: containerOpacity,
              pointerEvents: 'none', // Disable interaction during animation
            });
          }
        } else if (progress > 0.9) {
          // Animation complete - input is now fully interactive
          if (searchBarRef.current && !inputIsFocused) {
            gsap.set(searchBarRef.current, {
              width: `${searchBarFinalWidth}rem`,
              height: '3.5rem',
              transform: `translate(-50%, 200%)`,
              opacity: 1,
              pointerEvents: 'auto', // Enable interaction
            });
          } else if (searchBarRef.current && inputIsFocused) {
            // If input is focused, only update pointer events, not position/size
            gsap.set(searchBarRef.current, {
              pointerEvents: 'auto',
              opacity: 1,
            });
          }
        } else {
          // Before 0.7 - hide completely
          if (searchBarRef.current && !inputIsFocused) {
            gsap.set(searchBarRef.current, {
              opacity: 0,
              pointerEvents: 'none',
            });
          }
        }

        if (progress >= 0.75) {
          const finalHeaderProgress = (progress - 0.75) / 0.25;

          gsap.set(headerContentRef.current, {
            y: -50 + 50 * finalHeaderProgress,
            opacity: finalHeaderProgress,
          });
        } else {
          gsap.set(headerContentRef.current, {
            y: -50,
            opacity: 0,
          });
        }
      },
    });

    return () => {
      scrollTrigger.kill();
      window.removeEventListener('resize', handleResize);
      ScrollTrigger.getAll().forEach(st => st.kill());
      
      // Clean up style element
      const styleElement = document.getElementById('how-it-works-styles');
      if (styleElement) {
        styleElement.remove();
      }
    };
  }, []);

  const features = [
    'Sign Up & Connect Exchanges',
    'AI Trading Strategies',
    'Market Sentiment',
    'Receive Trade Recommendations',
    'Approve and Execute Trades',
    'Optimize your Portfolio',
    'Monitor your Performance',
    'AI Voice Assistant',
  ];

  return (
    <div className="bg-[#0f0f0f] text-white font-serif">
      {/* Spotlight Section */}
      <section ref={spotlightRef as React.RefObject<HTMLElement>} className="relative w-full h-screen overflow-hidden">
        {/* Space-themed background - ends with black */}
        <div className="absolute inset-0 z-0" style={{ background: 'linear-gradient(to bottom, #000000 0%, #0a0a1a 30%, #0a0a1a 50%, #050505 70%, #000000 90%, #000000 100%)' }}>
          {/* Stars layer */}
          <div className="absolute inset-0 space-stars" />
          {/* Deep space gradient overlay - vertical only for consistency */}
          <div className="absolute inset-0 bg-gradient-to-b from-purple-900/10 via-transparent to-blue-900/10" />
        </div>

        {/* Spotlight Content */}
        <div
          ref={spotlightContentRef}
          className="absolute w-full h-full flex justify-center items-center z-10"
        >
          <div 
            className="absolute inset-0 scale-[0.3] md:scale-[0.75] opacity-25 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: 'url(/works/mesh.png)' }}
          />
          <div className="absolute scale-[0.8] md:scale-[2] opacity-25">
            <svg width="800" height="800" viewBox="0 0 800 800" className="w-full h-full">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1"/>
                </pattern>
              </defs>
              <rect width="800" height="800" fill="url(#grid)" />
            </svg>
          </div>
          <div className="text-center w-full md:w-2/5 px-8 flex flex-col items-center gap-4">
            <h1 className="text-4xl md:text-[4.5rem] lg:text-[4.5rem] bg-gradient-to-r from-[#f86c24] via-[#ffa500] to-[#ffd700] bg-clip-text text-transparent font-medium leading-[0.9] tracking-wider">
              From Sign-Up to<br />Smart Trades
            </h1>
            <p className="font-sans text-base md:text-lg font-normal leading-relaxed text-gray-300">
              Get started in minutes and start trading smarter today
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="absolute w-full h-full flex justify-center items-center z-40">
          <div
            ref={headerContentRef}
            className="w-full md:w-3/5 flex flex-col items-center text-center gap-8 px-8 opacity-0"
            style={{ transform: 'translateY(-100px)' }}
          >
            <h1 className="text-3xl md:text-3xl lg:text-4xl xl:text-5xl font-medium bg-gradient-to-r from-[#f86c24] via-[#ffa500] to-[#ffd700] bg-clip-text text-transparent leading-[1.1] tracking-wider">
              Join us in shaping the future of Intelligent Trading
            </h1>
            <p className="font-sans text-base md:text-lg font-normal leading-relaxed text-gray-300">
              We're building something revolutionary that will transform how you trade. Join our community of forward-thinking traders and be among the first to experience the next evolution in AI-powered investment strategies.
            </p>
            {/* Add bottom padding for mobile only */}
            <style jsx>{`
              @media (max-width: 767px) {
                .howitworks-mobile-pb { padding-bottom: 8rem; }
              }
            `}</style>
            <span className="howitworks-mobile-pb block md:hidden" />
          </div>
        </div>

        {/* Features */}
        <div ref={featuresRef} className="z-30">
          {features.map((feature, index) => (
            <div
              key={index}
              ref={(el) => {
                featureRefs.current[index] = el;
              }}
              className="absolute inline-block px-4 md:px-6 py-4"
            >
              <div
                ref={(el) => {
                  featureBgRefs.current[index] = el;
                }}
                className="absolute inset-0 bg-[#141414] border-2 border-[#262626] rounded-lg"
                style={{ boxSizing: 'border-box' }}
              />
              <div
                ref={(el) => {
                  featureContentRefs.current[index] = el;
                }}
                className="relative whitespace-nowrap"
              >
                <p className="uppercase font-mono font-normal text-[0.7rem] md:text-[0.85rem] leading-none">
                  {feature}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Email Input Bar */}
        <div
          ref={searchBarRef}
          className="absolute rounded-full border-[0.35rem] border-[#262626] bg-[#141414] opacity-0 flex items-center overflow-hidden z-50"
          style={{ left: '50%', top: '50%', transform: 'translate(-50%, -50%)', pointerEvents: 'none' }}
        >
          <div className="w-full h-full flex items-center">
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Enter your Email to take part in this journey"
              className="w-full h-full bg-transparent border-none outline-none text-white font-sans text-base px-4 placeholder:text-gray-500 placeholder:font-medium flex-1"
              disabled={isSubmitted}
              autoComplete="email"
            />
            <button
              onClick={handleSubmit}
              disabled={isSubmitted}
              className="px-4 h-full bg-transparent text-white hover:text-gray-300 transition-colors disabled:opacity-70 flex items-center justify-center flex-shrink-0"
              aria-label="Submit email"
            >
              {isSubmitted ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default DeepJudgeScroll;