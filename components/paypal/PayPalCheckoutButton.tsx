"use client";

import { useState } from "react";
import {
  PayPalButtons,
  usePayPalScriptReducer,
} from "@paypal/react-paypal-js";

type PayPalCheckoutButtonProps = {
  internalOrderId: string;
  total: number;
  currency?: string;
  disabled?: boolean;
  onPaymentCompleted: (data: {
    internalOrderId: string;
    paypalOrderId: string;
    captureId?: string | null;
  }) => void | Promise<void>;
  onPaymentError?: (message: string) => void;
};

type CreateOrderResponse = {
  id?: string;
  status?: string;
  error?: string;
  details?: unknown;
};

type CaptureOrderResponse = {
  success?: boolean;
  internalOrderId?: string;
  paypalOrderId?: string;
  captureId?: string | null;
  status?: string;
  error?: string;
  details?: unknown;
};

export default function PayPalCheckoutButton({
  internalOrderId,
  total,
  currency = "USD",
  disabled = false,
  onPaymentCompleted,
  onPaymentError,
}: PayPalCheckoutButtonProps) {
  const [{ isPending, isRejected }] = usePayPalScriptReducer();

  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const normalizedTotal = Number(total);
  const normalizedCurrency = currency.trim().toUpperCase();

  function reportError(message: string) {
    setErrorMessage(message);
    onPaymentError?.(message);
  }

  if (isPending) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
        <p className="text-center text-sm text-zinc-300">
          Cargando PayPal...
        </p>
      </div>
    );
  }

  if (isRejected) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
        <p className="text-sm text-red-300">
          No se pudo cargar PayPal. Verifica tu Client ID y reinicia el
          servidor.
        </p>
      </div>
    );
  }

  if (!internalOrderId) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-5">
        <p className="text-sm text-amber-200">
          Primero debes crear la orden de compra.
        </p>
      </div>
    );
  }

  if (
    !Number.isFinite(normalizedTotal) ||
    normalizedTotal <= 0
  ) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5">
        <p className="text-sm text-red-300">
          El total de la compra no es válido.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {isProcessing && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 px-4 py-3">
          <p className="text-center text-sm text-blue-200">
            Procesando el pago. No cierres esta página...
          </p>
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3"
        >
          <p className="text-sm text-red-300">
            {errorMessage}
          </p>
        </div>
      )}

      <div
        className={
          disabled || isProcessing
            ? "pointer-events-none opacity-60"
            : ""
        }
      >
        <PayPalButtons
          forceReRender={[
            internalOrderId,
            normalizedTotal,
            normalizedCurrency,
          ]}
          disabled={disabled || isProcessing}
          style={{
            layout: "vertical",
            shape: "rect",
            label: "paypal",
            height: 48,
          }}
          createOrder={async () => {
            setErrorMessage("");

            try {
              const response = await fetch(
                "/api/paypal/create-order",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    orderId: internalOrderId,
                    total: normalizedTotal,
                    currency: normalizedCurrency,
                  }),
                }
              );

              const data =
                (await response.json()) as CreateOrderResponse;

              if (!response.ok || !data.id) {
                throw new Error(
                  data.error ||
                    "No se pudo crear la orden de PayPal."
                );
              }

              return data.id;
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Ocurrió un error creando la orden de PayPal.";

              reportError(message);
              throw error;
            }
          }}
          onApprove={async (data) => {
            setIsProcessing(true);
            setErrorMessage("");

            try {
              if (!data.orderID) {
                throw new Error(
                  "PayPal no devolvió el identificador del pago."
                );
              }

              const response = await fetch(
                "/api/paypal/capture-order",
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    paypalOrderId: data.orderID,
                    internalOrderId,
                  }),
                }
              );

              const captureData =
                (await response.json()) as CaptureOrderResponse;

              if (!response.ok || !captureData.success) {
                throw new Error(
                  captureData.error ||
                    "No se pudo confirmar el pago de PayPal."
                );
              }

              await onPaymentCompleted({
                internalOrderId:
                  captureData.internalOrderId ||
                  internalOrderId,
                paypalOrderId:
                  captureData.paypalOrderId ||
                  data.orderID,
                captureId: captureData.captureId ?? null,
              });
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Ocurrió un error procesando el pago.";

              reportError(message);
            } finally {
              setIsProcessing(false);
            }
          }}
          onCancel={() => {
            setIsProcessing(false);

            reportError(
              "El pago fue cancelado. No se realizó ningún cobro."
            );
          }}
          onError={(error) => {
            console.error("Error de PayPal:", error);

            setIsProcessing(false);

            reportError(
              "PayPal no pudo procesar el pago. Inténtalo nuevamente."
            );
          }}
        />
      </div>

      <p className="text-center text-xs leading-5 text-zinc-500">
        El pago se procesa de forma segura mediante PayPal. KTB
        Studio no almacena los datos de tu tarjeta.
      </p>
    </div>
  );
}