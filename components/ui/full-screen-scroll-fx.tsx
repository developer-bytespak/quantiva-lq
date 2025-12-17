"use client";

import React, {
  CSSProperties,
  ReactNode,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

type Section = {
  id?: string;
  background: string;
  leftLabel?: ReactNode;
  title: string | ReactNode;
  rightLabel?: ReactNode;
  renderBackground?: (active: boolean, previous: boolean) => ReactNode;
};

type Colors = Partial<{
  text: string;
  overlay: string;
  pageBg: string;
  stageBg: string;
}>;

type Durations = Partial<{
  change: number; // section change animation
  snap: number;   // programmatic scroll duration (ms)
}>;

export type FullScreenFXAPI = {
  next: () => void;
  prev: () => void;
  goTo: (index: number) => void;
  getIndex: () => number;
  refresh: () => void;
};

export type FullScreenFXProps = {
  sections: Section[];
  className?: string;
  style?: CSSProperties;

  // Layout
  fontFamily?: string;
  header?: ReactNode;
  footer?: ReactNode;
  gap?: number;           // rem
  gridPaddingX?: number;  // rem

  showProgress?: boolean;
  debug?: boolean;

  // Motion
  durations?: Durations;
  reduceMotion?: boolean;
  smoothScroll?: boolean; // if you use Lenis, set to true and install lenis

  // Background transition
  bgTransition?: "fade" | "wipe"; // default "fade"
  parallaxAmount?: number;        // % for outgoing bg (fade mode uses a tiny y drift)

  // Controlled index
  currentIndex?: number;
  onIndexChange?: (index: number) => void;
  initialIndex?: number;

  // Colors
  colors?: Colors;

  // Imperative API
  apiRef?: React.Ref<FullScreenFXAPI>;
  ariaLabel?: string;
};

const clamp = (n: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, n));

export const FullScreenScrollFX = forwardRef<HTMLDivElement, FullScreenFXProps>(
  (
    {
      sections,
      className,
      style,

      fontFamily = 'inherit',
      header,
      footer,
      gap = 1,
      gridPaddingX = 2,

      showProgress = true,
      debug = false,

      durations = { change: 0.7, snap: 800 },
      reduceMotion,
      smoothScroll = false, // enable if you install Lenis

      bgTransition = "fade",
      parallaxAmount = 4,

      currentIndex,
      onIndexChange,
      initialIndex = 0,

      colors = {
        text: "rgba(245,245,245,0.92)",
        overlay: "rgba(0,0,0,0.35)",
        pageBg: "#ffffff",
        stageBg: "#000000",
      },

      apiRef,
      ariaLabel = "Full screen scroll slideshow",
    },
    ref
  ) => {
    const total = sections.length;
    const [localIndex, setLocalIndex] = useState(clamp(initialIndex, 0, Math.max(0, total - 1)));
    const isControlled = typeof currentIndex === "number";
    const index = isControlled ? clamp(currentIndex!, 0, Math.max(0, total - 1)) : localIndex;

    const rootRef = useRef<HTMLDivElement | null>(null);
    const fixedRef = useRef<HTMLDivElement | null>(null);
    const fixedSectionRef = useRef<HTMLDivElement | null>(null);

    const bgRefs = useRef<HTMLImageElement[]>([]);
    const wordRefs = useRef<HTMLSpanElement[][]>([]);

    const leftTrackRef = useRef<HTMLDivElement | null>(null);
    const rightTrackRef = useRef<HTMLDivElement | null>(null);
    const leftItemRefs = useRef<HTMLDivElement[]>([]);
    const rightItemRefs = useRef<HTMLDivElement[]>([]);

    const progressFillRef = useRef<HTMLDivElement | null>(null);
    const currentNumberRef = useRef<HTMLSpanElement | null>(null);

    const stRef = useRef<ScrollTrigger | null>(null);
    const lastIndexRef = useRef(index);
    const isAnimatingRef = useRef(false);
    const isSnappingRef = useRef(false);
    const sectionTopRef = useRef<number[]>([]);

    // prefers-reduced-motion
    const prefersReduced = useMemo(() => {
      if (typeof window === "undefined") return false;
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }, []);
    const motionOff = reduceMotion ?? prefersReduced;

    // Split words for center title
    const tempWordBucket = useRef<HTMLSpanElement[]>([]);
    const splitWords = (text: string) => {
      const words = text.split(/\s+/).filter(Boolean);
      return words.map((w, i) => (
        <span className="fx-word-mask" key={i}>
          <span className="fx-word" ref={(el) => { if (el) tempWordBucket.current.push(el); }}>{w}</span>
          {i < words.length - 1 ? " " : null}
        </span>
      ));
    };
    const WordsCollector = ({ onReady }: { onReady: () => void }) => {
      useEffect(() => onReady(), []); // eslint-disable-line
      return null;
    };

    // Compute scroll snap positions
    const computePositions = () => {
      const el = fixedSectionRef.current;
      if (!el) return;
      const top = el.offsetTop;
      const h = el.offsetHeight;
      const arr: number[] = [];
      for (let i = 0; i < total; i++) arr.push(top + (h * i) / total);
      sectionTopRef.current = arr;
    };

    // Align lists: center active row
    const measureAndCenterLists = (toIndex = index, animate = true) => {
      const centerTrack = (
        container: HTMLDivElement | null,
        items: HTMLDivElement[],
        isRight: boolean
      ) => {
        if (!container || items.length === 0) return;
        const first = items[0];
        const second = items[1];
        const contRect = container.getBoundingClientRect();
        let rowH = first.getBoundingClientRect().height;
        if (second) {
          // more accurate: distance between rows includes gap
          rowH = second.getBoundingClientRect().top - first.getBoundingClientRect().top;
        }
        // center math
        const targetY = contRect.height / 2 - rowH / 2 - toIndex * rowH;
        const prop = isRight ? rightTrackRef : leftTrackRef;
        if (!prop.current) return;
        if (animate) {
          gsap.to(prop.current, {
            y: targetY,
            duration: (durations.change ?? 0.7) * 0.9,
            ease: "power3.out",
          });
        } else {
          gsap.set(prop.current, { y: targetY });
        }
      };

      measureRAF(() => {
        measureRAF(() => {
          centerTrack(leftTrackRef.current, leftItemRefs.current, false);
          centerTrack(rightTrackRef.current, rightItemRefs.current, true);
        });
      });
    };

    const measureRAF = (fn: () => void) => {
      if (typeof window === "undefined") return;
      requestAnimationFrame(() => requestAnimationFrame(fn));
    };

    // ScrollTrigger for pinning + index step detection
    useLayoutEffect(() => {
      if (typeof window === "undefined") return;
      const fixed = fixedRef.current;
      const fs = fixedSectionRef.current;
      if (!fixed || !fs || total === 0) return;

      // initial bg states
      gsap.set(bgRefs.current, { opacity: 0, scale: 1.04, yPercent: 0 });
      if (bgRefs.current[0]) gsap.set(bgRefs.current[0], { opacity: 1, scale: 1 });

      // initial center words
      wordRefs.current.forEach((words, sIdx) => {
        words.forEach((w) => {
          gsap.set(w, {
            yPercent: sIdx === index ? 0 : 100,
            opacity: sIdx === index ? 1 : 0,
          });
        });
      });

      computePositions();
      measureAndCenterLists(index, false);

      const st = ScrollTrigger.create({
        trigger: fs,
        start: "top top",
        end: "bottom bottom",
        pin: fixed,
        pinSpacing: true,
        onUpdate: (self) => {
          if (motionOff || isSnappingRef.current) return;
          const prog = self.progress;
          const target = Math.min(total - 1, Math.floor(prog * total));
          if (target !== lastIndexRef.current && !isAnimatingRef.current) {
            const next = lastIndexRef.current + (target > lastIndexRef.current ? 1 : -1);
            // programmatic one-step snap without extra sound
            goTo(next, false);
          }
          if (progressFillRef.current) {
            const p = (lastIndexRef.current / (total - 1 || 1)) * 100;
            progressFillRef.current.style.width = `${p}%`;
          }
        },
      });

      stRef.current = st;

      // initial jump if needed
      if (initialIndex && initialIndex > 0 && initialIndex < total) {
        requestAnimationFrame(() => goTo(initialIndex, false));
      }

      // handle resize
      const ro = new ResizeObserver(() => {
        computePositions();
        measureAndCenterLists(lastIndexRef.current, false);
        ScrollTrigger.refresh();
      });
      ro.observe(fs);

      return () => {
        ro.disconnect();
        st.kill();
        stRef.current = null;
      };
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [total, initialIndex, motionOff, bgTransition, parallaxAmount]);

    // Section change visuals
    const changeSection = (to: number, forceChange = false) => {
      if (to === lastIndexRef.current && !forceChange) return;
      if (isAnimatingRef.current && !forceChange) return;
      const from = lastIndexRef.current;
      const down = to > from;
      isAnimatingRef.current = true;
      
      // Update lastIndexRef immediately when forceChange (click) to prevent conflicts
      // But only after we've captured 'from' and 'down' for animation direction
      if (forceChange) {
        lastIndexRef.current = to;
      }

      if (!isControlled) setLocalIndex(to);
      onIndexChange?.(to);

      // progress numbers
      if (currentNumberRef.current) {
        currentNumberRef.current.textContent = String(to + 1).padStart(2, "0");
      }
      if (progressFillRef.current) {
        const p = (to / (total - 1 || 1)) * 100;
        progressFillRef.current.style.width = `${p}%`;
      }

      const D = durations.change ?? 0.7;

      // center title word animation (mask slide)
      const outWords = wordRefs.current[from] || [];
      const inWords = wordRefs.current[to] || [];
      if (outWords.length) {
        gsap.to(outWords, {
          yPercent: down ? -100 : 100,
          opacity: 0,
          duration: D * 0.6,
          stagger: down ? 0.03 : -0.03,
          ease: "power3.out",
        });
      }
      if (inWords.length) {
        gsap.set(inWords, { yPercent: down ? 100 : -100, opacity: 0 });
        gsap.to(inWords, {
          yPercent: 0,
          opacity: 1,
          duration: D,
          stagger: down ? 0.05 : -0.05,
          ease: "power3.out",
        });
      }

      // backgrounds — FADE mode (requested)
      const prevBg = bgRefs.current[from];
      const newBg = bgRefs.current[to];
      if (bgTransition === "fade") {
        if (newBg) {
          gsap.set(newBg, { opacity: 0, scale: 1.04, yPercent: down ? 1 : -1 });
          gsap.to(newBg, { opacity: 1, scale: 1, yPercent: 0, duration: D, ease: "power2.out" });
        }
        if (prevBg) {
          gsap.to(prevBg, {
            opacity: 0,
            yPercent: down ? -parallaxAmount : parallaxAmount,
            duration: D,
            ease: "power2.out",
          });
        }
      } else {
        // optional wipe mode
        if (newBg) {
          gsap.set(newBg, {
            opacity: 1,
            clipPath: down ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)",
            scale: 1,
            yPercent: 0,
          });
          gsap.to(newBg, { clipPath: "inset(0 0 0 0)", duration: D, ease: "power3.out" });
        }
        if (prevBg) {
          gsap.to(prevBg, { opacity: 0, duration: D * 0.8, ease: "power2.out" });
        }
      }

      // lists — center active row and animate active state
      measureAndCenterLists(to, true);

      leftItemRefs.current.forEach((el, i) => {
        el.classList.toggle("active", i === to);
        gsap.to(el, {
          opacity: i === to ? 1 : 0.35,
          x: i === to ? 10 : 0,
          duration: D * 0.6,
          ease: "power3.out",
        });
      });
      rightItemRefs.current.forEach((el, i) => {
        el.classList.toggle("active", i === to);
        gsap.to(el, {
          opacity: i === to ? 1 : 0.35,
          x: i === to ? -10 : 0,
          duration: D * 0.6,
          ease: "power3.out",
        });
      });

      // Only update lastIndexRef at the end if we didn't update it immediately (for forceChange)
      gsap.delayedCall(D, () => {
        if (!forceChange) {
          lastIndexRef.current = to;
        }
        isAnimatingRef.current = false;
      });
    };

    // programmatic navigation
    const goTo = (to: number, withScroll = true, forceChange = false) => {
      const clamped = clamp(to, 0, total - 1);
      
      // Recompute positions first to ensure accuracy
      computePositions();
      
      // Ensure positions array is valid
      if (!sectionTopRef.current || sectionTopRef.current.length === 0) {
        computePositions();
      }
      
      // Set snapping flag before making changes
      isSnappingRef.current = true;
      
      // Change section (this will update lastIndexRef if forceChange)
      changeSection(clamped, forceChange);

      if (withScroll && typeof window !== "undefined") {
        const pos = sectionTopRef.current[clamped];
        const snapMs = durations.snap ?? 800;
        
        // Temporarily disable ScrollTrigger to prevent interference
        const st = stRef.current;
        if (st) {
          st.disable();
        }
        
        // Use smooth scroll to the exact position
        const targetPos = Math.max(0, pos || 0);
        
        // Scroll immediately - use both methods to ensure it works
        window.scrollTo({ top: targetPos, behavior: "smooth" });
        
        // Fallback: also try direct assignment after a small delay
        setTimeout(() => {
          if (Math.abs(window.scrollY - targetPos) > 10) {
            window.scrollTo({ top: targetPos, behavior: "auto" });
          }
        }, 100);
        
        // Re-enable ScrollTrigger after scroll animation completes
        setTimeout(() => {
          if (st) {
            st.enable();
            // Refresh to sync ScrollTrigger with new scroll position
            ScrollTrigger.refresh();
          }
          isSnappingRef.current = false;
        }, snapMs);
      } else {
        setTimeout(() => (isSnappingRef.current = false), 10);
      }
    };

    const next = () => goTo(index + 1);
    const prev = () => goTo(index - 1);

    useImperativeHandle(apiRef, () => ({
      next,
      prev,
      goTo,
      getIndex: () => index,
      refresh: () => ScrollTrigger.refresh(),
    }));

    // click/hover on list items
    const handleJump = (i: number, e?: React.MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      // Force change to allow clicking during animations
      goTo(i, true, true);
    };
    const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleJump(i);
      }
    };
    const handleLoadedStagger = () => {
      // soft entrance for lists at mount
      leftItemRefs.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          { opacity: i === index ? 1 : 0.35, y: 0, duration: 0.5, delay: i * 0.06, ease: "power3.out" }
        );
      });
      rightItemRefs.current.forEach((el, i) => {
        gsap.fromTo(
          el,
          { opacity: 0, y: 20 },
          { opacity: i === index ? 1 : 0.35, y: 0, duration: 0.5, delay: 0.2 + i * 0.06, ease: "power3.out" }
        );
      });
    };

    // mount entrance
    useEffect(() => {
      handleLoadedStagger();
      measureAndCenterLists(index, false);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // CSS vars
    const cssVars: CSSProperties = {
      ["--fx-font" as any]: fontFamily, // inherit global font
      ["--fx-text" as any]: colors.text ?? "rgba(245,245,245,0.92)",
      ["--fx-overlay" as any]: colors.overlay ?? "rgba(0,0,0,0.35)",
      ["--fx-page-bg" as any]: colors.pageBg ?? "#fff",
      ["--fx-stage-bg" as any]: colors.stageBg ?? "#000",
      ["--fx-gap" as any]: `${gap}rem`,
      ["--fx-grid-px" as any]: `${gridPaddingX}rem`,
      ["--fx-row-gap" as any]: "10px",
    };

    return (
      <div
        ref={(node) => {
          (rootRef as any).current = node;
          if (typeof ref === "function") ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={["fx", className].filter(Boolean).join(" ")}
        style={{ ...cssVars, ...style }}
        aria-label={ariaLabel}
      >
        {debug && <div className="fx-debug">Section: {index}</div>}

        <div className="fx-scroll">
          <div className="fx-fixed-section" ref={fixedSectionRef}>
            <div className="fx-fixed" ref={fixedRef}>
              {/* Backgrounds */}
              <div className="fx-bgs" aria-hidden="true">
                {sections.map((s, i) => (
                  <div className="fx-bg" key={s.id ?? i}>
                    {s.renderBackground ? (
                      s.renderBackground(index === i, lastIndexRef.current === i)
                    ) : (
                      <>
                        <img
                          ref={(el) => { if (el) bgRefs.current[i] = el; }}
                          src={s.background}
                          alt=""
                          className="fx-bg-img"
                        />
                        <div className="fx-bg-overlay" />
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Grid */}
              <div className="fx-grid">
                {/* Header */}
                {header && <div className="fx-header">{header}</div>}

                {/* Content (lists + center) */}
                <div className="fx-content">
                  {/* Left list */}
                  <div className="fx-left" role="list">
                    <div className="fx-track" ref={leftTrackRef}>
                      {sections.map((s, i) => (
                        <div
                          key={`L-${s.id ?? i}`}
                          className={`fx-item fx-left-item ${i === index ? "active" : ""}`}
                          ref={(el) => { if (el) leftItemRefs.current[i] = el; }}
                          onClick={(e) => handleJump(i, e)}
                          onKeyDown={(e) => handleKeyDown(e, i)}
                          role="button"
                          tabIndex={0}
                          aria-pressed={i === index}
                          aria-label={`Go to section ${i + 1}: ${typeof s.leftLabel === 'string' ? s.leftLabel : `Section ${i + 1}`}`}
                        >
                          {s.leftLabel}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Center title (masked words if string) */}
                  <div className="fx-center">
                    {sections.map((s, sIdx) => {
                      tempWordBucket.current = [];
                      const isString = typeof s.title === "string";
                      return (
                        <div key={`C-${s.id ?? sIdx}`} className={`fx-featured ${sIdx === index ? "active" : ""}`}>
                          <h3
                            className="fx-featured-title"
                            style={typeof window !== 'undefined' && window.innerWidth <= 768 ? { fontSize: '3.2rem' } : undefined}
                          >
                            {isString ? splitWords(s.title as string) : s.title}
                          </h3>
                          <WordsCollector
                            onReady={() => {
                              if (tempWordBucket.current.length) {
                                wordRefs.current[sIdx] = [...tempWordBucket.current];
                              }
                              tempWordBucket.current = [];
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Right list */}
                  <div className="fx-right" role="list">
                    <div className="fx-track" ref={rightTrackRef}>
                      {sections.map((s, i) => (
                        <div
                          key={`R-${s.id ?? i}`}
                          className={`fx-item fx-right-item ${i === index ? "active" : ""}`}
                          ref={(el) => { if (el) rightItemRefs.current[i] = el; }}
                          onClick={(e) => handleJump(i, e)}
                          onKeyDown={(e) => handleKeyDown(e, i)}
                          role="button"
                          tabIndex={0}
                          aria-pressed={i === index}
                          aria-label={`Go to section ${i + 1}: ${typeof s.rightLabel === 'string' ? s.rightLabel : `Section ${i + 1}`}`}
                        >
                          {s.rightLabel}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer + progress */}
                <div className="fx-footer">
                  {footer && <div className="fx-footer-title">{footer}</div>}
                  {showProgress && (
                    <div className="fx-progress">
                      <div className="fx-progress-numbers">
                        <span ref={currentNumberRef}>{String(index + 1).padStart(2, "0")}</span>
                        <span>{String(total).padStart(2, "0")}</span>
                      </div>
                      <div className="fx-progress-bar">
                        <div className="fx-progress-fill" ref={progressFillRef} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          .fx {
            width: 100%;
            overflow: hidden;
            background: var(--fx-page-bg);
            color: #000;
            font-family: var(--fx-font);
            text-transform: uppercase;
            letter-spacing: -0.02em;
          }

          .fx-debug {
            position: fixed; bottom: 10px; right: 10px; z-index: 9999;
            background: rgba(255,255,255,0.8); color: #000; padding: 6px 8px; font: 12px/1 monospace; border-radius: 4px;
          }

          .fx-fixed-section { height: ${Math.max(1, total + 1)}00vh; position: relative; }
          .fx-fixed { position: sticky; top: 0; height: 100vh; width: 100%; overflow: hidden; background: var(--fx-page-bg); }

          .fx-grid {
            display: grid;
            grid-template-columns: repeat(12, 1fr);
            gap: var(--fx-gap);
            padding: 0 var(--fx-grid-px);
            position: relative;
            height: 100%;
            z-index: 2;
          }

          .fx-bgs { position: absolute; inset: 0; background: var(--fx-stage-bg); z-index: 1; }
          .fx-bg { position: absolute; inset: 0; }
          .fx-bg-img {
            position: absolute; inset: -10% 0 -10% 0;
            width: 100%; height: 120%; object-fit: cover;
            filter: brightness(0.8);
            opacity: 0;
            will-change: transform, opacity;
          }
          .fx-bg-overlay { position: absolute; inset: 0; background: var(--fx-overlay); }

          .fx-header {
            grid-column: 1 / 13; align-self: start; padding-top: 8vh;
            /* Use global font (inherit) and reduced sizes to avoid overlap on large screens */
            font-size: clamp(2rem, 4.5vw, 3.6rem);
            line-height: 0.95; text-align: center; color: var(--fx-text);
            position: relative;
            z-index: 5;
          }
          .fx-header > * { display: block; }

          .fx-content {
            grid-column: 1 / 13;
            position: absolute; inset: 0;
            display: grid; grid-template-columns: 0.6fr 1.3fr 0.6fr; /* L 15% / C 70% / R 15% — narrower lists */
            gap: 2rem;
            align-items: center;
            height: 100%;
            padding: 0 var(--fx-grid-px);
            z-index: 10;
          }

          .fx-left, .fx-right {
            height: 60vh; /* gives us room to center the active row */
            overflow: hidden;
            display: grid; align-content: center;
            position: relative;
            z-index: 20;
          }
          .fx-left { justify-items: start; text-align: left; }
          .fx-right { justify-items: end; text-align: right; }
          .fx-track { will-change: transform; position: relative; z-index: 21; display: flex; flex-direction: column; align-items: inherit; }

          .fx-item {
            color: var(--fx-text);
            font-weight: 800;
            letter-spacing: 0em;
            line-height: 1;
            margin: calc(var(--fx-row-gap) / 2) 0;
            opacity: 0.35;
            transition: opacity 0.3s ease, transform 0.3s ease;
            position: relative;
            font-size: clamp(0.65rem, 1.1vw, 0.95rem);
            user-select: none;
            cursor: pointer;
            pointer-events: auto !important;
            z-index: 25;
            touch-action: manipulation;
          }
          .fx-item:hover {
            opacity: 0.7;
          }
          .fx-left-item.active, .fx-right-item.active { opacity: 1; }
          .fx-left-item.active:hover, .fx-right-item.active:hover { opacity: 1; }
          .fx-left-item.active { transform: translateX(10px); padding-left: 16px; }
          .fx-right-item.active { transform: translateX(-10px); padding-right: 16px; }

          .fx-left-item.active::before,
          .fx-right-item.active::after {
            content: "";
            position: absolute; top: 50%; transform: translateY(-50%);
            width: 6px; height: 6px; background: var(--fx-text); border-radius: 50%;
          }
          .fx-left-item.active::before { left: 0; }
          .fx-right-item.active::after { right: 0; }

          .fx-center {
            display: grid; place-items: center; text-align: center; height: 60vh; overflow: hidden;
            pointer-events: none;
            position: relative;
            z-index: 1;
          }
          .fx-featured { position: absolute; opacity: 0; visibility: hidden; pointer-events: none; }
          .fx-featured.active { opacity: 1; visibility: visible; pointer-events: none; }
          .fx-featured-title {
            margin: 0; color: var(--fx-text);
            font-weight: 900; letter-spacing: -0.01em;
            /* Increased featured title size */
            font-size: clamp(2.2rem, 5.5vw, 3.8rem);
          }
          .fx-word-mask { display: inline-block; overflow: hidden; vertical-align: middle; }
          .fx-word { display: inline-block; vertical-align: middle; }

          .fx-footer {
            grid-column: 1 / 13; align-self: end; padding-bottom: 5vh; text-align: center;
          }
          .fx-footer-title { color: var(--fx-text); font-size: clamp(1.6rem, 7vw, 7rem); font-weight: 900; letter-spacing: -0.01em; line-height: 0.9; }
          .fx-progress { width: 200px; height: 2px; margin: 1rem auto 0; background: rgba(245,245,245,0.28); position: relative; }
          .fx-progress-fill { position: absolute; inset: 0 auto 0 0; width: 0%; background: var(--fx-text); height: 100%; transition: width 0.3s ease; }
          .fx-progress-numbers { position: absolute; inset: auto 0 100% 0; display: flex; justify-content: space-between; font-size: 0.8rem; color: var(--fx-text); }

          /* Keep responsive scaling without changing layout */
          @media (max-width: 1400px) {
            .fx-item {
              font-size: clamp(1rem, 1.8vw, 1.4rem);
            }
            .fx-featured-title {
              font-size: clamp(2rem, 4.8vw, 3.4rem);
            }
            .fx-header {
              font-size: clamp(1.5rem, 3.5vw, 3rem);
            }
          }

          @media (max-width: 1024px) {
            .fx-item {
              font-size: clamp(0.95rem, 1.6vw, 1.3rem);
            }
            .fx-featured-title {
              font-size: clamp(1.8rem, 4vw, 2.8rem);
            }
            .fx-header {
              font-size: clamp(1.4rem, 3.2vw, 2.5rem);
            }
          }

          @media (max-width: 768px) {
            .fx-left .fx-track {
              display: flex;
              flex-direction: column-reverse;
              align-items: flex-start;
            }
            .fx-left, .fx-right {
              height: 2.5rem;
            }
            .fx-center {
              height: 9rem;
            }
            .fx-left, .fx-right {
              justify-items: center;
              text-align: center;
            }
            .fx-item {
              font-size: 0.6rem;
            }
            .fx-item.active {
              font-size: 1.2rem;
            }
            .fx-featured-title {
              font-size: 4.4rem !important;
            }
            .fx-header {
              font-size: clamp(1.35rem, 2.8vw, 2rem);
              padding-top: 5vh;
            }
          }

          @media (max-width: 640px) {
            .fx-left .fx-track {
              margin-bottom: 3.2rem;
            }
            .fx-left .fx-track {
              display: flex;
              flex-direction: column-reverse;
              align-items: center;
            }
            .fx-left, .fx-right {
              height: 2.2rem;
            }
            .fx-center {
              height: 8rem;
            }
            .fx-left, .fx-right {
              justify-items: center;
              text-align: center;
            }
            .fx-item {
              align-items: flex-start;
              margin-top: 0;
            }
            .fx-featured-title {
              font-size: 4.4rem !important;
            }
            .fx-header {
              font-size: clamp(1.3rem, 2.4vw, 1.8rem);
              padding-top: 6vh;
            }
            .fx-grid {
              padding: 0;
            }
            .fx-content {
              padding: 0;
              grid-template-columns: 1fr;
              gap: 0;
              position: relative;
              margin-top: -1.5rem;
            }
            .fx-left {
              grid-row: 1;
              justify-items: center;
              height: auto;
              padding-bottom: 2rem;
            }
            .fx-center {
              grid-row: 2;
              height: auto;
              padding: 2rem 0;
            }
            .fx-right {
              grid-row: 3;
              justify-items: center;
              height: auto;
              padding-top: 0;
            }
            .fx-left-item.active, .fx-right-item.active {
              padding-left: 12px;
              padding-right: 12px;
            }
            .fx-left-item.active::before,
            .fx-right-item.active::after {
              width: 5px;
              height: 5px;
            }
          }

          @media (max-width: 480px) {
            .fx-left .fx-track {
              margin-bottom: 3.2rem;
            }
            .fx-left .fx-track {
              display: flex;
              flex-direction: column-reverse;
              align-items: center;
            }
            .fx-left, .fx-right {
              height: 2rem;
            }
            .fx-center {
              height: 7rem;
            }
            .fx-left, .fx-right {
              justify-items: center;
              text-align: center;
            }
            .fx-item {
              align-items: flex-start;
              margin-top: 0;
            }
            .fx-featured-title {
              font-size: 4.4rem !important;
            }
            .fx-header {
              font-size: clamp(0.7rem, 2.2vw, 1.6rem);
              padding-top: 7vh;
            }
            .fx-grid {
              padding: 0;
            }
            .fx-content {
              padding: 0;
              grid-template-columns: 1fr;
              gap: 0;
              position: relative;
              margin-top: -2.2rem;
            }
            .fx-left {
              grid-row: 1;
              justify-items: center;
              height: auto;
              padding-bottom: 1.5rem;
              margin-top: -1.2rem;
            }
            .fx-center {
              grid-row: 2;
              height: auto;
              padding: 1.5rem 0;
            }
            .fx-right {
              grid-row: 3;
              justify-items: center;
              height: auto;
              padding-top: 0;
              margin-top: -1.2rem;
            }
            .fx-grid-px {
              padding-left: 0.75rem !important;
              padding-right: 0.75rem !important;
            }
          }
        `}</style>
      </div>
    );
  }
);

FullScreenScrollFX.displayName = "FullScreenScrollFX";

