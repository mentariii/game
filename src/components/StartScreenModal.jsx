import React, { useState, useEffect, useRef } from 'react';
import { Heart, Camera, CheckCircle2, Gamepad2, Play, MousePointer, Sparkles, Trophy, Zap } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';

export const StartScreenModal = ({
  isOpen,
  cameraActive,
  cameraStatus,
  gestureState,
  onRequestCamera,
  onUnlock,
  onStartWithMouse
}) => {
  const [holdProgress, setHoldProgress] = useState(0); // 0.0 to 1.0
  const [isConfirmed, setIsConfirmed] = useState(false);

  const prevTimeRef = useRef(performance.now());
  const lastBeepTimeRef = useRef(0);
  const holdProgressRef = useRef(0);

  // Smooth hold progress accumulation loop (1.5 seconds hold required)
  useEffect(() => {
    if (!isOpen || isConfirmed) return;

    let animId;
    prevTimeRef.current = performance.now();

    const updateLoop = (now) => {
      const dt = Math.min((now - prevTimeRef.current) / 1000, 0.1);
      prevTimeRef.current = now;

      const isHeart = gestureState?.isHeart;

      if (isHeart) {
        setHoldProgress((prev) => {
          const next = Math.min(prev + dt / 1.5, 1.0);
          holdProgressRef.current = next;
          return next;
        });

        // Trigger periodic scanner sound during hold
        if (now - lastBeepTimeRef.current > 200) {
          lastBeepTimeRef.current = now;
          soundEngine.init();
          soundEngine.playScanBeep(holdProgressRef.current);
        }
      } else {
        // Smooth decay if gesture is lost
        setHoldProgress((prev) => {
          const next = Math.max(prev - dt * 2.0, 0);
          holdProgressRef.current = next;
          return next;
        });
      }

      animId = requestAnimationFrame(updateLoop);
    };

    animId = requestAnimationFrame(updateLoop);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, isConfirmed, gestureState?.isHeart]);

  const unlockedRef = useRef(false);
  const unlockTimeoutRef = useRef(null);

  // Access Granted trigger on 100% hold progress
  useEffect(() => {
    if (holdProgress >= 1.0 && !unlockedRef.current) {
      unlockedRef.current = true;
      setIsConfirmed(true);
      soundEngine.init();
      soundEngine.playAccessGranted();

      unlockTimeoutRef.current = setTimeout(() => {
        onUnlock();
      }, 700);
    }
  }, [holdProgress, onUnlock]);

  useEffect(() => {
    return () => {
      if (unlockTimeoutRef.current) {
        clearTimeout(unlockTimeoutRef.current);
      }
    };
  }, []);

  if (!isOpen) return null;

  // SVG Progress Ring calculations
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - holdProgress);
  const isHolding = gestureState?.isHeart && holdProgress > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none overflow-hidden font-gamer text-white">
      
      {/* 1. Fullscreen Access Granted Green Screen Flash */}
      {isConfirmed && (
        <div className="fixed inset-0 z-50 animate-access-flash" />
      )}

      {/* 2. Sleek Modern Gaming Card */}
      <div className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border transition-all duration-500 text-center space-y-6 relative overflow-hidden backdrop-blur-2xl ${
        isConfirmed
          ? 'bg-[#0b1324]/95 border-emerald-400 shadow-[0_0_80px_rgba(16,185,129,0.7)]'
          : isHolding
          ? 'bg-[#0b1324]/90 border-emerald-400/80 shadow-[0_0_60px_rgba(16,185,129,0.4)]'
          : 'bg-[#0b0f19]/90 border-cyan-400/40 shadow-[0_0_50px_rgba(0,242,254,0.3)]'
      }`}>

        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-24 bg-gradient-to-b from-cyan-500/20 to-transparent blur-2xl pointer-events-none" />

        {/* Top Trophy & Level Header (Console Achievement Banner) */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-cyan-500/20 to-blue-500/20 border border-amber-400/50 text-amber-300 text-xs sm:text-sm font-bold tracking-wider uppercase shadow-md">
            <Trophy className="w-4 h-4 text-amber-300 animate-bounce" />
            <span>LEVEL 21 UNLOCKED 🎮 • 10 NOVEMBER</span>
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide uppercase text-white drop-shadow-[0_0_15px_rgba(0,242,254,0.6)]">
            HAPPY BIRTHDAY, <span className="text-cyan-400">MAS AL!</span>
          </h1>
        </div>

        {/* Mission Objective Card (Clean Gaming Phrasing) */}
        <div className="p-4 sm:p-5 rounded-2xl bg-black/50 border border-cyan-500/30 text-center relative space-y-2 shadow-inner">
          <div className="text-xs font-bold uppercase tracking-widest text-cyan-300 flex items-center justify-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>OBJECTIVE UNLOCK</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>

          <p className="text-sm sm:text-base font-semibold text-white leading-relaxed">
            MISSION: Tunjukkan pose 'Love' <span className="text-xl">🫶</span> ke kamera untuk memulai game!
          </p>
          <p className="text-xs text-cyan-300/80 font-normal">
            (Bisa 2 tangan 🫶 atau 1 tangan finger heart 🫰)
          </p>
        </div>

        {/* Central Biometric Heart Gesture Scanner Ring */}
        <div className="flex flex-col items-center justify-center py-1 relative">
          <div className="relative w-44 h-44 flex items-center justify-center">
            
            {/* Outer Decorative Rotating Tech Ring */}
            <div
              className={`absolute inset-0 rounded-full border border-dashed transition-all duration-700 pointer-events-none ${
                isConfirmed
                  ? 'border-emerald-400 animate-spin'
                  : isHolding
                  ? 'border-emerald-400/80 animate-spin'
                  : 'border-cyan-400/40'
              }`}
              style={{ animationDuration: isHolding ? '4s' : '16s' }}
            />

            {/* SVG Progress Ring */}
            <svg className="w-40 h-40 -rotate-90 transform">
              <circle
                cx="80"
                cy="80"
                r={radius}
                className="stroke-slate-800"
                strokeWidth="7"
                fill="transparent"
              />
              <circle
                cx="80"
                cy="80"
                r={radius}
                className={`transition-all duration-100 ease-linear ${
                  isConfirmed
                    ? 'stroke-emerald-400'
                    : isHolding
                    ? 'stroke-emerald-400'
                    : 'stroke-cyan-400'
                }`}
                strokeWidth="8"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: isHolding
                    ? 'drop-shadow(0 0 12px rgba(16, 185, 129, 0.9))'
                    : 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.7))'
                }}
              />
            </svg>

            {/* Center Heart Hologram & Status */}
            <div className="absolute flex flex-col items-center justify-center text-center">
              {isConfirmed ? (
                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
              ) : (
                <div className={`transition-transform duration-200 ${isHolding ? 'scale-125' : 'scale-100'}`}>
                  <Heart
                    className={`w-11 h-11 transition-all duration-300 ${
                      isHolding
                        ? 'text-emerald-400 fill-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.9)] animate-pulse'
                        : 'text-cyan-400 fill-cyan-400/20 drop-shadow-[0_0_10px_rgba(0,242,254,0.5)]'
                    }`}
                  />
                </div>
              )}

              {/* Percentage Counter */}
              <div className="mt-1 font-bold text-xs sm:text-sm tracking-wider text-white">
                {isConfirmed ? '100% UNLOCKED' : `${Math.round(holdProgress * 100)}%`}
              </div>
            </div>
          </div>

          {/* Sensor Feedback Pill */}
          <div className="mt-2 text-xs">
            {isConfirmed ? (
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold uppercase tracking-wider animate-pulse">
                ✓ LEVEL 21 UNLOCKED! MEMULAI...
              </span>
            ) : isHolding ? (
              <span className="px-4 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold tracking-wider animate-pulse">
                ⚡ POSE TERDETEKSI! TAHAN 1.5 DETIK...
              </span>
            ) : gestureState?.handsCount >= 2 ? (
              <span className="px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/80 text-amber-300 font-semibold tracking-wider">
                🙌 2 Tangan Terlihat: Bentuk pose love (🫶)
              </span>
            ) : gestureState?.handsCount === 1 ? (
              <span className="px-4 py-1.5 rounded-full bg-cyan-500/20 border border-cyan-400/80 text-cyan-200 font-semibold tracking-wider">
                ✋ 1 Tangan Terlihat: Silangkan jempol & telunjuk (🫰) atau angkat 2 tangan (🫶)
              </span>
            ) : (
              <span className="px-4 py-1.5 rounded-full bg-slate-800/80 border border-cyan-500/30 text-cyan-200/80 tracking-wider">
                👋 Angkat tangan ke depan webcam (0.5 – 1 meter)
              </span>
            )}
          </div>
        </div>

        {/* Center Glowing Action Button: [ TAP TO START LEVEL 21 ] */}
        <div className="pt-1">
          <button
            onClick={onUnlock}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-sm sm:text-base tracking-widest uppercase shadow-[0_0_25px_rgba(0,242,254,0.5)] hover:shadow-[0_0_35px_rgba(0,242,254,0.8)] transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>[ TAP TO START LEVEL 21 ]</span>
          </button>
        </div>

        {/* Camera Activation or Troubleshooting Prompt */}
        {!cameraActive && (
          <div className="p-3 bg-amber-500/10 border border-amber-400/30 rounded-2xl text-amber-200 text-xs text-left flex items-center justify-between gap-3">
            <div>
              <div className="font-bold">Kamera Belum Aktif</div>
              <div className="text-[11px] text-amber-200/80">Izinkan kamera untuk sensor gerakan tangan.</div>
            </div>
            <button
              onClick={onRequestCamera}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-lg cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>Aktifkan</span>
            </button>
          </div>
        )}

        {/* Footer / Mouse Mode Fallback */}
        <div className="pt-2 border-t border-cyan-500/20 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="text-[11px] text-cyan-200/60 font-sans text-center sm:text-left">
            💡 Tips: Pastikan ruangan cukup terang & tangan kelihatan jelas.
          </div>

          <button
            onClick={onStartWithMouse}
            className="text-[11px] font-semibold text-cyan-300 hover:text-white flex items-center gap-1.5 transition underline underline-offset-4 cursor-pointer shrink-0"
          >
            <MousePointer className="w-3.5 h-3.5 text-cyan-400" />
            <span>Mode Mouse / Touch</span>
          </button>
        </div>

      </div>

    </div>
  );
};

export default StartScreenModal;
