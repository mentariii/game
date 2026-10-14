# ✨ Celestial Love Slice (Ultimate Edition) ✨
### High-Juice 3D Hand-Tracking Birthday Game & Procedural Web Audio Experience

A luxury, romantic AR/Webcam hand-tracking web slice game created as an unforgettable birthday gift for your boyfriend.

---

## 🌟 Key Features

1. **Aesthetic & Visual Direction (3D Glossy Luxury + Glassmorphism)**
   - **Mirrored Dreamy Webcam Feed**: Fullscreen mirrored (`scaleX(-1)`) video feed with a warm-glow CSS filter (`brightness(1.06) contrast(0.97) saturate(1.08)`) and rose-gold vignette overlay.
   - **Frosted Glass UI**: Floating glassmorphic HUD (`backdrop-filter: blur(20px)`) with an animated Score Odometer, Combo Multiplier Badge with pulse scaling, 3D Glossy Heart Lives, and Finale Progress Bar.
   - **Google Fonts Typography**: `'Plus Jakarta Sans'` for modern UI HUD and `'Playfair Display'` for romantic titles and letter.
   - **Procedural 3D Glossy Asset Renderer (NO Flat 2D Shapes)**:
     - Metallic Rose-Gold & Pearl Balloons with delicate wavy strings.
     - 3D Satin Gift Boxes with golden ribbon bows and specular highlights.
     - 3D Crystal Ruby Hearts with pulsing inner glow and curved glass reflections.
     - 3D Matte Dark Storm Clouds / Bombs with glowing spark fuses and playful labels (*"Overthinking 💭"*, *"Ngambek 😤"*, *"Bad Mood 🌧️"*, *"Kangen Berat 🥺"*).

2. **Game Feel ("Juice") & Hit Effects**
   - **The Stardust Blade Trail**: Tracks Index Finger Tip (MediaPipe Landmark 8) with smooth exponential low-pass filter + instant seamless Mouse/Touch fallback. Renders a glowing white core with a rose-gold bloom (`shadowBlur: 22`), emitting micro-sparkles and floating hearts on fast movement.
   - **True Object Slicing (Split-in-Half Physics)**: Sliced objects are dynamically clipped along the cutting angle $\theta$ and split into two halves that fly outward with rotational velocity and downward gravity!
   - **Impact Flash & Shockwave Ring**: Bright directional slash line flash across the cut line and expanding golden shockwave rings.
   - **Micro Hit-Stop**: 45ms physics timescale freeze (`timeScale = 0.15`) on slicing gift boxes or triggering a 3x+ combo.
   - **Fluttering Confetti & Floating Polaroids**: Balloons burst into 25+ metallic confetti rectangles and spawn spring-animated Floating Polaroid Memory Cards that hover and float upward.
   - **Infinite Love Revive**: If lives reach 0, an instant revive animation triggers refilling all hearts with the sweet message: *"Cinta kita nggak kenal Game Over ❤️"*.

3. **Built-In Procedural Web Audio Synthesizer**
   - **Dynamic Whoosh**: Velocity-modulated pink noise bandpass filter that matches blade speed in real-time.
   - **Balloon Pop + Pentatonic Chimes**: Percussive envelope pop followed by a shimmering 4-note harp arpeggio through an ethereal convolution reverb.
   - **Gift Box Bells**: Crystalline bell chord (`E5 - G#5 - B5 - E6`) with high-frequency sparkle shimmer.
   - **Combo Pitch Escalation**: Escalates consecutively along a Major Pentatonic scale (`C5, D5, E5, G5, A5, C6, D6, E6`).
   - **Bomb Drop & Slide**: Low sub-bass sine drop (`120Hz` down to `35Hz`) with a comical descending slide whistle.
   - **Procedural Ambient BGM**: Ethereal music-box chord progression loop (`Fmaj7 - G6 - Em7 - Am7`) that plays automatically without needing any external audio file!
   - **Custom Audio & Voice Note Support**: Easily drop your custom background music MP3 or your personal voice note recording into `loveConfig.js` with an animated dancing audio waveform visualizer!

4. **The Grand Finale: Giant Birthday Cake / Golden Gift Boss**
   - At 1,500 points (or after 60 seconds), normal items clear and a **Giant 3D Golden Birthday Gift & Tiered Cake** appears.
   - A prompt guides: *"Sabet 10x beruntun untuk membuka kejutan terakhir! ✨"*.
   - Slicing 10 times triggers slow-motion fireworks, confetti explosions, and opens the **Interactive Birthday Card & Polaroid Scrapbook Modal**:
     - Typewriter-animated romantic Indonesian birthday letter.
     - Interactive **"Pesan Suara dari Aku 🎙️"** button with animated audio waveform bars.
     - Polaroid memory scrapbook gallery with zoom lightbox preview.
     - **"Main Lagi Bersama 💖"** button to restart the game.

---

## 🚀 How to Run

The dev server is currently running on:
- Local: **`http://localhost:3000/`**

To restart or run in the future:
```bash
npm install
npm run dev
```

---

## 🎨 How to Customize for Your Boyfriend

Everything is centralized inside [`src/config/loveConfig.js`](file:///e:/game/src/config/loveConfig.js):

1. **Partner Name & Birthday Date**:
   ```javascript
   partnerName: "Sayangku Tersayang", // or his name / nickname
   birthdayMonth: "November",
   birthdayDate: "14 November",
   targetScore: 1500,
   ```

2. **Polaroid Photos & Memories**:
   Replace the placeholder Unsplash URLs in `memories` with photos of him and your favorite moments together (or drop photos into `public/assets/` and reference `/assets/your-photo.jpg`).

3. **Sweet Gift Slice Messages**:
   Customize the short romantic Indonesian phrases in `sweetMessages`.

4. **Birthday Letter**:
   Edit the title, greeting, paragraphs, and sign-off in the `letter` object.

5. **Custom Music & Voice Note**:
   In `audio`:
   - `customBgmUrl`: Put the path or URL to your special song (e.g. `"/assets/our-song.mp3"`). If left empty, the procedural music-box BGM plays automatically.
   - `voiceNoteUrl`: Put your recorded voice note MP3 (e.g. `"/assets/voice-note.mp3"`). When he clicks the voice button in the letter, it plays with dancing waveform visualization!
