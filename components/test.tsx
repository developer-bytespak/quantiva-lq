'use client'

import React, { useEffect } from 'react';

const CardRevealAnimation: React.FC = () => {
  const tradingSteps = [
    { title: 'Sign Up & Connect', subtitle: '01', icon: '👤', description: 'Create your account and securely connect your trading accounts' },
    { title: 'AI Strategies & Market Sentiment', subtitle: '02', icon: '🤖', description: 'AI analyzes market sentiment and generates strategies' },
    { title: 'Receive Trade Recommendations', subtitle: '03', icon: '📊', description: 'Receive personalized trade recommendations' },
    { title: 'Approve and Execute Trades', subtitle: '04', icon: '✅', description: 'Review and execute trades with one click' },
  ];

  useEffect(() => {
    // Import and setup GSAP
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
    script.onload = () => {
      const gsapScript = document.createElement('script');
      gsapScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/CustomEase.min.js';
      gsapScript.onload = () => {
        const { gsap } = window as any;
        const { CustomEase } = window as any;

        gsap.registerPlugin(CustomEase);
        CustomEase.create("hop", "0.75, 0, 0.2, 1");

        const introCards = document.querySelectorAll(".intro-cards .card");
        const introCardsCount = introCards.length;
        const radius = window.innerWidth < 1000 ? 150 : 225;

        // position each intro card in a circle
        introCards.forEach((card: any, i: number) => {
          const angle = (i / introCardsCount) * Math.PI * 2 - Math.PI / 2;

          const x = radius * Math.cos(angle);
          const y = radius * Math.sin(angle);

          gsap.set(card, {
            x: x,
            y: y,
            rotation: (angle * 180) / Math.PI + 90,
            transformPerspective: 800,
            transformOrigin: "center center",
            scale: 0,
          });
        });

        // position all outro cards at the same spot as the first intro card
        const outroCards = document.querySelectorAll(".outro-cards .card");

        const firstIntroCardAngle = (0 / introCardsCount) * Math.PI * 2 - Math.PI / 2;
        const firstIntroCardX = radius * Math.cos(firstIntroCardAngle);
        const firstIntroCardY = radius * Math.sin(firstIntroCardAngle);

        outroCards.forEach((card: any, index: number) => {
          gsap.set(card, {
            x: firstIntroCardX,
            y: firstIntroCardY,
            rotation: (firstIntroCardAngle * 180) / Math.PI + 90,
            rotationY: index === 0 ? 0 : 180,
            transformPerspective: 800,
            transformOrigin: "center center",
            zIndex: 4 - index,
            opacity: 0,
          });
        });

        // calculate card positions function with equal spacing
        const calculateCardPositions = () => {
          const viewportWidth = window.innerWidth;
          const cardRect = outroCards[0].getBoundingClientRect();
          const cardWidth = cardRect.width;
          const padding = viewportWidth < 1000 ? 16 : 32;
          
          // Calculate total available width
          const totalAvailableWidth = viewportWidth - (padding * 2);
          
          // Calculate total width needed for 4 cards
          const totalCardsWidth = cardWidth * 4;
          
          // Calculate total gap space (3 gaps for 4 cards)
          const totalGapSpace = totalAvailableWidth - totalCardsWidth;
          const gapBetweenCards = totalGapSpace / 3;
          
          // Calculate positions relative to center (0,0)
          const startX = -(totalCardsWidth + totalGapSpace) / 2 + cardWidth / 2;
          
          return [
            startX,
            startX + cardWidth + gapBetweenCards,
            startX + (cardWidth + gapBetweenCards) * 2,
            startX + (cardWidth + gapBetweenCards) * 3
          ];
        };

        // main animation timeline
        const tl = gsap.timeline({ delay: 0.5 });

        tl.to(introCards, {
          scale: 1,
          duration: 1,
          stagger: 0.1,
          ease: "hop",
          onComplete: () => {
            gsap.set(outroCards, { opacity: 1 });
            gsap.set(outroCards[0], { scale: 2.0, rotation: 0, rotationY: 0 });
            gsap.set(outroCards[1], { scale: 0.1, rotation: -60, rotationY: 180 });
            gsap.set(outroCards[2], { scale: 0.1, rotation: 60, rotationY: 180 });
            gsap.set(outroCards[3], { scale: 0.1, rotation: -30, rotationY: 180 });
          },
        });

        tl.to(introCards, {
          scale: 0,
          duration: 1,
          stagger: 0.1,
          ease: "hop",
        })
          .to(
            outroCards,
            {
              y: window.innerWidth < 1000 ? 0 : -125,
              duration: 1.5,
              ease: "hop",
            },
            "-=0.25"
          )
          .to(
            outroCards[0],
            {
              rotationY: 180,
              duration: 1.5,
              ease: "hop",
            },
            "<"
          )
          .to(
            outroCards,
            {
              x: (index: number) => calculateCardPositions()[index],
              scale: 2.0,
              rotation: 0,
              duration: 1.5,
              ease: "hop",
            },
            "<"
          );

        // hero-footer animation timeline
        const heroFooterTl = gsap.timeline({ delay: 0.5 });

        heroFooterTl
          .to(".hero-footer .logo img", {
            y: "0%",
            duration: 1,
            ease: "hop",
          })
          .to(
            ".hero-footer .logo",
            {
              scale: 1,
              duration: 1.25,
              ease: "hop",
            },
            "+=2.25"
          );

        // recalculate card positions when window resizes
        const updateCardPositions = () => {
          const positions = calculateCardPositions();

          outroCards.forEach((card: any, index: number) => {
            gsap.set(card, { x: positions[index] });
          });
        };

        window.addEventListener("resize", updateCardPositions);
      };
      document.head.appendChild(gsapScript);
    };
    document.head.appendChild(script);
  }, []);

  const styles = `
    @import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap");

    html, body {
      width: 100%;
      margin: 0;
      padding: 0;
      overflow-x: hidden;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: "Barlow Condensed";
      width: 100%;
    }

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    nav {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      padding: 1.5rem;
      display: flex;
      justify-content: space-between;
      gap: 2rem;
      transform: translateY(-100%);
      will-change: transform;
      z-index: 2;
    }

    nav > div {
      flex: 1;
    }

    nav .site-info {
      text-align: center;
    }

    nav .menu {
      text-align: right;
    }

    nav p {
      text-transform: uppercase;
      font-size: 1.25rem;
      font-weight: 700;
    }

    .container {
      position: relative;
      width: 100%;
      max-width: 100%;
      height: 100svh;
      padding: 2rem;
      background-color: #6c9a8b;
      overflow: hidden;
      margin: 0;
    }

    .intro-cards,
    .outro-cards {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
    }

    .card {
      position: absolute;
      width: 100px;
      height: 138.09px;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      transform-style: preserve-3d;
      will-change: transform;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .outro-cards .card:nth-child(2),
    .outro-cards .card:nth-child(3) {
      transform-origin: right bottom;
    }

    .outro-cards .card:nth-child(4) {
      transform-origin: left bottom;
    }

    .card-front,
    .card-back {
      position: absolute;
      width: 100%;
      height: 100%;
      backface-visibility: hidden;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }

    .card-front {
      display: flex;
      flex-direction: column;
      padding: 0.75rem;
      background-color: #fbf7f4;
      color: #0e0e0e;
      transform: rotateY(180deg);
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow: hidden;
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 0.5rem;
    }

    .card-icon {
      font-size: 1.25rem;
      line-height: 1;
    }

    .card-subtitle {
      font-size: 0.875rem;
      font-weight: 700;
      opacity: 0.6;
    }

    .card-title {
      font-size: 0.7rem;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 0.25rem;
    }

    .card-description {
      font-size: 0.55rem;
      line-height: 1.3;
      color: #666;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 3;
      -webkit-box-orient: vertical;
    }

    .card-front p {
      font-size: 1rem;
      font-weight: 700;
    }

    .hero-footer {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      padding: 1.5rem 2rem;
      display: flex;
      justify-content: center;
    }

    .hero-footer .logo {
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
      transform: scale(0.1);
      transform-origin: bottom;
      will-change: transform;
    }

    .hero-footer .logo img {
      position: relative;
      transform: translateY(125%);
    }

    .card {
      transform: translate(-50%, -50%) scale(0);
    }

    @media (max-width: 1000px) {
      nav {
        padding: 1rem;
        gap: 0;
      }

      .card {
        width: 60px;
        height: 83.44px;
      }

      .card-front {
        padding: 0.5rem;
      }

      .card-icon {
        font-size: 1rem;
      }

      .card-subtitle {
        font-size: 0.75rem;
      }

      .card-title {
        font-size: 0.6rem;
      }

      .card-description {
        font-size: 0.5rem;
        -webkit-line-clamp: 2;
      }

      .card-front p {
        font-size: 1rem;
      }

      .hero-footer {
        padding: 1rem;
      }

      .hero-footer .logo {
        transform: scale(0.5);
      }
    }
  `;

  return (
    <div style={{ width: '100%', margin: '0', padding: '0' }}>
      <style dangerouslySetInnerHTML={{ __html: styles }} />

      <div className="container">
        <div className="intro-cards">
          <div className="card"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='138'%3E%3Crect fill='%23ccc' width='100' height='138'/%3E%3C/svg%3E" /></div>
          <div className="card"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='138'%3E%3Crect fill='%23bbb' width='100' height='138'/%3E%3C/svg%3E" /></div>
          <div className="card"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='138'%3E%3Crect fill='%23aaa' width='100' height='138'/%3E%3C/svg%3E" /></div>
          <div className="card"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='138'%3E%3Crect fill='%23999' width='100' height='138'/%3E%3C/svg%3E" /></div>
          <div className="card"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='138'%3E%3Crect fill='%23888' width='100' height='138'/%3E%3C/svg%3E" /></div>
          <div className="card"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='138'%3E%3Crect fill='%23777' width='100' height='138'/%3E%3C/svg%3E" /></div>
          <div className="card"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='138'%3E%3Crect fill='%23666' width='100' height='138'/%3E%3C/svg%3E" /></div>
          <div className="card"><img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='138'%3E%3Crect fill='%23555' width='100' height='138'/%3E%3C/svg%3E" /></div>
        </div>

        <div className="outro-cards">
          <div className="card">
            <div className="card-back">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='138'%3E%3Crect fill='%23ccc' width='100' height='138'/%3E%3C/svg%3E" />
            </div>
            <div className="card-front">
              <div className="card-header">
                <span className="card-icon">{tradingSteps[0].icon}</span>
                <span className="card-subtitle">{tradingSteps[0].subtitle}</span>
              </div>
              <div className="card-title">{tradingSteps[0].title}</div>
              <div className="card-description">{tradingSteps[0].description}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-back">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='138'%3E%3Crect fill='%23ccc' width='100' height='138'/%3E%3C/svg%3E" />
            </div>
            <div className="card-front">
              <div className="card-header">
                <span className="card-icon">{tradingSteps[1].icon}</span>
                <span className="card-subtitle">{tradingSteps[1].subtitle}</span>
              </div>
              <div className="card-title">{tradingSteps[1].title}</div>
              <div className="card-description">{tradingSteps[1].description}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-back">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='138'%3E%3Crect fill='%23ccc' width='100' height='138'/%3E%3C/svg%3E" />
            </div>
            <div className="card-front">
              <div className="card-header">
                <span className="card-icon">{tradingSteps[2].icon}</span>
                <span className="card-subtitle">{tradingSteps[2].subtitle}</span>
              </div>
              <div className="card-title">{tradingSteps[2].title}</div>
              <div className="card-description">{tradingSteps[2].description}</div>
            </div>
          </div>
          <div className="card">
            <div className="card-back">
              <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='138'%3E%3Crect fill='%23ccc' width='100' height='138'/%3E%3C/svg%3E" />
            </div>
            <div className="card-front">
              <div className="card-header">
                <span className="card-icon">{tradingSteps[3].icon}</span>
                <span className="card-subtitle">{tradingSteps[3].subtitle}</span>
              </div>
              <div className="card-title">{tradingSteps[3].title}</div>
              <div className="card-description">{tradingSteps[3].description}</div>
            </div>
          </div>
        </div>

        <div className="hero-footer">
          <div className="logo">
            <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='60' viewBox='0 0 300 60'%3E%3Ctext x='150' y='35' text-anchor='middle' fill='%23fbf7f4' font-size='32' font-weight='bold' font-family='Barlow Condensed'%3EHow it Works%3C/text%3E%3C/svg%3E" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CardRevealAnimation;