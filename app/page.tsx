"use client";

import { Character } from "./components/Character";
import { VoiceRecorder } from "./components/VoiceRecorder";
import { PlaybackButton } from "./components/PlaybackButton";
import { Soundboard } from "./components/Soundboard";
import { ShareButton } from "./components/ShareButton";
import { useAnimationState } from "@/lib/use-animation-state";
import { playSoundboard } from "@/lib/audio-engine";
import { SOUNDS } from "@/lib/sounds";

export default function Home() {
  const { state, mouthOpen, tapReaction, handleTap } = useAnimationState();

  function handleCharacterTap() {
    handleTap();
    const randomSound = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
    playSoundboard(randomSound.id);
  }

  return (
    <main className="h-dvh flex flex-col bg-[#170721] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#ffe792]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-[#d873ff]/20 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-violet-950/40 backdrop-blur-xl max-w-[420px] left-1/2 -translate-x-1/2">
        <h1 className="font-headline font-black tracking-tighter uppercase text-2xl text-[#FF4500] italic">
          TUNG TUNG
        </h1>
        <ShareButton />
      </header>

      {/* Character zone */}
      <div className="flex-1 flex flex-col items-center justify-center relative pt-16 min-h-0 max-w-[420px] mx-auto w-full">
        <Character
          state={state}
          mouthOpen={mouthOpen}
          tapReaction={tapReaction}
          onTap={handleCharacterTap}
        />
      </div>

      {/* Bottom controller card */}
      <section className="relative z-20 px-4 pb-6 max-w-[420px] mx-auto w-full">
        <div className="glass-panel bg-[rgba(44,22,58,0.4)] rounded-2xl p-5 border border-white/5 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          {/* Controls row */}
          <div className="flex items-center justify-center gap-6 mb-5">
            <PlaybackButton />
            <VoiceRecorder />
          </div>

          {/* Soundboard pills */}
          <Soundboard />
        </div>
      </section>
    </main>
  );
}
