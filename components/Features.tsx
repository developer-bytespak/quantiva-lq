'use client'

import React from "react";
import { FullScreenScrollFX, FullScreenFXAPI } from "@/components/ui/full-screen-scroll-fx";

const sections = [
  {
    id: "ai-trading",
    leftLabel: "AI-Driven",
    title: "Trading Strategies",
    rightLabel: "AI-Driven",
    background: "/features/card_cover_1.jpg",
  },
  {
    id: "sentiment",
    leftLabel: "Real-Time",
    title: "Sentiment Analysis",
    rightLabel: "Real-Time",
    background: "/features/card_cover_2.jpg",
  },
  {
    id: "portfolio",
    leftLabel: "Portfolio",
    title: "Optimization",
    rightLabel: "Portfolio",
    background: "/features/card_cover_3.jpg",
  },
  {
    id: "multi-exchange",
    leftLabel: "Multi-Exchange",
    title: "Connectivity",
    rightLabel: "Multi-Exchange",
    background: "/features/card_cover_1.jpg",
  },
];

const SplitCardScroll: React.FC = () => {
  const apiRef = React.useRef<FullScreenFXAPI>(null);

  return (
    <div className="font-serif bg-[#0f0f0f] text-white">
      <FullScreenScrollFX
        sections={sections}
        header={
          <>
            <div>Powerful Features for</div>
            <div style={{ color: '#f97316' }}>Modern Traders</div>
          </>
        }
        footer={<div></div>}
        showProgress
        durations={{ change: 0.7, snap: 800 }}
        colors={{
          text: "rgba(255,255,255,0.92)",
          overlay: "rgba(0,0,0,0.5)",
          pageBg: "#0f0f0f",
          stageBg: "#0f0f0f",
        }}
        fontFamily="system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif"
        apiRef={apiRef}
      />
    </div>
  );
};

export default SplitCardScroll;