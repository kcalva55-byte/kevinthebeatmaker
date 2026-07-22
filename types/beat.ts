export type BeatStatus = "draft" | "published";

export type DatabaseBeat = {
  id: string;
  title: string;
  slug: string;
  genre: string;
  bpm: number;
  musical_key: string;
  price: number;
  status: BeatStatus;
  cover_url: string | null;
  audio_url: string | null;
  plays: number;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateBeatInput = {
  title: string;
  slug: string;
  genre: string;
  bpm: number;
  musical_key: string;
  price: number;
  status: BeatStatus;
  cover_url: string | null;
  audio_url: string | null;
  created_by: string;
};