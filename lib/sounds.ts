export interface SoundDef {
  id: string;
  label: string;
  sublabel: string;
  file: string;
  color: string;
}

export const SOUNDS: SoundDef[] = [
  { id: "tung-tung", label: "TUNG", sublabel: "TUNG", file: "/sounds/tung-tung.mp3", color: "#ff6b35" },
  { id: "bombardiro", label: "BOMBAR", sublabel: "DIRO", file: "/sounds/bombardiro.mp3", color: "#9b59b6" },
  { id: "tralalero", label: "TRALA", sublabel: "LERO", file: "/sounds/tralalero.mp3", color: "#2ecc71" },
  { id: "lirili", label: "LIRILI", sublabel: "LARILA", file: "/sounds/lirili.mp3", color: "#e74c3c" },
  { id: "skibidi", label: "BRR", sublabel: "SKIBIDI", file: "/sounds/skibidi.mp3", color: "#3498db" },
  { id: "sahur", label: "SAHUR", sublabel: "\u{1F4A5}", file: "/sounds/sahur.mp3", color: "#f39c12" },
];
