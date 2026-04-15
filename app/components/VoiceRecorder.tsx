"use client";

import { useState, useCallback, useRef } from "react";
import { startRecording, stopRecording, initAudio } from "@/lib/audio-engine";

export function VoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [micDenied, setMicDenied] = useState(false);
  const recordingRef = useRef(false);

  const handleStart = useCallback(async () => {
    if (micDenied) return;
    await initAudio();
    const success = await startRecording();
    if (!success) {
      setMicDenied(true);
      return;
    }
    recordingRef.current = true;
    setIsRecording(true);
  }, [micDenied]);

  const handleEnd = useCallback(async () => {
    if (!recordingRef.current) return;
    recordingRef.current = false;
    setIsRecording(false);
    await stopRecording();
  }, []);

  return (
    <div className="relative group">
      {/* Red glow behind button */}
      <div className={`absolute inset-0 rounded-full blur-xl transition-all ${
        micDenied ? "bg-gray-500/20" : isRecording ? "bg-[#ff716c]/60 blur-2xl" : "bg-[#ff716c]/40"
      }`} />
      <button
        onPointerDown={handleStart}
        onPointerUp={handleEnd}
        onPointerLeave={handleEnd}
        disabled={micDenied}
        className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all ${
          micDenied
            ? "bg-gray-700 cursor-not-allowed"
            : isRecording
              ? "bg-gradient-to-tr from-[#ff716c] to-[#9f0519] scale-110 shadow-[0_0_40px_rgba(255,113,108,0.6)]"
              : "bg-gradient-to-tr from-[#ff716c] to-[#9f0519] shadow-[0_0_30px_rgba(255,113,108,0.5)] hover:scale-105 active:scale-90"
        }`}
      >
        <span className="text-white text-3xl">
          {micDenied ? "🚫" : isRecording ? "🔴" : "🎤"}
        </span>
      </button>
    </div>
  );
}
