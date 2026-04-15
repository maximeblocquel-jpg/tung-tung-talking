"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { onAudioEvent, getMeterLevel } from "./audio-engine";

export type AnimationState = "idle" | "listening" | "speaking" | "soundboard-hit" | "tap-reaction";

const TAP_REACTIONS = ["dab", "spin", "dodge", "laugh"] as const;
export type TapReaction = (typeof TAP_REACTIONS)[number];

export function useAnimationState() {
  const [state, setState] = useState<AnimationState>("idle");
  const [mouthOpen, setMouthOpen] = useState(0);
  const [tapReaction, setTapReaction] = useState<TapReaction>("dab");
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const unsubscribe = onAudioEvent((event) => {
      switch (event) {
        case "listening-start":
          setState("listening");
          break;
        case "listening-end":
          setState("idle");
          break;
        case "speaking-start":
          setState("speaking");
          break;
        case "speaking-end":
          setState("idle");
          break;
        case "soundboard-hit":
          setState("soundboard-hit");
          clearTimeout(timeoutRef.current);
          timeoutRef.current = setTimeout(() => setState("idle"), 500);
          break;
      }
    });

    return () => {
      unsubscribe();
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (state !== "speaking") {
      setMouthOpen(0);
      return;
    }

    function tick() {
      setMouthOpen(getMeterLevel());
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafRef.current);
  }, [state]);

  const handleTap = useCallback(() => {
    const reaction = TAP_REACTIONS[Math.floor(Math.random() * TAP_REACTIONS.length)];
    setTapReaction(reaction);
    setState("tap-reaction");
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => setState("idle"), 800);
  }, []);

  return { state, mouthOpen, tapReaction, handleTap };
}
