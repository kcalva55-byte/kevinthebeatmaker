import BeatsManager, {
  type AdminBeat,
} from "../../../components/admin/beats/BeatsManager";

import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminBeatsPage() {
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
        cover_url,
        audio_url,
        plays,
        created_at,
        updated_at
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6">
          <h1 className="text-xl font-semibold text-red-200">
            No fue posible cargar los beats
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-200/70">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  return (
    <BeatsManager
      initialBeats={(data ?? []) as AdminBeat[]}
    />
  );
}