'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// NOTE: To use this version, install Lenis:
// npm install @studio-freight/lenis
// or use the basic version without Lenis

gsap.registerPlugin(ScrollTrigger);

interface CanvasScrollAnimationProps {
  frameCount?: number;
  scrollDuration?: number;
  showNavigation?: boolean;
  useSmoothScroll?: boolean;
}

const CanvasScrollAnimation: React.FC<CanvasScrollAnimationProps> = ({
  frameCount = 359,
  scrollDuration = 4,
  showNavigation = true,
  useSmoothScroll = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);
  const lenisRef = useRef<any>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const scrollContainer = scrollContainerRef.current;

    if (!canvas || !container || !scrollContainer) return;

    const context = canvas.getContext('2d', { 
      alpha: false,
      desynchronized: true, // Better performance
    });
    if (!context) return;

    // Optimize canvas
    const setCanvasSize = () => {
      const dpr = Math.min(window.devicePixelRatio, 2); // Cap at 2x for performance
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.scale(dpr, dpr);
    };
    setCanvasSize();

    const currentFrame = (index: number) =>
      `/Frames/frame_${index.toString().padStart(4, '0')}.png`;

    const images: HTMLImageElement[] = [];
    const frameData = { frame: 0 };
    let loadedImages = 0;

    // Preload images with better error handling
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.decoding = 'async';

      // Attach handlers BEFORE setting src so cached images still fire logic
      const handleLoad = () => {
        loadedImages++;
        setLoadedCount(loadedImages);
        if (loadedImages === frameCount) {
          setTimeout(() => setLoading(false), 300);
        }
      };

      const handleError = () => {
        console.error(`Failed to load frame ${i + 1}`);
        loadedImages++;
        setLoadedCount(loadedImages);
        if (loadedImages === frameCount) {
          setTimeout(() => setLoading(false), 300);
        }
      };

      img.addEventListener('load', handleLoad, { once: true });
      img.addEventListener('error', handleError, { once: true });

      img.src = currentFrame(i + 1);

      // If the image was cached and already complete, call handler synchronously
      if (img.complete) {
        // queue to next tick so behavior matches normal load event
        setTimeout(handleLoad, 0);
      }

      images.push(img);
    }

    const drawFrame = (index: number) => {
      const frameIndex = Math.min(Math.max(Math.floor(index), 0), frameCount - 1);
      const img = images[frameIndex];
      
      if (!img || !img.complete) return;

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
    };

    // Initialize Lenis for ultra-smooth scrolling (optional)
    const initSmoothScroll = async () => {
      if (useSmoothScroll && typeof window !== 'undefined') {
        try {
          const Lenis = (await import('@studio-freight/lenis')).default;
          // Some Lenis versions/typings don't include all runtime options (like `smoothTouch`)
          // Cast the options to `any` to avoid TypeScript errors while keeping desired behavior.
          const lenisOptions: any = {
            duration: 1.2,
            easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
            orientation: 'vertical',
            gestureOrientation: 'vertical',
            smoothWheel: true,
            wheelMultiplier: 1,
            // Avoid using `smoothTouch` if typings don't include it; use touchMultiplier instead.
            touchMultiplier: 2,
            infinite: false,
          };

          const lenis = new Lenis(lenisOptions);

           lenisRef.current = lenis;

           const raf = (time: number) => {
             lenis.raf(time);
             requestAnimationFrame(raf);
           };
           requestAnimationFrame(raf);

          // Connect Lenis with GSAP ScrollTrigger
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

    // Use a setup function so we don't overwrite the original image load handler
    const setupAnimation = () => {
      drawFrame(0);

      // Main ScrollTrigger animation
      gsap.to(frameData, {
        frame: frameCount - 1,
        ease: 'none',
        scrollTrigger: {
          trigger: scrollContainer,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5, // Higher = smoother, prevents frame skipping
          onUpdate: (self) => {
            const progress = self.progress;
            const targetFrame = progress * (frameCount - 1);
            frameData.frame = targetFrame;
            drawFrame(targetFrame);
          },
        },
      });

      // Pin the canvas
      ScrollTrigger.create({
        trigger: container,
        start: 'top top',
        end: () => `+=${scrollDuration * window.innerHeight}`,
        pin: true,
        pinSpacing: false,
        anticipatePin: 1,
      });

      // Fade out overlay when frame 130+ appears
      if (overlayRef.current) {
        const fadeStartProgress = 100 / frameCount; // Start fading at frame 110
        const fadeEndProgress = 115 / frameCount; // Fully faded by frame 115

        gsap.to(overlayRef.current, {
          opacity: 0,
          ease: 'power2.inOut',
          scrollTrigger: {
            trigger: scrollContainer,
            start: `${fadeStartProgress * 100}% top`,
            end: `${fadeEndProgress * 100}% top`,
            scrub: 0.5,
          },
        });
      }

      // Progress indicator
      const progressBar = document.getElementById('progress-bar');
      if (progressBar) {
        ScrollTrigger.create({
          trigger: scrollContainer,
          start: 'top top',
          end: 'bottom bottom',
          onUpdate: (self) => {
            progressBar.style.width = `${self.progress * 100}%`;
          },
        });
      }
    };

    // If the first image already loaded, run setup immediately, otherwise add a listener
    if (images[0].complete) {
      setupAnimation();
    } else {
      images[0].addEventListener('load', setupAnimation, { once: true });
    }

    // Handle resize with debouncing
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
  }, [frameCount, scrollDuration, useSmoothScroll]);

  return (
    <>
      {/* Loading Screen */}
      {loading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black">
          <div className="text-center">
            <div className="mb-8">
              <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300 ease-out"
                  style={{ width: `${(loadedCount / frameCount) * 100}%` }}
                />
              </div>
            </div>
            <p className="text-white text-lg font-light tracking-wider">
              {Math.round((loadedCount / frameCount) * 100)}%
            </p>
            <p className="text-gray-500 text-sm mt-2">Loading frames...</p>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-transparent z-50">
        <div
          id="progress-bar"
          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-100"
          style={{ width: '0%' }}
        />
      </div>

      {/* Navigation */}
      {showNavigation && !loading && (
        <nav className="fixed top-4 left-0 right-0 z-40 flex items-center justify-between px-8">
          <h1 className="text-2xl font-light text-white tracking-wider">
            <b>QUANTIVA</b>
          </h1>
        </nav>
      )}

      {/* Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="relative"
        style={{ height: `${scrollDuration * 100}vh` }}
      >
        {/* Canvas Container */}
        <div ref={containerRef} className="sticky top-0 left-0 w-full h-screen overflow-hidden">
          <canvas ref={canvasRef} className="w-full h-full bg-black" />

          {/* Overlay Content */}
          <div
            ref={overlayRef}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center text-white px-4 max-w-4xl">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                <span className="bg-clip-text text-transparent bg-gradient-to-r text-white">
                  The Future of Trading
                </span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-down {
          0% {
            transform: translateY(0);
            opacity: 1;
          }
          100% {
            transform: translateY(12px);
            opacity: 0;
          }
        }
        
        .animate-scroll-down {
          animation: scroll-down 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default CanvasScrollAnimation;