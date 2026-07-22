export interface BeatMood {
  primary: string;
  secondary: string;
  ambient: string;
  glow: string;
  particle: string;
}

export interface Beat {
  id: string;
  title: string;
  slug: string;
  genre: string;
  bpm: number;
  musicalKey: string;
  duration: string;
  cover: string;
  audio: string;
  color: string;
  mood: BeatMood;
}

export const beats: Beat[] = [
  {
    id: "1",
    title: "Night Drive",
    slug: "night-drive",
    genre: "Reggaetón",
    bpm: 95,
    musicalKey: "Am",
    duration: "03:12",
    cover: "/covers/night-drive.jpg",
    audio: "/audio/night-drive.mp3",
    color: "#2563eb",
    mood: {
      primary: "#2563eb",
      secondary: "#38bdf8",
      ambient: "#071b42",
      glow: "#1d4ed8",
      particle: "#60a5fa",
    },
  },
  {
    id: "2",
    title: "No Mercy",
    slug: "no-mercy",
    genre: "Trap",
    bpm: 140,
    musicalKey: "Fm",
    duration: "02:58",
    cover: "/covers/no-mercy.jpg",
    audio: "/audio/no-mercy.mp3",
    color: "#8b5cf6",
    mood: {
      primary: "#8b5cf6",
      secondary: "#c084fc",
      ambient: "#24103f",
      glow: "#7c3aed",
      particle: "#d8b4fe",
    },
  },
  {
    id: "3",
    title: "Cold City",
    slug: "cold-city",
    genre: "Detroit",
    bpm: 92,
    musicalKey: "Dm",
    duration: "03:20",
    cover: "/covers/cold-city.jpg",
    audio: "/audio/cold-city.mp3",
    color: "#84cc16",
    mood: {
      primary: "#84cc16",
      secondary: "#4ade80",
      ambient: "#102813",
      glow: "#22c55e",
      particle: "#bef264",
    },
  },
  {
    id: "4",
    title: "Afro Vibes",
    slug: "afro-vibes",
    genre: "Afrobeat",
    bpm: 105,
    musicalKey: "Gm",
    duration: "03:05",
    cover: "/covers/afro-vibes.jpg",
    audio: "/audio/afro-vibes.mp3",
    color: "#f97316",
    mood: {
      primary: "#f97316",
      secondary: "#facc15",
      ambient: "#351707",
      glow: "#ea580c",
      particle: "#fdba74",
    },
  },
];