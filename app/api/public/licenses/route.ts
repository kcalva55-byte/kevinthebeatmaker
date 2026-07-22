import { NextResponse } from "next/server";

import { createClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("beat_licenses")
      .select(
        `
          id,
          name,
          description,
          price,
          audio_format,
          distribution_limit,
          streams_limit,
          music_video_allowed,
          radio_allowed,
          paid_performances_allowed,
          exclusive
        `,
      )
      .order("price", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Error cargando licencias públicas:",
        error,
      );

      return NextResponse.json(
        {
          error:
            "No se pudieron cargar las licencias.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      licenses: data ?? [],
    });
  } catch (error) {
    console.error(
      "Error inesperado cargando licencias:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Ocurrió un error inesperado.",
      },
      {
        status: 500,
      },
    );
  }
}