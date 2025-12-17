"use client";

import React from "react";
import { FullScreenScrollFX, FullScreenFXAPI } from "@/components/ui/full-screen-scroll-fx";

const TripleTitle = ({ text }: { text: string }) => (
	<div className="flex flex-col items-center justify-center gap-2 sm:gap-3 md:gap-4">
		<div className="text-sm sm:text-xl md:text-3xl lg:text-4xl font-bold tracking-wider opacity-30 blur-[2px]">
			{text}
		</div>
		<div className="text-base sm:text-2xl md:text-3xl lg:text-4xl font-black tracking-wider bg-gradient-to-r from-[#f86c24] via-[#ffa500] to-[#ffd700] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] [-webkit-background-clip:text] shadow-2xl scale-100 sm:scale-105 md:scale-110">
			{text}
		</div>
		<div className="text-sm sm:text-xl md:text-3xl lg:text-4xl font-bold tracking-wider opacity-30 blur-[2px]">
			{text}
		</div>
	</div>
);

const sections = [
	{
		leftLabel: "Ai-Driven",
		title: <TripleTitle text="TRADING STRATEGIES" />,
		rightLabel: "Ai-Driven",
		background:
			"https://images.pexels.com/photos/3289156/pexels-photo-3289156.jpeg?cs=srgb&dl=pexels-alexfu-3289156.jpg&fm=jpg&_gl=1*1acr8i7*_ga*MTI3MjA2NDU0Mi4xNzU1NzM3ODI5*_ga_8JE65Q40S6*czE3NTU3NjkyMzgkbzMkZzEkdDE3NTU3Njk1MTckajYwJGwwJGgw",
		audioSrc: "/sfx/click-01.mp3",
	},
	{
		leftLabel: "REAL TIME",
		title: <TripleTitle text="SENTIMENT ANALYSIS" />,
		rightLabel: "REAL TIME",
		background:
			"https://images.pexels.com/photos/163790/at-night-under-a-lantern-guy-night-city-163790.jpeg",
		audioSrc: "/sfx/whoosh-02.mp3",
	},
	{
		leftLabel: "AI POWERED",
		title: <TripleTitle text="TOP 500 STOCKS TRADING" />,
		rightLabel: "AI POWERED",
		background: "https://images.pexels.com/photos/939807/pexels-photo-939807.jpeg",
		audioSrc: "/sfx/whoosh-02.mp3",
	},
	{
		leftLabel: "AUTOMATED",
		title: <TripleTitle text="RISK ASSESSED OPTIMIZATION" />,
		rightLabel: "AUTOMATED",
		background: "https://images.pexels.com/photos/9817/pexels-photo-9817.jpeg",
		audioSrc: "/sfx/whoosh-02.mp3",
	},
	{
		leftLabel: "Innovative",
		title: <TripleTitle text="VENTURE CAPITAL POOL" />,
		rightLabel: "Innovative",
		background:
			"https://images.pexels.com/photos/2033990/pexels-photo-2033990.jpeg",
		audioSrc: "/sfx/whoosh-02.mp3",
	},
];

export default function Features() {
	const apiRef = React.useRef<FullScreenFXAPI | null>(null);

	return (
		<FullScreenScrollFX
			sections={sections}
			header={
				<>
					<div className="text-lg sm:text-2xl md:text-4xl lg:text-[3.5rem] leading-wide tracking-wider">POWERFUL FEATURES FOR</div>
					<div className="text-2xl sm:text-4xl md:text-6xl lg:text-[5.5rem] font-extrabold bg-gradient-to-r from-[#f86c24] via-[#ffa500] to-[#ffd700] bg-clip-text text-transparent [-webkit-text-fill-color:transparent] [-webkit-background-clip:text] leading-wide tracking-wider">MODERN TRADERS</div>
				</>
			}
			footer={<div></div>}
			showProgress
			durations={{ change: 0.7, snap: 800 }}
			apiRef={apiRef}
		/>
	);
}