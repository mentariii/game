import React, { useEffect, useState } from 'react';
import { Shield, Volume2, VolumeX, Camera, MousePointer, Cpu, Zap, Lock } from 'lucide-react';
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
  waveTitle = "ROUND 1: PEMANASAN 🎮",
  timeLeft = 60
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
    <div className="fixed top-0 left-0 right-0 z-40 p-3 sm:p-4 pointer-events-none font-gamer">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Score Odometer & Combo Multiplier */}
        <div className="flex items-center gap-3 pointer-events-auto">
          <div className="glass-panel px-4 sm:px-5 py-2 sm:py-2.5 rounded-2xl flex items-center gap-3 border border-cyan-500/30 shadow-lg bg-[#0b0f19]/90">
            <Zap className="w-5 h-5 text-cyan-300" />
            <div>
              <div className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-cyan-300/80">
                SCORE
              </div>
              <div className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center">
                {displayScore.toLocaleString()}
                <span className="text-xs text-cyan-300/80 ml-1.5 font-normal">/ {targetScore.toLocaleString()} PTS</span>
              </div>
            </div>
          </div>

          {/* Combo Multiplier Badge */}
          {combo >= 2 && (
            <div
              className={`glass-panel-luxury px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl flex items-center gap-2 border border-amber-400/60 shadow-amber-500/30 shadow-lg bg-[#0b0f19]/95 ${
                comboPulse ? 'animate-combo-pulse' : ''
              }`}
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300 animate-bounce" />
              <div className="text-xs sm:text-sm font-extrabold text-amber-300 tracking-wide uppercase">
                COMBO x{combo}! 🔥
              </div>
            </div>
          )}
        </div>

        {/* Center: Sector Protocol, Timer, and Decryption Progress Bar */}
        <div className="w-full md:w-96 pointer-events-auto flex flex-col items-center">
          <div className="w-full flex justify-between items-center text-xs font-medium text-cyan-100 mb-1 px-1">
            <span className="flex items-center gap-1.5 font-bold text-amber-300">
              <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-400/50 text-[10px] text-cyan-200 uppercase tracking-wider">
                {waveTitle}
              </span>
            </span>
            <span className="text-cyan-200 font-bold flex items-center gap-1">
              ⏱️ {timeFormatted}
              <span className="text-amber-300 ml-1">({progressPercent}%)</span>
            </span>
          </div>
          <div className="w-full h-3.5 glass-panel rounded-full overflow-hidden p-0.5 border border-cyan-400/40 bg-slate-950/90">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out bg-gradient-to-r from-cyan-400 via-blue-500 to-amber-300 shadow-[0_0_12px_rgba(0,242,254,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Right: SYSTEM INTEGRITY (Shields) & System Controls */}
        <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
          {/* System Integrity (3 Glowing Shields) */}
          <div className="glass-panel px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl flex items-center gap-2 border border-cyan-500/30 bg-slate-950/85">
            <div className="text-[10px] font-bold text-cyan-300/80 uppercase hidden sm:inline mr-1">
              SHIELDS
            </div>
            {[1, 2, 3].map((shieldIndex) => {
              const isIntact = shieldIndex <= lives;
              return (
                <div
                  key={shieldIndex}
                  className={`transition-all duration-300 ${
                    isIntact ? 'scale-100' : 'scale-90 opacity-25'
                  }`}
                  title={isIntact ? "Shield Intact" : "Shield Depleted"}
                >
                  <Shield
                    className={`w-5 h-5 transition-all duration-300 ${
                      isIntact
                        ? 'text-cyan-400 fill-cyan-400/30 drop-shadow-[0_0_8px_rgba(0,242,254,0.8)]'
                        : 'text-rose-500/60 fill-transparent'
                    }`}
                  />
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
                ? 'border-emerald-400/50 text-emerald-300 bg-emerald-950/40 shadow-[0_0_15px_rgba(16,185,129,0.25)]' 
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
            title="Bypass Langsung ke Mainframe Vault Core"
            className="glass-btn px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-2xl text-[11px] sm:text-xs font-semibold text-amber-200 hover:text-amber-100 flex items-center gap-1 border-amber-400/50 shadow-amber-400/20 shadow-md"
          >
            <Lock className="w-3.5 h-3.5 text-amber-300" />
            <span className="hidden sm:inline">Vault</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default TopHUD;
