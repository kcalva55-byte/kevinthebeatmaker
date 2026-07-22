import { NextResponse } from "next/server";
import { createAdminClient } from "../../../../lib/supabase/admin";
type CaptureOrderBody = {
  paypalOrderId: string;
  internalOrderId: string;
};

type PayPalCapture = {
  id?: string;
  status?: string;
  amount?: {
    currency_code?: string;
    value?: string;
  };
};

type PayPalCaptureResponse = {
  id?: string;
  status?: string;
  purchase_units?: Array<{
    reference_id?: string;
    custom_id?: string;
    payments?: {
      captures?: PayPalCapture[];
    };
  }>;
  payer?: {
    email_address?: string;
    name?: {
      given_name?: string;
      surname?: string;
    };
  };
};

function getPayPalBaseUrl() {
  return process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";
}

async function getPayPalAccessToken() {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      "Faltan NEXT_PUBLIC_PAYPAL_CLIENT_ID o PAYPAL_CLIENT_SECRET."
    );
  }

  const credentials = Buffer.from(
    `${clientId}:${clientSecret}`
  ).toString("base64");

  const response = await fetch(
    `${getPayPalBaseUrl()}/v1/oauth2/token`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      cache: "no-store",
    }
  );

  const data = await response.json();

  if (!response.ok || !data.access_token) {
    console.error("Error obteniendo token de PayPal:", data);

    throw new Error(
      data.error_description ||
        "No se pudo obtener el token de acceso de PayPal."
    );
  }

  return data.access_token as string;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CaptureOrderBody;

    const paypalOrderId = body.paypalOrderId?.trim();
    const internalOrderId = body.internalOrderId?.trim();

    if (!paypalOrderId) {
      return NextResponse.json(
        {
          error: "Falta el identificador de la orden de PayPal.",
        },
        {
          status: 400,
        }
      );
    }

    if (!internalOrderId) {
      return NextResponse.json(
        {
          error: "Falta el identificador de la orden interna.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = createAdminClient();

    const { data: internalOrder, error: orderError } = await supabase
      .from("orders")
      .select(
        `
          id,
          status,
          total,
          currency,
          payment_reference
        `
      )
      .eq("id", internalOrderId)
      .maybeSingle();

    if (orderError) {
      console.error("Error consultando la orden:", orderError);

      return NextResponse.json(
        {
          error: "No se pudo consultar la orden interna.",
        },
        {
          status: 500,
        }
      );
    }

    if (!internalOrder) {
      return NextResponse.json(
        {
          error: "La orden interna no existe.",
        },
        {
          status: 404,
        }
      );
    }

    if (internalOrder.status === "paid") {
      return NextResponse.json({
        success: true,
        alreadyCaptured: true,
        internalOrderId: internalOrder.id,
        paypalOrderId:
          internalOrder.payment_reference || paypalOrderId,
      });
    }

    const accessToken = await getPayPalAccessToken();

    const paypalResponse = await fetch(
      `${getPayPalBaseUrl()}/v2/checkout/orders/${paypalOrderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "PayPal-Request-Id": `capture-${paypalOrderId}`,
        },
        body: JSON.stringify({}),
        cache: "no-store",
      }
    );

    const paypalOrder =
      (await paypalResponse.json()) as PayPalCaptureResponse;

    if (!paypalResponse.ok) {
      console.error(
        "Error capturando la orden de PayPal:",
        paypalOrder
      );

      return NextResponse.json(
        {
          error:
            (paypalOrder as { message?: string })?.message ||
            "No se pudo capturar el pago de PayPal.",
          details:
            (paypalOrder as { details?: unknown })?.details ?? null,
        },
        {
          status: paypalResponse.status,
        }
      );
    }

    const purchaseUnit = paypalOrder.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];

    const paypalStatus = paypalOrder.status;
    const captureStatus = capture?.status;
    const capturedAmount = Number(capture?.amount?.value);
    const capturedCurrency =
      capture?.amount?.currency_code?.toUpperCase();

    const expectedAmount = Number(internalOrder.total);
    const expectedCurrency = String(
      internalOrder.currency || "USD"
    ).toUpperCase();

    if (
      paypalStatus !== "COMPLETED" ||
      captureStatus !== "COMPLETED"
    ) {
      return NextResponse.json(
        {
          error: "PayPal no confirmó el pago como completado.",
          paypalStatus,
          captureStatus,
        },
        {
          status: 409,
        }
      );
    }

    if (
      !Number.isFinite(capturedAmount) ||
      capturedAmount !== expectedAmount
    ) {
      console.error("El monto capturado no coincide:", {
        capturedAmount,
        expectedAmount,
      });

      return NextResponse.json(
        {
          error:
            "El monto capturado por PayPal no coincide con la orden.",
        },
        {
          status: 409,
        }
      );
    }

    if (capturedCurrency !== expectedCurrency) {
      console.error("La moneda capturada no coincide:", {
        capturedCurrency,
        expectedCurrency,
      });

      return NextResponse.json(
        {
          error:
            "La moneda capturada por PayPal no coincide con la orden.",
        },
        {
          status: 409,
        }
      );
    }

    if (
      purchaseUnit?.reference_id &&
      purchaseUnit.reference_id !== internalOrderId
    ) {
      return NextResponse.json(
        {
          error:
            "La referencia de PayPal no coincide con la orden interna.",
        },
        {
          status: 409,
        }
      );
    }

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_provider: "paypal",
        payment_reference: paypalOrderId,
      })
      .eq("id", internalOrderId)
      .eq("status", "pending");

    if (updateError) {
      console.error(
        "Error actualizando la orden como pagada:",
        updateError
      );

      return NextResponse.json(
        {
          error:
            "El pago se completó, pero no se pudo actualizar la orden.",
        },
        {
          status: 500,
        }
      );
    }

    return NextResponse.json({
      success: true,
      internalOrderId,
      paypalOrderId,
      captureId: capture?.id ?? null,
      status: paypalStatus,
      payerEmail: paypalOrder.payer?.email_address ?? null,
    });
  } catch (error) {
    console.error("Error en capture-order:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Ocurrió un error inesperado.",
      },
      {
        status: 500,
      }
    );
  }
}