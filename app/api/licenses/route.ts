import { NextRequest, NextResponse } from "next/server";

import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const beatId =
      request.nextUrl.searchParams.get("beatId");

    if (!beatId) {
      return NextResponse.json(
        {
          error: "Falta el beatId.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("beat_licenses")
      .select(`
        id,
        beat_id,
        name,
        description,
        price,
        audio_format,
        distribution_limit,
        streams_limit,
        music_video_allowed,
        radio_allowed,
        paid_performances_allowed,
        exclusive,
        position
      `)
      .eq("beat_id", beatId)
      .order("position", {
        ascending: true,
      });

    if (error) {
      console.error(error);

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
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Error interno del servidor.",
      },
      {
        status: 500,
      },
    );
  }
}