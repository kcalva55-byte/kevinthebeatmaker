"use client";

import { useState } from "react";
import {
  Download,
  FileText,
  Loader2,
  Mail,
  Music2,
} from "lucide-react";

interface OrderActionsProps {
  orderId: string;
  beatId?: string | null;
  isPaid: boolean;
}

interface DownloadItem {
  beatId: string;
  beatTitle: string;
  licenseName: string;
  audioFormat: string;
  mp3Url: string | null;
  wavUrl: string | null;
  stemsUrl: string | null;
}

interface DownloadsResponse {
  error?: string;
  downloads?: DownloadItem[];
}

interface EmailResponse {
  success?: boolean;
  error?: string;
  sentTo?: string;
}

async function readJson<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    throw new Error(
      `El servidor devolvió una respuesta vacía. Código ${response.status}.`,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      `El servidor devolvió una respuesta inválida. Código ${response.status}.`,
    );
  }
}

export default function OrderActions({
  orderId,
  beatId,
  isPaid,
}: OrderActionsProps) {
  const [isLoadingDownloads, setIsLoadingDownloads] =
    useState(false);
  const [isSendingEmail, setIsSendingEmail] =
    useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function handleLicenseDownload() {
    setMessage("");
    setErrorMessage("");

    window.open(
      `/api/orders/${orderId}/license`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  async function handleDownloads() {
    setMessage("");
    setErrorMessage("");
    setIsLoadingDownloads(true);

    try {
      const response = await fetch(
        `/api/orders/${orderId}/downloads`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const result =
        await readJson<DownloadsResponse>(response);

      if (!response.ok || !result.downloads) {
        throw new Error(
          result.error ||
            "No fue posible generar las descargas.",
        );
      }

      const urls = result.downloads.flatMap((item) =>
        [
          item.mp3Url,
          item.wavUrl,
          item.stemsUrl,
        ].filter((url): url is string => Boolean(url)),
      );

      if (urls.length === 0) {
        throw new Error(
          "Este pedido no tiene archivos disponibles.",
        );
      }

      urls.forEach((url, index) => {
        window.setTimeout(() => {
          window.open(url, "_blank", "noopener,noreferrer");
        }, index * 250);
      });

      setMessage(
        `${urls.length} ${
          urls.length === 1 ? "archivo preparado" : "archivos preparados"
        } para descargar.`,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible generar las descargas.",
      );
    } finally {
      setIsLoadingDownloads(false);
    }
  }

  async function handleResendEmail() {
    setMessage("");
    setErrorMessage("");
    setIsSendingEmail(true);

    try {
      const response = await fetch(
        `/api/orders/${orderId}/email-delivery`,
        {
          method: "POST",
          cache: "no-store",
        },
      );

      const result =
        await readJson<EmailResponse>(response);

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "No fue posible reenviar el correo.",
        );
      }

      setMessage(
        result.sentTo
          ? `Correo enviado correctamente a ${result.sentTo}.`
          : "Correo enviado correctamente.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible reenviar el correo.",
      );
    } finally {
      setIsSendingEmail(false);
    }
  }

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.035]">
      <div className="border-b border-white/10 px-5 py-5">
        <h2 className="font-semibold">Acciones</h2>

        <p className="mt-1 text-sm leading-6 text-white/40">
          Gestiona la licencia, archivos y entrega del pedido.
        </p>
      </div>

      <div className="grid gap-3 p-5">
        <button
          type="button"
          onClick={handleLicenseDownload}
          disabled={!isPaid}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <FileText className="h-5 w-5" />
          Descargar licencia
        </button>

        <button
          type="button"
          onClick={handleDownloads}
          disabled={!isPaid || isLoadingDownloads}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isLoadingDownloads ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Download className="h-5 w-5" />
          )}

          {isLoadingDownloads
            ? "Preparando archivos..."
            : "Descargar archivos"}
        </button>

        <button
          type="button"
          onClick={handleResendEmail}
          disabled={!isPaid || isSendingEmail}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isSendingEmail ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Mail className="h-5 w-5" />
          )}

          {isSendingEmail
            ? "Enviando correo..."
            : "Reenviar correo"}
        </button>

        {beatId ? (
          <a
            href={`/admin/beats/${beatId}/edit`}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Music2 className="h-5 w-5" />
            Abrir beat
          </a>
        ) : null}

        {!isPaid ? (
          <p className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-xs leading-5 text-amber-200/75">
            Las acciones de entrega solo están disponibles para pedidos pagados.
          </p>
        ) : null}

        {message ? (
          <p className="rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-200">
            {message}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
            {errorMessage}
          </p>
        ) : null}
      </div>
    </section>
  );
}