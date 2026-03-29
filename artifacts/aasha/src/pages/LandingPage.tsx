// import React from 'react';
// import { useLocation } from "wouter";

// export function LandingPage() {
//   const [, setLocation] = useLocation();

//   return (
//     <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8">
//       <div className="max-w-2xl text-center">
//         <h1 className="text-5xl font-bold mb-4">Welcome to Chaaya</h1>
//         <p className="text-xl mb-8">
//           Your personal space to reflect and understand your mental well-being.
//         </p>
//         <p className="text-lg mb-8">
//           Chaaya helps you identify patterns in your daily life, providing insights that empower you to take control of your mental health. Our unique check-in process is designed to be quick, intuitive, and insightful.
//         </p>
//         <button
//           onClick={() => setLocation('/app')}
//           className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-full transition duration-300"
//         >
//           Get Started
//         </button>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import { useLocation } from "wouter";

export function LandingPage() {
  const [, setLocation] = useLocation();

  // Manual scroll function for the Home icon and Overview tab
  const scrollToTop = () => {
    const scrollContainer = document.getElementById('scroll-root');
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    /* THE FIX: 'fixed inset-0' creates a fullscreen container. 
       'overflow-y-auto' forces this specific div to handle the scrolling.
    */
    <div 
      id="scroll-root"
      className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#0a0a0a] text-[#d1d1d1] font-sans selection:bg-violet-500/30 scroll-smooth"
    >
      
      {/* 1. Global Home Icon (Top Left) */}
      <div 
        onClick={scrollToTop}
        className="fixed top-8 left-8 z-[70] cursor-pointer group flex items-center gap-3"
      >
        <div className="w-10 h-10 rounded-full border border-white/10 flex items-center justify-center bg-[#0a0a0a]/80 backdrop-blur-md group-hover:border-violet-500/50 transition-all">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9.5L12 3L21 9.5V20H14V14H10V20H3V9.5Z" />
          </svg>
        </div>
      </div>

      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 flex justify-center pt-6 px-4 pointer-events-none">
        <div className="flex items-center bg-[#161616]/90 backdrop-blur-2xl border border-white/10 p-1 rounded-2xl shadow-2xl pointer-events-auto">
          <NavTab 
            label="Overview" 
            isActive={true} 
            onClick={scrollToTop}
            icon={<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" fill="none" />}
          />
          <div className="h-6 w-[1px] bg-white/10 mx-2" />
          <button 
            onClick={() => setLocation('/app')}
            className="px-6 py-2 text-[10px] uppercase tracking-[0.2em] font-bold text-violet-400 hover:text-white transition-all duration-300"
          >
            Launch App
          </button>
        </div>
      </nav>

      {/* SECTION 1: HERO */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20">
        {/* Background Forest Image */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1502082553048-f009c37129b9?q=80&w=2070" 
            className="w-full h-full object-cover opacity-10 mix-blend-luminosity"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0a0a0a]/60 to-[#0a0a0a]"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-block px-4 py-1 border border-violet-500/20 rounded-full mb-8">
             <span className="text-[9px] uppercase tracking-[0.4em] text-violet-400 font-medium">The Student Reflection Engine</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extralight tracking-[0.4em] uppercase mb-12 text-white leading-tight">
            CHAAYA <span className="opacity-30">•</span> छाया
          </h1>

          <div className="grid md:grid-cols-2 gap-12 text-left max-w-5xl mb-16">
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-[0.3em] text-violet-300 font-bold">What is Chaaya?</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-light">
                Chaaya is a non-intrusive "shadow" tracker. It observes your digital and social hygiene to map the invisible patterns of your mental state.
              </p>
            </div>
            <div className="space-y-4">
              <h3 className="text-xs uppercase tracking-[0.3em] text-violet-300 font-bold">For the Modern Student</h3>
              <p className="text-sm text-gray-400 leading-relaxed font-light">
                College life is a cycle of burnout. Chaaya helps you identify when your "Authenticity Gap" is widening before the crash hits.
              </p>
            </div>
          </div>

          <button
            onClick={() => setLocation('/app')}
            className="group relative px-16 py-5 bg-transparent border border-white/10 transition-all hover:border-violet-500/50"
          >
            <span className="relative text-[10px] uppercase tracking-[0.6em] font-bold group-hover:text-violet-400 transition-colors">Start Your First Check-In</span>
          </button>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 flex flex-col items-center opacity-30 animate-bounce">
            <p className="text-[8px] uppercase tracking-[0.5em] text-violet-400 mb-2">Scroll</p>
            <div className="w-[1px] h-10 bg-gradient-to-b from-white to-transparent"></div>
        </div>
      </section>

      {/* SECTION 2: THE MECHANICS (Detailed Insights) */}
      <section className="relative py-40 px-6 z-10 border-t border-white/5 bg-[#0a0a0a]">
        <div className="max-w-5xl mx-auto">
          <div className="mb-24">
             <span className="text-[10px] uppercase tracking-[0.4em] text-violet-500 mb-4 block">System Logic</span>
             <h2 className="text-3xl font-extralight uppercase tracking-[0.2em] text-white">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            <ValueCard 
              title="Academic Pulse"
              desc="Correlation is key. Chaaya tracks how your lecture attendance and study focus shift alongside your emotional baseline."
            />
            <ValueCard 
              title="Social Masking"
              desc="Understand the 'Authenticity Gap.' Identify moments where public performance deviates from your internal rest state."
            />
            <ValueCard 
              title="Burnout Defense"
              desc="Monitor sleep shifts and nutrition stability. Get subtle nudges when your metrics suggest a high-stress phase is approaching."
            />
          </div>

          <div className="mt-40 pt-20 border-t border-white/5 max-w-2xl">
            <p className="text-xl text-gray-400 font-extralight leading-relaxed italic mb-8">
              "What you are feeling is real, predictable, and temporary."
            </p>
            <p className="text-[10px] text-gray-500 uppercase tracking-[0.4em]">Designed for the mid-semester flow</p>
          </div>
        </div>
      </section>

      <footer className="relative z-10 py-24 text-center opacity-20">
        <p className="text-[9px] uppercase tracking-[0.5em]">Chaaya © 2026</p>
      </footer>
    </div>
  );
}

// Sub-components
function NavTab({ label, isActive, onClick, icon }: { label: string, isActive: boolean, onClick: () => void, icon: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-6 py-2.5 rounded-xl transition-all duration-500 ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-gray-500 hover:text-gray-300'}`}>
      <svg width="16" height="16" viewBox="0 0 24 24" className={isActive ? 'text-violet-400' : 'text-current'}>{icon}</svg>
      <span className="text-[10px] uppercase tracking-[0.2em] font-bold">{label}</span>
    </button>
  );
}

function ValueCard({ title, desc }: { title: string, desc: string }) {
  return (
    <div className="space-y-6 group">
      <div className="w-12 h-[1px] bg-violet-500/50 group-hover:w-full transition-all duration-700"></div>
      <h4 className="text-[11px] uppercase tracking-[0.4em] font-bold text-white group-hover:text-violet-400 transition-colors">{title}</h4>
      <p className="text-[13px] text-gray-500 leading-relaxed font-light">{desc}</p>
    </div>
  );
}