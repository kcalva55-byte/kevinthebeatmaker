import { NextResponse } from "next/server";

import { createAdminClient } from "../../../../../lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type DownloadItem = {
  beatId: string;
  beatTitle: string;
  licenseName: string;
  audioFormat: string;
  mp3Url: string | null;
  wavUrl: string | null;
  stemsUrl: string | null;
};

const DOWNLOAD_EXPIRATION_SECONDS = 60 * 60;

export async function GET(
  _request: Request,
  context: RouteContext,
) {
  try {
    const { id } = await context.params;
    const orderId = id?.trim();

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Falta el identificador del pedido.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = createAdminClient();

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        `
          id,
          status,
          customer_email,
          payment_provider,
          payment_reference
        `,
      )
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error("Error consultando el pedido:", orderError);

      return NextResponse.json(
        {
          error: "No se pudo consultar el pedido.",
        },
        {
          status: 500,
        },
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          error: "El pedido no existe.",
        },
        {
          status: 404,
        },
      );
    }

    if (order.status !== "paid") {
      return NextResponse.json(
        {
          error: "El pedido todavía no ha sido pagado.",
        },
        {
          status: 403,
        },
      );
    }

    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select(
        `
          id,
          beat_id,
          license_id,
          beat_title,
          license_name,
          audio_format,
          exclusive,
          beats (
            id,
            title,
            mp3_file_path,
            wav_file_path,
            stems_file_path
          )
        `,
      )
      .eq("order_id", orderId);

    if (itemsError) {
      console.error(
        "Error consultando los productos:",
        itemsError,
      );

      return NextResponse.json(
        {
          error:
            "No se pudieron consultar los archivos del pedido.",
        },
        {
          status: 500,
        },
      );
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json(
        {
          error: "El pedido no contiene productos.",
        },
        {
          status: 404,
        },
      );
    }

    const downloads: DownloadItem[] = [];

    for (const item of orderItems) {
      const beatRelation = item.beats;

      const beat = Array.isArray(beatRelation)
        ? beatRelation[0]
        : beatRelation;

      if (!beat) {
        console.error(
          "No se encontró el beat del producto:",
          item.id,
        );
        continue;
      }

      let mp3Url: string | null = null;
      let wavUrl: string | null = null;
      let stemsUrl: string | null = null;

      if (beat.mp3_file_path) {
        const { data, error } = await supabase.storage
          .from("beat-files")
          .createSignedUrl(
            beat.mp3_file_path,
            DOWNLOAD_EXPIRATION_SECONDS,
            {
              download: `${beat.title || item.beat_title}.mp3`,
            },
          );

        if (error) {
          console.error(
            "No se pudo firmar el MP3:",
            error,
          );
        } else {
          mp3Url = data.signedUrl;
        }
      }

      if (beat.wav_file_path) {
        const { data, error } = await supabase.storage
          .from("beat-files")
          .createSignedUrl(
            beat.wav_file_path,
            DOWNLOAD_EXPIRATION_SECONDS,
            {
              download: `${beat.title || item.beat_title}.wav`,
            },
          );

        if (error) {
          console.error(
            "No se pudo firmar el WAV:",
            error,
          );
        } else {
          wavUrl = data.signedUrl;
        }
      }

      if (beat.stems_file_path) {
        const { data, error } = await supabase.storage
          .from("beat-files")
          .createSignedUrl(
            beat.stems_file_path,
            DOWNLOAD_EXPIRATION_SECONDS,
            {
              download: `${beat.title || item.beat_title}-stems.zip`,
            },
          );

        if (error) {
          console.error(
            "No se pudieron firmar los STEMS:",
            error,
          );
        } else {
          stemsUrl = data.signedUrl;
        }
      }

      const audioFormat = String(
        item.audio_format || "",
      )
        .trim()
        .toUpperCase();

      downloads.push({
        beatId: beat.id,
        beatTitle:
          beat.title || item.beat_title || "Beat",
        licenseName:
          item.license_name || "Licencia",
        audioFormat,
        mp3Url:
          audioFormat.includes("MP3") ||
          audioFormat.includes("WAV")
            ? mp3Url
            : null,
        wavUrl: audioFormat.includes("WAV")
          ? wavUrl
          : null,
        stemsUrl:
          audioFormat.includes("STEM") ||
          item.exclusive === true
            ? stemsUrl
            : null,
      });
    }

    if (downloads.length === 0) {
      return NextResponse.json(
        {
          error:
            "No se encontraron archivos disponibles para descargar.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
      expiresIn: DOWNLOAD_EXPIRATION_SECONDS,
      expiresInMinutes:
        DOWNLOAD_EXPIRATION_SECONDS / 60,
      downloads,
    });
  } catch (error) {
    console.error(
      "Error generando las descargas:",
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