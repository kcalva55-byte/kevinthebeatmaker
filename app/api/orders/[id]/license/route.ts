import { NextResponse } from "next/server";
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFForm,
  type PDFPage,
} from "pdf-lib";

import { createAdminClient } from "../../../../../lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type LicenseKey =
  | "basic"
  | "premium"
  | "exclusive";

type BeatRelation = {
  bpm: number | string | null;
  musical_key: string | null;
};

type OrderItem = {
  id: string;
  beat_title: string | null;
  license_name: string | null;
  audio_format: string | null;
  unit_price: number | string | null;
  exclusive: boolean | null;
  beats:
    | BeatRelation
    | BeatRelation[]
    | null;
};

type LicenseValues = {
  beatTitle: string;
  buyerName: string;
  artistName: string;
  buyerEmail: string;
  buyerCountry: string;
  beatMeta: string;
  licenseId: string;
  pricePaid: string;
  purchaseDate: string;
  paymentReference: string;
  licenseLabel: string;
};

const TEMPLATE_FILES: Record<
  LicenseKey,
  string
> = {
  basic: "basic.pdf",
  premium: "premium.pdf",
  exclusive: "exclusive.pdf",
};

const LICENSE_LABELS: Record<
  LicenseKey,
  string
> = {
  basic: "BÁSICA",
  premium: "PREMIUM",
  exclusive: "EXCLUSIVA",
};

function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

/**
 * Evita errores de Helvetica con emojis
 * u otros caracteres no compatibles.
 */
function sanitizePdfText(
  value: unknown,
) {
  return String(value ?? "")
    .replace(/[^\u0020-\u00ff]/g, "")
    .trim();
}

function resolveLicenseKey(
  item: OrderItem,
): LicenseKey {
  const licenseName = normalizeText(
    item.license_name ?? "",
  );

  if (
    item.exclusive === true ||
    licenseName.includes("exclus")
  ) {
    return "exclusive";
  }

  if (licenseName.includes("premium")) {
    return "premium";
  }

  if (
    licenseName.includes("basica") ||
    licenseName.includes("basic")
  ) {
    return "basic";
  }

  throw new Error(
    `No se pudo reconocer la licencia "${item.license_name ?? "sin nombre"}".`,
  );
}

function getBeatRelation(
  relation: OrderItem["beats"],
) {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "es-EC",
    {
      dateStyle: "long",
      timeZone: "America/Guayaquil",
    },
  ).format(date);
}

function formatMoney(
  value: number | string | null,
  currency: string | null,
) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return `${currency || "USD"} 0.00`;
  }

  return `${currency || "USD"} ${amount.toFixed(2)}`;
}

function createLicenseId(
  orderId: string,
  itemId: string,
  purchaseDate: string | null,
) {
  const year = purchaseDate
    ? new Date(purchaseDate).getFullYear()
    : new Date().getFullYear();

  const cleanOrderId = orderId
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 8)
    .toUpperCase();

  const cleanItemId = itemId
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 4)
    .toUpperCase();

  return `KTB-${year}-${cleanOrderId}-${cleanItemId}`;
}

function setTextField(
  form: PDFForm,
  fieldName: string,
  value: string,
) {
  try {
    const field =
      form.getTextField(fieldName);

    field.setText(
      sanitizePdfText(value),
    );
  } catch {
    /*
     * Algunas plantillas pueden no tener
     * todos los campos. No detenemos la
     * generación por un campo opcional.
     */
  }
}

function fillFormFields(
  pdfDocument: PDFDocument,
  values: LicenseValues,
) {
  const form = pdfDocument.getForm();

  const availableFields = new Set(
    form
      .getFields()
      .map((field) => field.getName()),
  );

  /*
   * Estos campos deben existir para considerar
   * que la plantilla está correctamente preparada.
   */
  const requiredFields = [
    "buyer_full",
    "beat_name",
    "license_id",
    "price_paid",
    "purchase_date",
  ];

  const hasRequiredFields =
    requiredFields.every((fieldName) =>
      availableFields.has(fieldName),
    );

  if (!hasRequiredFields) {
    return false;
  }

  setTextField(
    form,
    "beat_cover",
    values.beatTitle,
  );

  setTextField(
    form,
    "buyer_cover",
    values.buyerName,
  );

  setTextField(
    form,
    "license_cover",
    values.licenseLabel,
  );

  setTextField(
    form,
    "date_cover",
    values.purchaseDate,
  );

  setTextField(
    form,
    "buyer_full",
    values.buyerName,
  );

  setTextField(
    form,
    "artist_name",
    values.artistName,
  );

  setTextField(
    form,
    "buyer_email",
    values.buyerEmail,
  );

  setTextField(
    form,
    "buyer_country",
    values.buyerCountry,
  );

  setTextField(
    form,
    "beat_name",
    values.beatTitle,
  );

  setTextField(
    form,
    "beat_meta",
    values.beatMeta,
  );

  setTextField(
    form,
    "license_id",
    values.licenseId,
  );

  setTextField(
    form,
    "price_paid",
    values.pricePaid,
  );

  setTextField(
    form,
    "purchase_date",
    values.purchaseDate,
  );

  setTextField(
    form,
    "payment_ref",
    values.paymentReference,
  );

  setTextField(
    form,
    "producer_sign_date",
    values.purchaseDate,
  );

  setTextField(
    form,
    "buyer_sign_date",
    "",
  );

  return true;
}

function fitTextToWidth(
  text: string,
  font: PDFFont,
  maxWidth: number,
  initialSize = 8.5,
) {
  const safeText =
    sanitizePdfText(text);

  let size = initialSize;

  while (
    size > 6 &&
    font.widthOfTextAtSize(
      safeText,
      size,
    ) > maxWidth
  ) {
    size -= 0.25;
  }

  if (
    font.widthOfTextAtSize(
      safeText,
      size,
    ) <= maxWidth
  ) {
    return {
      text: safeText,
      size,
    };
  }

  let shortened = safeText;

  while (
    shortened.length > 3 &&
    font.widthOfTextAtSize(
      `${shortened}...`,
      size,
    ) > maxWidth
  ) {
    shortened = shortened.slice(0, -1);
  }

  return {
    text: `${shortened}...`,
    size,
  };
}

function drawFieldValue(
  page: PDFPage,
  font: PDFFont,
  value: string,
  x: number,
  y: number,
  maxWidth: number,
) {
  const fitted = fitTextToWidth(
    value,
    font,
    maxWidth,
  );

  page.drawText(fitted.text, {
    x,
    y,
    size: fitted.size,
    font,
    color: rgb(
      0.94,
      0.96,
      1,
    ),
  });
}

/**
 * La plantilla exclusiva puede no contener
 * campos AcroForm. En ese caso se escriben
 * los datos directamente sobre las cajas.
 */
async function drawFallbackFields(
  pdfDocument: PDFDocument,
  values: LicenseValues,
) {
  const pages = pdfDocument.getPages();

  if (pages.length < 5) {
    throw new Error(
      "La plantilla debe contener cinco páginas.",
    );
  }

  const font =
    await pdfDocument.embedFont(
      StandardFonts.Helvetica,
    );

  const coverPage = pages[0];
  const detailsPage = pages[4];

  const coverHeight =
    coverPage.getHeight();

  drawFieldValue(
    coverPage,
    font,
    values.beatTitle,
    100,
    coverHeight - 330,
    390,
  );

  drawFieldValue(
    coverPage,
    font,
    values.buyerName,
    100,
    coverHeight - 379,
    390,
  );

  drawFieldValue(
    coverPage,
    font,
    values.licenseLabel,
    100,
    coverHeight - 428,
    390,
  );

  drawFieldValue(
    coverPage,
    font,
    values.purchaseDate,
    100,
    coverHeight - 477,
    390,
  );

  const leftX = 64;
  const rightX = 321;
  const fieldWidth = 210;

  const rowOne =
    detailsPage.getHeight() - 216;

  const rowTwo = rowOne - 51;
  const rowThree = rowTwo - 51;
  const rowFour = rowThree - 51;
  const rowFive = rowFour - 51;

  drawFieldValue(
    detailsPage,
    font,
    values.buyerName,
    leftX,
    rowOne,
    fieldWidth,
  );

  drawFieldValue(
    detailsPage,
    font,
    values.artistName,
    rightX,
    rowOne,
    fieldWidth,
  );

  drawFieldValue(
    detailsPage,
    font,
    values.buyerEmail,
    leftX,
    rowTwo,
    fieldWidth,
  );

  drawFieldValue(
    detailsPage,
    font,
    values.buyerCountry,
    rightX,
    rowTwo,
    fieldWidth,
  );

  drawFieldValue(
    detailsPage,
    font,
    values.beatTitle,
    leftX,
    rowThree,
    fieldWidth,
  );

  drawFieldValue(
    detailsPage,
    font,
    values.beatMeta,
    rightX,
    rowThree,
    fieldWidth,
  );

  drawFieldValue(
    detailsPage,
    font,
    values.licenseId,
    leftX,
    rowFour,
    fieldWidth,
  );

  drawFieldValue(
    detailsPage,
    font,
    values.pricePaid,
    rightX,
    rowFour,
    fieldWidth,
  );

  drawFieldValue(
    detailsPage,
    font,
    values.purchaseDate,
    leftX,
    rowFive,
    fieldWidth,
  );

  drawFieldValue(
    detailsPage,
    font,
    values.paymentReference,
    rightX,
    rowFive,
    fieldWidth,
  );

  drawFieldValue(
    detailsPage,
    font,
    values.purchaseDate,
    64,
    154,
    90,
  );
}

async function loadTemplate(
  requestUrl: string,
  licenseKey: LicenseKey,
) {
  const filename =
    TEMPLATE_FILES[licenseKey];

  const templateUrl = new URL(
    `/licenses/templates/${filename}`,
    requestUrl,
  );

  const response = await fetch(
    templateUrl,
    {
      cache: "force-cache",
    },
  );

  if (!response.ok) {
    throw new Error(
      `No se pudo cargar la plantilla ${filename}. Estado HTTP: ${response.status}.`,
    );
  }

  return new Uint8Array(
    await response.arrayBuffer(),
  );
}

export async function GET(
  request: Request,
  context: RouteContext,
) {
  try {
    const { id } =
      await context.params;

    const orderId = id?.trim();

    if (!orderId) {
      return NextResponse.json(
        {
          error:
            "Falta el identificador del pedido.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase =
      createAdminClient();

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
          paid_at,
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
          error:
            "No se pudo consultar el pedido.",
        },
        {
          status: 500,
        },
      );
    }

    if (!order) {
      return NextResponse.json(
        {
          error:
            "El pedido no existe.",
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
          exclusive,
          beats (
            bpm,
            musical_key
          )
        `,
      )
      .eq("order_id", orderId);

    if (itemsError) {
      console.error(
        "Error consultando las licencias:",
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

    const typedItems =
      (orderItems ?? []) as OrderItem[];

    if (typedItems.length === 0) {
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

    const finalPdf =
      await PDFDocument.create();

    const templateCache =
      new Map<
        LicenseKey,
        Uint8Array
      >();

    const purchaseTimestamp =
      order.paid_at ||
      order.created_at;

    const purchaseDate =
      formatDate(
        purchaseTimestamp,
      );

    for (
      let index = 0;
      index < typedItems.length;
      index += 1
    ) {
      const item = typedItems[index];

      const licenseKey =
        resolveLicenseKey(item);

      let templateBytes =
        templateCache.get(
          licenseKey,
        );

      if (!templateBytes) {
        templateBytes =
          await loadTemplate(
            request.url,
            licenseKey,
          );

        templateCache.set(
          licenseKey,
          templateBytes,
        );
      }

      const templatePdf =
        await PDFDocument.load(
          templateBytes,
        );

      const beat =
        getBeatRelation(
          item.beats,
        );

      const bpm =
        beat?.bpm != null &&
        String(beat.bpm).trim()
          ? `${beat.bpm} BPM`
          : "";

      const musicalKey =
        beat?.musical_key?.trim() ||
        "";

      const beatMeta = [
        bpm,
        musicalKey,
      ]
        .filter(Boolean)
        .join(" / ");

      const paymentProvider =
        String(
          order.payment_provider ||
            "PayPal",
        ).toUpperCase();

      const paymentReference =
        order.payment_reference
          ? `${paymentProvider} - ${order.payment_reference}`
          : paymentProvider;

      const values: LicenseValues = {
        beatTitle:
          item.beat_title ||
          "Beat sin título",

        buyerName:
          order.customer_name ||
          "Comprador",

        artistName:
          order.artist_name || "",

        buyerEmail:
          order.customer_email || "",

        buyerCountry: "",

        beatMeta,

        licenseId:
          createLicenseId(
            order.id,
            item.id,
            purchaseTimestamp,
          ),

        pricePaid:
          formatMoney(
            item.unit_price,
            order.currency,
          ),

        purchaseDate,

        paymentReference,

        licenseLabel:
          LICENSE_LABELS[
            licenseKey
          ],
      };

      const hasFillableForm =
        fillFormFields(
          templatePdf,
          values,
        );

      if (hasFillableForm) {
        const form =
          templatePdf.getForm();

        const appearanceFont =
          await templatePdf.embedFont(
            StandardFonts.Helvetica,
          );

        form.updateFieldAppearances(
          appearanceFont,
        );

        /*
         * Convierte los campos rellenados
         * en contenido permanente.
         */
        form.flatten();
      } else {
        await drawFallbackFields(
          templatePdf,
          values,
        );
      }

      const copiedPages =
        await finalPdf.copyPages(
          templatePdf,
          templatePdf.getPageIndices(),
        );

      for (const copiedPage of copiedPages) {
        finalPdf.addPage(
          copiedPage,
        );
      }
    }

    finalPdf.setTitle(
      `Licencias KTB - Pedido ${order.id}`,
    );

    finalPdf.setAuthor(
      "Kevin The Beatmaker | KTB Studio",
    );

    finalPdf.setSubject(
      "Licencias de uso de beats",
    );

    finalPdf.setCreator(
      "KTB Studio Licensing System",
    );

    finalPdf.setProducer(
      "KTB Studio",
    );

    finalPdf.setCreationDate(
      new Date(),
    );

    const pdfBytes =
      await finalPdf.save();

    return new NextResponse(
      Buffer.from(pdfBytes),
      {
        status: 200,
        headers: {
          "Content-Type":
            "application/pdf",

          "Content-Disposition":
            `attachment; filename="licencias-ktb-${order.id}.pdf"`,

          "Cache-Control":
            "private, no-store, max-age=0",
        },
      },
    );
  } catch (error) {
    console.error(
      "Error generando las licencias:",
      error,
    );

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "No se pudieron generar las licencias.",
      },
      {
        status: 500,
      },
    );
  }
}