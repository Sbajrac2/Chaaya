import React from 'react';
import { useLocation } from 'wouter';
import { Sparkles } from 'lucide-react';

export function GlobalNavigation() {
  const [, setLocation] = useLocation();

  // Don't show navigation on the welcome page
  const currentPath = window.location.pathname;
  if (currentPath === '/' || currentPath === '/start') {
    return null;
  }

  return (
    <nav className="fixed top-6 left-6 z-50">
      <button
        onClick={() => setLocation('/')}
        className="group flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 hover:border-violet-500/30 transition-all duration-300 shadow-lg hover:shadow-xl"
        title="Return to Welcome"
      >
        <Sparkles className="w-5 h-5 text-violet-300 group-hover:text-violet-200 group-hover:scale-110 transition-all duration-300" />
        <span className="text-sm font-medium tracking-wide">Chaaya</span>
      </button>
    </nav>
  );
}