import * as Tone from "tone";
import { SOUNDS } from "./sounds";

let mic: Tone.UserMedia | null = null;
let recorder: Tone.Recorder | null = null;
let lastRecordingUrl: string | null = null;
let meter: Tone.Meter | null = null;
const soundboardPlayers: Map<string, Tone.Player> = new Map();
let contextStarted = false;
let soundsLoaded = false;

export type AudioEventCallback = (event: "speaking-start" | "speaking-end" | "listening-start" | "listening-end" | "soundboard-hit") => void;

const eventCallbacks = new Set<AudioEventCallback>();

export function onAudioEvent(cb: AudioEventCallback): () => void {
  eventCallbacks.add(cb);
  return () => { eventCallbacks.delete(cb); };
}

function emit(event: Parameters<AudioEventCallback>[0]) {
  eventCallbacks.forEach((cb) => cb(event));
}

// Must be called from a user gesture (click/tap). Starts the audio context.
export async function initAudio(): Promise<void> {
  if (!contextStarted) {
    await Tone.start();
    contextStarted = true;
    meter = new Tone.Meter();
    // Start loading sounds in the background (don't await)
    loadSounds();
  }
}

async function loadSounds(): Promise<void> {
  if (soundsLoaded) return;

  const loadPromises = SOUNDS.map((sound) => {
    return new Promise<void>((resolve) => {
      const player = new Tone.Player({
        url: sound.file,
        onload: () => resolve(),
      }).toDestination();
      soundboardPlayers.set(sound.id, player);
    });
  });

  await Promise.all(loadPromises);
  soundsLoaded = true;
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
  } catch (e) {
    console.error("startRecording failed:", e);
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

  if (lastRecordingUrl) {
    URL.revokeObjectURL(lastRecordingUrl);
  }
  lastRecordingUrl = URL.createObjectURL(blob);

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

  const pitch = Math.random() * 24 - 12;
  const reverbDecay = 0.5 + Math.random() * 1.5;
  const reverbWet = 0.15 + Math.random() * 0.25;

  const pitchShift = new Tone.PitchShift({ pitch });
  const reverb = new Tone.Reverb({ decay: reverbDecay, wet: reverbWet });
  await reverb.generate();

  pitchShift.connect(reverb);
  reverb.connect(meter!);
  meter!.connect(Tone.getDestination());

  // Wait for this specific buffer to load
  const player = await new Promise<Tone.Player>((resolve) => {
    const p = new Tone.Player({
      url,
      onload: () => resolve(p),
    });
    p.connect(pitchShift);
  });

  player.onstop = () => {
    emit("speaking-end");
    player.dispose();
    pitchShift.dispose();
    reverb.dispose();
  };

  player.start();

  // Layer a random brainrot sound at ~30% volume
  if (soundsLoaded) {
    const randomSound = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
    const preloaded = soundboardPlayers.get(randomSound.id);
    if (preloaded && preloaded.loaded) {
      const overlayGain = new Tone.Gain(0.12).toDestination();
      const overlayPitch = new Tone.PitchShift({ pitch: Math.random() * 4 - 2 });
      const overlayPlayer = new Tone.Player(preloaded.buffer);
      overlayPlayer.connect(overlayPitch);
      overlayPitch.connect(overlayGain);
      overlayPlayer.onstop = () => {
        overlayPlayer.dispose();
        overlayPitch.dispose();
        overlayGain.dispose();
      };
      setTimeout(() => {
        try { overlayPlayer.start(); } catch { /* ignore if disposed */ }
      }, 200 + Math.random() * 300);
    }
  }
}

export async function playSoundboard(soundId: string): Promise<void> {
  await initAudio();
  // Ensure sounds are loaded
  await loadSounds();

  emit("soundboard-hit");

  const preloaded = soundboardPlayers.get(soundId);
  if (!preloaded || !preloaded.loaded) return;

  const pitchShift = new Tone.PitchShift({ pitch: Math.random() * 4 - 2 });
  pitchShift.toDestination();

  const player = new Tone.Player(preloaded.buffer);
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
  return Math.max(0, Math.min(1, (db + 60) / 60));
}
