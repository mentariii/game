import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

export const ComboBanner = ({ combo, toastMessage }) => {
  const isFever = combo >= 3;

  return (
    <>
      {/* 1. Golden Shimmer Screen Border on Combo Fever */}
      {isFever && <div className="fixed inset-0 fever-border-shimmer z-20 pointer-events-none" />}

      {/* 2. Top-Center Floating Toast Message (Gift Box Slice) */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-35 pointer-events-none animate-bounce">
          <div className="glass-panel-luxury px-6 py-2.5 rounded-full border border-cyan-400/40 shadow-2xl flex items-center gap-2.5">
            <Heart className="w-4 h-4 text-cyan-400 fill-cyan-400 animate-pulse" />
            <span className="text-sm md:text-base font-gamer text-white font-bold tracking-wide">
              {toastMessage}
            </span>
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
        </div>
      )}

      {/* 3. Glowing Combo Fever Banner */}
      {isFever && (
        <div className="fixed top-36 left-1/2 -translate-x-1/2 z-35 pointer-events-none">
          <div className="glass-panel-luxury px-8 py-3 rounded-3xl border border-amber-300/60 shadow-amber-500/40 shadow-2xl flex items-center gap-3 animate-pulse">
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
            <div className="text-center">
              <div className="text-[11px] font-bold tracking-widest text-cyan-300 uppercase">
                Fever Mode
              </div>
              <div className="text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-amber-200 to-cyan-300 tracking-wider">
                COMBO x{combo}! ✨
              </div>
            </div>
            <Sparkles className="w-6 h-6 text-amber-300 animate-spin" style={{ animationDuration: '4s' }} />
          </div>
        </div>
      )}
    </>
  );
};

export default ComboBanner;
