"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import {
  ArrowRight,
  CalendarDays,
  CircleDollarSign,
  Mail,
  Search,
  ShoppingBag,
  UserRound,
  Users,
} from "lucide-react";

export interface AdminClient {
  id: string;
  name: string;
  email: string;
  artistName: string | null;
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalSpent: number;
  currency: string;
  firstOrderAt: string;
  lastOrderAt: string;
  lastOrderId: string;
  lastOrderStatus: string;
}

interface ClientsManagerProps {
  clients: AdminClient[];
}

type ClientFilter =
  | "all"
  | "buyers"
  | "pending"
  | "high-value";

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

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Sin fecha";
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

  return `${day} ${month} ${year}`;
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

function getClientCategory(client: AdminClient) {
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

export default function ClientsManager({
  clients,
}: ClientsManagerProps) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] =
    useState<ClientFilter>("all");

  const totalRevenue = useMemo(
    () =>
      clients.reduce(
        (total, client) =>
          total + client.totalSpent,
        0,
      ),
    [clients],
  );

  const repeatCustomers = useMemo(
    () =>
      clients.filter(
        (client) => client.paidOrders >= 2,
      ).length,
    [clients],
  );

  const averageCustomerValue =
    clients.length > 0
      ? totalRevenue / clients.length
      : 0;

  const filteredClients = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return clients.filter((client) => {
      const matchesSearch =
        !normalizedSearch ||
        client.name
          .toLowerCase()
          .includes(normalizedSearch) ||
        client.email
          .toLowerCase()
          .includes(normalizedSearch) ||
        client.artistName
          ?.toLowerCase()
          .includes(normalizedSearch);

      if (!matchesSearch) {
        return false;
      }

      switch (filter) {
        case "buyers":
          return client.paidOrders > 0;

        case "pending":
          return client.pendingOrders > 0;

        case "high-value":
          return client.totalSpent >= 300;

        default:
          return true;
      }
    });
  }, [clients, filter, search]);

  const filters: Array<{
    id: ClientFilter;
    label: string;
  }> = [
    {
      id: "all",
      label: "Todos",
    },
    {
      id: "buyers",
      label: "Compradores",
    },
    {
      id: "pending",
      label: "Con pendientes",
    },
    {
      id: "high-value",
      label: "Alto valor",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1540px]">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] px-5 py-6 sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
            <Users className="h-3.5 w-3.5" />
            Clientes
          </div>

          <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
            Gestión de clientes
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">
            Consulta compradores, historial de
            pedidos, gasto total y actividad
            comercial.
          </p>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/40">
                Clientes totales
              </p>

              <p className="mt-3 text-3xl font-bold">
                {clients.length}
              </p>

              <p className="mt-4 text-xs text-white/30">
                Correos únicos registrados
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10">
              <Users className="h-5 w-5 text-blue-300" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/40">
                Ingresos de clientes
              </p>

              <p className="mt-3 text-3xl font-bold">
                {formatMoney(totalRevenue)}
              </p>

              <p className="mt-4 text-xs text-white/30">
                Solo pedidos pagados
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
                Clientes recurrentes
              </p>

              <p className="mt-3 text-3xl font-bold">
                {repeatCustomers}
              </p>

              <p className="mt-4 text-xs text-white/30">
                Dos compras pagadas o más
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10">
              <ShoppingBag className="h-5 w-5 text-violet-300" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/40">
                Valor promedio
              </p>

              <p className="mt-3 text-3xl font-bold">
                {formatMoney(
                  averageCustomerValue,
                )}
              </p>

              <p className="mt-4 text-xs text-white/30">
                Gasto promedio por cliente
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-500/10">
              <UserRound className="h-5 w-5 text-amber-300" />
            </div>
          </div>
        </article>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
        <div className="border-b border-white/10 p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                Directorio de clientes
              </h2>

              <p className="mt-1 text-sm text-white/35">
                {filteredClients.length} de{" "}
                {clients.length} clientes
              </p>
            </div>

            <div className="flex flex-col gap-3 lg:flex-row">
              <div className="relative min-w-0 sm:min-w-[320px]">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                <input
                  type="search"
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value,
                    )
                  }
                  placeholder="Buscar nombre, correo o artista..."
                  className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div className="flex max-w-full gap-2 overflow-x-auto">
                {filters.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setFilter(item.id)
                    }
                    className={[
                      "h-11 shrink-0 rounded-xl border px-4 text-sm font-medium transition",
                      filter === item.id
                        ? "border-blue-400/25 bg-blue-500/15 text-blue-200"
                        : "border-white/10 bg-white/[0.035] text-white/45 hover:bg-white/[0.07] hover:text-white",
                    ].join(" ")}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {filteredClients.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <Users className="mx-auto h-11 w-11 text-white/15" />

            <h3 className="mt-5 font-semibold">
              No encontramos clientes
            </h3>

            <p className="mt-2 text-sm text-white/35">
              Prueba con otro término o filtro.
            </p>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px]">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/30">
                      Cliente
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/30">
                      Categoría
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/30">
                      Pedidos
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/30">
                      Gasto total
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/30">
                      Última compra
                    </th>

                    <th className="px-6 py-4 text-xs font-semibold uppercase tracking-[0.14em] text-white/30">
                      Estado
                    </th>

                    <th className="px-6 py-4" />
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/10">
                  {filteredClients.map(
                    (client) => {
                      const category =
                        getClientCategory(
                          client,
                        );

                      return (
                        <tr
                          key={client.id}
                          className="transition hover:bg-white/[0.025]"
                        >
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-4">
                              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-400/15 bg-blue-500/10 text-xs font-bold text-blue-300">
                                {getInitials(
                                  client.name,
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">
                                  {client.name}
                                </p>

                                <p className="mt-1 flex items-center gap-1.5 truncate text-xs text-white/35">
                                  <Mail className="h-3 w-3 shrink-0" />
                                  {client.email}
                                </p>

                                {client.artistName ? (
                                  <p className="mt-1 truncate text-xs text-blue-300/60">
                                    Artista:{" "}
                                    {
                                      client.artistName
                                    }
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={[
                                "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                category.classes,
                              ].join(" ")}
                            >
                              {category.label}
                            </span>
                          </td>

                          <td className="px-6 py-5">
                            <p className="text-sm font-semibold">
                              {
                                client.totalOrders
                              }
                            </p>

                            <p className="mt-1 text-xs text-white/30">
                              {
                                client.paidOrders
                              }{" "}
                              pagados
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="text-sm font-semibold text-emerald-300">
                              {formatMoney(
                                client.totalSpent,
                                client.currency,
                              )}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <p className="flex items-center gap-2 text-sm text-white/65">
                              <CalendarDays className="h-4 w-4 text-white/25" />

                              {formatDate(
                                client.lastOrderAt,
                              )}
                            </p>
                          </td>

                          <td className="px-6 py-5">
                            <span
                              className={[
                                "inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                getStatusClasses(
                                  client.lastOrderStatus,
                                ),
                              ].join(" ")}
                            >
                              {getStatusLabel(
                                client.lastOrderStatus,
                              )}
                            </span>
                          </td>

                          <td className="px-6 py-5 text-right">
                            <Link
                              href={`/admin/clients/${encodeURIComponent(
                                client.email,
                              )}`}
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.035] px-3 text-xs font-semibold text-white/55 transition hover:bg-white/[0.08] hover:text-white"
                            >
                              Ver perfil
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-white/10 lg:hidden">
              {filteredClients.map(
                (client) => {
                  const category =
                    getClientCategory(client);

                  return (
                    <article
                      key={client.id}
                      className="p-5"
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-blue-400/15 bg-blue-500/10 text-xs font-bold text-blue-300">
                          {getInitials(
                            client.name,
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium">
                            {client.name}
                          </p>

                          <p className="mt-1 truncate text-xs text-white/35">
                            {client.email}
                          </p>

                          {client.artistName ? (
                            <p className="mt-1 truncate text-xs text-blue-300/60">
                              Artista:{" "}
                              {client.artistName}
                            </p>
                          ) : null}
                        </div>

                        <span
                          className={[
                            "shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold",
                            category.classes,
                          ].join(" ")}
                        >
                          {category.label}
                        </span>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-3">
                        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                          <p className="text-xs text-white/30">
                            Pedidos
                          </p>

                          <p className="mt-2 font-semibold">
                            {
                              client.totalOrders
                            }
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                          <p className="text-xs text-white/30">
                            Gasto total
                          </p>

                          <p className="mt-2 font-semibold text-emerald-300">
                            {formatMoney(
                              client.totalSpent,
                              client.currency,
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                          <p className="text-xs text-white/30">
                            Última compra
                          </p>

                          <p className="mt-2 text-sm font-medium">
                            {formatDate(
                              client.lastOrderAt,
                            )}
                          </p>
                        </div>

                        <div className="rounded-xl border border-white/10 bg-black/15 p-3">
                          <p className="text-xs text-white/30">
                            Estado
                          </p>

                          <span
                            className={[
                              "mt-2 inline-flex rounded-full border px-2 py-1 text-[10px] font-semibold",
                              getStatusClasses(
                                client.lastOrderStatus,
                              ),
                            ].join(" ")}
                          >
                            {getStatusLabel(
                              client.lastOrderStatus,
                            )}
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/admin/clients/${encodeURIComponent(
                          client.email,
                        )}`}
                        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.035] text-sm font-semibold text-white/60 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        Ver perfil del cliente
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </article>
                  );
                },
              )}
            </div>
          </>
        )}
      </section>
    </div>
  );
}