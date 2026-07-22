import type { Beat } from "../../data/beats";
import { getBeatVisualStyle } from "./beatColors";

export type SupabaseBeat = {
  id: string;
  title: string;
  genre: string;
  bpm: number | string | null;
  musical_key: string | null;
  cover_url: string | null;
  audio_url: string | null;
  duration?: string | null;
  price?: number | string | null;
  plays?: number | null;
  slug?: string | null;
  status?: string | null;
  created_at?: string | null;
};

export function mapSupabaseBeatToPlayer(
  beat: SupabaseBeat,
): Beat {
  const visualStyle = getBeatVisualStyle(
    beat.genre || "Reggaetón",
  );

  return {
    id: beat.id,
    title: beat.title || "Beat sin título",
    slug: beat.slug || beat.id,
    genre: beat.genre || "Reggaetón",
    bpm: Number(beat.bpm) || 0,
    musicalKey: beat.musical_key || "N/A",
    duration: beat.duration || "0:00",
    cover:
      beat.cover_url || "/covers/default-beat.jpg",
    audio: beat.audio_url || "",
    color: visualStyle.color,
    mood: visualStyle.mood,
  };
}

export function mapSupabaseBeatsToPlayer(
  beats: SupabaseBeat[],
): Beat[] {
  return beats
    .filter((beat) => Boolean(beat.audio_url))
    .map(mapSupabaseBeatToPlayer);
}