import React from 'react';
import { Trophy, Zap, Swords } from 'lucide-react';

export const GiantBossOverlay = ({ isBossPhase }) => {
  if (!isBossPhase) return null;

  return (
    <div className="fixed top-20 sm:top-24 left-1/2 -translate-x-1/2 z-35 pointer-events-none text-center w-full max-w-xl px-4 animate-fadeIn font-gamer">
      <div className="glass-panel-luxury px-6 sm:px-8 py-3.5 rounded-3xl border border-amber-400/70 shadow-[0_0_50px_rgba(251,191,36,0.4)] bg-[#0b0f19]/95">
        
        {/* Boss Encounter Header */}
        <div className="flex items-center justify-center gap-2 text-amber-300 mb-1 text-xs sm:text-sm font-bold uppercase tracking-widest">
          <Swords className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>FINAL BOSS ENCOUNTER</span>
          <Trophy className="w-4 h-4 text-amber-300 animate-pulse" />
        </div>

        {/* User Prompt: 💥 BOSS FIGHT: Sabet 20x Beruntun Untuk Menang! 💥 */}
        <h2 className="text-base sm:text-lg md:text-xl font-extrabold text-white flex items-center justify-center gap-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.9)] tracking-wide">
          <span>💥 BOSS FIGHT: Sabet 20x Beruntun Untuk Menang! 💥</span>
        </h2>

      </div>
    </div>
  );
};

export default GiantBossOverlay;
