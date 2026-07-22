import { NextResponse } from "next/server";

import { getResendClient } from "../../../../../lib/email/resend";
import { createAdminClient } from "../../../../../lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type DownloadItem = {
  beatTitle: string;
  licenseName: string;
  audioFormat: string;
  mp3Url: string | null;
  wavUrl: string | null;
  stemsUrl: string | null;
};

const DOWNLOAD_EXPIRATION_SECONDS = 60 * 60;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(
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

    const testEmail = process.env.RESEND_TEST_EMAIL?.trim();

    if (!testEmail) {
      return NextResponse.json(
        {
          error:
            "Falta RESEND_TEST_EMAIL en el archivo .env.local.",
        },
        {
          status: 500,
        },
      );
    }

    const supabase = createAdminClient();

    const {
      data: order,
      error: orderError,
    } = await supabase
      .from("orders")
      .select(
        `
          id,
          customer_name,
          customer_email,
          artist_name,
          status,
          payment_reference,
          total,
          currency
        `,
      )
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error(
        "Error consultando el pedido:",
        orderError,
      );

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
          error:
            "Solo se puede enviar la entrega de pedidos pagados.",
        },
        {
          status: 403,
        },
      );
    }

    const {
      data: orderItems,
      error: itemsError,
    } = await supabase
      .from("order_items")
      .select(
        `
          id,
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
        "Error consultando el pedido:",
        itemsError,
      );

      return NextResponse.json(
        {
          error:
            "No se pudieron consultar los productos.",
        },
        {
          status: 500,
        },
      );
    }

    if (!orderItems || orderItems.length === 0) {
      return NextResponse.json(
        {
          error:
            "El pedido no contiene productos.",
        },
        {
          status: 404,
        },
      );
    }

    const downloads: DownloadItem[] = [];

    for (const item of orderItems) {
      const relation = item.beats;

      const beat = Array.isArray(relation)
        ? relation[0]
        : relation;

      if (!beat) {
        continue;
      }

      const audioFormat = String(
        item.audio_format || "",
      ).toUpperCase();

      let mp3Url: string | null = null;
      let wavUrl: string | null = null;
      let stemsUrl: string | null = null;

      if (
        beat.mp3_file_path &&
        (audioFormat.includes("MP3") ||
          audioFormat.includes("WAV"))
      ) {
        const { data, error } =
          await supabase.storage
            .from("beat-files")
            .createSignedUrl(
              beat.mp3_file_path,
              DOWNLOAD_EXPIRATION_SECONDS,
              {
                download: `${beat.title || item.beat_title}.mp3`,
              },
            );

        if (!error) {
          mp3Url = data.signedUrl;
        }
      }

      if (
        beat.wav_file_path &&
        audioFormat.includes("WAV")
      ) {
        const { data, error } =
          await supabase.storage
            .from("beat-files")
            .createSignedUrl(
              beat.wav_file_path,
              DOWNLOAD_EXPIRATION_SECONDS,
              {
                download: `${beat.title || item.beat_title}.wav`,
              },
            );

        if (!error) {
          wavUrl = data.signedUrl;
        }
      }

      if (
        beat.stems_file_path &&
        (audioFormat.includes("STEM") ||
          item.exclusive === true)
      ) {
        const { data, error } =
          await supabase.storage
            .from("beat-files")
            .createSignedUrl(
              beat.stems_file_path,
              DOWNLOAD_EXPIRATION_SECONDS,
              {
                download: `${
                  beat.title || item.beat_title
                }-stems.zip`,
              },
            );

        if (!error) {
          stemsUrl = data.signedUrl;
        }
      }

      downloads.push({
        beatTitle:
          beat.title || item.beat_title || "Beat",
        licenseName:
          item.license_name || "Licencia",
        audioFormat,
        mp3Url,
        wavUrl,
        stemsUrl,
      });
    }

    const downloadsHtml = downloads
      .map((download) => {
        const buttons = [
          download.mp3Url
            ? `<a href="${download.mp3Url}" style="display:inline-block;margin:6px 8px 6px 0;padding:12px 18px;background:#2563eb;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;">Descargar MP3</a>`
            : "",
          download.wavUrl
            ? `<a href="${download.wavUrl}" style="display:inline-block;margin:6px 8px 6px 0;padding:12px 18px;background:#059669;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;">Descargar WAV</a>`
            : "",
          download.stemsUrl
            ? `<a href="${download.stemsUrl}" style="display:inline-block;margin:6px 8px 6px 0;padding:12px 18px;background:#7c3aed;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;">Descargar STEMS</a>`
            : "",
        ].join("");

        return `
          <div style="margin-top:20px;padding:20px;border:1px solid #dbeafe;border-radius:16px;background:#f8fafc;">
            <h3 style="margin:0;color:#0f172a;">
              ${escapeHtml(download.beatTitle)}
            </h3>

            <p style="margin:8px 0;color:#475569;">
              ${escapeHtml(download.licenseName)}
            </p>

            <div style="margin-top:14px;">
              ${buttons}
            </div>
          </div>
        `;
      })
      .join("");

    const licenseUrl =
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}` +
      `/api/orders/${orderId}/license`;

    const resend = getResendClient();

    const { data, error: emailError } =
      await resend.emails.send({
        from: "KTB Studio <onboarding@resend.dev>",
        to: [testEmail],
        subject: `Tu compra en KTB Studio — Pedido ${order.id}`,
        html: `
          <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:28px;color:#0f172a;">
            <p style="font-size:12px;font-weight:800;letter-spacing:3px;color:#2563eb;">
              KTB STUDIO
            </p>

            <h1 style="font-size:30px;margin:12px 0;">
              ¡Gracias por tu compra!
            </h1>

            <p style="line-height:1.7;color:#475569;">
              Hola ${escapeHtml(order.customer_name)}, tu pago fue confirmado correctamente.
              A continuación encontrarás los archivos incluidos en tu licencia.
            </p>

            <div style="margin-top:24px;padding:18px;background:#eff6ff;border-radius:16px;">
              <p style="margin:0 0 8px;color:#475569;">
                Número de pedido
              </p>

              <strong>${escapeHtml(order.id)}</strong>

              <p style="margin:16px 0 8px;color:#475569;">
                Referencia de PayPal
              </p>

              <strong>
                ${escapeHtml(
                  order.payment_reference ||
                    "No disponible",
                )}
              </strong>
            </div>

            ${downloadsHtml}

            <div style="margin-top:24px;">
              <a
                href="${licenseUrl}"
                style="display:inline-block;padding:13px 20px;background:#0f172a;color:#ffffff;text-decoration:none;border-radius:999px;font-weight:700;"
              >
                Descargar licencia PDF
              </a>
            </div>

            <p style="margin-top:28px;font-size:13px;line-height:1.6;color:#64748b;">
              Los enlaces de los archivos vencen aproximadamente en 60 minutos.
              La licencia PDF seguirá disponible mientras el pedido esté registrado como pagado.
            </p>

            <p style="margin-top:28px;font-size:12px;color:#94a3b8;">
              Este es un correo de prueba. El comprador original registrado fue:
              ${escapeHtml(order.customer_email)}
            </p>
          </div>
        `,
      });

    if (emailError) {
      console.error(
        "Error enviando el correo:",
        emailError,
      );

      return NextResponse.json(
        {
          error:
            emailError.message ||
            "No se pudo enviar el correo.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json({
      success: true,
      emailId: data?.id ?? null,
      sentTo: testEmail,
      originalCustomerEmail:
        order.customer_email,
    });
  } catch (error) {
    console.error(
      "Error en email-delivery:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo enviar la entrega.",
      },
      {
        status: 500,
      },
    );
  }
}