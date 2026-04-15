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
      className="text-violet-300 hover:scale-110 hover:text-[#d873ff] transition-all active:brightness-125 text-lg"
      aria-label="Share"
    >
      {copied ? "✓" : "↗"}
    </button>
  );
}
