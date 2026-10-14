import React, { forwardRef } from 'react';

export const CameraBackground = forwardRef(({ cameraActive, bombPulseActive }, ref) => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none z-0">
      {/* 1. Mirrored Webcam Video Feed */}
      <video
        ref={ref}
        playsInline
        muted
        autoPlay
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          cameraActive ? 'opacity-95' : 'opacity-0'
        } webcam-glow-filter`}
        style={{ transform: 'scaleX(-1)' }}
      />

      {/* 2. Sleek Midnight Celestial Luxury Backdrop (Active when camera is off or loading) */}
      {!cameraActive && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#050811] via-[#091122] to-[#04060d] transition-opacity duration-700">
          {/* Subtle Electric Cyan & Royal Blue Radial Nebula Glows */}
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px]" />
          <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-blue-600/15 blur-[140px]" />
          <div className="absolute -bottom-32 left-1/3 w-[500px] h-[500px] rounded-full bg-amber-500/12 blur-[150px]" />
        </div>
      )}

      {/* 3. Midnight Blue & Neon Cyan Vignette Overlay */}
      <div className="absolute inset-0 midnight-cyan-vignette" />

      {/* 4. Bomb Hit Red Vignette Pulse */}
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
          bombPulseActive ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          background: 'radial-gradient(circle at center, transparent 30%, rgba(239, 68, 68, 0.45) 85%, rgba(153, 27, 27, 0.8) 100%)'
        }}
      />
    </div>
  );
});

CameraBackground.displayName = 'CameraBackground';
export default CameraBackground;
