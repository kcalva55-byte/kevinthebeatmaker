import { NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
} from "pdf-lib";

import { createAdminClient } from "../../../../../lib/supabase/admin";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(value: string | null) {
  if (!value) {
    return "No disponible";
  }

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}

function wrapText(
  text: string,
  maxCharacters: number,
) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const nextLine = currentLine
      ? `${currentLine} ${word}`
      : word;

    if (nextLine.length > maxCharacters) {
      if (currentLine) {
        lines.push(currentLine);
      }

      currentLine = word;
    } else {
      currentLine = nextLine;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

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
          payment_provider,
          payment_reference,
          total,
          currency,
          created_at
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
            "La licencia solo está disponible para pedidos pagados.",
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
          unit_price,
          exclusive
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
            "No se pudieron consultar las licencias del pedido.",
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
            "El pedido no contiene licencias.",
        },
        {
          status: 404,
        },
      );
    }

    const pdfDocument = await PDFDocument.create();

    const regularFont = await pdfDocument.embedFont(
      StandardFonts.Helvetica,
    );

    const boldFont = await pdfDocument.embedFont(
      StandardFonts.HelveticaBold,
    );

    const page = pdfDocument.addPage([
      595.28,
      841.89,
    ]);

    const { width, height } = page.getSize();

    const dark = rgb(0.03, 0.05, 0.1);
    const blue = rgb(0.1, 0.35, 0.95);
    const slate = rgb(0.35, 0.4, 0.5);
    const light = rgb(0.94, 0.96, 1);
    const green = rgb(0.05, 0.65, 0.45);

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height,
      color: light,
    });

    page.drawRectangle({
      x: 0,
      y: height - 165,
      width,
      height: 165,
      color: dark,
    });

    page.drawText("KTB STUDIO", {
      x: 55,
      y: height - 65,
      size: 13,
      font: boldFont,
      color: blue,
    });

    page.drawText("LICENCIA DE USO MUSICAL", {
      x: 55,
      y: height - 105,
      size: 25,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    page.drawText(
      "Documento oficial de adquisición y autorización de uso",
      {
        x: 55,
        y: height - 132,
        size: 10,
        font: regularFont,
        color: rgb(0.7, 0.75, 0.85),
      },
    );

    let cursorY = height - 205;

    function drawLabel(
      label: string,
      value: string,
    ) {
      page.drawText(label.toUpperCase(), {
        x: 55,
        y: cursorY,
        size: 8,
        font: boldFont,
        color: slate,
      });

      cursorY -= 17;

      page.drawText(value || "No disponible", {
        x: 55,
        y: cursorY,
        size: 11,
        font: boldFont,
        color: dark,
      });

      cursorY -= 31;
    }

    drawLabel(
      "Número de pedido",
      order.id,
    );

    drawLabel(
      "Comprador",
      order.customer_name,
    );

    drawLabel(
      "Correo electrónico",
      order.customer_email,
    );

    drawLabel(
      "Nombre artístico",
      order.artist_name || "No especificado",
    );

    drawLabel(
      "Fecha de compra",
      formatDate(order.created_at),
    );

    drawLabel(
      "Proveedor de pago",
      String(
        order.payment_provider || "PayPal",
      ).toUpperCase(),
    );

    drawLabel(
      "Referencia de pago",
      order.payment_reference ||
        "No disponible",
    );

    page.drawLine({
      start: {
        x: 55,
        y: cursorY + 8,
      },
      end: {
        x: width - 55,
        y: cursorY + 8,
      },
      thickness: 1,
      color: rgb(0.8, 0.83, 0.88),
    });

    cursorY -= 25;

    page.drawText("LICENCIAS ADQUIRIDAS", {
      x: 55,
      y: cursorY,
      size: 13,
      font: boldFont,
      color: dark,
    });

    cursorY -= 30;

    for (const item of orderItems) {
      page.drawRectangle({
        x: 55,
        y: cursorY - 83,
        width: width - 110,
        height: 96,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.82, 0.85, 0.9),
        borderWidth: 1,
      });

      page.drawText(
        item.beat_title || "Beat",
        {
          x: 72,
          y: cursorY - 10,
          size: 13,
          font: boldFont,
          color: dark,
        },
      );

      page.drawText(
        item.license_name || "Licencia",
        {
          x: 72,
          y: cursorY - 31,
          size: 10,
          font: boldFont,
          color: blue,
        },
      );

      page.drawText(
        `Formato: ${item.audio_format || "No especificado"}`,
        {
          x: 72,
          y: cursorY - 50,
          size: 9,
          font: regularFont,
          color: slate,
        },
      );

      page.drawText(
        item.exclusive
          ? "Tipo: Licencia exclusiva"
          : "Tipo: Licencia no exclusiva",
        {
          x: 72,
          y: cursorY - 67,
          size: 9,
          font: regularFont,
          color: slate,
        },
      );

      page.drawText(
        `${order.currency || "USD"} ${Number(
          item.unit_price,
        ).toFixed(2)}`,
        {
          x: width - 145,
          y: cursorY - 10,
          size: 11,
          font: boldFont,
          color: green,
        },
      );

      cursorY -= 115;
    }

    const termsText =
      "Esta licencia concede al comprador el derecho de utilizar el beat adquirido conforme a las condiciones asociadas con la licencia seleccionada. La propiedad intelectual del beat continúa perteneciendo a KTB Studio, excepto cuando la licencia indique expresamente una transferencia exclusiva. Queda prohibida la reventa, redistribución o entrega del archivo original a terceros.";

    const termsLines = wrapText(
      termsText,
      92,
    );

    page.drawText("CONDICIONES GENERALES", {
      x: 55,
      y: cursorY,
      size: 12,
      font: boldFont,
      color: dark,
    });

    cursorY -= 23;

    for (const line of termsLines) {
      page.drawText(line, {
        x: 55,
        y: cursorY,
        size: 8.7,
        font: regularFont,
        color: slate,
      });

      cursorY -= 14;
    }

    cursorY -= 18;

    page.drawText(
      `Total pagado: ${order.currency || "USD"} ${Number(
        order.total,
      ).toFixed(2)}`,
      {
        x: 55,
        y: cursorY,
        size: 12,
        font: boldFont,
        color: dark,
      },
    );

    page.drawText(
      "Documento generado automáticamente por KTB Studio.",
      {
        x: 55,
        y: 35,
        size: 8,
        font: regularFont,
        color: slate,
      },
    );

    const pdfBytes = await pdfDocument.save();

    return new NextResponse(
      Buffer.from(pdfBytes),
      {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="licencia-${order.id}.pdf"`,
          "Cache-Control":
            "private, no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Error generando la licencia PDF:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudo generar la licencia PDF.",
      },
      {
        status: 500,
      },
    );
  }
}