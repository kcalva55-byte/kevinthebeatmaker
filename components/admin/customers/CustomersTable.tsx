"use client";

import { ChevronRight, Mail, User } from "lucide-react";

import CustomerStatus from "./CustomerStatus";
import type { AdminCustomer } from "./types";

interface CustomersTableProps {
  customers: AdminCustomer[];
  onSelectCustomer?: (
    customer: AdminCustomer,
  ) => void;
}

function formatMoney(
  value: number,
  currency: string,
) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function CustomersTable({
  customers,
  onSelectCustomer,
}: CustomersTableProps) {
  if (customers.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-white/[0.035]">
        <div className="flex min-h-[350px] items-center justify-center">
          <div className="text-center">
            <User className="mx-auto h-10 w-10 text-white/20" />

            <h2 className="mt-5 text-lg font-semibold">
              No hay clientes
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Todavía no existen compras registradas.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
      <div className="border-b border-white/10 px-5 py-4">
        <p className="text-sm text-white/40">
          {customers.length}{" "}
          {customers.length === 1
            ? "cliente"
            : "clientes"}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse">
          <thead>
            <tr className="border-b border-white/10 text-left">
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                Cliente
              </th>

              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                Artista
              </th>

              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                Compras
              </th>

              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                Gastado
              </th>

              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                Última compra
              </th>

              <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                Estado
              </th>

              <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white/30">
                Detalle
              </th>
            </tr>
          </thead>

          <tbody>
            {customers.map((customer) => (
              <tr
                key={customer.email}
                className="border-b border-white/[0.07] transition last:border-b-0 hover:bg-white/[0.025]"
              >
                <td className="px-5 py-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
                      <User className="h-4 w-4 text-white/35" />
                    </div>

                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {customer.customerName}
                      </p>

                      <p className="mt-1 flex items-center gap-1 text-xs text-white/35">
                        <Mail className="h-3 w-3" />
                        {customer.email}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <p className="text-sm text-blue-300/80">
                    {customer.artistName || "—"}
                  </p>
                </td>

                <td className="px-4 py-4">
                  {customer.ordersCount}
                </td>

                <td className="px-4 py-4 font-semibold">
                  {formatMoney(
                    customer.totalSpent,
                    customer.currency,
                  )}
                </td>

                <td className="px-4 py-4 text-white/50">
                  {formatDate(
                    customer.lastPurchaseAt,
                  )}
                </td>

                <td className="px-4 py-4">
                  <CustomerStatus
                    category={customer.category}
                  />
                </td>

                <td className="px-5 py-4 text-right">
                  <button
                    onClick={() =>
                      onSelectCustomer?.(
                        customer,
                      )
                    }
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/50 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}