import React, { useState, useEffect, useRef } from 'react';
import { Heart, Camera, CheckCircle2, Trophy } from 'lucide-react';
import { soundEngine } from '../audio/SoundEngine';
import { LOVE_CONFIG } from '../config/loveConfig';

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

  // SVG Progress Ring calculations (compact & responsive)
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - holdProgress);
  const isHolding = gestureState?.isHeart && holdProgress > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between p-2 sm:p-5 select-none overflow-hidden font-gamer text-white pointer-events-none w-full max-w-full">
      
      {/* 1. Fullscreen Access Granted Green Screen Flash */}
      {isConfirmed && (
        <div className="fixed inset-0 z-50 animate-access-flash pointer-events-none" />
      )}

      {/* 2. Cyber Viewfinder Corner Brackets (Frames the live camera feed) */}
      <div className="absolute top-2 left-2 sm:top-5 sm:left-5 w-6 h-6 sm:w-12 sm:h-12 border-t-2 border-l-2 border-cyan-400/70 rounded-tl-lg pointer-events-none drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]" />
      <div className="absolute top-2 right-2 sm:top-5 sm:right-5 w-6 h-6 sm:w-12 sm:h-12 border-t-2 border-r-2 border-cyan-400/70 rounded-tr-lg pointer-events-none drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]" />
      <div className="absolute bottom-2 left-2 sm:bottom-5 sm:left-5 w-6 h-6 sm:w-12 sm:h-12 border-b-2 border-l-2 border-cyan-400/70 rounded-bl-lg pointer-events-none drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]" />
      <div className="absolute bottom-2 right-2 sm:bottom-5 sm:right-5 w-6 h-6 sm:w-12 sm:h-12 border-b-2 border-r-2 border-cyan-400/70 rounded-br-lg pointer-events-none drop-shadow-[0_0_8px_rgba(0,242,254,0.6)]" />

      {/* ============================================================ */}
      {/* TOP HEADER HUD (Compact, houses title)                      */}
      {/* ============================================================ */}
      <header className="pointer-events-auto w-full max-w-xl mx-auto pt-1 sm:pt-2 transition-all">
        <div className="glass-panel px-3 sm:px-5 py-2 sm:py-2.5 rounded-2xl border border-cyan-400/30 bg-[#080d1a]/85 shadow-[0_4px_24px_rgba(0,0,0,0.5)] backdrop-blur-md flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Achievement & Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500/30 to-cyan-500/20 border border-amber-400/50 flex items-center justify-center shrink-0 shadow-md">
              <Trophy className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-amber-300 animate-bounce" />
            </div>
            <div className="min-w-0 flex-1 text-left">
              <div className="inline-flex items-center gap-1 text-[9px] sm:text-xs font-bold text-amber-300 uppercase tracking-wider truncate">
                <span>HAPPY BIRTHDAY 🎮 • POSE LOVE</span>
              </div>
              <h1 className="text-xs sm:text-base md:text-lg font-extrabold tracking-wide uppercase text-white truncate drop-shadow-[0_0_12px_rgba(0,242,254,0.5)] leading-tight">
                HAPPY BIRTHDAY, <span className="text-cyan-400">{LOVE_CONFIG.partnerName || "MAS AL"}</span>
              </h1>
            </div>
          </div>

        </div>
      </header>

      {/* ============================================================ */}
      {/* CENTER VIEWFINDER AREA (WIDE OPEN FOR FACE & HANDS)          */}
      {/* ============================================================ */}
      <main className="flex-1 flex flex-col items-center justify-center relative w-full pointer-events-none my-auto">
        
        {/* Transparent Holographic Pose Reticle */}
        <div className="relative flex flex-col items-center justify-center">
          
          <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center">
            
            {/* Outer Decorative Tech Scanner Ring */}
            <div
              className={`absolute inset-0 rounded-full border border-dashed transition-all duration-700 pointer-events-none ${
                isConfirmed
                  ? 'border-emerald-400 animate-spin'
                  : isHolding
                  ? 'border-emerald-400/90 animate-spin shadow-[0_0_20px_rgba(16,185,129,0.5)]'
                  : 'border-cyan-400/40'
              }`}
              style={{ animationDuration: isHolding ? '3.5s' : '16s' }}
            />

            {/* SVG Progress Ring */}
            <svg className="w-32 h-32 sm:w-36 sm:h-36 -rotate-90 transform">
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className="stroke-slate-900/30"
                strokeWidth="5"
                fill="transparent"
              />
              <circle
                cx="50%"
                cy="50%"
                r={radius}
                className={`transition-all duration-100 ease-linear ${
                  isConfirmed
                    ? 'stroke-emerald-400'
                    : isHolding
                    ? 'stroke-emerald-400'
                    : 'stroke-cyan-400/70'
                }`}
                strokeWidth="6"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                style={{
                  filter: isHolding
                    ? 'drop-shadow(0 0 14px rgba(16, 185, 129, 0.95))'
                    : 'drop-shadow(0 0 8px rgba(0, 242, 254, 0.6))'
                }}
              />
            </svg>

            {/* Center Heart Hologram Indicator (Transparent, only shows percentage when holding) */}
            <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
              {isConfirmed ? (
                <CheckCircle2 className="w-11 h-11 sm:w-12 sm:h-12 text-emerald-400 animate-bounce drop-shadow-[0_0_15px_rgba(16,185,129,0.9)]" />
              ) : (
                <div className={`transition-transform duration-200 ${isHolding ? 'scale-125' : 'scale-100'}`}>
                  <Heart
                    className={`w-10 h-10 sm:w-11 sm:h-11 transition-all duration-300 ${
                      isHolding
                        ? 'text-emerald-400 fill-emerald-400 drop-shadow-[0_0_16px_rgba(16,185,129,0.95)] animate-pulse'
                        : 'text-cyan-300/80 fill-cyan-400/20 drop-shadow-[0_0_8px_rgba(0,242,254,0.4)]'
                    }`}
                  />
                </div>
              )}

              {/* Percentage Counter (No broken emojis or text) */}
              {isConfirmed ? (
                <div className="mt-1 font-bold text-xs sm:text-sm tracking-wider text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                  UNLOCKED
                </div>
              ) : isHolding ? (
                <div className="mt-1 font-bold text-xs sm:text-sm tracking-wider text-emerald-300 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">
                  {Math.round(holdProgress * 100)}%
                </div>
              ) : null}
            </div>

          </div>

          {/* Dynamic Status Pill (Only visible when holding or confirmed) */}
          <div className="mt-3 text-center pointer-events-none h-6">
            {isConfirmed ? (
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/30 border border-emerald-400 text-emerald-300 font-bold text-xs uppercase tracking-wider animate-pulse shadow-lg backdrop-blur-sm">
                ✓ AKSES DITERIMA! MEMULAI...
              </span>
            ) : isHolding ? (
              <span className="px-3.5 py-1 rounded-full bg-emerald-500/25 border border-emerald-400 text-emerald-300 font-bold text-xs tracking-wider animate-pulse shadow-lg backdrop-blur-sm">
                ⚡ POSE TERDETEKSI! TAHAN... ({Math.round(holdProgress * 100)}%)
              </span>
            ) : null}
          </div>

        </div>

      </main>

      {/* ============================================================ */}
      {/* CAMERA INACTIVE ALERT (Only displayed if camera is off)     */}
      {/* ============================================================ */}
      {!cameraActive && (
        <footer className="pointer-events-auto w-full max-w-md mx-auto pb-2 sm:pb-3 px-2 sm:px-3 flex flex-col items-center gap-2">
          <div className="w-full p-2 sm:p-2.5 bg-amber-500/15 border border-amber-400/50 rounded-2xl text-amber-200 text-xs backdrop-blur-md flex items-center justify-between gap-2 shadow-lg">
            <div className="min-w-0 flex-1 text-left">
              <div className="font-bold text-[11px] sm:text-xs text-amber-300 truncate">Kamera Belum Aktif</div>
              <div className="text-[10px] text-amber-200/80 truncate">Izinkan kamera untuk sensor gestur</div>
            </div>
            <button
              onClick={onRequestCamera}
              className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 text-white font-bold text-[11px] flex items-center gap-1 shrink-0 shadow cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5 text-amber-300" />
              <span>Aktifkan</span>
            </button>
          </div>
        </footer>
      )}

    </div>
  );
};

export default StartScreenModal;
