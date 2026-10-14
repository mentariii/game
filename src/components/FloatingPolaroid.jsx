import React, { useEffect, useState } from 'react';

export const FloatingPolaroid = ({ memory, onComplete }) => {
  const [rotation] = useState(() => (Math.random() - 0.5) * 14); // -7 to +7 deg tilt

  useEffect(() => {
    const timer = setTimeout(() => {
      if (onComplete) onComplete(memory.id);
    }, 3200);
    return () => clearTimeout(timer);
  }, [memory.id, onComplete]);

  return (
    <div
      className="fixed pointer-events-none z-30 animate-polaroid-float"
      style={{
        left: `${memory.spawnX || 120}px`,
        top: `${memory.spawnY || 160}px`,
        transformOrigin: 'center center'
      }}
    >
      <div
        className="w-56 p-3 bg-white rounded-lg shadow-2xl border border-cyan-400/30 transform transition-transform"
        style={{
          transform: `rotate(${rotation}deg)`,
          boxShadow: '0 20px 45px rgba(0, 0, 0, 0.4), 0 0 25px rgba(0, 242, 254, 0.25)'
        }}
      >
        {/* Photo Container */}
        <div className="w-full h-44 bg-zinc-900 rounded overflow-hidden relative shadow-inner">
          <img
            src={memory.imageUrl}
            alt={memory.caption}
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
            loading="lazy"
          />
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-mono text-cyan-300">
            {memory.date}
          </div>
        </div>

        {/* Polaroid Handwritten Caption */}
        <div className="mt-2.5 px-1 pb-1">
          <p className="text-xs font-serif-romantic italic text-zinc-800 leading-snug line-clamp-2">
            "{memory.caption}"
          </p>
        </div>
      </div>
    </div>
  );
};

export default FloatingPolaroid;
