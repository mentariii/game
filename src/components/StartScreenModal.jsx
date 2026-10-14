import React from 'react';
import { Camera, MousePointer, Sparkles, Sun } from 'lucide-react';
import { LOVE_CONFIG } from '../config/loveConfig';

export const StartScreenModal = ({ isOpen, onStartWithCamera, onStartWithMouse }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fadeIn select-none">
      <div className="w-full max-w-lg p-6 sm:p-8 glass-panel-luxury rounded-3xl border border-cyan-400/30 shadow-2xl text-center space-y-5 relative overflow-hidden bg-slate-950/85">
        
        {/* Decorative Background Glows: Neon Cyan & Royal Blue */}
        <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-blue-600/25 blur-3xl pointer-events-none" />

        {/* Level Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
          <span>Level 21 Unlocked! 🎮 • 10 November</span>
          <span className="text-amber-300 font-bold">✨</span>
        </div>

        {/* Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-serif-romantic text-white tracking-wide">
            Happy Birthday Mas Al ✨
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-cyan-100/80 leading-relaxed font-sans">
            Ayunkan telunjukmu di depan kamera seperti pedang neon bercahaya untuk menyabet balon & kado kejutan spesial dari Tata!
          </p>
        </div>

        {/* Lighting Warning Banner (Revision 4) */}
        <div className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-400/40 text-amber-200 text-xs sm:text-sm flex items-start gap-3 text-left shadow-lg">
          <Sun className="w-5 h-5 text-amber-300 shrink-0 mt-0.5 animate-pulse" />
          <p className="leading-snug font-medium">
            Sistem butuh cahaya yang cukup! Pastikan kamu main di tempat terang biar tanganmu nggak dikira bayangan hitam.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3 pt-1">
          {/* 1. Start with Camera (Hand Tracking) */}
          <button
            onClick={onStartWithCamera}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-400 hover:from-cyan-400 hover:to-amber-300 text-white font-bold text-base flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/25 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Camera className="w-5 h-5 text-amber-200" />
            <span>Aktifkan Kamera & Mulai Main 📷✨</span>
          </button>

          {/* 2. Start with Mouse / Touch Fallback */}
          <button
            onClick={onStartWithMouse}
            className="w-full py-3 px-6 rounded-2xl glass-btn text-cyan-200 hover:text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2 border border-cyan-400/20"
          >
            <MousePointer className="w-4 h-4 text-cyan-300" />
            <span>Main dengan Mouse / Sentuh Saja 🖱️</span>
          </button>
        </div>

        {/* Footer Hint */}
        <div className="pt-2 text-[11px] text-cyan-200/60 font-sans border-t border-cyan-500/15 flex items-center justify-center gap-1.5">
          <span>💡 Tips: Jaga jarak tangan sekitar 0.5 – 1 meter di depan webcam ya!</span>
        </div>

      </div>
    </div>
  );
};

export default StartScreenModal;
