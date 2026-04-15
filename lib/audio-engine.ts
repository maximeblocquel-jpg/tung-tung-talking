import * as Tone from "tone";
import { SOUNDS } from "./sounds";

let mic: Tone.UserMedia | null = null;
let recorder: Tone.Recorder | null = null;
let lastRecordingUrl: string | null = null;
let meter: Tone.Meter | null = null;
let soundboardPlayers: Map<string, Tone.Player> = new Map();
let isInitialized = false;

export type AudioEventCallback = (event: "speaking-start" | "speaking-end" | "listening-start" | "listening-end" | "soundboard-hit") => void;

const eventCallbacks = new Set<AudioEventCallback>();

export function onAudioEvent(cb: AudioEventCallback): () => void {
  eventCallbacks.add(cb);
  return () => { eventCallbacks.delete(cb); };
}

function emit(event: Parameters<AudioEventCallback>[0]) {
  eventCallbacks.forEach((cb) => cb(event));
}

export async function initAudio(): Promise<void> {
  if (isInitialized) return;
  await Tone.start();

  for (const sound of SOUNDS) {
    const player = new Tone.Player(sound.file).toDestination();
    soundboardPlayers.set(sound.id, player);
  }

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
  const reverbDecay = 1 + Math.random() * 3;
  const reverbWet = 0.3 + Math.random() * 0.4;

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

  const randomSound = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
  const overlay = soundboardPlayers.get(randomSound.id);
  if (overlay && overlay.loaded) {
    const overlayGain = new Tone.Gain(0.3).toDestination();
    const overlayPitch = new Tone.PitchShift({ pitch: Math.random() * 4 - 2 });
    const overlayPlayer = new Tone.Player(randomSound.file);
    overlayPlayer.connect(overlayPitch);
    overlayPitch.connect(overlayGain);
    overlayPlayer.onstop = () => {
      overlayPlayer.dispose();
      overlayPitch.dispose();
      overlayGain.dispose();
    };
    setTimeout(() => overlayPlayer.start(), 200 + Math.random() * 300);
  }
}

export function playSoundboard(soundId: string): void {
  if (!isInitialized) return;
  emit("soundboard-hit");

  const sound = SOUNDS.find((s) => s.id === soundId);
  if (!sound) return;

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
  return Math.max(0, Math.min(1, (db + 60) / 60));
}
