// HandTracker: Direct getUserMedia Webcam + Local MediaPipe Hands (Dual-Hand Heart Gesture 🫶 + Landmark 8 Slicing)

function waitForMediaPipeHands() {
  if (typeof window !== 'undefined' && window.Hands) {
    return Promise.resolve(window.Hands);
  }
  return new Promise((resolve) => {
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (typeof window !== 'undefined' && window.Hands) {
        clearInterval(interval);
        resolve(window.Hands);
      } else if (attempts > 50) {
        clearInterval(interval);
        resolve(window.Hands || null);
      }
    }, 100);
  });
}

export class HandTracker {
  constructor({ onPoint, onStatusChange, onGesture }) {
    this.onPoint = onPoint; // Callback: (x, y, isHand)
    this.onStatusChange = onStatusChange || (() => {});
    this.onGesture = onGesture || (() => {});
    this.videoElement = null;
    this.mediaStream = null;
    this.hands = null;
    this.initPromise = null;
    this.isRunning = false;
    this.isHandDetected = false;
    this.isLoopRunning = false;

    // Smoothed coordinates for slicing blade
    this.smoothX = null;
    this.smoothY = null;
    this.alpha = 0.72; // High-responsiveness smoothing for rapid swipes

    // Dimensions
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Mouse fallback tracking
    this.isMouseDown = false;

    this.setupWindowListeners();
  }

  setDimensions(w, h) {
    this.width = w;
    this.height = h;
  }

  setupWindowListeners() {
    // Mouse movement fallback
    window.addEventListener('mousemove', (e) => {
      if (this.isHandDetected && !this.isMouseDown) return;

      const x = e.clientX;
      const y = e.clientY;
      if (this.onPoint) {
        this.onPoint(x, y, false);
      }
    });

    window.addEventListener('mousedown', () => {
      this.isMouseDown = true;
    });

    window.addEventListener('mouseup', () => {
      this.isMouseDown = false;
    });

    // Touch support (mobile / touchscreens)
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        const t = e.touches[0];
        if (this.onPoint) {
          this.onPoint(t.clientX, t.clientY, false);
        }
      }
    }, { passive: true });
  }

  // Start Camera using native navigator.mediaDevices.getUserMedia
  async startCamera(videoRef) {
    if (this.isRunning && this.mediaStream) return;
    this.videoElement = videoRef;
    this.onStatusChange('requesting');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Browser does not support navigator.mediaDevices.getUserMedia");
      this.onStatusChange('unsupported');
      return;
    }

    try {
      // 1. Request direct webcam stream with 720p ideal
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      });

      this.mediaStream = stream;

      if (this.videoElement) {
        this.videoElement.srcObject = stream;
        try {
          await this.videoElement.play();
        } catch (playErr) {
          console.warn("Video play notice:", playErr);
        }
      }

      this.isRunning = true;
      this.onStatusChange('ready');

      // 2. Initialize MediaPipe Hands in background and start loop once initialized
      await this.initMediaPipe();

    } catch (err) {
      console.warn("Webcam permission denied or camera unavailable:", err);
      this.onStatusChange('denied');
    }
  }

  // Initialize MediaPipe Hands using local assets with async initialize()
  async initMediaPipe() {
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const Hands = await waitForMediaPipeHands();
        if (!Hands) {
          console.warn("MediaPipe Hands library not loaded, camera active with mouse fallback.");
          return;
        }

        if (!this.hands) {
          this.hands = new Hands({
            locateFile: (file) => `/mediapipe/hands/${file}`
          });

          // Track 2 hands for the Two-Handed Heart Gesture (🫶) with sensitive indoor detection
          this.hands.setOptions({
            maxNumHands: 2,
            modelComplexity: 0, // Fastest, lightest model for rapid movement
            minDetectionConfidence: 0.3, // Highly sensitive for indoor room lighting
            minTrackingConfidence: 0.3
          });

          this.hands.onResults((results) => {
            this.handleResults(results);
          });

          // Wait for WebAssembly module and assets to fully initialize
          console.log("Compiling MediaPipe Hands WebAssembly...");
          await this.hands.initialize();
          console.log("✓ MediaPipe Hands WebAssembly ready.");
        }

        this.startProcessingLoop();
        this.onStatusChange('tracking');

      } catch (err) {
        console.warn("MediaPipe Hands initialization notice:", err);
      }
    })();

    return this.initPromise;
  }

  startProcessingLoop() {
    if (this.isLoopRunning) return;
    this.isLoopRunning = true;

    let isProcessing = false;
    let lastProcessedTime = -1;

    const processLoop = async () => {
      if (!this.isRunning || !this.videoElement || !this.hands) {
        this.isLoopRunning = false;
        return;
      }

      const vid = this.videoElement;

      // Ensure video is playing and has actual dimensions before sending frame
      if (
        vid.readyState >= 2 &&
        vid.videoWidth > 0 &&
        !vid.paused &&
        vid.currentTime !== lastProcessedTime &&
        !isProcessing
      ) {
        lastProcessedTime = vid.currentTime;
        isProcessing = true;
        try {
          await this.hands.send({ image: vid });
        } catch (sendErr) {
          console.warn("MediaPipe frame send notice:", sendErr);
        } finally {
          isProcessing = false;
        }
      }

      if (this.isRunning) {
        requestAnimationFrame(processLoop);
      } else {
        this.isLoopRunning = false;
      }
    };

    requestAnimationFrame(processLoop);
  }

  // Scale-Invariant & Forgiving Heart Gesture Detection (Two-Handed 🫶 + Finger Heart 🫰)
  checkHeartGesture(multiHandLandmarks) {
    if (!multiHandLandmarks || multiHandLandmarks.length === 0) {
      return { isHeart: false, type: null, confidence: 0 };
    }

    // 1. Single-Handed "Finger Heart" (🫰) check on any detected hand
    for (let i = 0; i < multiHandLandmarks.length; i++) {
      const hand = multiHandLandmarks[i];
      // Hand scale reference (wrist to middle MCP)
      const palmScale = Math.max(Math.hypot(hand[0].x - hand[9].x, hand[0].y - hand[9].y), 0.05);

      // Thumb tip (4) to Index tip (8) distance
      const dThumbIndex = Math.hypot(hand[4].x - hand[8].x, hand[4].y - hand[8].y);
      const normalizedThumbIndex = dThumbIndex / palmScale;

      // Distance from wrist to middle tip (12), ring tip (16), pinky tip (20)
      const dWristMiddle = Math.hypot(hand[12].x - hand[0].x, hand[12].y - hand[0].y);
      const dWristIndex = Math.hypot(hand[8].x - hand[0].x, hand[8].y - hand[0].y);

      // Finger heart condition: thumb and index are touching or crossed, and middle finger is curled
      if (normalizedThumbIndex < 0.55 && (dWristMiddle < dWristIndex * 1.05 || hand[12].y > hand[10].y)) {
        return { isHeart: true, type: 'finger-heart', confidence: 0.95 };
      }
    }

    // 2. Two-Handed Heart (🫶) when 2 hands are visible
    if (multiHandLandmarks.length >= 2) {
      const handA = multiHandLandmarks[0];
      const handB = multiHandLandmarks[1];

      const palmA = Math.max(Math.hypot(handA[0].x - handA[9].x, handA[0].y - handA[9].y), 0.05);
      const palmB = Math.max(Math.hypot(handB[0].x - handB[9].x, handB[0].y - handB[9].y), 0.05);
      const avgPalm = (palmA + palmB) / 2;

      // Distance between thumbs (Landmark 4)
      const dThumbs = Math.hypot(handA[4].x - handB[4].x, handA[4].y - handB[4].y);
      // Distance between index finger tips (Landmark 8)
      const dIndices = Math.hypot(handA[8].x - handB[8].x, handA[8].y - handB[8].y);
      // Distance between wrists (Landmark 0)
      const dWrists = Math.hypot(handA[0].x - handB[0].x, handA[0].y - handB[0].y);

      // Scale-normalized checks
      const normThumbs = dThumbs / avgPalm;
      const normIndices = dIndices / avgPalm;
      const normWrists = dWrists / avgPalm;

      // Thumbs close together, index tips close together, wrists spaced apart
      if (normThumbs < 1.1 && normIndices < 1.1 && normWrists > 0.35) {
        return { isHeart: true, type: 'two-hand', confidence: 1.0 };
      }

      // Crossed tips check (indexA touching thumbB and vice versa)
      const dCross1 = Math.hypot(handA[4].x - handB[8].x, handA[4].y - handB[8].y) / avgPalm;
      const dCross2 = Math.hypot(handA[8].x - handB[4].x, handA[8].y - handB[4].y) / avgPalm;
      if (dCross1 < 1.1 && dCross2 < 1.1 && normWrists > 0.35) {
        return { isHeart: true, type: 'two-hand', confidence: 1.0 };
      }
    }

    return { isHeart: false, type: null, confidence: 0 };
  }

  // Handle MediaPipe Landmark Results
  handleResults(results) {
    const hands = results.multiHandLandmarks || [];
    if (hands.length > 0) {
      this.isHandDetected = true;

      // 1. Evaluate Heart Gesture for Biometric Scanner
      const gesture = this.checkHeartGesture(hands);
      if (this.onGesture) {
        this.onGesture({
          isHeart: gesture.isHeart,
          type: gesture.type,
          confidence: gesture.confidence,
          handsCount: hands.length
        });
      }

      // 2. Track Index Finger Tip (Landmark 8) of primary hand for Slicing Blade
      const landmarks = hands[0];
      const indexTip = landmarks[8];

      // Screen is mirrored horizontally (scaleX(-1)), so x is flipped: (1 - x)
      const rawX = (1 - indexTip.x) * this.width;
      const rawY = indexTip.y * this.height;

      // Exponential moving average smoothing for zero jitter
      if (this.smoothX === null) {
        this.smoothX = rawX;
        this.smoothY = rawY;
      } else {
        this.smoothX += (rawX - this.smoothX) * this.alpha;
        this.smoothY += (rawY - this.smoothY) * this.alpha;
      }

      if (this.onPoint) {
        this.onPoint(this.smoothX, this.smoothY, true);
      }
    } else {
      this.isHandDetected = false;
      if (this.onGesture) {
        this.onGesture({
          isHeart: false,
          type: null,
          confidence: 0,
          handsCount: 0
        });
      }
    }
  }

  // Stop Camera & free hardware
  stopCamera() {
    this.isRunning = false;
    this.isHandDetected = false;
    this.isLoopRunning = false;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    if (this.hands && typeof this.hands.close === 'function') {
      try {
        this.hands.close();
      } catch (e) {
        // ignore on unmount
      }
      this.hands = null;
      this.initPromise = null;
    }

    this.onStatusChange('stopped');
  }
}

export default HandTracker;
