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
      className={`p-4 rounded-full transition-all ${
        available
          ? "bg-[#3a214b] text-[#baa3c6] hover:scale-110 active:scale-95"
          : "bg-[#3a214b]/50 text-[#baa3c6]/30 cursor-not-allowed"
      }`}
    >
      <span className="text-2xl">▶</span>
    </button>
  );
}
