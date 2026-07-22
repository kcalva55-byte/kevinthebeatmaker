"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Mail,
  Package,
  Search,
  User,
  XCircle,
} from "lucide-react";

export interface AdminOrder {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  artist_name: string | null;
  status: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  currency: string | null;
  subtotal: number | string | null;
  total: number | string | null;
  terms_accepted: boolean | null;
  paid_at: string | null;
  created_at: string;
  items_count: number;
}

interface OrdersManagerProps {
  initialOrders: AdminOrder[];
}

function formatMoney(
  value: number | string | null,
  currency: string | null,
) {
  const amount = Number(value ?? 0);

  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: currency || "USD",
    minimumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusLabel(status: string | null) {
  switch (status?.toLowerCase()) {
    case "paid":
    case "completed":
    case "approved":
      return "Pagado";

    case "pending":
    case "created":
      return "Pendiente";

    case "cancelled":
    case "canceled":
      return "Cancelado";

    case "failed":
      return "Fallido";

    case "refunded":
      return "Reembolsado";

    default:
      return status || "Sin estado";
  }
}

function getStatusClasses(status: string | null) {
  switch (status?.toLowerCase()) {
    case "paid":
    case "completed":
    case "approved":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";

    case "pending":
    case "created":
      return "border-amber-400/20 bg-amber-500/10 text-amber-300";

    case "cancelled":
    case "canceled":
    case "failed":
      return "border-red-400/20 bg-red-500/10 text-red-300";

    case "refunded":
      return "border-purple-400/20 bg-purple-500/10 text-purple-300";

    default:
      return "border-white/10 bg-white/5 text-white/50";
  }
}

function StatusIcon({
  status,
}: {
  status: string | null;
}) {
  switch (status?.toLowerCase()) {
    case "paid":
    case "completed":
    case "approved":
      return <CheckCircle2 className="h-3.5 w-3.5" />;

    case "cancelled":
    case "canceled":
    case "failed":
      return <XCircle className="h-3.5 w-3.5" />;

    default:
      return <Clock3 className="h-3.5 w-3.5" />;
  }
}

export default function OrdersManager({
  initialOrders,
}: OrdersManagerProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState("all");

  const statuses = useMemo(() => {
    return Array.from(
      new Set(
        initialOrders
          .map((order) => order.status?.trim().toLowerCase())
          .filter(
            (status): status is string => Boolean(status),
          ),
      ),
    ).sort();
  }, [initialOrders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return initialOrders.filter((order) => {
      const matchesSearch =
        !normalizedSearch ||
        order.id.toLowerCase().includes(normalizedSearch) ||
        order.customer_name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        order.customer_email
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        order.artist_name
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        order.payment_reference
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        order.status?.toLowerCase() === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [initialOrders, search, statusFilter]);

  const totalRevenue = useMemo(() => {
    return filteredOrders.reduce((total, order) => {
      const amount = Number(order.total ?? 0);

      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [filteredOrders]);

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <section className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-400">
          Ventas
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Pedidos
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
          Consulta las compras, pagos y productos adquiridos
          por tus clientes.
        </p>
      </section>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/40">
                Pedidos mostrados
              </p>

              <p className="mt-2 text-3xl font-bold">
                {filteredOrders.length}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
              <Package className="h-5 w-5 text-blue-400" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/40">
                Ingresos mostrados
              </p>

              <p className="mt-2 text-3xl font-bold">
                {formatMoney(totalRevenue, "USD")}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10">
              <CreditCard className="h-5 w-5 text-emerald-300" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-white/40">
                Productos vendidos
              </p>

              <p className="mt-2 text-3xl font-bold">
                {filteredOrders.reduce(
                  (total, order) =>
                    total + order.items_count,
                  0,
                )}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-500/10">
              <Package className="h-5 w-5 text-purple-300" />
            </div>
          </div>
        </article>
      </section>

      <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
        <div className="border-b border-white/10 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_220px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar por cliente, correo, artista, pedido o referencia..."
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
              className="h-12 rounded-xl border border-white/10 bg-[#0a0d13] px-4 text-sm text-white outline-none focus:border-blue-500/50"
            >
              <option value="all">
                Todos los estados
              </option>

              {statuses.map((status) => (
                <option key={status} value={status}>
                  {getStatusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <p className="text-sm text-white/40">
            {filteredOrders.length}{" "}
            {filteredOrders.length === 1
              ? "pedido"
              : "pedidos"}
          </p>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="flex min-h-80 items-center justify-center px-6 py-16 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Package className="h-7 w-7 text-white/25" />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                No se encontraron pedidos
              </h2>

              <p className="mt-2 text-sm text-white/40">
                Prueba con otra búsqueda o estado.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      Pedido
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      Cliente
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      Productos
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      Pago
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      Total
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      Estado
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      Fecha
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white/30">
                      Detalle
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredOrders.map((order) => (
                    <tr
                      key={order.id}
                      className="border-b border-white/[0.07] transition last:border-b-0 hover:bg-white/[0.025]"
                    >
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs font-semibold text-white/75">
                          #{order.id.slice(0, 8)}
                        </p>

                        {order.payment_reference ? (
                          <p className="mt-1 max-w-36 truncate text-xs text-white/30">
                            {order.payment_reference}
                          </p>
                        ) : null}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex items-start gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                            <User className="h-4 w-4 text-white/35" />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-52 truncate text-sm font-medium text-white">
                              {order.customer_name ||
                                "Cliente sin nombre"}
                            </p>

                            <p className="mt-1 flex max-w-52 items-center gap-1.5 truncate text-xs text-white/35">
                              <Mail className="h-3 w-3 shrink-0" />
                              {order.customer_email || "—"}
                            </p>

                            {order.artist_name ? (
                              <p className="mt-1 max-w-52 truncate text-xs text-blue-300/65">
                                Artista: {order.artist_name}
                              </p>
                            ) : null}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm text-white/65">
                          {order.items_count}{" "}
                          {order.items_count === 1
                            ? "beat"
                            : "beats"}
                        </p>
                      </td>

                      <td className="px-4 py-4">
                        <p className="text-sm capitalize text-white/65">
                          {order.payment_provider || "—"}
                        </p>

                        {order.paid_at ? (
                          <p className="mt-1 text-xs text-white/30">
                            Pagado
                          </p>
                        ) : null}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold">
                        {formatMoney(
                          order.total,
                          order.currency,
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={[
                            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
                            getStatusClasses(order.status),
                          ].join(" ")}
                        >
                          <StatusIcon status={order.status} />
                          {getStatusLabel(order.status)}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-white/45">
                        {formatDate(order.created_at)}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end">
                          <Link
                            href={`/admin/orders/${order.id}`}
                            aria-label={`Ver pedido ${order.id}`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/50 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-white/10 lg:hidden">
              {filteredOrders.map((order) => (
                <article
                  key={order.id}
                  className="p-4 sm:p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-semibold text-blue-300">
                        #{order.id.slice(0, 8)}
                      </p>

                      <h2 className="mt-2 font-semibold">
                        {order.customer_name ||
                          "Cliente sin nombre"}
                      </h2>

                      <p className="mt-1 text-xs text-white/35">
                        {order.customer_email || "—"}
                      </p>
                    </div>

                    <span
                      className={[
                        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                        getStatusClasses(order.status),
                      ].join(" ")}
                    >
                      <StatusIcon status={order.status} />
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs text-white/35">
                        Total
                      </p>

                      <p className="mt-1 font-semibold">
                        {formatMoney(
                          order.total,
                          order.currency,
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
                      <p className="text-xs text-white/35">
                        Productos
                      </p>

                      <p className="mt-1 font-semibold">
                        {order.items_count}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-xs text-white/35">
                      <CalendarDays className="h-4 w-4" />
                      {formatDate(order.created_at)}
                    </p>

                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 text-sm font-medium text-white/65"
                    >
                      Ver
                      <ChevronRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  );
}