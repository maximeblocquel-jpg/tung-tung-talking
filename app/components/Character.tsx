"use client";

import { AnimationState, TapReaction } from "@/lib/use-animation-state";

interface CharacterProps {
  state: AnimationState;
  mouthOpen: number;
  tapReaction: TapReaction;
  onTap: () => void;
}

export function Character({ state, mouthOpen, tapReaction, onTap }: CharacterProps) {
  const containerClass = getAnimationClass(state, tapReaction);
  const speakingScale = state === "speaking" ? 1 + mouthOpen * 0.05 : 1;

  return (
    <div
      className={`flex-1 flex flex-col items-center justify-center cursor-pointer select-none min-h-0 ${containerClass}`}
      onClick={onTap}
    >
      <div className="relative">
        {/* Purple glow behind character */}
        <div className="absolute inset-0 bg-[#d873ff]/30 rounded-full blur-3xl scale-150 animate-pulse" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/tung-tung-character.png"
          alt="Tung Tung Tung Sahur"
          className="relative z-10 w-56 h-56 object-contain glow-aura transition-transform duration-75"
          style={{ transform: `scale(${speakingScale})` }}
          draggable={false}
        />
      </div>
      {/* Status pill */}
      <div className="mt-6 glass-panel bg-[rgba(44,22,58,0.4)] px-5 py-1.5 rounded-full border border-white/5">
        <span className="font-headline font-bold text-[#ffe792] tracking-widest uppercase text-xs">
          {state === "listening" ? "Listening..." : state === "speaking" ? "Speaking..." : "Awaiting Brainrot..."}
        </span>
      </div>
    </div>
  );
}

function getAnimationClass(state: AnimationState, tapReaction: TapReaction): string {
  switch (state) {
    case "idle": return "animate-bounce-gentle";
    case "listening": return "animate-vibrate";
    case "speaking": return "animate-shake";
    case "soundboard-hit": return "animate-jump";
    case "tap-reaction":
      switch (tapReaction) {
        case "dab": return "animate-dab";
        case "spin": return "animate-spin-once";
        case "dodge": return "animate-dodge";
        case "laugh": return "animate-laugh";
      }
    default: return "";
  }
}
