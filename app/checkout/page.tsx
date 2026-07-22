"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  CreditCard,
  LockKeyhole,
  Mail,
  ShoppingBag,
  User,
} from "lucide-react";
import { type FormEvent, useState } from "react";

import { useCart } from "../../components/cart/CartProvider";
import PayPalCheckoutButton from "../../components/paypal/PayPalCheckoutButton";

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

type CompletedPayment = {
  internalOrderId: string;
  paypalOrderId: string;
  captureId?: string | null;
};

export default function CheckoutPage() {
  const {
    items,
    itemCount,
    total,
    removeItem,
    clearCart,
  } = useCart();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [artistName, setArtistName] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [completedPayment, setCompletedPayment] =
    useState<CompletedPayment | null>(null);
type DownloadItem = {
  beatId: string;
  beatTitle: string;
  licenseName: string;
  audioFormat: string;
  mp3Url: string | null;
  wavUrl: string | null;
  stemsUrl: string | null;
};

const [downloads, setDownloads] = useState<DownloadItem[]>([]);
const [downloadsError, setDownloadsError] = useState("");
  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setErrorMessage("");

    if (items.length === 0) {
      setErrorMessage(
        "Tu carrito está vacío. Agrega una licencia antes de continuar.",
      );
      return;
    }

    if (!name.trim() || !email.trim()) {
      setErrorMessage(
        "Completa tu nombre y correo electrónico.",
      );
      return;
    }

    if (!acceptedTerms) {
      setErrorMessage(
        "Debes aceptar los términos de compra y licencia.",
      );
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName: name.trim(),
          customerEmail: email.trim(),
          artistName: artistName.trim(),
          termsAccepted: acceptedTerms,
          licenseIds: items.map((item) => item.licenseId),
        }),
      });

      const result = (await response.json()) as {
        orderId?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.error || "No se pudo crear el pedido.",
        );
      }

      if (!result.orderId) {
        throw new Error(
          "No se recibió el identificador del pedido.",
        );
      }

      setOrderId(result.orderId);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo crear el pedido.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

async function handlePaymentCompleted(
  payment: CompletedPayment,
) {
  setErrorMessage("");
  setDownloadsError("");
  setCompletedPayment(payment);
  clearCart();

  try {
    const response = await fetch(
      `/api/orders/${payment.internalOrderId}/downloads`,
      {
        cache: "no-store",
      },
    );

    const result = (await response.json()) as {
      downloads?: DownloadItem[];
      error?: string;
    };

    if (!response.ok) {
      throw new Error(
        result.error ||
          "No se pudieron obtener los archivos.",
      );
    }

    setDownloads(result.downloads ?? []);
  } catch (error) {
    setDownloadsError(
      error instanceof Error
        ? error.message
        : "No se pudieron cargar las descargas.",
    );
  }
}
  if (completedPayment) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-[#030712] px-4 pb-20 pt-28 text-white sm:px-6 lg:px-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]"
        />

        <section className="relative mx-auto max-w-2xl rounded-[2rem] border border-emerald-500/20 bg-white/[0.035] px-6 py-14 text-center shadow-2xl backdrop-blur-xl sm:px-10">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
            <Check size={34} />
          </div>

          <p className="mt-7 text-sm font-black uppercase tracking-[0.25em] text-emerald-400">
            Pago completado
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em]">
            ¡Gracias por tu compra!
          </h1>

          <p className="mx-auto mt-4 max-w-lg leading-7 text-slate-400">
            PayPal confirmó el pago correctamente. Tu pedido quedó
            registrado y está listo para el proceso de entrega digital.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5 text-left">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Referencia del pedido
            </p>

            <p className="mt-2 break-all text-sm font-bold text-white">
              {completedPayment.internalOrderId}
            </p>

            <p className="mt-4 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
              Referencia de PayPal
            </p>
{downloads.length > 0 && (
  <div className="mt-8 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 text-left">
    <h3 className="text-lg font-black">
      Tus archivos
    </h3>

    <p className="mt-2 text-sm text-slate-300">
      Los enlaces estarán disponibles durante
      aproximadamente 60 minutos.
    </p>

    <div className="mt-5 space-y-4">
      {downloads.map((download) => (
        <div
          key={download.beatId}
          className="rounded-xl border border-white/10 bg-black/20 p-4"
        >
          <h4 className="font-bold">
            {download.beatTitle}
          </h4>

          <p className="mt-1 text-sm text-slate-400">
            {download.licenseName}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            {download.mp3Url && (
              <a
                href={download.mp3Url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-blue-600 px-5 py-2 text-sm font-bold transition hover:bg-blue-500"
              >
                Descargar MP3
              </a>
            )}

            {download.wavUrl && (
              <a
                href={download.wavUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-bold transition hover:bg-emerald-500"
              >
                Descargar WAV
              </a>
            )}

            {download.stemsUrl && (
              <a
                href={download.stemsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-violet-600 px-5 py-2 text-sm font-bold transition hover:bg-violet-500"
              >
                Descargar STEMS
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}

{downloadsError && (
  <div className="mt-6 rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4 text-sm text-yellow-200">
    {downloadsError}
  </div>
)}
            <p className="mt-2 break-all text-sm font-bold text-white">
              {completedPayment.paypalOrderId}
            </p>
          </div>

          <Link
            href="/beats"
            className="mt-8 inline-flex rounded-full bg-blue-600 px-7 py-3.5 font-black transition hover:bg-blue-500"
          >
            Volver a los beats
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#030712] px-4 pb-20 pt-28 text-white sm:px-6 lg:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-0 h-[480px] w-[760px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <Link
          href="/beats"
          className="mb-8 inline-flex items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white"
        >
          <ArrowLeft size={17} />
          Volver a los beats
        </Link>

        <div className="mb-10">
          <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-400">
            Compra segura
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
            Finalizar compra
          </h1>

          <p className="mt-4 max-w-2xl leading-7 text-slate-400">
            Completa tus datos para recibir los archivos del beat y el
            documento de licencia.
          </p>
        </div>

        {items.length === 0 ? (
          <section className="rounded-[2rem] border border-white/10 bg-white/[0.035] px-6 py-16 text-center backdrop-blur-xl">
            <div className="mx-auto grid h-20 w-20 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-blue-400">
              <ShoppingBag size={30} />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              Tu carrito está vacío
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-slate-400">
              Selecciona una licencia antes de acceder al proceso de compra.
            </p>

            <Link
              href="/beats"
              className="mt-7 inline-flex rounded-full bg-blue-600 px-7 py-3.5 font-black transition hover:bg-blue-500"
            >
              Explorar beats
            </Link>
          </section>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px]"
          >
            <section className="space-y-8">
              <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl sm:p-8">
                <div className="mb-7 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-600/15 text-blue-400">
                    <User size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Paso 1
                    </p>

                    <h2 className="text-xl font-black">
                      Información del cliente
                    </h2>
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-300">
                      Nombre completo
                    </span>

                    <div className="relative">
                      <User
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type="text"
                        value={name}
                        onChange={(event) =>
                          setName(event.target.value)
                        }
                        placeholder="Tu nombre"
                        autoComplete="name"
                        disabled={Boolean(orderId)}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </label>

                  <label className="block">
                    <span className="mb-2 block text-sm font-bold text-slate-300">
                      Correo electrónico
                    </span>

                    <div className="relative">
                      <Mail
                        size={18}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
                      />

                      <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                          setEmail(event.target.value)
                        }
                        placeholder="correo@ejemplo.com"
                        autoComplete="email"
                        disabled={Boolean(orderId)}
                        className="w-full rounded-2xl border border-white/10 bg-black/20 py-3.5 pl-12 pr-4 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                      />
                    </div>
                  </label>

                  <label className="block sm:col-span-2">
                    <span className="mb-2 block text-sm font-bold text-slate-300">
                      Nombre artístico
                    </span>

                    <input
                      type="text"
                      value={artistName}
                      onChange={(event) =>
                        setArtistName(event.target.value)
                      }
                      placeholder="Opcional"
                      disabled={Boolean(orderId)}
                      className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5 text-white outline-none transition placeholder:text-slate-600 focus:border-blue-500/70 focus:ring-4 focus:ring-blue-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                    />
                  </label>
                </div>
              </div>

              <div className="rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl sm:p-8">
                <div className="mb-7 flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-600/15 text-blue-400">
                    <CreditCard size={20} />
                  </div>

                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">
                      Paso 2
                    </p>

                    <h2 className="text-xl font-black">
                      Método de pago
                    </h2>
                  </div>
                </div>

                <div className="rounded-2xl border border-blue-500/40 bg-blue-500/10 p-5">
                  <div className="flex items-center gap-4">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-600 text-white">
                      <Check size={19} />
                    </div>

                    <div>
                      <h3 className="font-black">
                        PayPal
                      </h3>

                      <p className="mt-1 text-sm text-slate-400">
                        Paga de forma segura con tu cuenta PayPal o con
                        los métodos disponibles en la ventana de pago.
                      </p>
                    </div>
                  </div>
                </div>

                <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-black/20 p-4">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) =>
                      setAcceptedTerms(event.target.checked)
                    }
                    disabled={Boolean(orderId)}
                    className="mt-1 h-4 w-4 accent-blue-600 disabled:cursor-not-allowed"
                  />

                  <span className="text-sm leading-6 text-slate-400">
                    Confirmo que he revisado la licencia seleccionada y
                    acepto los términos de compra y uso del beat.
                  </span>
                </label>

                {errorMessage && (
                  <div
                    role="alert"
                    className="mt-5 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200"
                  >
                    {errorMessage}
                  </div>
                )}

                {orderId && (
                  <div className="mt-6 space-y-4">
                    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
                      <p className="text-sm font-bold text-emerald-300">
                        Pedido creado. Completa el pago con PayPal.
                      </p>

                      <p className="mt-1 break-all text-xs text-emerald-200/70">
                        Referencia: {orderId}
                      </p>
                    </div>

                    <PayPalCheckoutButton
                      internalOrderId={orderId}
                      total={total}
                      currency="USD"
                      onPaymentCompleted={handlePaymentCompleted}
                      onPaymentError={setErrorMessage}
                    />
                  </div>
                )}
              </div>
            </section>

            <aside className="h-fit rounded-[2rem] border border-white/10 bg-[#070c18]/95 p-6 shadow-2xl backdrop-blur-xl lg:sticky lg:top-28">
              <div className="flex items-center justify-between border-b border-white/10 pb-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                    Tu pedido
                  </p>

                  <h2 className="mt-1 text-2xl font-black">
                    Resumen
                  </h2>
                </div>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-slate-300">
                  {itemCount}{" "}
                  {itemCount === 1 ? "licencia" : "licencias"}
                </span>
              </div>

              <div className="max-h-[430px] space-y-4 overflow-y-auto py-5">
                {items.map((item) => (
                  <article
                    key={item.licenseId}
                    className="rounded-2xl border border-white/10 bg-white/[0.035] p-3"
                  >
                    <div className="flex gap-3">
                      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                        {item.beatCoverUrl ? (
                          <Image
                            src={item.beatCoverUrl}
                            alt={`Portada de ${item.beatTitle}`}
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-xs font-black text-slate-500">
                            KTB
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-black">
                              {item.beatTitle}
                            </h3>

                            <p className="mt-1 text-sm font-bold text-blue-400">
                              {item.licenseName}
                            </p>
                          </div>

                          <strong className="shrink-0 text-sm">
                            {formatPrice(item.price)}
                          </strong>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <span className="text-xs text-slate-500">
                            {item.audioFormat}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeItem(item.licenseId)
                            }
                            disabled={Boolean(orderId)}
                            className="text-xs font-bold text-slate-500 transition hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              <div className="space-y-3 border-t border-white/10 pt-5 text-sm">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>{formatPrice(total)}</span>
                </div>

                <div className="flex justify-between text-slate-400">
                  <span>Entrega digital</span>

                  <span className="font-bold text-emerald-400">
                    Gratis
                  </span>
                </div>

                <div className="flex items-end justify-between border-t border-white/10 pt-4">
                  <span className="font-bold">
                    Total
                  </span>

                  <strong className="text-3xl font-black tracking-[-0.04em]">
                    {formatPrice(total)}
                  </strong>
                </div>
              </div>

              {!orderId ? (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-4 font-black transition hover:bg-blue-500 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LockKeyhole size={18} />

                  {isSubmitting
                    ? "Creando pedido..."
                    : "Continuar al pago"}
                </button>
              ) : (
                <div className="mt-6 rounded-2xl border border-blue-500/20 bg-blue-500/10 p-4 text-center">
                  <p className="text-sm font-bold text-blue-200">
                    Usa el botón de PayPal en el paso 2 para completar
                    tu compra.
                  </p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <LockKeyhole size={13} />
                Compra protegida y entrega digital
              </div>
            </aside>
          </form>
        )}
      </div>
    </main>
  );
}