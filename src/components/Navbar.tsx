import React from 'react';
import { Plus } from 'lucide-react';

interface NavbarProps {
  onNewDecision: () => void;
  onOpenDashboard: () => void;
  onGoHome: () => void;
  savedCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewDecision,
  onOpenDashboard,
  onGoHome,
  savedCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-[#090B0C]/90 border-b border-white/5 transition-all">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand with official FEZI icon */}
        <div
          onClick={onGoHome}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <img
            src="/fezi-icon.png"
            alt="FEZI"
            className="w-8 h-8 object-contain filter drop-shadow-[0_2px_10px_rgba(185,229,243,0.35)] group-hover:scale-105 transition-transform"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-serif tracking-tight text-[#F5F5F2] group-hover:text-[#B9E5F3] transition">
                FEZI
              </span>
              <span className="hidden sm:inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-white/10 text-[#8E959E]">
                Decision Intelligence
              </span>
            </div>
          </div>
        </div>

        {/* Navigation CTAs */}
        <div className="flex items-center gap-3">
          {/* Secondary CTA: transparent bg with border */}
          <button
            onClick={onOpenDashboard}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-transparent hover:bg-white/5 text-[#F5F5F2] border border-white/15 text-xs font-mono transition"
          >
            <span>My Decisions</span>
            {savedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full border border-[#B9E5F3]/40 text-[#B9E5F3] font-mono text-[10px] font-bold">
                {savedCount}
              </span>
            )}
          </button>

          {/* Primary CTA: #B9E5F3 background with #090B0C text */}
          <button
            onClick={onNewDecision}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-[#B9E5F3] hover:bg-[#a6dcf0] text-[#090B0C] font-semibold text-xs transition font-sans"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Make a Decision</span>
          </button>
        </div>
      </div>
    </header>
  );
};
