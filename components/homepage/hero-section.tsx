"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

export function HeroSection() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/onboarding/sign-up?tab=signup");
  };

  const scrollToFeatures = () => {
    const element = document.getElementById("services");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="h-screen bg-[#070a0f] p-4 sm:p-6 lg:p-8 xl:p-10">
      {/* Main Container */}
      <div className="relative w-full h-full bg-[#03070a] rounded-[20px] sm:rounded-[28px] border border-[#161d2a] overflow-hidden">
        
        {/* Top Left Logo Badge */}
        <div className="absolute top-3 left-4 sm:top-2 sm:left-2 z-20">
          <div className="bg-[#0b0f15] px-5 sm:px-6 py-3 sm:py-3.5 rounded-full border border-[#161d2a]">
            <span className="text-[#8a9199] text-base sm:text-lg font-medium tracking-wide">QuantivaHQ</span>
          </div>
        </div>

        {/* Content Wrapper */}
        <div className="relative flex flex-col lg:flex-row h-full">
          
          {/* Left Column - Text Content */}
          <div className="relative z-10 w-full lg:w-[45%] flex flex-col p-6 sm:p-8 lg:p-12 lg:pl-14">
            
            {/* Headline Section */}
            <div className="mt-4 lg:mt-8">
              <h1 className="text-white leading-[1.05] tracking-tight">
                <span className="block text-[16px] sm:text-[24px] md:text-[32px] lg:text-[40px] font-bold italic">UNLOCK</span>
                <span className="block text-[16px] sm:text-[24px] md:text-[32px] lg:text-[40px] font-bold italic">YOUR TRADING</span>
                <span className="block text-[16px] sm:text-[24px] md:text-[32px] lg:text-[40px] font-bold italic text-transparent bg-clip-text bg-gradient-to-r from-[#00d4ff] to-[#00f0ff]">POTENTIAL</span>
              </h1>

              {/* Subtitle */}
              <p className="mt-2 text-[#5c6370] text-[8px] sm:text-base lg:text-lg leading-relaxed max-w-[380px]">
                Automate your crypto and stock trading with powerful AI strategies. Real-time sentiment analysis & portfolio optimization.
              </p>

              {/* CTA Buttons */}
              {/* <div className="flex flex-wrap gap-3 mt-8">
                <button
                  onClick={handleGetStarted}
                  className="bg-gradient-to-r from-[#00c8e0] to-[#00a0b8] hover:from-[#00d4ff] hover:to-[#00b8d4] text-[#070a0f] px-6 py-3 rounded-full font-semibold text-sm transition-all duration-300 hover:scale-105 shadow-lg shadow-[#00c8e0]/20"
                >
                  Get Started
                </button>
                <button
                  onClick={scrollToFeatures}
                  className="border border-[#1c2530] hover:border-[#00c8e0]/50 bg-[#111820]/80 text-white px-6 py-3 rounded-full font-medium text-sm transition-all duration-300 hover:bg-[#151c26]"
                >
                  Learn More
                </button>
              </div> */}
            </div>

            {/* Bottom - Stats Section */}
            <div className="relative mt-auto pt-12 pb-6">
              {/* Gradient Sphere */}
              <div 
                className="absolute -left-[170px] -bottom-[170px] w-[240px] h-[240px] sm:w-[300px] sm:h-[300px] lg:w-[360px] lg:h-[360px] rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #0a5a66 0%, #064952 30%, #03343b 60%, #011f24 100%)',
                  boxShadow: '0 0 80px rgba(6, 90, 100, 0.4)',
                }}
              />
<div 
                 className="absolute -left-[100px] -bottom-[100px] w-[150px] h-[150px] sm:w-[150px] sm:h-[150px] lg:w-[220px] lg:h-[220px] rounded-full"
                 style={{
                   background: 'linear-gradient(135deg,rgb(3, 11, 12) 0%, rgb(3, 11, 12) 30%, rgb(3, 11, 12) 60%, rgb(3, 11, 12) 100%)',
                   boxShadow: '0 0 60px 20px rgba(0, 0, 0, 0.8), 0 0 100px 40px rgba(3, 11, 12, 0.6), inset 0 0 30px rgba(0, 0, 0, 0.5)',
                 }}
               />
              {/* Stats Card */}
              <div className="relative bg-[#111820]/95 backdrop-blur-sm rounded-xl p-5 border border-[#1c2530] shadow-xl">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#00d4ff]">10K+</div>
                    <div className="text-[10px] sm:text-xs text-[#5c6370] mt-1">Active Traders</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#00d4ff]">$500M+</div>
                    <div className="text-[10px] sm:text-xs text-[#5c6370] mt-1">Trading Volume</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#00d4ff]">99.9%</div>
                    <div className="text-[10px] sm:text-xs text-[#5c6370] mt-1">Uptime</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl sm:text-2xl font-bold text-[#00d4ff]">24/7</div>
                    <div className="text-[10px] sm:text-xs text-[#5c6370] mt-1">AI Monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Robot Image */}
          <div className="absolute lg:relative right-0 top-0 w-full lg:w-[55%] h-full overflow-hidden opacity-30 lg:opacity-100">
            {/* Glow effect */}
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-[#00d4ff]/5 rounded-full blur-[120px]" />
            
            {/* Hero Image */}
            <div className="relative w-full h-full">
              <Image
                src="/images/robo.png"
                alt="AI Trading Robot"
                fill
                className="object-contain object-right"
                priority
              />
            </div>
          </div>
        </div>

        {/* View Services Button */}
        <button
          onClick={scrollToFeatures}
          className="absolute bottom-5 right-2 sm:bottom-6 sm:right-6 lg:bottom-2 lg:right-2 bg-[#161d2a] hover:bg-[#161d2a] text-[#ffffff] px-5 sm:px-6 py-3 sm:py-3 rounded-full font-medium text-sm transition-all duration-300 hover:scale-105"
        >
          View Our Services
        </button>
      </div>
    </section>
  );
}
