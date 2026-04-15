# Tung Tung Talking -- Design Spec

**Date:** 2026-04-15
**Status:** Approved

## Overview

A Talking Tom-style web app featuring Tung Tung Tung Sahur (Italian brainrot meme character). The user talks into their mic, and the character repeats their voice with chaotic brainrot distortion effects. Includes a soundboard of iconic brainrot sounds. Pure toy -- zero state, zero progression, instant fun.

## Stack

- **Next.js 16** (App Router) + TypeScript + Tailwind CSS v4
- **Tone.js** for audio capture, effects chain, and playback
- **SVG animations** (inline SVG + CSS keyframes + JS-driven attributes) for character. Migration to Lottie possible in v2 for richer animations.
- Deployed on **Vercel**
- 100% client-side, zero backend

## Architecture

Single page app (`/`), no routing, no auth, no database.

### Component Tree

```
app/page.tsx
├── Character          -- SVG animated Tung Tung, driven by audio state
├── VoiceRecorder      -- Record button + Tone.js mic capture + distortion chain
├── PlaybackButton     -- Replay last distorted recording
└── Soundboard         -- Grid of brainrot sound buttons
```

### Layout (Compact -- everything visible, no scroll)

```
┌─────────────────────────────┐
│      TUNG TUNG TALKING      │  header (gradient orange→yellow)
├─────────────────────────────┤
│                             │
│    [Personnage SVG animé]   │  ~50% screen height
│     animations réactives    │  dark gradient background
│        tap = reaction       │  with subtle particles
│                             │
├─────────────────────────────┤
│  🎤 [RECORD]    ▶ [PLAY]   │  voice controls (centered)
├─────────────────────────────┤
│ [TUNG]  [BOMBARDIRO] [TRALA]│  soundboard grid 3x2
│ [LIRILI] [SKIBIDI]  [SAHUR] │  colored buttons
└─────────────────────────────┘
```

- **Mobile:** full viewport, 100dvh, no scroll
- **Desktop:** centered, max-width 420px, dark background with subtle brainrot particles around

## Audio Engine (Tone.js)

### Voice Recording & Playback Flow

```
Mic → Tone.UserMedia → Tone.Recorder (captures buffer)
                                ↓
                         Buffer recorded
                                ↓
         Tone.Player → PitchShift → Reverb → Destination
                                           + random brainrot sound layered at ~30% volume
```

### Effects Chain

1. **PitchShift**: random value between -12 and +12 semitones per playback (sometimes chipmunk, sometimes demon)
2. **Reverb**: decay random 1-4s, wet random 0.3-0.7
3. **Brainrot overlay**: a random sound from the soundboard bank plays simultaneously at ~30% volume

### Soundboard

Each button triggers a preloaded `Tone.Player` with a slight random pitch shift (+/- 2 semitones) so it never sounds exactly the same. Sounds are polyphonic -- users can spam buttons and they stack.

| Button | Sound |
|--------|-------|
| TUNG TUNG | "tung tung tung sahur" vocal |
| BOMBARDIRO | "bombardiro crocodilo" vocal |
| TRALALERO | "tralalero tralala" vocal |
| LIRILI LARILA | "lirili larila" vocal |
| BRR SKIBIDI | "brr skibidi dop dop" vocal |
| SAHUR | stick hit sfx |

Sound files: `.mp3` in `/public/sounds/`. These need to be sourced (recorded, found royalty-free, or generated).

## Character & Animations

### Visual Approach

SVG animated character (inline SVG with CSS keyframes + JS-driven attributes). Structure:

- `<g>` groups for: head, body, arms, stick, eyes (left/right), mouth
- Each animation state applies a CSS class that activates corresponding keyframes
- Mouth sync driven by JS: volume level from `Tone.Meter` maps to mouth open/close path attribute

### Animation States

| State | Trigger | Animation |
|-------|---------|-----------|
| **Idle** | Default | Gentle sway, eye blink loop, subtle bounce |
| **Listening** | During RECORD hold | Head tilted, wide eyes, slight vibration |
| **Speaking** | During distorted playback | Mouth open/close synced to volume, body shake, stick tapping |
| **Soundboard hit** | Soundboard button click | Punch reaction -- jump, wide eyes, startle |
| **Tap reaction** | Click on character | Random reaction: laugh, dodge, dab, spin |

### Audio-Visual Sync

- `Tone.Meter` connected to the effects chain output
- Volume level (0-1) drives mouth openness via `setAttribute` on SVG mouth path
- Above a threshold, body shake intensity scales proportionally

## Interactions & UX

### First Launch Flow

1. App opens → Tung Tung in **idle** state (bouncing, blinking)
2. User can immediately:
   - **Tap character** → random reaction animation + random sound
   - **Hold RECORD** → character enters **listening** state, audio captures
   - **Release RECORD** → instant processing, character enters **speaking** state, distorted voice plays with brainrot overlay
   - **Tap PLAY** → replays last distorted recording
   - **Tap soundboard button** → sound plays, character does punch reaction

### Microphone Permission

- First RECORD tap triggers browser mic permission dialog
- If denied → RECORD button greys out, soundboard + character tap remain functional
- No blocking modal or error -- graceful degradation

### Desktop Adaptation

- Same layout, centered with max-width 420px
- Dark background around the app frame with subtle floating particle effects

### Share

- Small share icon top-right corner
- Copies app URL to clipboard (no audio sharing in v1)

## File Structure

```
app/
├── page.tsx                 -- main page, composes all components
├── layout.tsx               -- root layout, metadata, fonts
├── globals.css              -- Tailwind imports, global styles
└── components/
    ├── Character.tsx         -- SVG character with animation states
    ├── VoiceRecorder.tsx     -- Record button + Tone.js audio chain
    ├── PlaybackButton.tsx    -- Play last recording
    ├── Soundboard.tsx        -- Sound button grid
    └── ShareButton.tsx       -- Copy link to clipboard
lib/
├── audio-engine.ts          -- Tone.js setup, effects chain, recorder
├── sounds.ts                -- Sound definitions and preloading
└── animations.ts            -- Animation state management
public/
└── sounds/
    ├── tung-tung.mp3
    ├── bombardiro.mp3
    ├── tralalero.mp3
    ├── lirili.mp3
    ├── skibidi.mp3
    └── sahur.mp3
```

## Out of Scope (v1)

- No user accounts or persistence
- No audio recording sharing/download
- No pet states or progression system
- No custom character skins
- No mobile native app (web only for now)
- No backend/API routes
