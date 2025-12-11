"use client";

import React from "react";
import { FullScreenScrollFX, FullScreenFXAPI } from "@/components/ui/full-screen-scroll-fx";

const sections = [
	{
		leftLabel: "Ai-Driven",
		title: <>Trading Strategies</>,
		rightLabel: "Ai-Driven",
		background:
			"https://images.pexels.com/photos/3289156/pexels-photo-3289156.jpeg?cs=srgb&dl=pexels-alexfu-3289156.jpg&fm=jpg&_gl=1*1acr8i7*_ga*MTI3MjA2NDU0Mi4xNzU1NzM3ODI5*_ga_8JE65Q40S6*czE3NTU3NjkyMzgkbzMkZzEkdDE3NTU3Njk1MTckajYwJGwwJGgw",
		audioSrc: "/sfx/click-01.mp3",
	},
	{
		leftLabel: "REAL TIME",
		title: <>SENTIMENT ANALYSIS</>,
		rightLabel: "REAL TIME",
		background:
			"https://images.pexels.com/photos/163790/at-night-under-a-lantern-guy-night-city-163790.jpeg",
		audioSrc: "/sfx/whoosh-02.mp3",
	},
	{
		leftLabel: "AUTOMATED",
		title: <>PORTFOLIO OPTIMIZATION</>,
		rightLabel: "AUTOMATED",
		background: "https://images.pexels.com/photos/9817/pexels-photo-9817.jpeg",
		audioSrc: "/sfx/whoosh-02.mp3",
	},
	{
		leftLabel: "SECURE",
		title: <>MULTI-EXCHANGE CONNECTIVITY</>,
		rightLabel: "SECURE",
		background: "https://images.pexels.com/photos/939807/pexels-photo-939807.jpeg",
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
					<div className="text-3xl md:text-4xl lg:text-[3.5rem] leading-tight">POWERFUL FEATURES FOR</div>
					<div className="text-4xl md:text-6xl lg:text-[5.5rem] font-extrabold text-orange-500 leading-tight">MODERN TRADERS</div>
				</>
			}
			footer={<div></div>}
			showProgress
			durations={{ change: 0.7, snap: 800 }}
			apiRef={apiRef}
		/>
	);
}
