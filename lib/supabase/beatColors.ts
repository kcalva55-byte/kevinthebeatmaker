import type { BeatMood } from "../../data/beats";

export type BeatVisualStyle = {
  color: string;
  mood: BeatMood;
};

const defaultStyle: BeatVisualStyle = {
  color: "#2563eb",
  mood: {
    primary: "#2563eb",
    secondary: "#38bdf8",
    ambient: "#071b42",
    glow: "#1d4ed8",
    particle: "#60a5fa",
  },
};

const beatStyles: Record<string, BeatVisualStyle> = {
  reggaeton: {
    color: "#2563eb",
    mood: {
      primary: "#2563eb",
      secondary: "#38bdf8",
      ambient: "#071b42",
      glow: "#1d4ed8",
      particle: "#60a5fa",
    },
  },

  trap: {
    color: "#8b5cf6",
    mood: {
      primary: "#8b5cf6",
      secondary: "#c084fc",
      ambient: "#24103f",
      glow: "#7c3aed",
      particle: "#d8b4fe",
    },
  },

  detroit: {
    color: "#84cc16",
    mood: {
      primary: "#84cc16",
      secondary: "#4ade80",
      ambient: "#102813",
      glow: "#22c55e",
      particle: "#bef264",
    },
  },

  afrobeat: {
    color: "#f97316",
    mood: {
      primary: "#f97316",
      secondary: "#facc15",
      ambient: "#351707",
      glow: "#ea580c",
      particle: "#fdba74",
    },
  },
};

function normalizeGenre(genre: string) {
  return genre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getBeatVisualStyle(
  genre: string,
): BeatVisualStyle {
  const normalizedGenre = normalizeGenre(genre);

  return beatStyles[normalizedGenre] ?? defaultStyle;
}