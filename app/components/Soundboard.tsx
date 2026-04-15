"use client";

import { SOUNDS } from "@/lib/sounds";
import { playSoundboard } from "@/lib/audio-engine";

const EMOJI_MAP: Record<string, string> = {
  "tung-tung": "🪵",
  "bombardiro": "🐊",
  "tralalero": "🎵",
  "lirili": "🎶",
  "skibidi": "💀",
  "sahur": "🔥",
};

export function Soundboard() {
  async function handlePress(soundId: string) {
    await playSoundboard(soundId);
  }

  return (
    <div className="flex overflow-x-auto gap-2.5 no-scrollbar pb-1">
      {SOUNDS.map((sound) => (
        <button
          key={sound.id}
          onClick={() => handlePress(sound.id)}
          className="flex-shrink-0 px-4 py-2.5 rounded-full border border-white/10 flex items-center gap-2 transition-all active:scale-90 hover:bg-[#331c42]"
          style={{ backgroundColor: `${sound.color}20` }}
        >
          <span className="text-base">{EMOJI_MAP[sound.id] || "🔊"}</span>
          <span className="font-headline font-bold text-[10px] uppercase tracking-tight text-[#f5ddff] whitespace-nowrap">
            {sound.label}
          </span>
        </button>
      ))}
    </div>
  );
}
