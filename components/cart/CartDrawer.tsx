"use client";

import {
  ArrowRight,
  Crown,
  FileAudio,
  LockKeyhole,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import { useCart } from "./CartProvider";

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

export default function CartDrawer() {
  const {
    items,
    itemCount,
    total,
    isOpen,
    closeCart,
    removeBeat,
    clearCart,
  } = useCart();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeCart();
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [isOpen, closeCart]);

  return (
    <>
      <div
        aria-hidden={!isOpen}
        onClick={closeCart}
        className={[
          "fixed inset-0 z-[80] bg-black/75 backdrop-blur-sm",
          "transition-opacity duration-300",
          isOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de compras"
        className={[
          "fixed right-0 top-0 z-[90] flex h-dvh w-full max-w-md flex-col",
          "border-l border-white/10 bg-[#050914]/98 shadow-2xl backdrop-blur-2xl",
          "transition-transform duration-300 ease-out",
          isOpen
            ? "translate-x-0"
            : "translate-x-full",
        ].join(" ")}
      >
        <header className="flex items-center justify-between border-b border-white/10 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-blue-400">
              KTB Studio
            </p>

            <div className="mt-1 flex items-center gap-3">
              <h2 className="text-2xl font-black text-white">
                Tu carrito
              </h2>

              {itemCount > 0 && (
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-600 px-2 text-xs font-bold text-white">
                  {itemCount}
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={closeCart}
            aria-label="Cerrar carrito"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-slate-300 transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <X size={20} />
          </button>
        </header>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <div className="grid h-20 w-20 place-items-center rounded-full border border-white/10 bg-white/[0.04] text-blue-400">
              <ShoppingBag size={30} />
            </div>

            <h3 className="mt-6 text-2xl font-black text-white">
              Tu carrito está vacío
            </h3>

            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-400">
              Escoge un beat y selecciona la licencia que
              mejor se adapte a tu proyecto.
            </p>

            <Link
              href="/#beats"
              onClick={closeCart}
              className="mt-7 rounded-full bg-blue-600 px-6 py-3 font-black text-white transition hover:bg-blue-500"
            >
              Explorar beats
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4 px-5 py-5 sm:px-6">
                {items.map((item) => (
                  <article
                    key={`${item.beatId}-${item.licenseId}`}
                    className="group rounded-3xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-white/15 hover:bg-white/[0.05]"
                  >
                    <div className="flex gap-4">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04]">
                        {item.beatCoverUrl ? (
                          <Image
                            src={item.beatCoverUrl}
                            alt={`Portada de ${item.beatTitle}`}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="grid h-full w-full place-items-center text-xs font-black text-slate-500">
                            KTB
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-black text-white">
                              {item.beatTitle}
                            </h3>

                            <p className="mt-1 truncate text-sm font-bold text-blue-400">
                              Licencia {item.licenseName}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeBeat(item.beatId)
                            }
                            aria-label={`Eliminar ${item.beatTitle} del carrito`}
                            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-white/10 text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                        <div className="mt-4 flex items-end justify-between gap-4">
                          <div className="space-y-1.5 text-xs text-slate-500">
                            <p className="flex items-center gap-1.5">
                              <FileAudio size={13} />
                              {item.audioFormat}
                            </p>

                            {item.exclusive && (
                              <p className="flex items-center gap-1.5 font-bold uppercase tracking-[0.12em] text-amber-400">
                                <Crown size={13} />
                                Licencia exclusiva
                              </p>
                            )}
                          </div>

                          <strong className="text-lg font-black text-white">
                            {formatPrice(item.price)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={clearCart}
                    className="text-sm font-bold text-slate-500 transition hover:text-red-400"
                  >
                    Vaciar carrito
                  </button>
                </div>
              </div>
            </div>

            <footer className="border-t border-white/10 bg-[#050914] px-5 py-5 sm:px-6">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-400">
                    Productos
                  </span>

                  <span className="font-semibold text-white">
                    {itemCount}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-400">
                    Entrega digital
                  </span>

                  <span className="font-semibold text-emerald-400">
                    Gratis
                  </span>
                </div>

                <div className="my-4 h-px bg-white/10" />

                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-300">
                    Total
                  </span>

                  <strong className="text-2xl font-black text-white">
                    {formatPrice(total)}
                  </strong>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={closeCart}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-4 font-black text-white transition hover:bg-blue-500"
              >
                Continuar al pago
                <ArrowRight size={18} />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                <LockKeyhole size={13} />

                <span>
                  Pago seguro y entrega digital
                </span>
              </div>

              <p className="mt-2 text-center text-xs leading-5 text-slate-600">
                Recibirás los archivos y la licencia después
                de confirmar el pago.
              </p>
            </footer>
          </>
        )}
      </aside>
    </>
  );
}