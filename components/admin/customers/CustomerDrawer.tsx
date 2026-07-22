"use client";

import { X, Mail, User, DollarSign, ShoppingBag, Calendar } from "lucide-react";

import CustomerStatus from "./CustomerStatus";
import type { AdminCustomer } from "./types";

interface CustomerDrawerProps {
  customer: AdminCustomer | null;
  open: boolean;
  onClose: () => void;
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function CustomerDrawer({
  customer,
  open,
  onClose,
}: CustomerDrawerProps) {
  if (!open || !customer) return null;

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
      />

      <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-md border-l border-white/10 bg-[#0b0d12] shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 p-6">
          <h2 className="text-xl font-bold">
            Cliente
          </h2>

          <button
            onClick={onClose}
            className="rounded-lg p-2 transition hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-6 p-6">

          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold">
              {customer.customerName.charAt(0).toUpperCase()}
            </div>

            <div>
              <h3 className="text-xl font-bold">
                {customer.customerName}
              </h3>

              <CustomerStatus category={customer.category} />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border border-white/10 p-5">

            <div className="flex items-center gap-3">
              <Mail size={18} />
              <span>{customer.email}</span>
            </div>

            <div className="flex items-center gap-3">
              <User size={18} />
              <span>{customer.artistName || "Sin artista"}</span>
            </div>

            <div className="flex items-center gap-3">
              <ShoppingBag size={18} />
              <span>{customer.ordersCount} compras</span>
            </div>

            <div className="flex items-center gap-3">
              <DollarSign size={18} />
              <span>
                {formatMoney(
                  customer.totalSpent,
                  customer.currency,
                )}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Calendar size={18} />
              <span>
                Primera compra:
                {" "}
                {formatDate(customer.firstPurchaseAt)}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <Calendar size={18} />
              <span>
                Última compra:
                {" "}
                {formatDate(customer.lastPurchaseAt)}
              </span>
            </div>

          </div>

<div>
  <div className="mb-3 flex items-center justify-between">
    <h4 className="font-semibold">
      Historial de compras
    </h4>

    <span className="text-xs text-white/35">
      {customer.purchases.length}{" "}
      {customer.purchases.length === 1
        ? "producto"
        : "productos"}
    </span>
  </div>

  {customer.purchases.length === 0 ? (
    <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/40">
      Este cliente todavía no tiene compras pagadas.
    </div>
  ) : (
    <div className="space-y-3">
      {customer.purchases.map((purchase) => (
        <article
          key={purchase.id}
          className="rounded-xl border border-white/10 bg-white/[0.025] p-4"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-semibold">
                {purchase.beatTitle}
              </p>

              <p className="mt-1 text-sm text-blue-300/80">
                Licencia {purchase.license}
              </p>
            </div>

            <p className="shrink-0 font-semibold">
              {formatMoney(
                purchase.total,
                purchase.currency,
              )}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/40">
            <span>
              {formatDate(
                purchase.purchaseDate,
              )}
            </span>

            <span>
              {purchase.paymentProvider
                ? purchase.paymentProvider.toUpperCase()
                : "Pago no especificado"}
            </span>

            <span>
              {purchase.paymentStatus || "Sin estado"}
            </span>
          </div>
        </article>
      ))}
    </div>
  )}
</div>

        </div>
      </aside>
    </>
  );
}