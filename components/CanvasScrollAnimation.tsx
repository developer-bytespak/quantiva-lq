'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface CanvasScrollAnimationProps {
  frameCount?: number;
  showNavigation?: boolean;
  useSmoothScroll?: boolean;
}

const CanvasScrollAnimation: React.FC<CanvasScrollAnimationProps> = ({
  frameCount = 182,
  showNavigation = true,
  useSmoothScroll = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [scrollHeight, setScrollHeight] = useState('400vh');
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const lenisRef = useRef<any>(null);
  const [navEmail, setNavEmail] = useState('');
  const [navSubmitted, setNavSubmitted] = useState(false);
  const [navMessage, setNavMessage] = useState('');
  const [navError, setNavError] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const handleNavSubmit = async () => {
    if (!navEmail || !navEmail.includes('@')) {
      setNavError(true);
      setNavMessage('Please enter a valid email');
      return;
    }
    if (navSubmitted) return;

    setNavSubmitted(true);
    setNavError(false);
    setNavMessage('');

    try {
      const res = await fetch('/api/submit-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: navEmail }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        console.error('Proxy error:', data);
        setNavError(true);
        setNavMessage(data?.error || data?.upstream || 'Submission failed');
        setTimeout(() => setNavSubmitted(false), 3000);
        return;
      }

      setNavMessage(data?.upstream || '✓ Successfully joined!');
      setNavEmail('');
      setTimeout(() => {
        setNavSubmitted(false);
        setNavMessage('');
      }, 3000);
    } catch (err) {
      console.error('Error submitting email:', err);
      setNavError(true);
      setNavMessage('Connection error. Please try again.');
      setTimeout(() => setNavSubmitted(false), 3000);
    }
  };

  useEffect(() => {
    // Only restrict scroll during loading, ensure it's properly reset
    if (loading) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore original overflow state on cleanup
        document.body.style.overflow = originalOverflow;
      };
    } else {
      // Ensure overflow is cleared after loading
      document.body.style.overflow = '';
    }
  }, [loading]);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Add scroll listener to detect scrolling for mobile header background
  // Using passive listener to avoid interfering with scroll performance
  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY > 10;
      setIsScrolled(scrolled);
    };

    // Use passive event listener to ensure it doesn't block page scroll
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;

    if (!canvas || !container) return;

    const context = canvas.getContext('2d', { 
      alpha: false,
      desynchronized: true,
    });
    if (!context) return;

    const setCanvasSize = () => {
      // Strictly isolated to canvas element - no layout modifications
      const dpr = Math.min(window.devicePixelRatio, 2);
      // Set logical canvas pixels according to device pixel ratio
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      // Set canvas CSS size without affecting page layout
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      // Use setTransform to avoid accumulating scale on repeated resizes
      // This prevents any unintended layout shifts
      if (typeof (context as any).setTransform === 'function') {
        context.setTransform(dpr, 0, 0, dpr, 0, 0);
      } else {
        // Fallback for older browsers
        context.scale(dpr, dpr);
      }
    };
    setCanvasSize();

    const images: HTMLImageElement[] = [];
    const frameData = { frame: 0, scrollProgress: 0 };
    let loadedImages = 0;

    // Detect if mobile at this point
    const isMobileDevice = window.innerWidth < 768;

    // Fetch blob URLs from API (returns optimized .webp paths)
    const fetchBlobUrls = async () => {
      try {
        const response = await fetch('/api/frames2');
        if (!response.ok) {
          throw new Error('Failed to fetch blob URLs');
        }
        const data = await response.json();
        return data.urls as string[];
      } catch (error) {
        console.error('Error fetching blob URLs:', error);
        // Fallback to local .webp paths if blob fetch fails
        return Array.from({ length: frameCount }, (_, i) => 
          `/frames2/frame_${(i + 1).toString().padStart(4, '0')}.webp`
        );
      }
    };

    const loadImages = async () => {
      const urls = await fetchBlobUrls();
      
      for (let i = 0; i < frameCount && i < urls.length; i++) {
        const img = new Image();
        img.decoding = 'async';
        img.crossOrigin = 'anonymous';

        const handleLoad = () => {
          loadedImages++;
          setLoadedCount(loadedImages);
          if (loadedImages === frameCount) {
            setTimeout(() => setLoading(false), 300);
            // Setup animation after all images are loaded
            setupAnimation();
          }
        };

        const handleError = () => {
          console.error(`Failed to load frame ${i + 1}`);
          loadedImages++;
          setLoadedCount(loadedImages);
          if (loadedImages === frameCount) {
            setTimeout(() => setLoading(false), 300);
            // Setup animation even if some images failed
            setupAnimation();
          }
        };

        img.addEventListener('load', handleLoad, { once: true });
        img.addEventListener('error', handleError, { once: true });

        img.src = urls[i];

        if (img.complete) {
          setTimeout(handleLoad, 0);
        }

        images.push(img);
      }
    };

    loadImages();

    const drawFrame = (index: number) => {
      const frameIndex = Math.min(Math.max(Math.floor(index), 0), frameCount - 1);
      const img = images[frameIndex];
      
      // Check if image exists, is complete, and not broken
      if (!img || !img.complete || img.naturalWidth === 0 || img.naturalHeight === 0) {
        return;
      }

      try {
        // Calculate canvas size in CSS pixels (account for devicePixelRatio)
        const dpr = Math.min(window.devicePixelRatio, 2);
        const canvasWidth = canvas.width / dpr;
        const canvasHeight = canvas.height / dpr;
        const imgRatio = img.width / img.height;

        context.clearRect(0, 0, canvasWidth, canvasHeight);

        // LAPTOP: Video width fills the screen (attached to sides)
        if (!isMobileDevice) {
          // Fit width to screen - maintain aspect ratio
          const drawWidth = canvasWidth;
          const drawHeight = drawWidth / imgRatio;
          const offsetX = 0;
          const offsetY = (canvasHeight - drawHeight) / 2;
          context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
          return;
        }

        // MOBILE: Apply contained zoom effect based on scroll progress
        // Zoom only affects the visual rendering, not the layout
        let scale = 1;
        if (frameData.scrollProgress >= 0.75) {
          // Map 0.75-1.0 progress to 1.0-0.5 scale (zoom out effect)
          const zoomProgress = (frameData.scrollProgress - 0.75) * 4;
          scale = 1 - (zoomProgress * 0.5); // Zooms from 1.0 to 0.5
        }

        // Fit height to screen - maintain aspect ratio
        const drawHeight = canvasHeight;
        const drawWidth = drawHeight * imgRatio;

        // Center the image on canvas
        const offsetX = (canvasWidth - drawWidth) / 2;
        const offsetY = (canvasHeight - drawHeight) / 2;

        // Apply transform for scaling around center
        // This ensures zoom stays centered and only affects the visual layer
        context.save();
        context.translate(canvasWidth / 2, canvasHeight / 2);
        context.scale(scale, scale);
        context.translate(-canvasWidth / 2, -canvasHeight / 2);
        
        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        context.restore();
      } catch (error) {
        console.error('Error drawing frame:', error);
      }
    };

    const initSmoothScroll = async () => {
      if (useSmoothScroll && typeof window !== 'undefined') {
        try {
          const Lenis = (await import('@studio-freight/lenis')).default;
          
          // Configure Lenis with options that won't affect other page components
          const lenisOptions: any = {
            duration: 1.8,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.7,
            touchMultiplier: 1.5,
            infinite: false,
            // Ensure Lenis targets the document for global scroll
            // but respects the container hierarchy
            target: window,
          };

          const lenis = new Lenis(lenisOptions);
          lenisRef.current = lenis;

          // Request animation frame loop for Lenis
          const raf = (time: number) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
          };
          requestAnimationFrame(raf);

          // Sync Lenis scroll with ScrollTrigger
          lenis.on('scroll', ScrollTrigger.update);

          // Also integrate Lenis with GSAP ticker for consistent animation timing
          gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
          });

          // Disable lag smoothing to prevent timing issues with other animations
          gsap.ticker.lagSmoothing(0);
          
          console.log('Lenis smooth scroll initialized for CanvasScrollAnimation');
        } catch (error) {
          console.warn('Lenis not installed, using native scroll:', error);
          // Fall back to native scroll without affecting other components
        }
      }
    };

    initSmoothScroll();

    const setupAnimation = () => {
      drawFrame(0);

      // Single ScrollTrigger that handles everything - scoped to container only
      // Ensure it doesn't affect the entire page
      gsap.to(frameData, {
        frame: frameCount - 1,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 5,
          markers: false, // Disable debug markers in production
          onUpdate: (self) => {
            const progress = self.progress;
            // Only track scroll progress on mobile
            if (isMobileDevice) {
              frameData.scrollProgress = progress;
            }
            const targetFrame = progress * (frameCount - 1);
            frameData.frame = targetFrame;
            drawFrame(targetFrame);
          },
        },
      });

      // Fade out overlay at frames 50-75 (faster fade out)
      // Scoped to container to ensure it doesn't affect other page elements
      if (overlayRef.current) {
        const fadeStartProgress = 30 / frameCount;
        const fadeEndProgress = 45 / frameCount;

        gsap.to(overlayRef.current, {
          opacity: 0,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: container,
            start: `${fadeStartProgress * 100}% top`,
            end: `${fadeEndProgress * 100}% top`,
            scrub: 3.5,
            markers: false,
          },
        });
      }

      // Fade out scroll indicator on scroll
      // Scoped to container to ensure it doesn't affect other page elements
      if (scrollIndicatorRef.current) {
        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: 'top+=100 top',
            scrub: 1.5,
            markers: false,
          },
        });
      }
    };

    // setupAnimation will be called after all images are loaded in loadImages

    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        setCanvasSize();
        drawFrame(frameData.frame);
        ScrollTrigger.refresh();
        // adjust container scroll height for smaller screens
        if (window.innerWidth < 640) {
          setScrollHeight('260vh');
        } else if (window.innerWidth < 1024) {
          setScrollHeight('360vh');
        } else {
          setScrollHeight('400vh');
        }
      }, 250);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      // Comprehensive cleanup to ensure no interference with other components
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      
      // Kill all ScrollTrigger instances created by this component
      // This prevents any lingering scroll handlers from affecting other components
      ScrollTrigger.getAll().forEach((trigger) => {
        if (trigger.vars?.trigger === container) {
          trigger.kill();
        }
      });
      
      // Properly destroy Lenis instance to prevent global scroll conflicts
      if (lenisRef.current) {
        try {
          lenisRef.current.destroy();
          lenisRef.current = null;
        } catch (error) {
          console.warn('Error destroying Lenis:', error);
        }
      }
      
      // Reset any overflow styles that might have been applied
      document.body.style.overflow = '';
    };
  }, [frameCount, useSmoothScroll, isMobile]);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="w-64 h-8 bg-gray-800 overflow-hidden">
            <div
              className="h-full transition-all duration-300 ease-out"
              style={{ 
                width: `${(loadedCount / frameCount) * 100}%`,
                background: 'linear-gradient(to right, #f86c24, #ffa500, #ffd700)'
              }}
            />
          </div>
        </div>
      )}

      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50">
        <div
          id="progress-bar"
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
          style={{ width: '0%' }}
        />
      </div>

      {showNavigation && !loading && (
        <>
        <nav className="fixed top-4 left-0 right-0 z-40 flex items-center justify-between px-8">
          <div className="flex flex-col items-start">
            <img src="/logo.png" alt="Quantiva" className="h-8 md:h-12" />
            <span className="coming-soon mt-1">Coming Soon</span>
          </div>

          <div className="flex items-center">
            <div
              className="relative rounded-full border-[0.35rem] border-[#262626] bg-[#141414] flex items-center overflow-hidden"
              style={{ width: '240px', maxWidth: '28vw' }}
              onClick={(e) => e.stopPropagation()}
            >
              {navMessage ? (
                <div className={`w-full h-8 md:h-4 flex items-center justify-center text-xs font-medium px-5 ${navError ? 'text-red-400' : 'text-green-400'}`}>
                  {navMessage}
                </div>
              ) : (
                <>
                  <input
                    type="email"
                    value={navEmail}
                    onChange={(e) => setNavEmail(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleNavSubmit(); } }}
                    placeholder={isMobile ? "Email" : "Enter your email"}
                    className="w-full h-10 md:h-6 bg-transparent border-none outline-none text-white font-sans text-[15px] md:text-sm px-5 md:px-3 py-2 placeholder:text-gray-500 placeholder:font-medium"
                    disabled={navSubmitted}
                    autoComplete="email"
                    aria-label="Email"
                    onClick={(e) => e.stopPropagation()}
                  />

                  <button
                    onClick={(e) => { e.preventDefault(); handleNavSubmit(); }}
                    disabled={navSubmitted}
                    className="px-2 h-12 md:h-8 bg-transparent text-white hover:text-gray-300 transition-colors disabled:opacity-70 flex items-center justify-center flex-shrink-0"
                    aria-label="Submit email"
                  >
                    {navSubmitted ? (
                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.3" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 010 20" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    )}
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
        {/* Load Orbitron for a robotic display look */}
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400;600;700&display=swap" rel="stylesheet" />
        <style jsx>{`
          .coming-soon {
            font-family: 'Orbitron', system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            font-weight: 600;
            letter-spacing: 0.6em;
            font-size: 0.8rem;
            padding-left: 0.6em;
            margin-top: -0.6rem;
            background: linear-gradient(90deg, #ffffff 0%, #ff9100ff 50%, #ffffff 100%);
            background-size: 200% 100%;
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: comingGradient 2.6s linear infinite;
            text-shadow: 0 10px 30px rgba(248,108,36,0.22), 0 0 14px rgba(255,255,255,0.12);
            transform-origin: left center;
          }
          //adding media code for mobile to reduce size of coming soon
          @media (max-width: 640px) {
            .coming-soon {
              font-size: 0.6rem;
              letter-spacing: 0.4em;
              padding-left: 0.4em;
              margin-top: -0.4rem;
            }
          }
          @keyframes comingGradient {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}</style>
        </>
      )}

      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: scrollHeight }}
      >
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full bg-black" />

          <div
            ref={overlayRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center text-white px-4 max-w-4xl">
              <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-6 tracking-wider">
                <span className="bg-clip-text text-transparent bg-gradient-to-r text-white">
                  WITNESS TRADING REIMAGINED
                </span>
              </h1>
            </div>
          </div>

          {/* Scroll indicator with glassmorphism */}
          <div 
            ref={scrollIndicatorRef}
            className="absolute bottom-6 sm:bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none"
          >
            <div 
              className="px-4 sm:px-6 py-2 sm:py-3 rounded-2xl"
              style={{
                background: 'rgba(239, 130, 22, 0.23137254901960785)',
                borderRadius: '16px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(3.2px)',
                WebkitBackdropFilter: 'blur(3.2px)'
              }}
            >
              <p className="text-white text-sm sm:text-md font-light tracking-wider">
                Scroll to begin the journey
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CanvasScrollAnimation;