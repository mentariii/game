import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Play, Pause, RotateCcw, Download, Camera, Heart, Volume2, Sparkles, X } from 'lucide-react';
import { LOVE_CONFIG } from '../config/loveConfig';
import { soundEngine } from '../audio/SoundEngine';

export const BirthdayLetterModal = ({ isOpen, onPlayAgain, candidPhotos = [] }) => {
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [isPlayingVoice, setIsPlayingVoice] = useState(false);
  const [activeTab, setActiveTab] = useState('letter'); // 'letter' | 'candid'

  const voiceAudioRef = useRef(null);
  const waveformAnimRef = useRef(null);
  const [waveHeights, setWaveHeights] = useState([25, 60, 85, 45, 95, 55, 100, 40, 75, 50, 65, 35]);

  // Use captured candid webcam photos, or fallback to memories if camera was disabled
  const displayPhotos = candidPhotos && candidPhotos.length > 0 ? candidPhotos : LOVE_CONFIG.memories;

  // Trigger grand victory fireworks and confetti rain on open (Cyan, Blue & Gold)
  useEffect(() => {
    if (!isOpen) return;

    const end = Date.now() + 3.2 * 1000;
    const colors = ['#00f2fe', '#38bdf8', '#3b82f6', '#fbbf24', '#ffd700', '#ffffff'];

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors
      });
      confetti({
        particleCount: 5,
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

  // Voice Note Play / Pause & Waveform Animation
  const toggleVoiceNote = () => {
    soundEngine.init();
    const willPlay = !isPlayingVoice;
    setIsPlayingVoice(willPlay);

    if (willPlay) {
      if (LOVE_CONFIG.audio.voiceNoteUrl && voiceAudioRef.current) {
        voiceAudioRef.current.play().catch(e => console.log(e));
      } else {
        soundEngine.playDataDecrypt();
      }

      const animateWave = () => {
        setWaveHeights(prev =>
          prev.map(() => Math.floor(Math.random() * 75 + 20))
        );
        waveformAnimRef.current = setTimeout(animateWave, 100);
      };
      animateWave();
    } else {
      if (voiceAudioRef.current) {
        voiceAudioRef.current.pause();
      }
      if (waveformAnimRef.current) {
        clearTimeout(waveformAnimRef.current);
      }
      setWaveHeights([25, 30, 25, 35, 30, 25, 35, 30, 25, 30, 25, 30]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-6 bg-black/85 backdrop-blur-2xl animate-fadeIn select-none font-gamer text-white">
      
      {/* Audio element for custom voice note override */}
      {LOVE_CONFIG.audio.voiceNoteUrl && (
        <audio
          ref={voiceAudioRef}
          src={LOVE_CONFIG.audio.voiceNoteUrl}
          onEnded={() => setIsPlayingVoice(false)}
        />
      )}

      {/* Main Sleek Console Gamer Victory Container (PS5 / GTA / Valorant Style) */}
      <div className="w-full max-w-4xl max-h-[94vh] flex flex-col bg-[#0b0f19] border-2 border-cyan-400/80 rounded-3xl shadow-[0_0_60px_rgba(0,242,254,0.35)] relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-28 bg-gradient-to-b from-amber-500/20 via-cyan-500/15 to-transparent blur-3xl pointer-events-none" />

        {/* 1. Victory Top Header Bar */}
        <div className="px-5 sm:px-8 py-4 border-b border-cyan-500/30 bg-[#080c14]/90 flex flex-wrap items-center justify-between gap-3 shrink-0 relative z-10">
          <div>
            {/* Header Title: MISSION PASSED: LEVEL 21 🏆 */}
            <div className="text-xl sm:text-2xl md:text-3xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 flex items-center gap-2 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]">
              <Trophy className="w-6 h-6 text-amber-300 animate-bounce shrink-0" />
              <span>MISSION PASSED: LEVEL 21 🏆</span>
            </div>
            {/* Header Subtitle: Player: Mas Al | 10 November */}
            <div className="text-xs sm:text-sm text-cyan-300 font-semibold tracking-wider mt-0.5 flex items-center gap-2">
              <span>Player: <strong className="text-white">Mas Al</strong></span>
              <span className="text-cyan-500">•</span>
              <span>10 November</span>
              <span className="text-cyan-500">•</span>
              <span className="text-emerald-400 font-bold">VICTORY UNLOCKED</span>
            </div>
          </div>

          {/* Clean Console Tab Navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('letter')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'letter'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(0,242,254,0.5)] scale-105'
                  : 'bg-slate-900/80 border border-cyan-500/30 text-cyan-200 hover:text-white hover:border-cyan-400'
              }`}
            >
              <span>Pesan Spesial 💌</span>
            </button>

            <button
              onClick={() => setActiveTab('candid')}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'candid'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(0,242,254,0.5)] scale-105'
                  : 'bg-slate-900/80 border border-cyan-500/30 text-cyan-200 hover:text-white hover:border-cyan-400'
              }`}
            >
              <Camera className="w-4 h-4 text-amber-300" />
              <span>Candid Kamu 📸</span>
            </button>
          </div>
        </div>

        {/* 2. Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6">
          
          {activeTab === 'letter' ? (
            /* TAB 1: PESAN SPESIAL (Clean Instant Display, Zero Typewriter Delay) */
            <div className="max-w-3xl mx-auto space-y-6 animate-fadeIn">
              
              {/* Voice Note Player (Clean Console Style) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center shrink-0">
                    <Volume2 className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-bold text-white">Pesan Suara Dari Tata 🎙️</div>
                    <div className="text-xs text-cyan-300/80">Dengarkan pesan spesial untukmu di hari ulang tahun ini</div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <button
                    onClick={toggleVoiceNote}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-extrabold text-xs sm:text-sm tracking-wide shadow-[0_0_15px_rgba(0,242,254,0.4)] flex items-center gap-2 cursor-pointer transition active:scale-95"
                  >
                    {isPlayingVoice ? (
                      <>
                        <Pause className="w-4 h-4 fill-white text-white" />
                        <span>Jeda Pesan Suara ⏸️</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-white text-white ml-0.5" />
                        <span>Putar Pesan Suara 🎙️</span>
                      </>
                    )}
                  </button>

                  {/* Waveform Equalizer Bars */}
                  <div className="flex items-center gap-1 h-7 px-3 py-1 bg-black/60 rounded-lg border border-cyan-500/20">
                    {waveHeights.map((h, i) => (
                      <div
                        key={i}
                        className={`w-1 rounded-full transition-all duration-100 ${
                          isPlayingVoice
                            ? 'bg-gradient-to-t from-cyan-400 to-amber-300 shadow-[0_0_6px_rgba(0,242,254,0.8)]'
                            : 'bg-cyan-500/30'
                        }`}
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Main Letter Card (Rendered Immediately with Smooth Reading Experience) */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-950/90 border border-cyan-400/40 shadow-xl text-left relative space-y-6">
                
                {/* Greeting Title: Untuk Mas Al tersayang muah muah 💋 */}
                <div className="border-b border-cyan-500/30 pb-4">
                  <h3 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide flex items-center gap-2">
                    <span>{LOVE_CONFIG.letter.title}</span>
                  </h3>
                </div>

                {/* Letter Paragraphs (Verbatim Exact Text from User Request) */}
                <div className="space-y-4 font-sans text-sm sm:text-base text-slate-100 leading-relaxed font-normal">
                  {LOVE_CONFIG.letter.paragraphs.map((p, idx) => (
                    <p key={idx} className="leading-relaxed text-slate-200">
                      {p}
                    </p>
                  ))}
                </div>

                {/* Signature: ~tata cantik ❤️ */}
                <div className="pt-6 border-t border-cyan-500/30 text-right space-y-1">
                  <div className="text-base sm:text-lg font-black text-amber-300 flex items-center justify-end gap-1.5 font-gamer">
                    <span>{LOVE_CONFIG.letter.senderName}</span>
                    <Heart className="w-4 h-4 text-rose-500 fill-rose-500 inline-block animate-pulse" />
                  </div>
                </div>

              </div>

            </div>
          ) : (
            /* TAB 2: CANDID KAMU 📸 (Clean Screenshot Gallery) */
            <div className="space-y-4 animate-fadeIn">
              
              <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-cyan-500/30 text-left flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-2 text-cyan-200 font-bold">
                  <Camera className="w-4 h-4 text-amber-300" />
                  <span>Momen Candid Mas Al Saat Main Game 📸</span>
                </div>
                <span className="text-amber-300 font-bold text-xs">
                  {displayPhotos.length} Foto Terkumpul
                </span>
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {displayPhotos.map((photo, idx) => (
                  <div
                    key={photo.id || idx}
                    onClick={() => setSelectedPhoto(photo)}
                    className="p-3 rounded-2xl bg-slate-950/90 border border-cyan-500/30 hover:border-cyan-300 shadow-lg hover:shadow-[0_0_25px_rgba(0,242,254,0.3)] transition-all cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      {/* Photo Container */}
                      <div className="w-full h-44 rounded-xl bg-black relative overflow-hidden border border-cyan-500/20">
                        <img
                          src={photo.imageUrl}
                          alt={photo.caption}
                          className="w-full h-full object-cover filter contrast-105 group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />

                        <div className="absolute top-2 right-2 px-2.5 py-1 rounded-full bg-black/75 text-[10px] text-cyan-200 font-bold border border-cyan-500/30">
                          {photo.date || '10 November'}
                        </div>
                      </div>

                      {/* Caption */}
                      <div className="mt-3 px-1 text-left">
                        <p className="text-xs text-slate-200 leading-snug line-clamp-2 font-sans font-medium">
                          "{photo.caption}"
                        </p>
                      </div>
                    </div>

                    {/* Download Button */}
                    <a
                      href={photo.imageUrl}
                      download={`candid-mas-al-${idx + 1}.jpg`}
                      onClick={(e) => e.stopPropagation()}
                      className="mt-3 w-full py-2 px-3 rounded-xl bg-cyan-950/60 hover:bg-cyan-500/20 border border-cyan-400/50 text-cyan-200 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5 text-cyan-300" />
                      <span>Unduh Foto 📥</span>
                    </a>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>

        {/* 3. Modal Bottom Footer with "Main Lagi 🎮" Button */}
        <div className="px-5 sm:px-8 py-4 border-t border-cyan-500/30 bg-[#080c14]/90 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-cyan-300/80 hidden sm:flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Selamat Ulang Tahun, Sayang! Sukses terus yaa ❤️</span>
          </div>

          {/* Restart Button: Main Lagi 🎮 */}
          <button
            onClick={onPlayAgain}
            className="w-full sm:w-auto px-7 py-3 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-cyan-500 hover:from-cyan-400 hover:to-blue-500 text-white font-black text-sm sm:text-base tracking-widest uppercase transition-all duration-200 shadow-[0_0_25px_rgba(0,242,254,0.5)] hover:shadow-[0_0_35px_rgba(0,242,254,0.8)] active:scale-95 cursor-pointer flex items-center justify-center gap-2 ml-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Main Lagi 🎮</span>
          </button>
        </div>

      </div>

      {/* Lightbox Modal for Photo Inspection */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4 animate-fadeIn font-gamer"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="w-full max-w-lg p-5 rounded-3xl bg-[#0b0f19] border-2 border-cyan-400 shadow-[0_0_50px_rgba(0,242,254,0.5)] relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-cyan-500/30 text-xs text-cyan-300 font-bold">
              <span>FOTO CANDID MAS AL 📸</span>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-full h-80 rounded-2xl bg-black relative overflow-hidden border border-cyan-500/40">
              <img
                src={selectedPhoto.imageUrl}
                alt={selectedPhoto.caption}
                className="w-full h-full object-cover filter contrast-105"
              />
            </div>

            <div className="mt-4 text-left space-y-3 font-sans">
              <p className="text-xs sm:text-sm text-slate-200 font-medium">
                "{selectedPhoto.caption}"
              </p>
              
              <div className="flex items-center justify-end gap-3 pt-2 border-t border-cyan-500/20 font-gamer">
                <a
                  href={selectedPhoto.imageUrl}
                  download="candid-mas-al-full.jpg"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-950/80 hover:bg-cyan-500/20 border border-cyan-400 text-cyan-200 hover:text-white transition flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Unduh Foto Penuh 📥</span>
                </a>
                <button
                  onClick={() => setSelectedPhoto(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
                >
                  Tutup
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
