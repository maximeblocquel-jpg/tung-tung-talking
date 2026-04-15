"use client";

import Image from "next/image";
import { AnimationState, TapReaction } from "@/lib/use-animation-state";

interface CharacterProps {
  state: AnimationState;
  mouthOpen: number;
  tapReaction: TapReaction;
  onTap: () => void;
}

export function Character({ state, mouthOpen, tapReaction, onTap }: CharacterProps) {
  const containerClass = getAnimationClass(state, tapReaction);
  // Scale based on mouth open during speaking for a "breathing" effect
  const speakingScale = state === "speaking" ? 1 + mouthOpen * 0.05 : 1;

  return (
    <div
      className={`flex-1 flex items-center justify-center cursor-pointer select-none min-h-0 ${containerClass}`}
      onClick={onTap}
    >
      <div
        className="relative h-full max-h-[50dvh] aspect-[3/4] transition-transform duration-75"
        style={{ transform: `scale(${speakingScale})` }}
      >
        <Image
          src="/tung-tung-character.jpeg"
          alt="Tung Tung Tung Sahur"
          fill
          className="object-contain drop-shadow-[0_0_30px_rgba(255,107,53,0.3)]"
          priority
        />
      </div>
    </div>
  );
}

function getAnimationClass(state: AnimationState, tapReaction: TapReaction): string {
  switch (state) {
    case "idle":
      return "animate-bounce-gentle";
    case "listening":
      return "animate-vibrate";
    case "speaking":
      return "animate-shake";
    case "soundboard-hit":
      return "animate-jump";
    case "tap-reaction":
      switch (tapReaction) {
        case "dab": return "animate-dab";
        case "spin": return "animate-spin-once";
        case "dodge": return "animate-dodge";
        case "laugh": return "animate-laugh";
      }
    default:
      return "";
  }
}
