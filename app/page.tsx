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
    initAudio().then(() => {
      const randomSound = SOUNDS[Math.floor(Math.random() * SOUNDS.length)];
      playSoundboard(randomSound.id);
    });
  }

  return (
    <main className="h-dvh max-w-[420px] mx-auto flex flex-col bg-[#0d0d1a] relative overflow-hidden">
      <ShareButton />

      <header className="bg-gradient-to-r from-[#ff6b35] to-[#f7c948] py-2.5 text-center shrink-0">
        <h1 className="text-lg font-black tracking-[0.2em] text-[#1a1a2e]">
          TUNG TUNG TALKING
        </h1>
      </header>

      <div className="flex-1 flex flex-col bg-gradient-to-b from-[#1a1a2e] to-[#2d1b69] relative min-h-0">
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

      <div className="flex items-center justify-center gap-3 py-3 bg-[#1a1a2e] shrink-0">
        <VoiceRecorder />
        <PlaybackButton />
      </div>

      <div className="bg-[#111] shrink-0">
        <Soundboard />
      </div>
    </main>
  );
}
