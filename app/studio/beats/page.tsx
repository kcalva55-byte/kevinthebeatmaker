import BeatsManager, {
  type AdminBeat,
} from "../../../components/dashboard/BeatsManager";
import { createClient } from "../../../lib/supabase/server";

export default async function StudioBeatsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("beats")
    .select(
      `
        id,
        title,
        genre,
        bpm,
        musical_key,
        price,
        plays,
        status,
        cover_url,
        created_at
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  const beats: AdminBeat[] =
    data?.map((beat) => ({
      id: beat.id,
      title: beat.title,
      genre: beat.genre,
      bpm: beat.bpm,
      musicalKey: beat.musical_key,
      price: Number(beat.price),
      plays: beat.plays,
      status:
        beat.status === "published"
          ? "Publicado"
          : "Borrador",
      cover: beat.cover_url || "/images/logo-k.jpg",
    })) ?? [];

  return (
    <BeatsManager
      initialBeats={beats}
      loadingError={
        error
          ? `No se pudieron cargar los beats: ${error.message}`
          : ""
      }
    />
  );
}