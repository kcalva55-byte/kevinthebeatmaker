import { NextResponse } from "next/server";

type CreatePayPalOrderBody = {
  orderId: string;
  total: number;
  currency?: string;
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
    const body = (await request.json()) as CreatePayPalOrderBody;

    const orderId = body.orderId?.trim();
    const total = Number(body.total);
    const currency = body.currency?.trim().toUpperCase() || "USD";

    if (!orderId) {
      return NextResponse.json(
        {
          error: "Falta el identificador de la orden interna.",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isFinite(total) || total <= 0) {
      return NextResponse.json(
        {
          error: "El total de la orden no es válido.",
        },
        {
          status: 400,
        }
      );
    }

    const accessToken = await getPayPalAccessToken();

    const paypalResponse = await fetch(
      `${getPayPalBaseUrl()}/v2/checkout/orders`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
          "PayPal-Request-Id": orderId,
        },
        body: JSON.stringify({
          intent: "CAPTURE",
          purchase_units: [
            {
              reference_id: orderId,
              custom_id: orderId,
              description: "Compra de licencia musical en KTB Studio",
              amount: {
                currency_code: currency,
                value: total.toFixed(2),
              },
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                user_action: "PAY_NOW",
                shipping_preference: "NO_SHIPPING",
              },
            },
          },
        }),
        cache: "no-store",
      }
    );

    const paypalOrder = await paypalResponse.json();

    if (!paypalResponse.ok) {
      console.error(
        "Error creando orden de PayPal:",
        paypalOrder
      );

      return NextResponse.json(
        {
          error:
            paypalOrder?.message ||
            "No se pudo crear la orden de PayPal.",
          details: paypalOrder?.details ?? null,
        },
        {
          status: paypalResponse.status,
        }
      );
    }

    return NextResponse.json({
      id: paypalOrder.id,
      status: paypalOrder.status,
    });
  } catch (error) {
    console.error("Error en create-order:", error);

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