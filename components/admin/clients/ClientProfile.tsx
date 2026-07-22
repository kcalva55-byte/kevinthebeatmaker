import Link from "next/link";

import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Mail,
  Music2,
  Package,
  ShoppingBag,
  UserRound,
} from "lucide-react";

export interface ClientOrder {
  id: string;
  status: string;
  total: number;
  subtotal: number;
  currency: string;
  paymentProvider: string | null;
  paymentReference: string | null;
  createdAt: string;
  paidAt: string | null;
  products: Array<{
    id: string;
    beatId: string | null;
    beatTitle: string;
    licenseName: string;
    audioFormat: string;
    unitPrice: number;
    exclusive: boolean;
  }>;
}

export interface ClientProfileData {
  name: string;
  email: string;
  artistName: string | null;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  currency: string;
  firstOrderAt: string;
  lastOrderAt: string;
  orders: ClientOrder[];
}

interface ClientProfileProps {
  client: ClientProfileData;
}

function formatMoney(
  value: number,
  currency = "USD",
) {
  const safeValue = Number.isFinite(value)
    ? value
    : 0;

  if (currency.toUpperCase() === "USD") {
    return `$${safeValue.toFixed(2)}`;
  }

  return `${currency.toUpperCase()} ${safeValue.toFixed(2)}`;
}

function formatDate(value: string | null) {
  if (!value) {
    return "No disponible";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "No disponible";
  }

  const months = [
    "ene",
    "feb",
    "mar",
    "abr",
    "may",
    "jun",
    "jul",
    "ago",
    "sep",
    "oct",
    "nov",
    "dic",
  ];

  const day = String(date.getDate()).padStart(
    2,
    "0",
  );

  const month =
    months[date.getMonth()] ?? "";

  const year = date.getFullYear();

  const hours = String(
    date.getHours(),
  ).padStart(2, "0");

  const minutes = String(
    date.getMinutes(),
  ).padStart(2, "0");

  return `${day} ${month} ${year} · ${hours}:${minutes}`;
}

function getInitials(value: string) {
  const words = value
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) {
    return "C";
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase();
}

function getStatusLabel(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
    case "approved":
    case "completed":
      return "Pagado";

    case "pending":
    case "created":
      return "Pendiente";

    case "refunded":
      return "Reembolsado";

    case "failed":
      return "Fallido";

    case "cancelled":
    case "canceled":
      return "Cancelado";

    default:
      return status || "Sin estado";
  }
}

function getStatusClasses(status: string) {
  switch (status.toLowerCase()) {
    case "paid":
    case "approved":
    case "completed":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";

    case "pending":
    case "created":
      return "border-amber-400/20 bg-amber-500/10 text-amber-300";

    case "refunded":
      return "border-purple-400/20 bg-purple-500/10 text-purple-300";

    case "failed":
    case "cancelled":
    case "canceled":
      return "border-red-400/20 bg-red-500/10 text-red-300";

    default:
      return "border-white/10 bg-white/[0.04] text-white/45";
  }
}

function getClientCategory(
  client: ClientProfileData,
) {
  if (client.totalSpent >= 300) {
    return {
      label: "Cliente VIP",
      classes:
        "border-amber-400/20 bg-amber-500/10 text-amber-300",
    };
  }

  if (client.paidOrders >= 2) {
    return {
      label: "Cliente recurrente",
      classes:
        "border-blue-400/20 bg-blue-500/10 text-blue-300",
    };
  }

  if (client.paidOrders >= 1) {
    return {
      label: "Comprador",
      classes:
        "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
    };
  }

  return {
    label: "Prospecto",
    classes:
      "border-white/10 bg-white/[0.04] text-white/40",
  };
}

export default function ClientProfile({
  client,
}: ClientProfileProps) {
  const category =
    getClientCategory(client);

  return (
    <div className="mx-auto w-full max-w-[1540px]">
      <Link
        href="/admin/clients"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-white/45 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a clientes
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] px-5 py-6 sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="flex min-w-0 items-center gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-xl font-bold text-blue-300 sm:h-20 sm:w-20 sm:text-2xl">
              {getInitials(client.name)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="truncate text-2xl font-bold tracking-tight sm:text-4xl">
                  {client.name}
                </h1>

                <span
                  className={[
                    "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                    category.classes,
                  ].join(" ")}
                >
                  {category.label}
                </span>
              </div>

              <p className="mt-3 flex items-center gap-2 truncate text-sm text-white/40">
                <Mail className="h-4 w-4 shrink-0" />
                {client.email}
              </p>

              {client.artistName ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-blue-300/70">
                  <Music2 className="h-4 w-4" />
                  Artista: {client.artistName}
                </p>
              ) : null}
            </div>
          </div>

          <a
            href={`mailto:${client.email}`}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500"
          >
            <Mail className="h-4 w-4" />
            Enviar correo
          </a>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/40">
                Gasto total
              </p>

              <p className="mt-3 text-3xl font-bold text-emerald-300">
                {formatMoney(
                  client.totalSpent,
                  client.currency,
                )}
              </p>

              <p className="mt-4 text-xs text-white/30">
                Pedidos pagados
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-emerald-400/15 bg-emerald-500/10">
              <CircleDollarSign className="h-5 w-5 text-emerald-300" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/40">
                Pedidos totales
              </p>

              <p className="mt-3 text-3xl font-bold">
                {client.totalOrders}
              </p>

              <p className="mt-4 text-xs text-white/30">
                {client.paidOrders} pagados
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10">
              <ShoppingBag className="h-5 w-5 text-blue-300" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/40">
                Ticket promedio
              </p>

              <p className="mt-3 text-3xl font-bold">
                {formatMoney(
                  client.averageOrderValue,
                  client.currency,
                )}
              </p>

              <p className="mt-4 text-xs text-white/30">
                Por compra pagada
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10">
              <Package className="h-5 w-5 text-violet-300" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/40">
                Pedidos pendientes
              </p>

              <p className="mt-3 text-3xl font-bold">
                {client.pendingOrders}
              </p>

              <p className="mt-4 text-xs text-white/30">
                Aún no completados
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-500/10">
              <Clock3 className="h-5 w-5 text-amber-300" />
            </div>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
        <aside className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-5">
              <h2 className="font-semibold">
                Información del cliente
              </h2>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/30">
                  Nombre
                </p>

                <p className="mt-2 font-medium">
                  {client.name}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/30">
                  Correo electrónico
                </p>

                <p className="mt-2 break-all text-sm text-white/65">
                  {client.email}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-white/30">
                  Nombre artístico
                </p>

                <p className="mt-2 text-sm text-white/65">
                  {client.artistName ||
                    "No especificado"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-white/[0.025]">
            <div className="border-b border-white/10 px-5 py-5">
              <h2 className="font-semibold">
                Actividad
              </h2>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/30">
                  <CalendarDays className="h-4 w-4" />
                  Primera compra
                </p>

                <p className="mt-2 text-sm text-white/65">
                  {formatDate(
                    client.firstOrderAt,
                  )}
                </p>
              </div>

              <div>
                <p className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/30">
                  <CalendarDays className="h-4 w-4" />
                  Última compra
                </p>

                <p className="mt-2 text-sm text-white/65">
                  {formatDate(
                    client.lastOrderAt,
                  )}
                </p>
              </div>
            </div>
          </section>
        </aside>

        <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <div className="border-b border-white/10 px-5 py-5 sm:px-6">
            <h2 className="text-lg font-semibold">
              Historial de pedidos
            </h2>

            <p className="mt-1 text-sm text-white/35">
              Todos los pedidos registrados para este cliente.
            </p>
          </div>

          {client.orders.length === 0 ? (
            <div className="px-6 py-20 text-center">
              <Package className="mx-auto h-11 w-11 text-white/15" />

              <p className="mt-4 text-sm text-white/35">
                Este cliente no tiene pedidos.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {client.orders.map((order) => (
                <article
                  key={order.id}
                  className="p-5 sm:p-6"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="font-mono text-xs text-white/45">
                          #{order.id.slice(0, 8)}
                        </p>

                        <span
                          className={[
                            "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                            getStatusClasses(
                              order.status,
                            ),
                          ].join(" ")}
                        >
                          {getStatusLabel(
                            order.status,
                          )}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-white/35">
                        {formatDate(
                          order.createdAt,
                        )}
                      </p>
                    </div>

                    <div className="text-left sm:text-right">
                      <p className="text-lg font-bold">
                        {formatMoney(
                          order.total,
                          order.currency,
                        )}
                      </p>

                      <p className="mt-1 text-xs text-white/30">
                        {order.products.length}{" "}
                        {order.products.length === 1
                          ? "producto"
                          : "productos"}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {order.products.map(
                      (product) => (
                        <div
                          key={product.id}
                          className="flex flex-col justify-between gap-3 rounded-2xl border border-white/10 bg-black/15 p-4 sm:flex-row sm:items-center"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10">
                              <Music2 className="h-4 w-4 text-blue-300" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">
                                {
                                  product.beatTitle
                                }
                              </p>

                              <p className="mt-1 truncate text-xs text-white/35">
                                {
                                  product.licenseName
                                }{" "}
                                ·{" "}
                                {
                                  product.audioFormat
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-4 sm:justify-end">
                            {product.exclusive ? (
                              <span className="rounded-full border border-amber-400/20 bg-amber-500/10 px-2 py-1 text-[10px] font-semibold text-amber-300">
                                Exclusiva
                              </span>
                            ) : null}

                            <p className="text-sm font-semibold">
                              {formatMoney(
                                product.unitPrice,
                                order.currency,
                              )}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>

                  <div className="mt-5 flex flex-col justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center">
                    <div className="min-w-0 text-xs text-white/30">
                      <p>
                        Método:{" "}
                        {order.paymentProvider ||
                          "No especificado"}
                      </p>

                      {order.paymentReference ? (
                        <p className="mt-1 break-all">
                          Referencia:{" "}
                          {
                            order.paymentReference
                          }
                        </p>
                      ) : null}
                    </div>

                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] px-4 text-sm font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                    >
                      Ver pedido
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}