import { NextRequest, NextResponse } from "next/server";

import { createClient } from "../../../../../lib/supabase/server";
import { createAdminClient } from "../../../../../lib/supabase/admin";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

interface UpdateFaqBody {
  question?: string;
  answer?: string;
  sort_order?: number;
  published?: boolean;
}

async function verifyAuthenticatedUser() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

export async function PUT(
  request: NextRequest,
  context: RouteContext,
) {
  try {
    const user = await verifyAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const body = (await request.json()) as UpdateFaqBody;

    const question = body.question?.trim();
    const answer = body.answer?.trim();
    const sortOrder = Number(body.sort_order ?? 0);

    if (!question) {
      return NextResponse.json(
        { error: "La pregunta es obligatoria." },
        { status: 400 },
      );
    }

    if (!answer) {
      return NextResponse.json(
        { error: "La respuesta es obligatoria." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(sortOrder) || sortOrder < 0) {
      return NextResponse.json(
        {
          error:
            "El orden debe ser un número entero igual o mayor que cero.",
        },
        { status: 400 },
      );
    }

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("help_faqs")
      .update({
        question,
        answer,
        sort_order: sortOrder,
        published: body.published ?? true,
      })
      .eq("id", id)
      .select(
        `
          id,
          question,
          answer,
          sort_order,
          published,
          created_at,
          updated_at
        `,
      )
      .single();

    if (error) {
      console.error("Error updating FAQ:", error);

      return NextResponse.json(
        { error: "No se pudo actualizar la pregunta." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Pregunta actualizada correctamente.",
      faq: data,
    });
  } catch (error) {
    console.error("Unexpected PUT help error:", error);

    return NextResponse.json(
      { error: "Ocurrió un error inesperado." },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  try {
    const user = await verifyAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 },
      );
    }

    const { id } = await context.params;
    const adminSupabase = createAdminClient();

    const { error } = await adminSupabase
      .from("help_faqs")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting FAQ:", error);

      return NextResponse.json(
        { error: "No se pudo eliminar la pregunta." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      message: "Pregunta eliminada correctamente.",
    });
  } catch (error) {
    console.error("Unexpected DELETE help error:", error);

    return NextResponse.json(
      { error: "Ocurrió un error inesperado." },
      { status: 500 },
    );
  }
}