"use client";

import { SOUNDS } from "@/lib/sounds";
import { playSoundboard } from "@/lib/audio-engine";

export function Soundboard() {
  async function handlePress(soundId: string) {
    await playSoundboard(soundId);
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
