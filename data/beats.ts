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

export const beats: Beat[] = [];