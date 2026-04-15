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
    <button
      onPointerDown={handleStart}
      onPointerUp={handleEnd}
      onPointerLeave={handleEnd}
      disabled={micDenied}
      className={`
        rounded-full py-2.5 px-6 font-bold text-sm flex items-center gap-2 transition-all
        ${micDenied
          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
          : isRecording
            ? "bg-red-600 text-white scale-110 shadow-lg shadow-red-500/50"
            : "bg-red-500 text-white active:scale-95"
        }
      `}
    >
      <span>{isRecording ? "\u{1F534}" : "\u{1F3A4}"}</span>
      {micDenied ? "MIC OFF" : isRecording ? "RECORDING..." : "RECORD"}
    </button>
  );
}
