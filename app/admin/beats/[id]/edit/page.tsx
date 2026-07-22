import { notFound } from "next/navigation";

import BeatForm, {
  type EditableBeat,
} from "../../../../../components/admin/beats/BeatForm";

import { createClient } from "../../../../../lib/supabase/server";

interface EditBeatPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function EditBeatPage({
  params,
}: EditBeatPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("beats")
    .select(
      `
        id,
        title,
        slug,
        genre,
        bpm,
        musical_key,
        price,
        status,
        description,
        tags,
        mood,
        duration_seconds,
        featured,
        preview_start,
        preview_end,
        cover_url,
        audio_url,
        wav_url,
        stems_url
      `,
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1200px]">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6">
          <h1 className="text-xl font-semibold text-red-200">
            No fue posible cargar el beat
          </h1>

          <p className="mt-2 text-sm text-red-200/70">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  if (!data) {
    notFound();
  }

  return (
    <BeatForm initialBeat={data as EditableBeat} />
  );
}