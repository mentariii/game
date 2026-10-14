import React from 'react';
import { Sparkles, Gift } from 'lucide-react';

export const GiantBossOverlay = ({ isBossPhase }) => {
  if (!isBossPhase) return null;

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-35 pointer-events-none text-center">
      <div className="glass-panel-luxury px-8 py-3.5 rounded-3xl border border-amber-300/60 shadow-2xl animate-bounce">
        <div className="flex items-center justify-center gap-2 text-amber-300 mb-1">
          <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
          <span className="text-xs font-bold uppercase tracking-widest text-amber-200">
            Puncak Kejutan Ulang Tahun
          </span>
          <Sparkles className="w-5 h-5 animate-spin" style={{ animationDuration: '6s' }} />
        </div>
        <h2 className="text-lg md:text-xl font-bold font-serif-romantic text-white flex items-center justify-center gap-2">
          <Gift className="w-5 h-5 text-cyan-300" />
          Sabet 30x beruntun untuk membuka kejutan terakhir! ✨
        </h2>
      </div>
    </div>
  );
};

export default GiantBossOverlay;
