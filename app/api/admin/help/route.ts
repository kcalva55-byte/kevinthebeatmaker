import { NextRequest, NextResponse } from "next/server";

import { createClient } from "../../../../lib/supabase/server";
import { createAdminClient } from "../../../../lib/supabase/admin";

interface CreateFaqBody {
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

export async function GET() {
  try {
    const user = await verifyAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 },
      );
    }

    const adminSupabase = createAdminClient();

    const { data, error } = await adminSupabase
      .from("help_faqs")
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
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading FAQs:", error);

      return NextResponse.json(
        { error: "No se pudieron cargar las preguntas." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      faqs: data ?? [],
    });
  } catch (error) {
    console.error("Unexpected GET help error:", error);

    return NextResponse.json(
      { error: "Ocurrió un error inesperado." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await verifyAuthenticatedUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado." },
        { status: 401 },
      );
    }

    const body = (await request.json()) as CreateFaqBody;

    const question = body.question?.trim();
    const answer = body.answer?.trim();

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

    const sortOrder = Number(body.sort_order ?? 0);

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
      .insert({
        question,
        answer,
        sort_order: sortOrder,
        published: body.published ?? true,
      })
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
      console.error("Error creating FAQ:", error);

      return NextResponse.json(
        { error: "No se pudo crear la pregunta." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Pregunta creada correctamente.",
        faq: data,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Unexpected POST help error:", error);

    return NextResponse.json(
      { error: "Ocurrió un error inesperado." },
      { status: 500 },
    );
  }
}