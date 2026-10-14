// HandTracker: Direct getUserMedia Webcam + MediaPipe Hands (Index Finger Tip Landmark 8) + Mouse/Touch Fallback

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
        resolve(null);
      }
    }, 100);
  });
}

export class HandTracker {
  constructor({ onPoint, onStatusChange }) {
    this.onPoint = onPoint; // Callback: (x, y, isHand)
    this.onStatusChange = onStatusChange || (() => {});
    this.videoElement = null;
    this.mediaStream = null;
    this.hands = null;
    this.isRunning = false;
    this.isHandDetected = false;

    // Smoothed coordinates
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
      // If hand is actively tracking, mouse only overrides if clicked
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
    if (this.isRunning) return;
    this.videoElement = videoRef;
    this.onStatusChange('requesting');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.warn("Browser does not support navigator.mediaDevices.getUserMedia");
      this.onStatusChange('unsupported');
      return;
    }

    try {
      // 1. Request direct webcam stream
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
          console.warn("Video play error:", playErr);
        }
      }

      this.isRunning = true;
      this.onStatusChange('ready');

      // 2. Initialize MediaPipe Hands in parallel
      this.initMediaPipe();

    } catch (err) {
      console.warn("Webcam permission denied or camera unavailable:", err);
      this.onStatusChange('denied');
    }
  }

  // Initialize MediaPipe Hands
  async initMediaPipe() {
    try {
      const Hands = await waitForMediaPipeHands();
      if (!Hands) {
        console.warn("MediaPipe Hands library not loaded yet, camera video is active with mouse/touch tracking.");
        return;
      }

      this.hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      this.hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 0, // Fastest, lightest model for rapid hand slicing
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.hands.onResults((results) => {
        this.handleResults(results);
      });

      // Frame processing loop using requestVideoFrameCallback or requestAnimationFrame
      let isProcessing = false;
      const processLoop = async () => {
        if (!this.isRunning || !this.videoElement) return;

        if (this.videoElement.readyState >= 2 && !isProcessing) {
          isProcessing = true;
          try {
            await this.hands.send({ image: this.videoElement });
          } catch {
            // Drop frame on busy worker
          }
          isProcessing = false;
        }

        if (this.isRunning) {
          requestAnimationFrame(processLoop);
        }
      };

      requestAnimationFrame(processLoop);
      this.onStatusChange('tracking');

    } catch (err) {
      console.warn("MediaPipe Hands initialization note:", err);
    }
  }

  // Handle MediaPipe Landmark Results
  handleResults(results) {
    if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
      this.isHandDetected = true;
      const landmarks = results.multiHandLandmarks[0];

      // Landmark 8 is the Index Finger Tip
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
    }
  }

  // Stop Camera & free hardware
  stopCamera() {
    this.isRunning = false;
    this.isHandDetected = false;

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }

    this.onStatusChange('stopped');
  }
}

export default HandTracker;
