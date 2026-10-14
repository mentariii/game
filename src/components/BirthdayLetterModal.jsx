import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Heart, Play, Pause, RotateCcw, Sparkles, Image as ImageIcon, Music, Download } from 'lucide-react';
import { LOVE_CONFIG } from '../config/loveConfig';
import { soundEngine } from '../audio/SoundEngine';

export const BirthdayLetterModal = ({ isOpen, onPlayAgain, candidPhotos = [] }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [activeTab, setActiveTab] = useState('letter'); // 'letter' | 'candid'
  const [displayedTextIndex, setDisplayedTextIndex] = useState(0);

  const voiceAudioRef = useRef(null);
  const waveformAnimRef = useRef(null);
  const [waveHeights, setWaveHeights] = useState([20, 45, 60, 35, 75, 40, 85, 30, 65, 40, 55, 30]);

  // Use captured candid webcam photos, or fallback to memories if camera was disabled
  const displayPhotos = candidPhotos && candidPhotos.length > 0 ? candidPhotos : LOVE_CONFIG.memories;

  // Trigger grand fireworks and confetti rain on open (Cyan & Gold)
  useEffect(() => {
    if (!isOpen) return;

    // Canvas confetti fireworks burst
    const end = Date.now() + 3.5 * 1000;
    const colors = ['#00f2fe', '#38bdf8', '#3b82f6', '#fbbf24', '#ffd700', '#ffffff'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [isOpen]);

  // Combine letter paragraphs with clean spacing
  const fullLetterText = LOVE_CONFIG.letter.paragraphs.join("\n\n");

  useEffect(() => {
    if (!isOpen) {
      setDisplayedTextIndex(0);
      return;
    }

    let i = 0;
    const timer = setInterval(() => {
      i += 3;
      setDisplayedTextIndex(i);
      if (i >= fullLetterText.length) {
        clearInterval(timer);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [isOpen, fullLetterText.length]);

  // Handle Voice Note Playback & Waveform Animation
  const toggleVoiceNote = () => {
    soundEngine.init();
    const willPlay = !isPlayingVoice;
    setIsPlayingVoice(willPlay);

    if (willPlay) {
      if (LOVE_CONFIG.audio.voiceNoteUrl && voiceAudioRef.current) {
        voiceAudioRef.current.play().catch(e => console.log(e));
      } else {
        soundEngine.playHeartSlice();
      }

      const animateWave = () => {
        setWaveHeights(prev =>
          prev.map(() => Math.floor(Math.random() * 65 + 15))
        );
        waveformAnimRef.current = setTimeout(animateWave, 110);
      };
      animateWave();
    } else {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
      }
      if (waveformAnimRef.current) {
        clearTimeout(waveformAnimRef.current);
      }
      setWaveHeights([20, 25, 20, 30, 25, 20, 30, 25, 20, 25, 20, 25]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-black/85 backdrop-blur-xl animate-fadeIn">
      {/* Audio element for custom voice note override */}
      {LOVE_CONFIG.audio.voiceNoteUrl && (
        <audio
          ref={voiceAudioRef}
          src={LOVE_CONFIG.audio.voiceNoteUrl}
          onEnded={() => setIsPlayingVoice(false)}
        />
      )}

      {/* Main Glassmorphic Modal Container: Midnight Blue & Cyan Border */}
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col glass-panel-luxury rounded-3xl border border-cyan-400/30 overflow-hidden shadow-2xl relative bg-slate-950/90">
        
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-cyan-500/20 flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-blue-950/60 via-slate-900/80 to-cyan-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              {/* Teks Utama (Besar) */}
              <h1 className="text-xl sm:text-2xl font-black font-serif-romantic text-white flex items-center gap-2">
                {LOVE_CONFIG.letter.modalMainTitle}
              </h1>
              {/* Teks Kecil (Bawah) */}
              <p className="text-xs font-semibold text-cyan-300">
                {LOVE_CONFIG.letter.modalSubTitle}
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1 rounded-2xl bg-white/10 border border-white/10">
            <button
              onClick={() => setActiveTab('letter')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'letter'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-cyan-200 hover:text-white'
              }`}
            >
              Surat Cinta 💌
            </button>
            <button
              onClick={() => setActiveTab('candid')}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'candid'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/25'
                  : 'text-cyan-200 hover:text-white'
              }`}
            >
              Candid Kamu 📸
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-8 space-y-6">
          {activeTab === 'letter' ? (
            /* Tab 1: Romantic Typewriter Letter */
            <div className="max-w-2xl mx-auto space-y-6">
              
              {/* Voice Message Player Bar */}
              <div className="glass-panel p-4 rounded-2xl border border-cyan-400/25 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/70">
                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleVoiceNote}
                    className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25 transition-transform hover:scale-105 active:scale-95"
                  >
                    {isPlayingVoice ? (
                      <Pause className="w-5 h-5 fill-white" />
                    ) : (
                      <Play className="w-5 h-5 ml-0.5 fill-white" />
                    )}
                  </button>
                  <div>
                    <div className="text-xs font-bold text-white flex items-center gap-1.5">
                      <Music className="w-3.5 h-3.5 text-cyan-300" />
                      Pesan Suara dari Aku 🎙️
                    </div>
                    <div className="text-[11px] text-cyan-200/70">
                      {isPlayingVoice ? "Sedang memutar nada cinta..." : "Klik untuk dengarkan pesan spesial"}
                    </div>
                  </div>
                </div>

                {/* Animated Waveform Bars */}
                <div className="flex items-center gap-1 h-8 px-3 py-1 rounded-xl bg-black/40 border border-white/5">
                  {waveHeights.map((h, i) => (
                    <div
                      key={i}
                      className={`w-1 rounded-full transition-all duration-150 ${
                        isPlayingVoice ? 'bg-gradient-to-t from-cyan-400 to-amber-300' : 'bg-cyan-500/30'
                      }`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>

              {/* Letter Paper */}
              <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-900/80 to-slate-950/90 border border-cyan-400/25 shadow-2xl backdrop-blur-md">
                
                {/* Judul: Untuk Mas Al tersayang muah muah 💋 */}
                <h2 className="text-lg sm:text-xl font-bold font-serif-romantic text-amber-200 mb-5 pb-3 border-b border-cyan-400/20 flex items-center gap-2">
                  {LOVE_CONFIG.letter.title}
                </h2>

                {/* Isi Surat Typewriter */}
                <div className="font-serif-romantic text-sm sm:text-base text-zinc-100 leading-relaxed whitespace-pre-line tracking-wide">
                  {fullLetterText.slice(0, displayedTextIndex)}
                  {displayedTextIndex < fullLetterText.length && (
                    <span className="inline-block w-1.5 h-4 ml-1 bg-cyan-400 animate-pulse" />
                  )}
                </div>

                {/* Akhir Surat: ~tata cantik */}
                {displayedTextIndex >= fullLetterText.length && (
                  <div className="mt-8 pt-4 flex flex-col items-end">
                    <p className="font-serif-romantic font-bold text-base text-cyan-100 flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                      {LOVE_CONFIG.letter.senderName}
                    </p>
                  </div>
                )}
              </div>

            </div>
          ) : (
            /* Tab 2: "Candid Kamu 📸" Paparazzi Polaroid Gallery */
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-serif-romantic text-white font-bold flex items-center justify-center gap-2">
                  <ImageIcon className="w-5 h-5 text-cyan-400" />
                  Candid Rahasia Mas Al Selama Main 📸
                </h3>
                <p className="text-xs text-cyan-200/80 max-w-lg mx-auto mt-1">
                  Dipotret diam-diam oleh sistem pas kamu lagi panik kena bom, fokus combo, dan bantai kue ultah! Simpan fotonya buat kenang-kenangan yaa 🤍
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {displayPhotos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    onClick={() => setSelectedPhoto(photo)}
                    className="cursor-pointer group p-3.5 bg-slate-900/95 rounded-2xl shadow-xl border border-cyan-400/30 transform transition-all duration-300 hover:-translate-y-2 hover:rotate-1 hover:shadow-2xl hover:shadow-cyan-500/25 flex flex-col justify-between"
                    style={{
                      transform: `rotate(${((idx % 3) - 1) * 2}deg)`
                    }}
                  >
                    <div>
                      {/* Photo Container */}
                      <div className="w-full h-48 rounded-xl overflow-hidden relative bg-zinc-950 border border-white/10">
                        <img
                          src={photo.imageUrl}
                          alt={photo.caption}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[10px] font-mono text-cyan-200 border border-cyan-500/30 flex items-center gap-1">
                          <span>📸</span>
                          <span>{photo.date || '10 November'}</span>
                        </div>
                      </div>

                      {/* Polaroid Handwritten Funny Caption */}
                      <div className="mt-3 px-1">
                        <p className="text-xs font-serif-romantic italic text-cyan-100 leading-snug line-clamp-2">
                          "{photo.caption}"
                        </p>
                      </div>
                    </div>

                    {/* Download Foto Button */}
                    <a
                      href={photo.imageUrl}
                      download={`candid-mas-al-${idx + 1}.jpg`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3.5 w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all hover:scale-[1.02] active:scale-95 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download Foto
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer: Sisain Icon Love Saja & Tombol "Main Lagi" */}
        <div className="px-6 py-4 border-t border-cyan-500/20 bg-black/50 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-400 fill-rose-400 animate-pulse" />
          </div>

          <button
            onClick={onPlayAgain}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-amber-400 hover:from-cyan-400 hover:to-amber-300 text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition-transform hover:scale-105 active:scale-95"
          >
            <RotateCcw className="w-4 h-4" />
            Main Lagi
          </button>
        </div>

      </div>

      {/* Lightbox Modal for Single Candid Photo Zoom & Download */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="w-full max-w-md p-4 bg-slate-900 rounded-2xl shadow-2xl border border-cyan-400/40 transform transition-transform"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-80 rounded-xl overflow-hidden bg-zinc-950 relative border border-white/10">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.caption}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-black/75 backdrop-blur-md text-xs font-mono text-cyan-200 border border-cyan-500/30">
                {selectedPhoto.date || '10 November'}
              </div>
            </div>
            <div className="mt-4 px-2 text-center space-y-3">
              <p className="text-sm font-serif-romantic italic text-slate-200">
                "{selectedPhoto.caption}"
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <a
                  href={selectedPhoto.imageUrl}
                  download="candid-mas-al-zoom.jpg"
                  className="px-4 py-2 text-xs font-semibold rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 transition shadow-md flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download Foto 📥
                </a>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-4 py-2 text-xs font-semibold rounded-full bg-white/10 hover:bg-white/20 text-cyan-200 transition"
                >
                  Tutup Momen ✨
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default BirthdayLetterModal;
