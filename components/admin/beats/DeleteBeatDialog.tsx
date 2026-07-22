"use client";

import {
  AlertTriangle,
  Archive,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

interface DeleteBeatDialogProps {
  beatTitle: string;
  isOpen: boolean;
  isDeleting: boolean;
  isArchiving: boolean;
  hasOrders: boolean;
  errorMessage?: string;
  onCancel: () => void;
  onConfirmDelete: () => void;
  onArchive: () => void;
}

export default function DeleteBeatDialog({
  beatTitle,
  isOpen,
  isDeleting,
  isArchiving,
  hasOrders,
  errorMessage = "",
  onCancel,
  onConfirmDelete,
  onArchive,
}: DeleteBeatDialogProps) {
  if (!isOpen) {
    return null;
  }

  const isProcessing =
    isDeleting || isArchiving;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-beat-title"
    >
      <button
        type="button"
        aria-label="Cerrar diálogo"
        disabled={isProcessing}
        onClick={onCancel}
        className="absolute inset-0 cursor-default"
      />

      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0a0d13] shadow-2xl shadow-black/60">
        <div className="flex items-start justify-between gap-4 border-b border-white/10 p-5 sm:p-6">
          <div className="flex gap-4">
            <div
              className={[
                "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border",
                hasOrders
                  ? "border-amber-400/20 bg-amber-500/10"
                  : "border-red-400/20 bg-red-500/10",
              ].join(" ")}
            >
              {hasOrders ? (
                <Archive className="h-6 w-6 text-amber-300" />
              ) : (
                <AlertTriangle className="h-6 w-6 text-red-300" />
              )}
            </div>

            <div>
              <h2
                id="delete-beat-title"
                className="text-lg font-semibold text-white"
              >
                {hasOrders
                  ? "Beat protegido"
                  : "Eliminar beat"}
              </h2>

              <p className="mt-1 text-sm leading-6 text-white/45">
                {hasOrders
                  ? "Este beat tiene pedidos asociados."
                  : "Esta acción no se puede deshacer."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isProcessing}
            aria-label="Cerrar"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-white/40 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <p className="text-sm leading-6 text-white/60">
            {hasOrders ? (
              <>
                No puedes eliminar{" "}
                <strong className="font-semibold text-white">
                  “{beatTitle}”
                </strong>{" "}
                porque forma parte del historial de pedidos.
              </>
            ) : (
              <>
                ¿Seguro que deseas eliminar{" "}
                <strong className="font-semibold text-white">
                  “{beatTitle}”
                </strong>
                ?
              </>
            )}
          </p>

          <div
            className={[
              "mt-4 rounded-xl border px-4 py-3",
              hasOrders
                ? "border-amber-400/15 bg-amber-500/[0.07]"
                : "border-red-400/15 bg-red-500/[0.07]",
            ].join(" ")}
          >
            <p
              className={[
                "text-xs leading-5",
                hasOrders
                  ? "text-amber-200/70"
                  : "text-red-200/70",
              ].join(" ")}
            >
              {hasOrders
                ? "Puedes archivarlo para ocultarlo de la tienda sin perder ventas, pedidos ni descargas."
                : "Se eliminarán el registro, la portada, el MP3, el WAV y los STEMS asociados."}
            </p>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm leading-6 text-red-200">
              {errorMessage}
            </p>
          ) : null}

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onCancel}
              disabled={isProcessing}
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-white/60 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {hasOrders ? "Cerrar" : "Cancelar"}
            </button>

            {hasOrders ? (
              <button
                type="button"
                onClick={onArchive}
                disabled={isProcessing}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-amber-500 px-5 text-sm font-semibold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isArchiving ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Archive className="h-5 w-5" />
                )}

                {isArchiving
                  ? "Archivando..."
                  : "Archivar beat"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onConfirmDelete}
                disabled={isProcessing}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Trash2 className="h-5 w-5" />
                )}

                {isDeleting
                  ? "Eliminando..."
                  : "Eliminar beat"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}