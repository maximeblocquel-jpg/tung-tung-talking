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
