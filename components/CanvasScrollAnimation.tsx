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
  frameCount = 359,
  showNavigation = true,
  useSmoothScroll = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    // Disable scrolling when loading
    if (loading) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [loading]);

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
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.scale(dpr, dpr);
    };
    setCanvasSize();

    const images: HTMLImageElement[] = [];
    const frameData = { frame: 0 };
    let loadedImages = 0;

    // Fetch blob URLs from API
    const fetchBlobUrls = async () => {
      try {
        const response = await fetch('/api/frames');
        if (!response.ok) {
          throw new Error('Failed to fetch blob URLs');
        }
        const data = await response.json();
        return data.urls as string[];
      } catch (error) {
        console.error('Error fetching blob URLs:', error);
        // Fallback to local paths if blob fetch fails
        return Array.from({ length: frameCount }, (_, i) => 
          `/Frames/frame_${(i + 1).toString().padStart(4, '0')}.png`
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
        const canvasWidth = canvas.width / (Math.min(window.devicePixelRatio, 2));
        const canvasHeight = canvas.height / (Math.min(window.devicePixelRatio, 2));
        const canvasRatio = canvasWidth / canvasHeight;
        const imgRatio = img.width / img.height;

        let drawWidth, drawHeight, offsetX, offsetY;

        if (canvasRatio > imgRatio) {
          drawWidth = canvasWidth;
          drawHeight = canvasWidth / imgRatio;
          offsetX = 0;
          offsetY = (canvasHeight - drawHeight) / 2;
        } else {
          drawHeight = canvasHeight;
          drawWidth = canvasHeight * imgRatio;
          offsetX = (canvasWidth - drawWidth) / 2;
          offsetY = 0;
        }

        context.clearRect(0, 0, canvasWidth, canvasHeight);
        context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      } catch (error) {
        console.error('Error drawing frame:', error);
        // Don't throw, just skip this frame
      }
    };

    const initSmoothScroll = async () => {
      if (useSmoothScroll && typeof window !== 'undefined') {
        try {
          const Lenis = (await import('@studio-freight/lenis')).default;
          const lenisOptions: any = {
            duration: 1.8,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 0.7,
            touchMultiplier: 1.5,
            infinite: false,
          };

          const lenis = new Lenis(lenisOptions);
          lenisRef.current = lenis;

          const raf = (time: number) => {
            lenis.raf(time);
            requestAnimationFrame(raf);
          };
          requestAnimationFrame(raf);

          lenis.on('scroll', ScrollTrigger.update);

          gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
          });

          gsap.ticker.lagSmoothing(0);
        } catch (error) {
          console.warn('Lenis not installed, using native scroll');
        }
      }
    };

    initSmoothScroll();

    const setupAnimation = () => {
      drawFrame(0);

      // Single ScrollTrigger that handles everything - no pinning
      gsap.to(frameData, {
        frame: frameCount - 1,
        ease: 'none',
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 3,
          onUpdate: (self) => {
            const progress = self.progress;
            const targetFrame = progress * (frameCount - 1);
            frameData.frame = targetFrame;
            drawFrame(targetFrame);
          },
        },
      });

      // Fade out overlay at frames 100-115
      if (overlayRef.current) {
        const fadeStartProgress = 100 / frameCount;
        const fadeEndProgress = 115 / frameCount;

        gsap.to(overlayRef.current, {
          opacity: 0,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: container,
            start: `${fadeStartProgress * 100}% top`,
            end: `${fadeEndProgress * 100}% top`,
            scrub: 2,
          },
        });
      }

      // Fade out scroll indicator on scroll
      if (scrollIndicatorRef.current) {
        gsap.to(scrollIndicatorRef.current, {
          opacity: 0,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: container,
            start: 'top top',
            end: 'top+=100 top',
            scrub: 1.5,
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
      }, 250);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
      
      if (lenisRef.current) {
        lenisRef.current.destroy();
      }
    };
  }, [frameCount, useSmoothScroll]);

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
        <nav className="fixed top-4 left-0 right-0 z-40 flex items-center justify-between px-8">
          <img src="/logo.png" alt="Quantiva" className="h-12" />
        </nav>
      )}

      <div
        ref={containerRef}
        className="relative w-full"
        style={{ height: '400vh' }}
      >
        <div className="sticky top-0 left-0 w-full h-screen overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full bg-black" />

          <div
            ref={overlayRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center text-white px-4 max-w-4xl">
              <h1 className="text-6xl md:text-6xl font-bold mb-6 tracking-wider">
                <span className="bg-clip-text text-transparent bg-gradient-to-r text-white">
                  WITNESS TRADING REIMAGINED
                </span>
              </h1>
            </div>
          </div>

          {/* Scroll indicator with glassmorphism */}
          <div 
            ref={scrollIndicatorRef}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-none"
          >
            <div 
              className="px-6 py-3 rounded-2xl"
              style={{
                background: 'rgba(239, 130, 22, 0.23137254901960785)',
                borderRadius: '16px',
                boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
                backdropFilter: 'blur(3.2px)',
                WebkitBackdropFilter: 'blur(3.2px)'
              }}
            >
              <p className="text-white text-md font-light tracking-wider">
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