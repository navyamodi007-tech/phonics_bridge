# Brag Plan: PhonicsFlow

## What is this app?
PhonicsFlow is an AI-powered phonics practice app where students read sentences aloud, get instant pronunciation feedback (an accuracy score + the exact sounds they missed), track progress over time, and let teachers monitor the whole class.

## The angle
A clean, friendly "how to use it in 4 steps" product tour. This is a *how-to* video, not a joke — the payoff is showing how simple the loop is: **read → record → get scored → know exactly which sound to fix.** It's specific to PhonicsFlow because it uses the app's real screens and real content: the "Stronger Sounds. Brighter Futures." wordmark, the teal-on-cream UI, the 87% accuracy ring, the weak-sounds card (/th/ /r/ /v/), the 🔥 12-day streak, and the teacher class view.

## Hook (first 2-3 seconds)
The wordmark **"PhonicsFlow"** on warm cream, with the tagline snapping in beneath — **"Stronger Sounds. Brighter Futures."** — teal underline sweeping across. A small mic glyph pulses once. It reads instantly as: this is a reading app, and it's polished.

## Key moments (the middle)
- **Step 1 — Read aloud:** a real practice sentence with two focus words highlighted in teal pills.
- **Step 2 — Tap the mic:** the big circular record button pulses; a simple waveform ripples out (simulated recording).
- **Step 3 — Instant feedback:** the accuracy ring counts up 0 → **87%**, "Excellent work! 🎉" lands. This is the money shot.
- **Step 4 — Target weak sounds:** the Weak Sounds card reveals /th/ · /r/ · /v/ one by one, with the 🔥 12-day streak beside it.

## Outro / punchline
Quick cut to the teacher line — **"Teachers see the whole class."** — a mini row of student cards. Then back to the wordmark with the CTA **"Get Started"**. Final line: *one sound at a time.*

## User flow worth showing
The core practice loop (this is the centerpiece):
1. **Entry:** open a practice sentence with highlighted focus words.
2. **Key action:** tap the mic and read it aloud (record).
3. **Result:** accuracy score + the specific weak sounds to work on.
Teacher monitoring is the bonus frame at the end, not the centerpiece.

## Tone
- Preset: app-store
- Creative direction: friendly classroom product tour — "how to use it in 4 steps"
- Interpretation: smooth feature-card reveals, numbered steps, confident holds, no chaos; each step gets a clean slide-in and enough hold time to read, light consistent SFX per step, one warm success chime at 87%.

## Format: landscape — 1920x1080
## Duration: 21s

## Visual identity (from the project)
- Background: `#fdf8f0` (cream) — with subtle white glass cards
- Accent: `#0d9488` (teal-600); deep `#0f766e`; success `#059669`; warm `#fbbf24` amber; alert `#e11d48` rose
- Text: `#1f2937` primary, `#6b7280` secondary
- Display font: Outfit (700/800 for headings, numbers)
- Body font: Inter
- Strongest visual element: the accuracy donut ring counting to 87% + the Weak Sounds card, both on cream glass cards

## Share copy (draft)
Meet PhonicsFlow 🔊 — read a sentence aloud, tap record, and get an instant accuracy score plus the exact sounds to fix. Stronger sounds, one at a time. 🎯

## Audio direction
- Role: warm upbeat bed under a light, consistent per-step SFX layer
- Music: `happy-beats-business-moves-vol-1-by-ende-dot-app.mp3` (upbeat, clean — ideal for app-store)
- Music treatment: start at 0, volume ~0.32, gentle fade-in over first 0.5s, soft fade-out in the last 1s; let energy lift into the 87% reveal
- Music cue guidance: bundled preset available for vol-1 — read `assets/music/cues/happy-beats-business-moves-vol-1-by-ende-dot-app.music-cues.json`; target 1 strong cue near the 87% reveal (~9-10s), align the 4 step titles to nearby beats, align the 3 weak-sound chips to a beat-grid window but hold the full set afterward.
- Audio-reactive treatment: subtle; use music RMS/bass to let the accuracy ring and hero wordmark presence breathe. No waveform/equalizer visuals.
- SFX posture: light and consistent — a soft drop/click as each step title slides in; a mic tap when the record button is pressed; a warm bell on the 87% reveal; soft card slides for the weak-sound chips.
- Audio-coupled moments: numbered step titles sliding in, the mic tap, the count-up to 87%, the three weak-sound chips arriving one by one.
- Restraint rule: no aggressive/chaotic hits, no strobing, nothing that competes with reading the step titles; at most one success bell in the whole video.

## Storyboard

### Scene 1 — Hook / Wordmark — 3s
Cream background. "PhonicsFlow" scales in bold (Outfit 800, teal). Tagline "Stronger Sounds. Brighter Futures." snaps in beneath at ~0.7s with a teal underline sweeping L→R. A small mic glyph pulses once. Hold the full lockup ~1.2s so it reads.
Sequential/interaction: none
Audio intent: warm, inviting lift-in; establish the brand
Audio-coupled idea: soft `interface/drop_001` as the tagline lands; music fades in from 0
Music: upbeat bed, low, rising
Transition mood: smooth wipe → Scene 2

### Scene 2 — Step 1: Read aloud — 4s
Card title "1 · Read aloud" slides in top-left. A glass card shows a real practice sentence with two focus words as teal pills (e.g. "The **thirsty** rabbit ran through the **thick** grass."). Focus pills pop slightly after the sentence settles. Hold ~1.5s.
Sequential/interaction: yes — sentence appears, then the 2 focus pills highlight one after the other
Audio intent: clean, instructional
Audio-coupled idea: soft `interface/drop_002` on the step title; tiny pop as each focus pill highlights
Music: steady bed
Transition mood: slide → Scene 3

### Scene 3 — Step 2: Tap to record — 3.5s
Title "2 · Tap the mic" slides in. Center: the large circular teal record button (mic icon). A cursor/tap ripple hits it; the button pulses and a simple concentric waveform ripples outward (simulated recording). Hold ~1.2s.
Sequential/interaction: yes — simulate a tap on the mic button, then the pulse/waveform
Audio intent: satisfying single tap, then a soft record hum
Audio-coupled idea: `ui/mouseclick1` or `interface/click_002` exactly on the tap; subtle rise as the waveform expands
Music: steady bed
Transition mood: smooth wipe → Scene 4

### Scene 4 — Step 3: Instant feedback (the money shot) — 4.5s
Title "3 · Instant feedback" slides in. The accuracy donut ring draws around and the number counts up 0 → **87%** (Outfit 800, teal). "Excellent work! 🎉" fades up beneath at the moment it hits 87%. Ring gets a subtle glow. Hold ~1.8s — this is the emotional peak.
Sequential/interaction: yes — ring draws + number counts up, then the "Excellent work!" label lands on completion
Audio intent: build then a warm, rewarding payoff
Audio-coupled idea: `casino/chips-stack-*` ticks under the count-up (thinned), then `impact/impactBell_heavy_000` right as it locks to 87%
Music: energy lifts into this beat (align to a strong cue ~9-10s)
Transition mood: soft crossfade → Scene 5

### Scene 5 — Step 4: Target weak sounds — 3.5s
Title "4 · Know what to fix" slides in. Weak Sounds glass card: three chips reveal one by one — **/th/ · 7 errors** (rose), **/r/ · 4 errors** (amber), **/v/ · 2 errors** (green). To the right, a small 🔥 **12** day-streak stat. Hold the full set ~1.2s.
Sequential/interaction: yes — 3 weak-sound chips arrive one by one on a beat-grid window, then hold the full card
Audio intent: crisp, itemized, "here's your plan"
Audio-coupled idea: `casino/card-slide-*` (or `interface/drop_*`) per chip; accent first and last
Music: steady bed
Transition mood: slide → Scene 6

### Scene 6 — Teachers + Outro — 2.5s
Quick beat: "Teachers see the whole class." with a mini row of 3 student cards sliding in. Then it resolves to the "PhonicsFlow" wordmark + a teal "Get Started" pill CTA, tagline echo "one sound at a time." Music fades out over the last ~1s.
Sequential/interaction: yes — 3 student cards slide in quickly, then resolve to wordmark + CTA
Audio intent: confident close, gentle settle
Audio-coupled idea: soft card slides for the student row; no big hit — let the music fade carry it
Music: final fade-out
Transition mood: soft crossfade → end

**Music mood for this video:** upbeat
**Audio summary:** A warm upbeat bed rises from the wordmark, carries four lightly-scored how-to steps, peaks with a single rewarding bell as the accuracy ring locks to 87%, then settles into a gentle fade over the teacher view and CTA.
