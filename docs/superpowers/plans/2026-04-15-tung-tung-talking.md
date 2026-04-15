# Tung Tung Talking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Talking Tom-style brainrot web app where a Tung Tung Tung Sahur character repeats your voice with chaotic distortion and has a soundboard of Italian brainrot sounds.

**Architecture:** Single-page Next.js app, 100% client-side. Tone.js handles all audio (mic capture, pitch shift, reverb, playback). Inline SVG character animated with CSS keyframes and JS-driven mouth sync via Tone.Meter. No backend, no database, no auth.

**Tech Stack:** Next.js 16 (App Router), TypeScript, Tailwind CSS v4, Tone.js, inline SVG animations. Deployed on Vercel.

**Spec:** `docs/superpowers/specs/2026-04-15-tung-tung-talking-design.md`

---

## File Map

```
app/
├── page.tsx                  -- main page, composes all components, full-viewport layout
├── layout.tsx                -- root layout, metadata, fonts, viewport config
├── globals.css               -- Tailwind v4 imports, character animation keyframes, global styles
└── components/
    ├── Character.tsx          -- inline SVG Tung Tung with 5 animation states, mouth sync
    ├── VoiceRecorder.tsx      -- hold-to-record button, mic capture via audio-engine
    ├── PlaybackButton.tsx     -- replay last distorted recording
    ├── Soundboard.tsx         -- 3x2 grid of brainrot sound buttons
    └── ShareButton.tsx        -- copy URL to clipboard
lib/
├── audio-engine.ts           -- Tone.js singleton: mic, recorder, effects chain, meter, soundboard players
├── sounds.ts                 -- sound metadata (names, colors, file paths) and preload function
└── use-animation-state.ts    -- React hook managing character animation state machine
public/
└── sounds/
    ├── tung-tung.mp3
    ├── bombardiro.mp3
    ├── tralalero.mp3
    ├── lirili.mp3
    ├── skibidi.mp3
    └── sahur.mp3
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `tailwind.config.ts`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx`

- [ ] **Step 1: Scaffold Next.js project**

Run from the project root (`/Users/maximeblocquel/App brainroot`):

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --use-npm --yes
```

This creates the full Next.js scaffolding in the current directory.

- [ ] **Step 2: Install Tone.js**

```bash
npm install tone
```

- [ ] **Step 3: Configure layout.tsx for full-viewport app**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tung Tung Talking",
  description: "Brainrot Talking Tom - Tung Tung Tung Sahur",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0d0d1a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#0d0d1a] overflow-hidden">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Set up globals.css with Tailwind v4**

Replace `app/globals.css` with:

```css
@import "tailwindcss";

:root {
  --color-brainrot-orange: #ff6b35;
  --color-brainrot-yellow: #f7c948;
  --color-brainrot-dark: #0d0d1a;
  --color-brainrot-purple: #2d1b69;
}

html, body {
  height: 100dvh;
  overflow: hidden;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}
```

- [ ] **Step 5: Create minimal page.tsx placeholder**

Replace `app/page.tsx` with:

```tsx
export default function Home() {
  return (
    <main className="h-dvh flex flex-col items-center justify-center bg-[#0d0d1a] text-white">
      <h1 className="text-2xl font-black tracking-widest">TUNG TUNG TALKING</h1>
      <p className="text-sm text-gray-400 mt-2">Loading brainrot...</p>
    </main>
  );
}
```

- [ ] **Step 6: Verify dev server runs**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected: dark page with "TUNG TUNG TALKING" centered in white text.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: scaffold Next.js project with Tone.js"
```

---

## Task 2: Sound Assets & Sound Definitions

**Files:**
- Create: `public/sounds/tung-tung.mp3`, `public/sounds/bombardiro.mp3`, `public/sounds/tralalero.mp3`, `public/sounds/lirili.mp3`, `public/sounds/skibidi.mp3`, `public/sounds/sahur.mp3`
- Create: `lib/sounds.ts`

- [ ] **Step 1: Generate placeholder sound files**

We need 6 short MP3 files. Generate them with `say` (macOS TTS) + `ffmpeg` (or just `say` → `.aiff` → convert). If `ffmpeg` isn't installed, use the `.aiff` files directly renamed to `.mp3` isn't ideal — instead use `afconvert`:

```bash
mkdir -p public/sounds

say -o /tmp/tung-tung.aiff "tung tung tung sahur"
say -o /tmp/bombardiro.aiff "bombardiro crocodilo"
say -o /tmp/tralalero.aiff "tralalero tralala"
say -o /tmp/lirili.aiff "lirili larila"
say -o /tmp/skibidi.aiff "brr skibidi dop dop"
say -o /tmp/sahur.aiff "sahur"

for f in tung-tung bombardiro tralalero lirili skibidi sahur; do
  afconvert /tmp/$f.aiff -o public/sounds/$f.mp3 -f mp4f -d aac
done
```

These are placeholder TTS sounds. Replace with real brainrot audio clips later.

- [ ] **Step 2: Create lib/sounds.ts**

```ts
export interface SoundDef {
  id: string;
  label: string;
  sublabel: string;
  file: string;
  color: string;
}

export const SOUNDS: SoundDef[] = [
  { id: "tung-tung", label: "TUNG", sublabel: "TUNG", file: "/sounds/tung-tung.mp3", color: "#ff6b35" },
  { id: "bombardiro", label: "BOMBAR", sublabel: "DIRO", file: "/sounds/bombardiro.mp3", color: "#9b59b6" },
  { id: "tralalero", label: "TRALA", sublabel: "LERO", file: "/sounds/tralalero.mp3", color: "#2ecc71" },
  { id: "lirili", label: "LIRILI", sublabel: "LARILA", file: "/sounds/lirili.mp3", color: "#e74c3c" },
  { id: "skibidi", label: "BRR", sublabel: "SKIBIDI", file: "/sounds/skibidi.mp3", color: "#3498db" },
  { id: "sahur", label: "SAHUR", sublabel: "\u{1F4A5}", file: "/sounds/sahur.mp3", color: "#f39c12" },
];
```

- [ ] **Step 3: Commit**

```bash
git add lib/sounds.ts public/sounds/
git commit -m "feat: add sound definitions and placeholder audio files"
```

---

## Task 3: Audio Engine

**Files:**
- Create: `lib/audio-engine.ts`

This is the core module. It manages Tone.js: mic access, recording, effects chain, playback, soundboard players, and the meter for visual sync.

- [ ] **Step 1: Create lib/audio-engine.ts**

```ts
import * as Tone from "tone";
import { SOUNDS } from "./sounds";

let mic: Tone.UserMedia | null = null;
let recorder: Tone.Recorder | null = null;
let lastRecordingUrl: string | null = null;
let meter: Tone.Meter | null = null;
let soundboardPlayers: Map<string, Tone.Player> = new Map();
let isInitialized = false;

export type AudioEventCallback = (event: "speaking-start" | "speaking-end" | "listening-start" | "listening-end" | "soundboard-hit") => void;

let eventCallback: AudioEventCallback | null = null;

export function onAudioEvent(cb: AudioEventCallback) {
  eventCallback = cb;
}

function emit(event: Parameters<AudioEventCallback>[0]) {
  eventCallback?.(event);
}

export async function initAudio(): Promise<void> {
  if (isInitialized) return;
  await Tone.start();

  // Preload soundboard players
  for (const sound of SOUNDS) {
    const player = new Tone.Player(sound.file).toDestination();
    soundboardPlayers.set(sound.id, player);
  }

  // Meter for visual sync
  meter = new Tone.Meter();

  isInitialized = true;
}

export async function startRecording(): Promise<boolean> {
  try {
    await initAudio();
    mic = new Tone.UserMedia();
    await mic.open();
    recorder = new Tone.Recorder();
    mic.connect(recorder);
    recorder.start();
    emit("listening-start");
    return true;
  } catch {
    // Mic permission denied or not available
    return false;
  }
}

export async function stopRecording(): Promise<void> {
  if (!recorder || !mic) return;
  emit("listening-end");

  const blob = await recorder.stop();
  mic.close();
  mic.dispose();
  mic = null;
  recorder.dispose();
  recorder = null;

  // Revoke previous recording URL
  if (lastRecordingUrl) {
    URL.revokeObjectURL(lastRecordingUrl);
  }
  lastRecordingUrl = URL.createObjectURL(blob);

  // Play it back with effects
  await playDistorted(lastRecordingUrl);
}

export async function replayLast(): Promise<void> {
  if (!lastRecordingUrl) return;
  await playDistorted(lastRecordingUrl);
}

export function hasRecording(): boolean {
  return lastRecordingUrl !== null;
}

async function playDistorted(url: string): Promise<void> {
  await initAudio();
  emit("speaking-start");

  const pitch = Math.random() * 24 - 12; // -12 to +12 semitones
  const reverbDecay = 1 + Math.random() * 3; // 1-4s
  const reverbWet = 0.3 + Math.random() * 0.4; // 0.3-0.7

  const pitchShift = new Tone.PitchShift({ pitch });
  const reverb = new Tone.Reverb({ decay: reverbDecay, wet: reverbWet });
  await reverb.generate();

  pitchShift.connect(reverb);
  reverb.connect(meter!);
  meter!.connect(Tone.getDestination());

  const player = new Tone.Player(url);
  player.connect(pitchShift);

  player.onstop = () => {
    emit("speaking-end");
    player.dispose();
    pitchShift.dispose();
    reverb.dispose();
  };

  player.start();

  // Layer a random brainrot sound at ~30% volume
  const randomSound = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
  const overlay = soundboardPlayers.get(randomSound.id);
  if (overlay && overlay.loaded) {
    const overlayGain = new Tone.Gain(0.3).toDestination();
    const overlayPitch = new Tone.PitchShift({ pitch: Math.random() * 4 - 2 });
    // Create a fresh player for the overlay so we don't interfere with soundboard
    const overlayPlayer = new Tone.Player(randomSound.file);
    overlayPlayer.connect(overlayPitch);
    overlayPitch.connect(overlayGain);
    overlayPlayer.onstop = () => {
      overlayPlayer.dispose();
      overlayPitch.dispose();
      overlayGain.dispose();
    };
    // Small delay before overlay
    setTimeout(() => overlayPlayer.start(), 200 + Math.random() * 300);
  }
}

export function playSoundboard(soundId: string): void {
  if (!isInitialized) return;
  emit("soundboard-hit");

  const sound = SOUNDS.find((s) => s.id === soundId);
  if (!sound) return;

  // Fresh player each time for polyphony + slight pitch variation
  const pitchShift = new Tone.PitchShift({ pitch: Math.random() * 4 - 2 });
  pitchShift.toDestination();

  const player = new Tone.Player(sound.file);
  player.connect(pitchShift);
  player.onstop = () => {
    player.dispose();
    pitchShift.dispose();
  };
  player.start();
}

export function getMeterLevel(): number {
  if (!meter) return 0;
  const val = meter.getValue();
  const db = typeof val === "number" ? val : val[0];
  // Convert dB to 0-1 range. -60dB = silence, 0dB = max
  return Math.max(0, Math.min(1, (db + 60) / 60));
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: no errors (or only unrelated Next.js template warnings).

- [ ] **Step 3: Commit**

```bash
git add lib/audio-engine.ts
git commit -m "feat: add Tone.js audio engine with recording, effects, and soundboard"
```

---

## Task 4: Animation State Hook

**Files:**
- Create: `lib/use-animation-state.ts`

- [ ] **Step 1: Create lib/use-animation-state.ts**

```ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { onAudioEvent, getMeterLevel } from "./audio-engine";

export type AnimationState = "idle" | "listening" | "speaking" | "soundboard-hit" | "tap-reaction";

const TAP_REACTIONS = ["dab", "spin", "dodge", "laugh"] as const;
export type TapReaction = (typeof TAP_REACTIONS)[number];

export function useAnimationState() {
  const [state, setState] = useState<AnimationState>("idle");
  const [mouthOpen, setMouthOpen] = useState(0);
  const [tapReaction, setTapReaction] = useState<TapReaction>("dab");
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Listen to audio engine events
  useEffect(() => {
    onAudioEvent((event) => {
      switch (event) {
        case "listening-start":
          setState("listening");
          break;
        case "listening-end":
          setState("idle");
          break;
        case "speaking-start":
          setState("speaking");
          break;
        case "speaking-end":
          setState("idle");
          break;
        case "soundboard-hit":
          setState("soundboard-hit");
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => setState("idle"), 500);
          break;
      }
    });

    return () => {
      onAudioEvent(() => {});
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  // Poll meter level during speaking state for mouth sync
  useEffect(() => {
    if (state !== "speaking") {
      setMouthOpen(0);
      return;
    }

    function tick() {
      setMouthOpen(getMeterLevel());
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [state]);

  const handleTap = useCallback(() => {
    const reaction = TAP_REACTIONS[Math.floor(Math.random() * TAP_REACTIONS.length)];
    setTapReaction(reaction);
    setState("tap-reaction");
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setState("idle"), 800);
  }, []);

  return { state, mouthOpen, tapReaction, handleTap };
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add lib/use-animation-state.ts
git commit -m "feat: add animation state hook with audio event sync"
```

---

## Task 5: SVG Character Component

**Files:**
- Create: `app/components/Character.tsx`
- Modify: `app/globals.css` (add animation keyframes)

- [ ] **Step 1: Add character animation keyframes to globals.css**

Append to `app/globals.css`:

```css
/* Character animations */
@keyframes idle-sway {
  0%, 100% { transform: rotate(-1deg); }
  50% { transform: rotate(1deg); }
}

@keyframes idle-bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-4px); }
}

@keyframes blink {
  0%, 90%, 100% { transform: scaleY(1); }
  95% { transform: scaleY(0.1); }
}

@keyframes listening-tilt {
  0%, 100% { transform: rotate(-5deg); }
  50% { transform: rotate(5deg); }
}

@keyframes listening-vibrate {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-1px); }
  75% { transform: translateX(1px); }
}

@keyframes speaking-shake {
  0%, 100% { transform: translateX(0) rotate(0); }
  20% { transform: translateX(-3px) rotate(-2deg); }
  40% { transform: translateX(3px) rotate(2deg); }
  60% { transform: translateX(-2px) rotate(-1deg); }
  80% { transform: translateX(2px) rotate(1deg); }
}

@keyframes stick-tap {
  0%, 100% { transform: rotate(-30deg); }
  50% { transform: rotate(-10deg); }
}

@keyframes hit-jump {
  0%, 100% { transform: translateY(0) scale(1); }
  30% { transform: translateY(-20px) scale(1.1); }
  60% { transform: translateY(-5px) scale(1.02); }
}

@keyframes reaction-dab {
  0%, 100% { transform: rotate(0) translateX(0); }
  50% { transform: rotate(-15deg) translateX(-5px); }
}

@keyframes reaction-spin {
  0% { transform: rotate(0); }
  100% { transform: rotate(360deg); }
}

@keyframes reaction-dodge {
  0%, 100% { transform: translateX(0); }
  30% { transform: translateX(-20px); }
  70% { transform: translateX(10px); }
}

@keyframes reaction-laugh {
  0%, 100% { transform: scaleY(1); }
  25% { transform: scaleY(0.95); }
  50% { transform: scaleY(1.05); }
  75% { transform: scaleY(0.97); }
}
```

- [ ] **Step 2: Create app/components/Character.tsx**

```tsx
"use client";

import { AnimationState, TapReaction } from "@/lib/use-animation-state";

interface CharacterProps {
  state: AnimationState;
  mouthOpen: number;
  tapReaction: TapReaction;
  onTap: () => void;
}

export function Character({ state, mouthOpen, tapReaction, onTap }: CharacterProps) {
  const bodyStyle = getBodyStyle(state, tapReaction);
  const eyeScale = state === "listening" || state === "soundboard-hit" ? 1.3 : 1;
  // Mouth: interpolate between closed (2px tall ellipse) and open (14px tall ellipse)
  const mouthRy = state === "speaking" ? 2 + mouthOpen * 12 : 2;

  return (
    <div
      className="flex-1 flex items-center justify-center cursor-pointer select-none"
      onClick={onTap}
    >
      <svg
        viewBox="0 0 200 320"
        className="h-full max-h-[50dvh] w-auto"
        style={bodyStyle}
      >
        {/* Body (trunk/torso) */}
        <g>
          {/* Main body - wooden stick figure */}
          <rect x="95" y="160" width="10" height="80" rx="5" fill="#b8834a" />

          {/* Head */}
          <g
            style={{
              animation:
                state === "listening"
                  ? "listening-tilt 0.6s ease-in-out infinite"
                  : state === "idle"
                    ? "idle-sway 3s ease-in-out infinite"
                    : undefined,
              transformOrigin: "100px 80px",
            }}
          >
            <ellipse cx="100" cy="80" rx="42" ry="52" fill="#d4a574" />
            {/* Left eye */}
            <g
              style={{
                animation: state === "idle" ? "blink 4s ease-in-out infinite" : undefined,
                transformOrigin: "82px 70px",
                transform: `scale(${eyeScale})`,
                transition: "transform 0.15s",
              }}
            >
              <circle cx="82" cy="70" r="10" fill="white" />
              <circle cx="84" cy="70" r="5" fill="#222" />
            </g>
            {/* Right eye */}
            <g
              style={{
                animation: state === "idle" ? "blink 4s ease-in-out infinite 0.1s" : undefined,
                transformOrigin: "118px 70px",
                transform: `scale(${eyeScale})`,
                transition: "transform 0.15s",
              }}
            >
              <circle cx="118" cy="70" r="10" fill="white" />
              <circle cx="120" cy="70" r="5" fill="#222" />
            </g>
            {/* Mouth */}
            <ellipse
              cx="100"
              cy="105"
              rx="12"
              ry={mouthRy}
              fill="#8b4513"
              style={{ transition: "ry 0.05s" }}
            />
          </g>

          {/* Left arm */}
          <line x1="95" y1="175" x2="60" y2="210" stroke="#b8834a" strokeWidth="6" strokeLinecap="round" />

          {/* Right arm + stick */}
          <g
            style={{
              animation: state === "speaking" ? "stick-tap 0.3s ease-in-out infinite" : undefined,
              transformOrigin: "105px 175px",
            }}
          >
            <line x1="105" y1="175" x2="140" y2="210" stroke="#b8834a" strokeWidth="6" strokeLinecap="round" />
            {/* Stick */}
            <line
              x1="135"
              y1="205"
              x2="175"
              y2="265"
              stroke="#8b6914"
              strokeWidth="5"
              strokeLinecap="round"
            />
          </g>

          {/* Left leg */}
          <line x1="97" y1="240" x2="80" y2="290" stroke="#b8834a" strokeWidth="6" strokeLinecap="round" />
          {/* Right leg */}
          <line x1="103" y1="240" x2="120" y2="290" stroke="#b8834a" strokeWidth="6" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

function getBodyStyle(state: AnimationState, tapReaction: TapReaction): React.CSSProperties {
  switch (state) {
    case "idle":
      return { animation: "idle-bounce 2s ease-in-out infinite" };
    case "listening":
      return { animation: "listening-vibrate 0.15s linear infinite" };
    case "speaking":
      return { animation: "speaking-shake 0.2s ease-in-out infinite" };
    case "soundboard-hit":
      return { animation: "hit-jump 0.5s ease-out" };
    case "tap-reaction":
      switch (tapReaction) {
        case "dab":
          return { animation: "reaction-dab 0.8s ease-in-out" };
        case "spin":
          return { animation: "reaction-spin 0.8s ease-in-out" };
        case "dodge":
          return { animation: "reaction-dodge 0.8s ease-in-out" };
        case "laugh":
          return { animation: "reaction-laugh 0.5s ease-in-out infinite" };
      }
    default:
      return {};
  }
}
```

- [ ] **Step 3: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add app/components/Character.tsx app/globals.css
git commit -m "feat: add SVG character with animation states and mouth sync"
```

---

## Task 6: Soundboard Component

**Files:**
- Create: `app/components/Soundboard.tsx`

- [ ] **Step 1: Create app/components/Soundboard.tsx**

```tsx
"use client";

import { SOUNDS } from "@/lib/sounds";
import { playSoundboard, initAudio } from "@/lib/audio-engine";

export function Soundboard() {
  async function handlePress(soundId: string) {
    await initAudio();
    playSoundboard(soundId);
  }

  return (
    <div className="grid grid-cols-3 gap-1.5 p-2">
      {SOUNDS.map((sound) => (
        <button
          key={sound.id}
          onClick={() => handlePress(sound.id)}
          className="rounded-xl py-2 px-1 text-white font-bold text-[11px] leading-tight text-center active:scale-95 transition-transform"
          style={{ backgroundColor: sound.color }}
        >
          {sound.label}
          <br />
          {sound.sublabel}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/components/Soundboard.tsx
git commit -m "feat: add soundboard component with 6 brainrot sounds"
```

---

## Task 7: Voice Recorder Component

**Files:**
- Create: `app/components/VoiceRecorder.tsx`

- [ ] **Step 1: Create app/components/VoiceRecorder.tsx**

```tsx
"use client";

import { useState, useCallback, useRef } from "react";
import { startRecording, stopRecording, initAudio } from "@/lib/audio-engine";

export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const recordingRef = useRef(false);

  const handleStart = useCallback(async () => {
    if (micDenied) return;
    await initAudio();
    const success = await startRecording();
    if (!success) {
      setMicDenied(true);
      return;
    }
    recordingRef.current = true;
    setIsRecording(true);
  }, [micDenied]);

  const handleEnd = useCallback(async () => {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    setIsRecording(false);
    await stopRecording();
  }, []);

  return (
    <button
      onPointerDown={handleStart}
      onPointerUp={handleEnd}
      onPointerLeave={handleEnd}
      disabled={micDenied}
      className={`
        rounded-full py-2.5 px-6 font-bold text-sm flex items-center gap-2 transition-all
        ${micDenied
          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
          : isRecording
            ? "bg-red-600 text-white scale-110 shadow-lg shadow-red-500/50"
            : "bg-red-500 text-white active:scale-95"
        }
      `}
    >
      <span>{isRecording ? "🔴" : "🎤"}</span>
      {micDenied ? "MIC OFF" : isRecording ? "RECORDING..." : "RECORD"}
    </button>
  );
}
```

- [ ] **Step 2: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add app/components/VoiceRecorder.tsx
git commit -m "feat: add hold-to-record voice recorder component"
```

---

## Task 8: Playback Button Component

**Files:**
- Create: `app/components/PlaybackButton.tsx`

- [ ] **Step 1: Create app/components/PlaybackButton.tsx**

```tsx
"use client";

import { useState, useEffect } from "react";
import { replayLast, hasRecording, onAudioEvent } from "@/lib/audio-engine";

export function PlaybackButton() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    // Check after each speaking-end event (a recording was made)
    const prevCallback = onAudioEvent;
    onAudioEvent((event) => {
      if (event === "speaking-end") {
        setAvailable(hasRecording());
      }
    });
  }, []);

  return (
    <button
      onClick={() => replayLast()}
      disabled={!available}
      className={`
        rounded-full py-2.5 px-6 font-bold text-sm flex items-center gap-2 transition-all
        ${available
          ? "bg-gray-700 text-white active:scale-95"
          : "bg-gray-800 text-gray-600 cursor-not-allowed"
        }
      `}
    >
      <span>▶</span>
      PLAY
    </button>
  );
}
```

Wait — there's a problem with this approach. The `onAudioEvent` function only supports a single callback, and the animation state hook already uses it. Let me fix the audio-engine to support multiple listeners before writing this component.

- [ ] **Step 1 (revised): Update lib/audio-engine.ts to support multiple event listeners**

Replace the event callback section at the top of `lib/audio-engine.ts`. Find these lines:

```ts
let eventCallback: AudioEventCallback | null = null;

export function onAudioEvent(cb: AudioEventCallback) {
  eventCallback = cb;
}

function emit(event: Parameters<AudioEventCallback>[0]) {
  eventCallback?.(event);
}
```

Replace with:

```ts
const eventCallbacks = new Set<AudioEventCallback>();

export function onAudioEvent(cb: AudioEventCallback): () => void {
  eventCallbacks.add(cb);
  return () => { eventCallbacks.delete(cb); };
}

function emit(event: Parameters<AudioEventCallback>[0]) {
  eventCallbacks.forEach((cb) => cb(event));
}
```

- [ ] **Step 2: Update lib/use-animation-state.ts cleanup**

In `lib/use-animation-state.ts`, update the `useEffect` that calls `onAudioEvent`. Replace:

```ts
    return () => {
      onAudioEvent(() => {});
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);
    };
```

With:

```ts
    return () => {
      unsubscribe();
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);
    };
```

And change the `onAudioEvent` call to capture the unsubscribe function:

```ts
    const unsubscribe = onAudioEvent((event) => {
```

- [ ] **Step 3: Create app/components/PlaybackButton.tsx**

```tsx
"use client";

import { useState, useEffect } from "react";
import { replayLast, hasRecording, onAudioEvent } from "@/lib/audio-engine";

export function PlaybackButton() {
  const [available, setAvailable] = useState(false);

  useEffect(() => {
    const unsubscribe = onAudioEvent((event) => {
      if (event === "speaking-end") {
        setAvailable(hasRecording());
      }
    });
    return unsubscribe;
  }, []);

  return (
    <button
      onClick={() => replayLast()}
      disabled={!available}
      className={`
        rounded-full py-2.5 px-6 font-bold text-sm flex items-center gap-2 transition-all
        ${available
          ? "bg-gray-700 text-white active:scale-95"
          : "bg-gray-800 text-gray-600 cursor-not-allowed"
        }
      `}
    >
      <span>▶</span>
      PLAY
    </button>
  );
}
```

- [ ] **Step 4: Verify it compiles**

```bash
npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add lib/audio-engine.ts lib/use-animation-state.ts app/components/PlaybackButton.tsx
git commit -m "feat: add playback button, refactor audio events to multi-listener"
```

---

## Task 9: Share Button Component

**Files:**
- Create: `app/components/ShareButton.tsx`

- [ ] **Step 1: Create app/components/ShareButton.tsx**

```tsx
"use client";

import { useState } from "react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Tung Tung Talking",
          text: "Check out this brainrot Talking Tom!",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled share dialog
    }
  }

  return (
    <button
      onClick={handleShare}
      className="absolute top-3 right-3 z-10 bg-white/10 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all text-sm"
      aria-label="Share"
    >
      {copied ? "✓" : "↗"}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/components/ShareButton.tsx
git commit -m "feat: add share button with native share API fallback"
```

---

## Task 10: Main Page Composition

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Compose all components in app/page.tsx**

Replace `app/page.tsx` with:

```tsx
"use client";

import { Character } from "./components/Character";
import { VoiceRecorder } from "./components/VoiceRecorder";
import { PlaybackButton } from "./components/PlaybackButton";
import { Soundboard } from "./components/Soundboard";
import { ShareButton } from "./components/ShareButton";
import { useAnimationState } from "@/lib/use-animation-state";
import { playSoundboard, initAudio } from "@/lib/audio-engine";
import { SOUNDS } from "@/lib/sounds";

export default function Home() {
  const { state, mouthOpen, tapReaction, handleTap } = useAnimationState();

  function handleCharacterTap() {
    handleTap();
    // Play a random sound on tap
    initAudio().then(() => {
      const randomSound = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
      playSoundboard(randomSound.id);
    });
  }

  return (
    <main className="h-dvh max-w-[420px] mx-auto flex flex-col bg-[#0d0d1a] relative overflow-hidden">
      {/* Share button */}
      <ShareButton />

      {/* Header */}
      <header className="bg-gradient-to-r from-[#ff6b35] to-[#f7c948] py-2.5 text-center shrink-0">
        <h1 className="text-lg font-black tracking-[0.2em] text-[#1a1a2e]">
          TUNG TUNG TALKING
        </h1>
      </header>

      {/* Character zone */}
      <div className="flex-1 bg-gradient-to-b from-[#1a1a2e] to-[#2d1b69] relative min-h-0">
        {/* Subtle particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[15%] text-xl opacity-20 animate-pulse">✦</div>
          <div className="absolute top-[30%] left-[10%] text-sm opacity-15 animate-pulse" style={{ animationDelay: "1s" }}>✦</div>
          <div className="absolute bottom-[20%] right-[25%] text-lg opacity-10 animate-pulse" style={{ animationDelay: "2s" }}>✦</div>
        </div>

        <Character
          state={state}
          mouthOpen={mouthOpen}
          tapReaction={tapReaction}
          onTap={handleCharacterTap}
        />
      </div>

      {/* Voice controls */}
      <div className="flex items-center justify-center gap-3 py-3 bg-[#1a1a2e] shrink-0">
        <VoiceRecorder />
        <PlaybackButton />
      </div>

      {/* Soundboard */}
      <div className="bg-[#111] shrink-0">
        <Soundboard />
      </div>
    </main>
  );
}
```

- [ ] **Step 2: Start dev server and verify in browser**

```bash
npm run dev
```

Open `http://localhost:3000`. Expected:
- Dark page with orange→yellow gradient header "TUNG TUNG TALKING"
- Wooden stick figure character in center with idle bounce animation
- RECORD and PLAY buttons in the middle
- 6 colorful soundboard buttons at the bottom in a 3x2 grid
- Share button top-right
- Full viewport height, no scroll

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: compose main page with all components"
```

---

## Task 11: End-to-End Manual Testing & Polish

**Files:**
- Possibly modify: any file that needs fixes

- [ ] **Step 1: Test soundboard**

Click each of the 6 soundboard buttons. Expected:
- Sound plays on each click
- Character does a jump/startle reaction on each click
- Spamming buttons stacks sounds (polyphony)
- Slight pitch variation on each play

- [ ] **Step 2: Test voice recording**

Click and hold RECORD. Speak. Release. Expected:
- Browser asks for mic permission on first press
- Character tilts/vibrates during recording
- On release, your voice plays back distorted (pitch shifted + reverb)
- Character shakes and mouth moves during playback
- A brainrot sound plays faintly layered on top

- [ ] **Step 3: Test playback**

After recording, click PLAY. Expected:
- Last recording replays with fresh random effects (different pitch/reverb each time)
- PLAY button is greyed out before first recording

- [ ] **Step 4: Test character tap**

Click on the character (not during recording). Expected:
- Random reaction animation (dab, spin, dodge, or laugh)
- A random sound plays

- [ ] **Step 5: Test share button**

Click share icon (top-right). Expected:
- On mobile: native share sheet opens
- On desktop: URL copied to clipboard, icon briefly shows "✓"

- [ ] **Step 6: Test mic denial**

Revoke mic permission in browser settings, reload, try RECORD. Expected:
- RECORD button greys out and shows "MIC OFF"
- Soundboard and character tap still work

- [ ] **Step 7: Fix any issues found, commit**

```bash
git add -A
git commit -m "fix: polish from end-to-end testing"
```

---

## Task 12: Build & Deploy Check

- [ ] **Step 1: Run production build**

```bash
npm run build
```

Expected: build succeeds with no errors.

- [ ] **Step 2: Test production build locally**

```bash
npm start
```

Open `http://localhost:3000`. Verify the same behavior as dev mode.

- [ ] **Step 3: Final commit if any build fixes were needed**

```bash
git add -A
git commit -m "fix: production build fixes"
```

- [ ] **Step 4: Deploy to Vercel (optional)**

```bash
npx vercel --yes
```

Or connect the repo to Vercel dashboard for automatic deploys.
