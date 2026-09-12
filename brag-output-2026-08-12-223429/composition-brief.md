# Hyperframes Composition Brief: PhonicsFlow

## Objective
Create a short, friendly "how to use it in 4 steps" launch/tour video for PhonicsFlow — an AI-powered phonics practice app.

## Output
- Composition directory: `brag-output-2026-08-12-223429/composition/`
- Rendered video: `brag-output-2026-08-12-223429/brag.mp4`
- Format: landscape — 1920x1080
- Duration: 21 seconds

## Source Material
- Project root: `/Users/sr/phonics-app/frontend`
- Primary files read: `app/page.tsx` (landing + student dashboard), `app/practice/page.tsx` (practice flow), `components/practice/ResultsDisplay.tsx` (accuracy result), `app/globals.css` (theme), `app/teacher/page.tsx` (teacher dashboard)
- Product name: **PhonicsFlow**
- Tagline / strongest claim: **"Stronger Sounds. Brighter Futures."**
- Key UI moments to recreate:
  - Practice sentence with **teal-pill focus words**
  - The large circular **teal mic / record button** with a pulse + simple waveform
  - The **accuracy donut ring counting up to 87%** with "Excellent work! 🎉"
  - The **Weak Sounds card** — /th/ · 7 errors, /r/ · 4 errors, /v/ · 2 errors — plus a 🔥 12-day streak
  - A small **teacher class row** of student cards
- Copy that must appear verbatim:
  - PhonicsFlow
  - Stronger Sounds. Brighter Futures.
  - 1 · Read aloud
  - 2 · Tap the mic
  - 3 · Instant feedback
  - 4 · Know what to fix
  - 87%
  - Excellent work! 🎉
  - /th/  /r/  /v/
  - Teachers see the whole class.
  - Get Started
  - one sound at a time

## Creative Direction
- Tone preset: app-store
- Creative direction: friendly classroom product tour — "how to use it in 4 steps"
- Interpretation: smooth feature-card reveals, numbered steps, confident holds, light consistent SFX per step, one warm success chime on the 87% reveal. No chaos, no strobing. Every step title holds long enough to read (~0.8s+ settled).
- Angle: A clean how-to that shows the whole loop — read → record → get scored → know exactly which sound to fix — using PhonicsFlow's real screens and teal-on-cream identity.
- Hook: "PhonicsFlow" wordmark on cream, tagline "Stronger Sounds. Brighter Futures." snapping in with a teal underline sweep, a mic glyph pulsing once.
- Outro / punchline: "Teachers see the whole class." → wordmark + "Get Started" CTA → "one sound at a time."
- Avoid:
  - Generic SaaS language ("streamline your workflow")
  - Abstract filler visuals / particle fields / equalizer bars
  - Any visual redesign that isn't PhonicsFlow's real teal-on-cream look

## Visual Identity
- Background: `#fdf8f0` (cream); cards are white glass (`rgba(255,255,255,0.75)`, `backdrop-filter: blur(12px)`, border `rgba(236,231,223,0.8)`, radius ~24px, soft shadow)
- Text: `#1f2937` primary, `#6b7280` secondary
- Accent: `#0d9488` (teal-600), deep `#0f766e`; success `#059669`; amber `#fbbf24`; rose `#e11d48`
- Display font: Outfit (700/800 for headings & big numbers) — use web-safe fallback if Outfit isn't embeddable in the renderer; keep the bold, geometric feel
- Body font: Inter (fallback system sans)
- Visual references from the project: teal donut accuracy ring, teal pill tags for focus words, 🔥 streak stat, colored dots on weak-sound rows, teal rounded CTA button

## Storyboard
Use the storyboard in `brag-output-2026-08-12-223429/brag-plan.md` as the creative contract.

Scene summary:
1. Hook / Wordmark — 3s — "PhonicsFlow" + "Stronger Sounds. Brighter Futures." with teal underline sweep + mic pulse
2. Step 1: Read aloud — 4s — practice sentence, two focus words highlight as teal pills one after the other
3. Step 2: Tap the mic — 3.5s — simulated tap on circular record button → pulse + concentric waveform
4. Step 3: Instant feedback — 4.5s — accuracy ring draws + counts 0→87%, "Excellent work! 🎉" lands (emotional peak)
5. Step 4: Know what to fix — 3.5s — Weak Sounds card, 3 chips (/th/ /r/ /v/) reveal one by one, 🔥 12 streak
6. Teachers + Outro — 2.5s — "Teachers see the whole class." + 3 student cards slide in → wordmark + "Get Started" + "one sound at a time"

## Audio
- Audio role: warm upbeat bed under a light, consistent per-step SFX layer
- Audio arc: bed fades in on the wordmark, carries four lightly-scored steps, lifts into the 87% reveal (single warm bell), settles into a gentle fade over the teacher view + CTA
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3`
- Music treatment: start at 0, volume ~0.32, 0.5s fade-in, ~1s fade-out at the end; let energy build into scene 4
- Music cue guidance: bundled preset for vol-1 — read `assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json` (or `.md`). Lock the 87% reveal (~9-10s into the video) to the nearest strong cue within ±0.15s. Snap the 3 weak-sound chips (scene 5) to consecutive beat-grid points within ±0.10s, but hold the full card after. Align the 4 step titles to nearby beats. Use only 1 strong-cue lock (the 87% reveal).
- Audio-reactive treatment: subtle; use music RMS/bass so the accuracy ring glow and the hero wordmark presence breathe. No waveform/equalizer visuals, no strobing.
- Audio-coupled moments:
  - Scene 1 — tagline landing (soft drop), music fade-in
  - Scene 2 — step title drop + tiny pop per focus pill
  - Scene 3 — a single crisp click exactly on the simulated mic tap
  - Scene 4 — count-up ticks (thinned) then one warm bell as it locks to 87%
  - Scene 5 — card-slide per weak-sound chip (accent first + last)
  - Scene 6 — soft card slides for the student row; let the music fade carry the close
- SFX selection guidance: match motion — `interface/drop_*` or `interface/click_*` for step titles, `ui/mouseclick1` / `interface/click_002` for the mic tap, `casino/chips-stack-*` (thinned) under the count-up, `impact/impactBell_heavy_000` for the 87% payoff, `casino/card-slide-*` for the weak-sound chips and student cards. All SFX 0.6-0.75 volume; only ONE bell in the whole video.
- SFX analysis guidance: read `~/.claude/plugins/cache/brag/brag/0.2.2/skills/brag/assets/sfx/sfx-analysis.md` (or the installed equivalent) and prefer low/medium high-frequency-risk files for the repeated step + card sounds.
- Exact SFX choice: Hyperframes chooses filenames, timestamps, density, and volume based on the implemented animation.
- Audio files: copy the chosen music and any selected SFX into `brag-output-2026-08-12-223429/composition/assets/`.

## Hyperframes Instructions
Load the composition-building Hyperframes domain skills — `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-cli`. This is the /brag workflow: do NOT enter the hyperframes entry-point intent interview or route into its generic promo / launch-video workflow. Prefer native Hyperframes conventions over anything in /brag.

Requirements:
- Show at least one real UI / copy element from PhonicsFlow (this brief lists several — the accuracy ring and weak-sounds card are the strongest).
- Keep all text readable in the final render (step titles hold ~0.8s+ settled; the tagline and "Excellent work!" get longer holds).
- Keep the video within 15-25 seconds (target 21s).
- Include the planned music + SFX layer.
- Treat audio notes as guidance; choose exact SFX after the animation exists.
- Beat metadata is optional timing bias: 1 strong-cue lock (the 87% reveal), weak-sound chips on consecutive beats, ignore any cue that hurts readability.
- Add a subtle audio-reactive treatment (ring glow / wordmark presence). If extraction is unavailable, document it and skip — do not block render.
- Use local assets only (relative paths from `composition/`). No absolute paths.
- Run `hyperframes check` before render — brag's single gate.
