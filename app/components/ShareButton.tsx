"use client";

import { useState } from "react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  async function handleShare() {
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Tung Tung Talking",
          text: "Check out this brainrot Talking Tom!",
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled share dialog
    }
  }

  return (
    <button
      onClick={handleShare}
      className="absolute top-3 right-3 z-10 bg-white/10 backdrop-blur-sm rounded-full w-9 h-9 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all text-sm"
      aria-label="Share"
    >
      {copied ? "\u2713" : "\u2197"}
    </button>
  );
}
