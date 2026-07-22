import { NextResponse } from "next/server";

import { createClient } from "../../../lib/supabase/server";

type CreateOrderBody = {
  customerName?: string;
  customerEmail?: string;
  artistName?: string;
  termsAccepted?: boolean;
  licenseIds?: string[];
};

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as CreateOrderBody;

    const customerName =
      body.customerName?.trim() ?? "";

    const customerEmail =
      body.customerEmail
        ?.trim()
        .toLowerCase() ?? "";

    const artistName =
      body.artistName?.trim() ?? "";

    const termsAccepted =
      body.termsAccepted === true;

    const licenseIds = Array.isArray(
      body.licenseIds,
    )
      ? body.licenseIds.filter(
          (
            licenseId,
          ): licenseId is string =>
            typeof licenseId === "string" &&
            licenseId.trim().length > 0,
        )
      : [];

    if (!customerName) {
      return NextResponse.json(
        {
          error:
            "El nombre del cliente es obligatorio.",
        },
        {
          status: 400,
        },
      );
    }

    if (!customerEmail) {
      return NextResponse.json(
        {
          error:
            "El correo electrónico es obligatorio.",
        },
        {
          status: 400,
        },
      );
    }

    if (!termsAccepted) {
      return NextResponse.json(
        {
          error:
            "Debes aceptar los términos de compra.",
        },
        {
          status: 400,
        },
      );
    }

    if (licenseIds.length === 0) {
      return NextResponse.json(
        {
          error:
            "El pedido no contiene licencias.",
        },
        {
          status: 400,
        },
      );
    }

    const uniqueLicenseIds = [
      ...new Set(licenseIds),
    ];

    if (
      uniqueLicenseIds.length !==
      licenseIds.length
    ) {
      return NextResponse.json(
        {
          error:
            "El pedido contiene licencias duplicadas.",
        },
        {
          status: 400,
        },
      );
    }

    const supabase = await createClient();

    const {
      data: orderId,
      error,
    } = await supabase.rpc(
      "create_pending_order",
      {
        p_customer_name: customerName,
        p_customer_email: customerEmail,
        p_artist_name:
          artistName.length > 0
            ? artistName
            : null,
        p_terms_accepted: termsAccepted,
        p_license_ids: uniqueLicenseIds,
      },
    );

    if (error) {
      console.error(
        "No se pudo crear el pedido:",
        error,
      );

      return NextResponse.json(
        {
          error:
            error.message ||
            "No se pudo crear el pedido.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof orderId !== "string" ||
      orderId.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "Supabase no devolvió el identificador del pedido.",
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(
      {
        orderId,
        status: "pending",
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error(
      "Error inesperado al crear el pedido:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Ocurrió un error inesperado al procesar el pedido.",
      },
      {
        status: 500,
      },
    );
  }
}