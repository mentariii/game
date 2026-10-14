import React, { useEffect, useState } from 'react';
import { Heart, Volume2, VolumeX, Camera, MousePointer, Sparkles, Award } from 'lucide-react';
import { LOVE_CONFIG } from '../config/loveConfig';

export const TopHUD = ({
  score,
  lives,
  combo,
  targetScore,
  isMuted,
  onToggleMute,
  cameraActive,
  onToggleCamera,
  cameraStatus,
  onTriggerBoss,
  currentWave = 1,
  waveTitle = "Wave 1: Pemanasan 🎮",
  timeLeft = 120
}) => {
  // Score Odometer interpolation
  const [displayScore, setDisplayScore] = useState(score);
  const [comboPulse, setComboPulse] = useState(false);

  useEffect(() => {
    let animationFrame;
    const animate = () => {
      setDisplayScore((prev) => {
        const diff = score - prev;
        if (Math.abs(diff) < 2) return score;
        return Math.round(prev + diff * 0.18);
      });
      if (displayScore !== score) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [score, displayScore]);

  // Pulse combo badge when combo increases
  useEffect(() => {
    if (combo > 1) {
      setComboPulse(true);
      const timer = setTimeout(() => setComboPulse(false), 350);
      return () => clearTimeout(timer);
    }
  }, [combo]);

  const progressPercent = Math.min(Math.round((score / targetScore) * 100), 100);

  // Format timeLeft MM:SS
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed top-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Score Odometer & Combo Badge */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="glass-panel px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl flex items-center gap-3 border border-cyan-500/25 shadow-lg bg-slate-900/80">
            <Sparkles className="w-5 h-5 text-amber-300 animate-spin" style={{ animationDuration: '8s' }} />
            <div>
              <div className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-cyan-200/80">Score</div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white font-mono flex items-center">
                {displayScore.toLocaleString()}
                <span className="text-xs text-cyan-300/70 ml-1.5 font-normal">/ {targetScore}</span>
              </div>
            </div>
          </div>

          {/* Combo Multiplier Badge */}
          {combo >= 2 && (
            <div
              className={`glass-panel-luxury px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl flex items-center gap-2 border border-amber-400/50 shadow-amber-500/30 shadow-lg ${
                comboPulse ? 'animate-combo-pulse' : ''
              }`}
            >
              <Award className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
              <div className="text-xs sm:text-sm font-extrabold text-amber-300 tracking-wide uppercase">
                COMBO x{combo}!
              </div>
            </div>
          )}
        </div>

        {/* Center: Wave Indicator, Timer, and Finale Progress Bar */}
        <div className="w-full md:w-96 pointer-events-auto flex flex-col items-center">
          <div className="w-full flex justify-between items-center text-xs font-medium text-cyan-100 mb-1 px-1">
            <span className="flex items-center gap-1.5 font-bold text-amber-300">
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-[10px] text-cyan-200 uppercase tracking-wider font-mono">
                {waveTitle}
              </span>
            </span>
            <span className="font-mono text-cyan-200 font-bold flex items-center gap-1">
              ⏱️ {timeFormatted}
              <span className="text-amber-300 ml-1">({progressPercent}%)</span>
            </span>
          </div>
          <div className="w-full h-3.5 glass-panel rounded-full overflow-hidden p-0.5 border border-cyan-400/30 bg-slate-900/80">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-300 shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: 3D Hearts Lives & Controls */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* 3D Glossy Lives (Cyan & Royal Sapphire) */}
          <div className="glass-panel px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl flex items-center gap-1.5 sm:gap-2 border border-cyan-500/25 bg-slate-900/80">
            {[1, 2, 3].map((heartIndex) => {
              const isAlive = heartIndex <= lives;
              return (
                <div
                  key={heartIndex}
                  className={`transition-all duration-300 ${
                    isAlive ? 'scale-100' : 'scale-90 opacity-30 grayscale'
                  }`}
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <defs>
                      <radialGradient id={`heartGrad-${heartIndex}`} cx="30%" cy="30%" r="70%">
                        <stop offset="0%" stopColor="#bae6fd" />
                        <stop offset="35%" stopColor="#00f2fe" />
                        <stop offset="75%" stopColor="#2563eb" />
                        <stop offset="100%" stopColor="#0f172a" />
                      </radialGradient>
                    </defs>
                    <path
                      d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                      fill={isAlive ? `url(#heartGrad-${heartIndex})` : '#475569'}
                      stroke={isAlive ? '#38bdf8' : '#334155'}
                      strokeWidth="1.2"
                    />
                    {isAlive && (
                      <ellipse cx="8" cy="7" rx="2" ry="1" fill="#ffffff" opacity="0.85" />
                    )}
                  </svg>
                </div>
              );
            })}
          </div>

          {/* Camera Status & Toggle Button */}
          <button
            onClick={onToggleCamera}
            title={cameraActive ? "Kamera Aktif (Klik untuk Matikan)" : "Aktifkan Kamera (Hand Tracking)"}
            className={`glass-btn px-3 py-2 rounded-2xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
              cameraActive 
                ? 'border-emerald-400/50 text-emerald-300 bg-emerald-950/40' 
                : 'border-cyan-400/30 text-cyan-200'
            }`}
          >
            {cameraActive ? (
              <>
                <Camera className="w-4 h-4 text-emerald-400" />
                <span className="hidden sm:inline">Kamera Aktif</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-0.5" />
              </>
            ) : (
              <>
                <MousePointer className="w-4 h-4 text-cyan-300" />
                <span className="hidden sm:inline">Mode Mouse</span>
              </>
            )}
          </button>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            title={isMuted ? "Bunyikan Musik & Suara" : "Senyapkan Suara"}
            className="glass-btn p-2 sm:p-2.5 rounded-2xl text-cyan-200 hover:text-white flex items-center justify-center border-cyan-400/25"
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />
            )}
          </button>

          {/* Boss Trigger Preview Button */}
          <button
            onClick={onTriggerBoss}
            title="Buka Langsung Kejutan Boss Ultah"
            className="glass-btn px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-semibold text-amber-200 hover:text-amber-100 flex items-center gap-1 border-amber-400/40"
          >
            🎂 <span className="hidden sm:inline">Boss</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default TopHUD;
