import React, { useEffect, useRef, useState, useCallback } from 'react';
import { VFXEngine } from './vfx/VFXEngine';
import { GameEngine } from './game/GameEngine';
import { HandTracker } from './tracker/HandTracker';
import { soundEngine } from './audio/SoundEngine';
import { LOVE_CONFIG } from './config/loveConfig';

import TopHUD from './components/TopHUD';
import CameraBackground from './components/CameraBackground';
import FloatingPolaroid from './components/FloatingPolaroid';
import ComboBanner from './components/ComboBanner';
import GiantBossOverlay from './components/GiantBossOverlay';
import BirthdayLetterModal from './components/BirthdayLetterModal';
import StartScreenModal from './components/StartScreenModal';

const PAPARAZZI_CAPTIONS = {
  bomb: [
    "Muka panik kena bom 💥",
    "Detik-detik syok kena bom wkwk 💣",
    "Kaget banget yaa kena bom 😅"
  ],
  combo: [
    "Fokus banget nebasnya 👀",
    "Muka serius mode bantai combo 🔥",
    "Tatapan tajam sang master pedang ⚔️"
  ],
  boss: [
    "Mode bantai kue ultah boss 🔥",
    "Ekspresi sabetan maut ke kue 🎂",
    "Ngebut nebas kue ultah mas al ⚡"
  ],
  timer: [
    "Serius amat bos 🎮",
    "Lagi asyik-asyiknya main ✨",
    "Gantengnya Mas Al pas fokus nebas 🥰"
  ]
};

export function App() {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);

  // Engines
  const vfxRef = useRef(null);
  const gameRef = useRef(null);
  const trackerRef = useRef(null);

  // React State for UI HUD & Overlays
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LOVE_CONFIG.initialLives);
  const [combo, setCombo] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraStatus, setCameraStatus] = useState('idle');
  const [bombPulseActive, setBombPulseActive] = useState(false);

  // Progressive Waves & Timer State
  const [currentWave, setCurrentWave] = useState(1);
  const [waveTitle, setWaveTitle] = useState("Wave 1: Pemanasan 🎮");
  const [timeLeft, setTimeLeft] = useState(LOVE_CONFIG.gameDurationSeconds);

  // Modals & Overlays
  const [isStartModalOpen, setIsStartModalOpen] = useState(true);
  const [toastMessage, setToastMessage] = useState('');
  const [floatingPolaroids, setFloatingPolaroids] = useState([]);
  const [isBossPhase, setIsBossPhase] = useState(false);
  const [isFinaleOpen, setIsFinaleOpen] = useState(false);

  // Hidden Paparazzi Captured Photos
  const [candidPhotos, setCandidPhotos] = useState([]);
  const lastCaptureTimeRef = useRef(0);
  const candidCountRef = useRef(0);

  // Toast message timer
  const showToast = useCallback((msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? '' : current));
    }, 2500);
  }, []);

  // Silent Paparazzi Capture from live webcam stream
  const capturePaparazziSnapshot = useCallback((reason) => {
    const now = Date.now();
    // Enforce at least 4.5s cooldown between snapshots and max 6 total
    if (now - lastCaptureTimeRef.current < 4500) return;
    if (candidCountRef.current >= 6) return;

    const video = videoRef.current;
    let snapshotUrl = null;

    if (video && video.readyState >= 2 && video.videoWidth > 0) {
      try {
        const capCanvas = document.createElement('canvas');
        capCanvas.width = video.videoWidth;
        capCanvas.height = video.videoHeight;
        const capCtx = capCanvas.getContext('2d');

        // Draw mirrored to match player's mirrored webcam view
        capCtx.translate(capCanvas.width, 0);
        capCtx.scale(-1, 1);
        capCtx.drawImage(video, 0, 0, capCanvas.width, capCanvas.height);

        snapshotUrl = capCanvas.toDataURL('image/jpeg', 0.85);
      } catch (err) {
        console.warn("Paparazzi capture exception:", err);
      }
    }

    // Fallback if camera is inactive or not ready (Mouse Mode)
    if (!snapshotUrl) {
      const fallbackImgs = LOVE_CONFIG.memories;
      const fallbackItem = fallbackImgs[candidCountRef.current % fallbackImgs.length];
      snapshotUrl = fallbackItem?.imageUrl || "";
    }

    const pool = PAPARAZZI_CAPTIONS[reason] || PAPARAZZI_CAPTIONS.timer;
    const caption = pool[Math.floor(Math.random() * pool.length)];

    const newCandid = {
      id: `candid-${now}-${candidCountRef.current}`,
      imageUrl: snapshotUrl,
      caption,
      date: '10 November',
      reason
    };

    lastCaptureTimeRef.current = now;
    candidCountRef.current += 1;
    setCandidPhotos((prev) => [...prev, newCandid]);
  }, []);

  // Initialize Engines & Loop
  useEffect(() => {
    const vfx = new VFXEngine();
    vfxRef.current = vfx;

    const game = new GameEngine({
      vfx,
      onScoreChange: (newScore) => setScore(newScore),
      onLivesChange: (newLives) => {
        setLives(newLives);
        if (newLives < lives) {
          // Bomb damage pulse
          setBombPulseActive(true);
          setTimeout(() => setBombPulseActive(false), 380);
        }
      },
      onComboChange: (newCombo) => setCombo(newCombo),
      onToast: (msg) => showToast(msg),
      onPolaroidSpawn: (polaroidData) => {
        setFloatingPolaroids((prev) => [...prev, polaroidData]);
      },
      onBossStart: () => setIsBossPhase(true),
      onFinaleComplete: () => {
        setIsFinaleOpen(true);
        setIsBossPhase(false);
      },
      onWaveChange: (waveNum, title) => {
        setCurrentWave(waveNum);
        setWaveTitle(title);
      },
      onTimeUpdate: (remaining) => {
        setTimeLeft(remaining);
      },
      onPaparazziCapture: (reason) => {
        capturePaparazziSnapshot(reason);
      }
    });
    gameRef.current = game;

    // Hand Tracker
    const tracker = new HandTracker({
      onPoint: (x, y) => {
        game.handleBladeMove(x, y);
      },
      onStatusChange: (status) => {
        setCameraStatus(status);
        if (status === 'ready' || status === 'tracking') {
          setCameraActive(true);
        }
        if (status === 'denied' || status === 'unsupported' || status === 'stopped') {
          setCameraActive(false);
        }
      }
    });
    trackerRef.current = tracker;

    // Canvas Resize
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
      vfx.width = w;
      vfx.height = h;
      game.setDimensions(w, h);
      tracker.setDimensions(w, h);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initial audio resume trigger on first interaction fallback
    const initAudio = () => {
      soundEngine.init();
      soundEngine.startAmbientBgm(LOVE_CONFIG.audio.customBgmUrl);
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
    };
    window.addEventListener('pointerdown', initAudio);
    window.addEventListener('keydown', initAudio);

    // Main 60fps Game & VFX Render Loop
    let lastTime = performance.now();
    let animId;

    const render = (time) => {
      const dt = Math.min((time - lastTime) / 1000, 0.1);
      lastTime = time;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Apply screen shake
      const shake = vfx.getShakeOffset();
      ctx.save();
      ctx.translate(shake.x, shake.y);

      // Update & Draw Game physics
      game.update(dt);
      game.draw(ctx);

      // Update & Draw VFX
      vfx.update(dt);
      vfx.draw(ctx);

      ctx.restore();

      animId = requestAnimationFrame(render);
    };
    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', initAudio);
      window.removeEventListener('keydown', initAudio);
      if (trackerRef.current) trackerRef.current.stopCamera();
      soundEngine.stopAmbientBgm();
    };
  }, [showToast, capturePaparazziSnapshot]);

  // Start With Camera Choice from Start Screen
  const handleStartWithCamera = async () => {
    setIsStartModalOpen(false);
    soundEngine.init();
    soundEngine.startAmbientBgm(LOVE_CONFIG.audio.customBgmUrl);

    if (videoRef.current) {
      await trackerRef.current?.startCamera(videoRef.current);
    }
  };

  // Start With Mouse Choice from Start Screen
  const handleStartWithMouse = () => {
    setIsStartModalOpen(false);
    soundEngine.init();
    soundEngine.startAmbientBgm(LOVE_CONFIG.audio.customBgmUrl);
    showToast("Mode Mouse Aktif ✨ Klik ikon kamera di atas kapan saja!");
  };

  // Toggle Camera in HUD anytime
  const handleToggleCamera = async () => {
    soundEngine.init();
    if (cameraActive) {
      trackerRef.current?.stopCamera();
      setCameraActive(false);
      showToast("Kamera Dinonaktifkan 🖱️ Mode Mouse Aktif");
    } else {
      if (videoRef.current) {
        await trackerRef.current?.startCamera(videoRef.current);
      }
    }
  };

  // Toggle Audio Mute
  const handleToggleMute = () => {
    soundEngine.init();
    const muted = soundEngine.toggleMute();
    setIsMuted(muted);
  };

  // Quick Trigger Boss for Testing / Preview
  const handleTriggerBoss = () => {
    soundEngine.init();
    gameRef.current?.startBossPhase();
  };

  // Play Again from Birthday Letter Modal
  const handlePlayAgain = () => {
    soundEngine.init();
    setIsFinaleOpen(false);
    setIsBossPhase(false);
    candidCountRef.current = 0;
    setCandidPhotos([]);
    gameRef.current?.resetGame();
  };

  // Remove individual floating polaroid after animation completes
  const handlePolaroidComplete = (id) => {
    setFloatingPolaroids((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      
      {/* 1. Camera Background & Flattering Vignette */}
      <CameraBackground
        ref={videoRef}
        cameraActive={cameraActive}
        bombPulseActive={bombPulseActive}
      />

      {/* 2. Main 60fps Game & VFX Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full z-10 cursor-crosshair touch-none"
      />

      {/* 3. Top Glassmorphic HUD with Wave Indicator & Countdown Timer */}
      <TopHUD
        score={score}
        lives={lives}
        combo={combo}
        targetScore={LOVE_CONFIG.targetScore}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        cameraActive={cameraActive}
        onToggleCamera={handleToggleCamera}
        cameraStatus={cameraStatus}
        onTriggerBoss={handleTriggerBoss}
        currentWave={currentWave}
        waveTitle={waveTitle}
        timeLeft={timeLeft}
      />

      {/* 4. Floating Polaroid Cards (if any) */}
      {floatingPolaroids.map((mem) => (
        <FloatingPolaroid
          key={`${mem.id}-${mem.spawnX}-${mem.spawnY}`}
          memory={mem}
          onComplete={handlePolaroidComplete}
        />
      ))}

      {/* 5. Combo Banner & Toast Notifications */}
      <ComboBanner combo={combo} toastMessage={toastMessage} />

      {/* 6. Boss Encounter Top Prompt Overlay */}
      <GiantBossOverlay isBossPhase={isBossPhase} />

      {/* 7. Start / Camera Permission Modal */}
      <StartScreenModal
        isOpen={isStartModalOpen}
        onStartWithCamera={handleStartWithCamera}
        onStartWithMouse={handleStartWithMouse}
      />

      {/* 8. Grand Finale: Birthday Letter & "Candid Kamu 📸" Polaroid Modal */}
      <BirthdayLetterModal
        isOpen={isFinaleOpen}
        candidPhotos={candidPhotos}
        onPlayAgain={handlePlayAgain}
      />

    </div>
  );
}

export default App;
