import { NextResponse } from "next/server";

import { createAdminClient } from "../../../../lib/supabase/admin";
import { createClient } from "../../../../lib/supabase/server";

interface SettingsPayload {
  studio_name?: unknown;
  producer_name?: unknown;

  contact_email?: unknown;
  support_email?: unknown;
  phone?: unknown;
  whatsapp?: unknown;

  site_url?: unknown;
  instagram_url?: unknown;
  youtube_url?: unknown;
  tiktok_url?: unknown;
  spotify_url?: unknown;

  currency?: unknown;
  country?: unknown;
  timezone?: unknown;

  order_email_enabled?: unknown;
  download_expiration_minutes?: unknown;

  legal_name?: unknown;
  legal_identification?: unknown;
  legal_address?: unknown;

  terms_text?: unknown;
  privacy_text?: unknown;
  license_footer_text?: unknown;
}

function requiredString(
  value: unknown,
  fieldName: string,
) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    throw new Error(
      `El campo ${fieldName} es obligatorio.`,
    );
  }

  return value.trim();
}

function nullableString(value: unknown) {
  if (typeof value !== "string") {
    return null;
  }

  const trimmedValue = value.trim();

  return trimmedValue || null;
}

export async function PUT(request: Request) {
  try {
    const authenticatedClient =
      await createClient();

    const {
      data: { user },
      error: authError,
    } =
      await authenticatedClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          error:
            "Debes iniciar sesión para modificar la configuración.",
        },
        {
          status: 401,
        },
      );
    }

    const body =
      (await request.json()) as SettingsPayload;

    const studioName = requiredString(
      body.studio_name,
      "nombre del estudio",
    );

    const producerName = requiredString(
      body.producer_name,
      "nombre del productor",
    );

    const currency = requiredString(
      body.currency,
      "moneda",
    ).toUpperCase();

    if (currency.length !== 3) {
      return NextResponse.json(
        {
          error:
            "La moneda debe contener exactamente tres letras.",
        },
        {
          status: 400,
        },
      );
    }

    const country = requiredString(
      body.country,
      "país",
    );

    const timezone = requiredString(
      body.timezone,
      "zona horaria",
    );

    const downloadExpirationMinutes =
      Number(
        body.download_expiration_minutes,
      );

    if (
      !Number.isInteger(
        downloadExpirationMinutes,
      ) ||
      downloadExpirationMinutes < 5 ||
      downloadExpirationMinutes > 10080
    ) {
      return NextResponse.json(
        {
          error:
            "La expiración debe estar entre 5 y 10080 minutos.",
        },
        {
          status: 400,
        },
      );
    }

    const adminClient =
      createAdminClient();

    const {
      data: currentSettings,
      error: currentSettingsError,
    } = await adminClient
      .from("site_settings")
      .select("id")
      .limit(1)
      .maybeSingle();

    if (currentSettingsError) {
      return NextResponse.json(
        {
          error:
            "No se pudo consultar la configuración actual.",
        },
        {
          status: 500,
        },
      );
    }

    if (!currentSettings) {
      return NextResponse.json(
        {
          error:
            "No existe un registro de configuración.",
        },
        {
          status: 404,
        },
      );
    }

    const settingsToUpdate = {
      studio_name: studioName,
      producer_name: producerName,

      contact_email: nullableString(
        body.contact_email,
      ),

      support_email: nullableString(
        body.support_email,
      ),

      phone: nullableString(body.phone),
      whatsapp: nullableString(body.whatsapp),

      site_url: nullableString(body.site_url),

      instagram_url: nullableString(
        body.instagram_url,
      ),

      youtube_url: nullableString(
        body.youtube_url,
      ),

      tiktok_url: nullableString(
        body.tiktok_url,
      ),

      spotify_url: nullableString(
        body.spotify_url,
      ),

      currency,
      country,
      timezone,

      order_email_enabled:
        body.order_email_enabled === true,

      download_expiration_minutes:
        downloadExpirationMinutes,

      legal_name: nullableString(
        body.legal_name,
      ),

      legal_identification: nullableString(
        body.legal_identification,
      ),

      legal_address: nullableString(
        body.legal_address,
      ),

      terms_text: nullableString(
        body.terms_text,
      ),

      privacy_text: nullableString(
        body.privacy_text,
      ),

      license_footer_text: nullableString(
        body.license_footer_text,
      ),
    };

    const {
      data: updatedSettings,
      error: updateError,
    } = await adminClient
      .from("site_settings")
      .update(settingsToUpdate)
      .eq("id", currentSettings.id)
      .select("*")
      .single();

    if (updateError) {
      console.error(
        "Error actualizando configuración:",
        updateError,
      );

      return NextResponse.json(
        {
          error:
            updateError.message ||
            "No se pudo guardar la configuración.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error(
      "Error guardando configuración:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado.",
      },
      {
        status: 500,
      },
    );
  }
}