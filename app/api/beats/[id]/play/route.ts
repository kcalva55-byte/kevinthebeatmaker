import { NextResponse } from "next/server";

import { createClient } from "../../../../../lib/supabase/server";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(
  _request: Request,
  { params }: RouteContext,
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json(
      {
        error: "ID del beat no proporcionado.",
      },
      {
        status: 400,
      },
    );
  }

  const supabase = await createClient();

  const { data, error } = await supabase.rpc(
    "increment_beat_plays",
    {
      beat_id: id,
    },
  );

  if (error) {
    console.error(
      "No se pudo incrementar la reproducción:",
      error.message,
    );

    return NextResponse.json(
      {
        error:
          "No se pudo registrar la reproducción.",
      },
      {
        status: 500,
      },
    );
  }

  return NextResponse.json({
    plays: Number(data) || 0,
  });
}