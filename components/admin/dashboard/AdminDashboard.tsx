import Link from "next/link";

import {
  ArrowRight,
  BadgeDollarSign,
  CircleDollarSign,
  Crown,
  Headphones,
  Music2,
  Package,
  Play,
  Plus,
  ReceiptText,
  ShoppingBag,
  Sparkles,
  TrendingUp,
  UserRound,
  Users,
} from "lucide-react";

export interface DashboardSalePoint {
  date: string;
  label: string;
  total: number;
}

export interface DashboardRecentOrder {
  id: string;
  customerName: string;
  customerEmail: string;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
}

export interface DashboardTopBeat {
  beatId: string;
  title: string;
  sales: number;
  revenue: number;
}

export interface DashboardLicenseRevenue {
  licenseName: string;
  sales: number;
  revenue: number;
}

export interface DashboardMostPlayedBeat {
  id: string;
  title: string;
  plays: number;
  coverUrl: string | null;
}

export interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  productsSold: number;
  publishedBeats: number;
  totalPlays: number;
  salesLast30Days: DashboardSalePoint[];
  recentOrders: DashboardRecentOrder[];
  topBeats: DashboardTopBeat[];
  revenueByLicense: DashboardLicenseRevenue[];
  mostPlayedBeats: DashboardMostPlayedBeat[];
}

interface AdminDashboardProps {
  data: DashboardData;
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

function formatCompactNumber(value: number) {
  const safeValue = Number.isFinite(value)
    ? value
    : 0;

  if (safeValue >= 1_000_000) {
    return `${(safeValue / 1_000_000).toFixed(1)}M`;
  }

  if (safeValue >= 1_000) {
    return `${(safeValue / 1_000).toFixed(1)}K`;
  }

  return String(safeValue);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Fecha no disponible";
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
      return "border-white/10 bg-white/5 text-white/50";
  }
}

function SalesChart({
  points,
}: {
  points: DashboardSalePoint[];
}) {
  const width = 980;
  const height = 310;
  const paddingLeft = 28;
  const paddingRight = 28;
  const paddingTop = 26;
  const paddingBottom = 42;

  const maxValue = Math.max(
    1,
    ...points.map((point) => point.total),
  );

  const usableWidth =
    width - paddingLeft - paddingRight;

  const usableHeight =
    height - paddingTop - paddingBottom;

  const coordinates = points.map(
    (point, index) => {
      const progress =
        points.length <= 1
          ? 0
          : index / (points.length - 1);

      const x =
        paddingLeft +
        progress * usableWidth;

      const y =
        paddingTop +
        usableHeight -
        (point.total / maxValue) *
          usableHeight;

      return {
        ...point,
        x,
        y,
      };
    },
  );

  const linePoints = coordinates
    .map(({ x, y }) => `${x},${y}`)
    .join(" ");

  const areaPoints = [
    `${paddingLeft},${
      height - paddingBottom
    }`,
    linePoints,
    `${width - paddingRight},${
      height - paddingBottom
    }`,
  ].join(" ");

  const visibleLabels =
    coordinates.filter(
      (_, index) =>
        index === 0 ||
        index ===
          coordinates.length - 1 ||
        index % 6 === 0,
    );

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[760px]">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Ingresos de los últimos 30 días"
          className="h-auto w-full"
        >
          <defs>
            <linearGradient
              id="dashboard-sales-area"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >
              <stop
                offset="0%"
                stopColor="currentColor"
                stopOpacity="0.28"
              />

              <stop
                offset="100%"
                stopColor="currentColor"
                stopOpacity="0"
              />
            </linearGradient>

            <filter
              id="dashboard-line-glow"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
            >
              <feGaussianBlur
                stdDeviation="3"
                result="blur"
              />

              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {[0, 1, 2, 3, 4].map(
            (line) => {
              const y =
                paddingTop +
                (usableHeight / 4) *
                  line;

              return (
                <line
                  key={line}
                  x1={paddingLeft}
                  x2={
                    width - paddingRight
                  }
                  y1={y}
                  y2={y}
                  stroke="currentColor"
                  strokeOpacity="0.075"
                  strokeWidth="1"
                />
              );
            },
          )}

          <polygon
            points={areaPoints}
            fill="url(#dashboard-sales-area)"
            className="text-blue-500"
          />

          <polyline
            points={linePoints}
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            filter="url(#dashboard-line-glow)"
            className="text-blue-500"
          />

          {coordinates.map((point) => (
            <g key={point.date}>
              <circle
                cx={point.x}
                cy={point.y}
                r="7"
                fill="currentColor"
                fillOpacity="0.14"
                className="text-blue-400"
              />

              <circle
                cx={point.x}
                cy={point.y}
                r="3.5"
                fill="currentColor"
                className="text-blue-300"
              >
                <title>
                  {`${point.label}: ${formatMoney(
                    point.total,
                  )}`}
                </title>
              </circle>
            </g>
          ))}

          {visibleLabels.map(
            (point) => (
              <text
                key={point.date}
                x={point.x}
                y={height - 10}
                textAnchor="middle"
                fill="currentColor"
                fillOpacity="0.34"
                fontSize="12"
              >
                {point.label}
              </text>
            ),
          )}
        </svg>
      </div>
    </div>
  );
}

function SectionHeader({
  title,
  description,
  icon: Icon,
  action,
}: {
  title: string;
  description: string;
  icon:
    | typeof Music2
    | typeof TrendingUp
    | typeof ReceiptText;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-white/10 px-5 py-5 sm:flex-row sm:items-center sm:px-6">
      <div className="flex min-w-0 items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-500/10">
          <Icon className="h-4 w-4 text-blue-300" />
        </div>

        <div className="min-w-0">
          <h2 className="font-semibold text-white">
            {title}
          </h2>

          <p className="mt-1 text-sm leading-6 text-white/35">
            {description}
          </p>
        </div>
      </div>

      {action ? (
        <div className="shrink-0">
          {action}
        </div>
      ) : null}
    </div>
  );
}

export default function AdminDashboard({
  data,
}: AdminDashboardProps) {
  const averageOrder =
    data.totalOrders > 0
      ? data.totalRevenue /
        data.totalOrders
      : 0;

  const mostSoldLicense =
    data.revenueByLicense
      .slice()
      .sort(
        (a, b) => b.sales - a.sales,
      )[0] ?? null;

  const mostProfitableBeat =
    data.topBeats
      .slice()
      .sort(
        (a, b) =>
          b.revenue - a.revenue,
      )[0] ?? null;

  const revenueLast30Days =
    data.salesLast30Days.reduce(
      (total, point) =>
        total + point.total,
      0,
    );

  const maximumBeatSales = Math.max(
    1,
    ...data.topBeats.map(
      (beat) => beat.sales,
    ),
  );

  const maximumLicenseRevenue =
    Math.max(
      1,
      ...data.revenueByLicense.map(
        (license) =>
          license.revenue,
      ),
    );

  const stats = [
    {
      label: "Ingresos totales",
      value: formatMoney(
        data.totalRevenue,
      ),
      description: `${data.totalOrders} pedidos pagados`,
      icon: CircleDollarSign,
      accent:
        "border-emerald-400/15 bg-emerald-500/10 text-emerald-300",
    },
    {
      label: "Pedidos pagados",
      value: String(
        data.totalOrders,
      ),
      description: `${data.productsSold} productos vendidos`,
      icon: ShoppingBag,
      accent:
        "border-blue-400/15 bg-blue-500/10 text-blue-300",
    },
    {
      label: "Clientes",
      value: String(
        data.totalCustomers,
      ),
      description: "Compradores únicos",
      icon: Users,
      accent:
        "border-violet-400/15 bg-violet-500/10 text-violet-300",
    },
    {
      label: "Ticket promedio",
      value: formatMoney(
        averageOrder,
      ),
      description: "Promedio por pedido",
      icon: BadgeDollarSign,
      accent:
        "border-amber-400/15 bg-amber-500/10 text-amber-300",
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1540px]">
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] px-5 py-6 sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="pointer-events-none absolute -bottom-24 left-1/3 h-52 w-52 rounded-full bg-violet-600/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              Resumen general
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Buenos días, Kevin
              <span className="ml-2">
                👋
              </span>
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">
              Aquí tienes una vista general
              del rendimiento comercial y la
              actividad reciente de KTB
              Studio.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              href="/admin/beats"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-5 text-sm font-semibold text-white/70 transition hover:bg-white/[0.08] hover:text-white"
            >
              <Music2 className="h-4 w-4" />
              Ver catálogo
            </Link>

            <Link
              href="/admin/beats/new"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-500"
            >
              <Plus className="h-4 w-4" />
              Nuevo beat
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.045]"
            >
              <div className="pointer-events-none absolute right-0 top-0 h-24 w-24 translate-x-8 -translate-y-8 rounded-full bg-white/[0.025] blur-2xl transition group-hover:bg-blue-500/10" />

              <div className="relative flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-white/40">
                    {stat.label}
                  </p>

                  <p className="mt-3 truncate text-2xl font-bold tracking-tight text-white sm:text-3xl">
                    {stat.value}
                  </p>
                </div>

                <div
                  className={[
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border",
                    stat.accent,
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="relative mt-5 text-xs text-white/30">
                {stat.description}
              </p>
            </article>
          );
        })}
      </section>

      <section className="mt-4 grid gap-4 md:grid-cols-3">
        <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/30">
                Beats publicados
              </p>

              <p className="mt-3 text-2xl font-bold">
                {data.publishedBeats}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/10">
              <Music2 className="h-5 w-5 text-violet-300" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/30">
                Reproducciones
              </p>

              <p className="mt-3 text-2xl font-bold">
                {formatCompactNumber(
                  data.totalPlays,
                )}
              </p>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-500/10">
              <Headphones className="h-5 w-5 text-cyan-300" />
            </div>
          </div>
        </article>

        <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-white/30">
                Licencia más vendida
              </p>

              <p className="mt-3 truncate text-lg font-bold">
                {mostSoldLicense
                  ? mostSoldLicense.licenseName
                  : "Sin datos"}
              </p>

              <p className="mt-1 text-xs text-white/30">
                {mostSoldLicense
                  ? `${mostSoldLicense.sales} ventas`
                  : "Todavía no hay ventas"}
              </p>
            </div>

            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/15 bg-amber-500/10">
              <Crown className="h-5 w-5 text-amber-300" />
            </div>
          </div>
        </article>
      </section>

      <section className="mt-6 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
        <SectionHeader
          title="Rendimiento de ventas"
          description="Ingresos generados durante los últimos 30 días."
          icon={TrendingUp}
          action={
            <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-2 text-right">
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">
                Total del periodo
              </p>

              <p className="mt-1 font-semibold">
                {formatMoney(
                  revenueLast30Days,
                )}
              </p>
            </div>
          }
        />

        <div className="p-4 sm:p-6">
          <SalesChart
            points={
              data.salesLast30Days
            }
          />
        </div>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-2">
        <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <SectionHeader
            title="Beats más vendidos"
            description="Ranking por cantidad de licencias adquiridas."
            icon={Music2}
            action={
              <Crown className="h-5 w-5 text-amber-300" />
            }
          />

          {data.topBeats.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Music2 className="mx-auto h-10 w-10 text-white/15" />

              <p className="mt-4 text-sm text-white/35">
                Todavía no hay ventas para
                mostrar.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {data.topBeats.map(
                (beat, index) => {
                  const progress =
                    (beat.sales /
                      maximumBeatSales) *
                    100;

                  return (
                    <Link
                      key={beat.beatId}
                      href={`/admin/beats/${beat.beatId}/edit`}
                      className="group block px-5 py-5 transition hover:bg-white/[0.025] sm:px-6"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={[
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border text-sm font-bold",
                            index === 0
                              ? "border-amber-400/20 bg-amber-500/10 text-amber-300"
                              : "border-white/10 bg-white/[0.04] text-white/40",
                          ].join(" ")}
                        >
                          {index === 0
                            ? "🥇"
                            : index + 1}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <p className="truncate font-medium transition group-hover:text-blue-300">
                              {beat.title}
                            </p>

                            <p className="shrink-0 text-sm font-semibold">
                              {formatMoney(
                                beat.revenue,
                              )}
                            </p>
                          </div>

                          <div className="mt-2 flex items-center justify-between gap-4">
                            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                              <div
                                className="h-full rounded-full bg-blue-500"
                                style={{
                                  width: `${Math.max(
                                    progress,
                                    4,
                                  )}%`,
                                }}
                              />
                            </div>

                            <p className="shrink-0 text-xs text-white/30">
                              {beat.sales}{" "}
                              {beat.sales === 1
                                ? "venta"
                                : "ventas"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                },
              )}
            </div>
          )}
        </article>

        <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <SectionHeader
            title="Ingresos por licencia"
            description="Distribución de ingresos por tipo de licencia."
            icon={ReceiptText}
          />

          {data.revenueByLicense.length ===
          0 ? (
            <div className="px-6 py-16 text-center">
              <ReceiptText className="mx-auto h-10 w-10 text-white/15" />

              <p className="mt-4 text-sm text-white/35">
                Todavía no hay licencias
                vendidas.
              </p>
            </div>
          ) : (
            <div className="space-y-6 p-5 sm:p-6">
              {data.revenueByLicense.map(
                (license) => {
                  const progress =
                    (license.revenue /
                      maximumLicenseRevenue) *
                    100;

                  return (
                    <div
                      key={
                        license.licenseName
                      }
                    >
                      <div className="mb-3 flex items-end justify-between gap-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">
                            {
                              license.licenseName
                            }
                          </p>

                          <p className="mt-1 text-xs text-white/30">
                            {license.sales}{" "}
                            {license.sales ===
                            1
                              ? "licencia vendida"
                              : "licencias vendidas"}
                          </p>
                        </div>

                        <p className="shrink-0 font-semibold">
                          {formatMoney(
                            license.revenue,
                          )}
                        </p>
                      </div>

                      <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-600 to-cyan-400"
                          style={{
                            width: `${Math.max(
                              progress,
                              4,
                            )}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                },
              )}

              {mostProfitableBeat ? (
                <div className="mt-3 rounded-2xl border border-emerald-400/15 bg-emerald-500/[0.07] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-300/70">
                    Beat más rentable
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-4">
                    <p className="truncate font-medium">
                      {
                        mostProfitableBeat.title
                      }
                    </p>

                    <p className="shrink-0 font-bold text-emerald-300">
                      {formatMoney(
                        mostProfitableBeat.revenue,
                      )}
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.85fr]">
        <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <SectionHeader
            title="Pedidos recientes"
            description="Últimas compras registradas en la tienda."
            icon={ShoppingBag}
            action={
              <Link
                href="/admin/orders"
                className="inline-flex items-center gap-2 text-sm font-medium text-blue-300 transition hover:text-blue-200"
              >
                Ver todos
                <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />

          {data.recentOrders.length ===
          0 ? (
            <div className="px-6 py-16 text-center">
              <Package className="mx-auto h-10 w-10 text-white/15" />

              <p className="mt-4 text-sm text-white/35">
                Todavía no hay pedidos.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {data.recentOrders.map(
                (order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.025] sm:px-6"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-blue-400/15 bg-blue-500/10 text-xs font-bold text-blue-300">
                      {getInitials(
                        order.customerName,
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium transition group-hover:text-blue-300">
                        {
                          order.customerName
                        }
                      </p>

                      <p className="mt-1 truncate text-xs text-white/30">
                        {
                          order.customerEmail
                        }
                      </p>
                    </div>

                    <div className="hidden shrink-0 text-right sm:block">
                      <p className="text-xs text-white/30">
                        {formatDate(
                          order.createdAt,
                        )}
                      </p>

                      <span
                        className={[
                          "mt-1 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold",
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

                    <p className="shrink-0 text-sm font-semibold">
                      {formatMoney(
                        order.total,
                        order.currency,
                      )}
                    </p>

                    <ArrowRight className="h-4 w-4 shrink-0 text-white/20 transition group-hover:translate-x-0.5 group-hover:text-blue-300" />
                  </Link>
                ),
              )}
            </div>
          )}
        </article>

        <article className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
          <SectionHeader
            title="Más reproducidos"
            description="Beats con mayor número de plays."
            icon={Play}
          />

          {data.mostPlayedBeats.length ===
          0 ? (
            <div className="px-6 py-16 text-center">
              <Play className="mx-auto h-10 w-10 text-white/15" />

              <p className="mt-4 text-sm text-white/35">
                No hay reproducciones
                registradas.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {data.mostPlayedBeats.map(
                (beat, index) => (
                  <Link
                    key={beat.id}
                    href={`/admin/beats/${beat.id}/edit`}
                    className="group flex items-center gap-4 px-5 py-4 transition hover:bg-white/[0.025] sm:px-6"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-blue-600/30 to-violet-600/20">
                      {beat.coverUrl ? (
                        <img
                          src={
                            beat.coverUrl
                          }
                          alt={`Portada de ${beat.title}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Music2 className="h-5 w-5 text-white/35" />
                        </div>
                      )}

                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/45 group-hover:opacity-100">
                        <Play className="h-4 w-4 fill-white text-white" />
                      </div>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium transition group-hover:text-blue-300">
                        {beat.title}
                      </p>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-white/30">
                        <Headphones className="h-3 w-3" />
                        {formatCompactNumber(
                          beat.plays,
                        )}{" "}
                        reproducciones
                      </p>
                    </div>

                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/[0.035] text-xs font-bold text-white/30">
                      {index + 1}
                    </div>
                  </Link>
                ),
              )}
            </div>
          )}
        </article>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/orders"
          className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-blue-400/20 hover:bg-blue-500/[0.045]"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">
                Gestionar pedidos
              </p>

              <p className="mt-1 text-sm text-white/30">
                Revisa pagos, licencias y
                entregas.
              </p>
            </div>

            <ArrowRight className="h-5 w-5 text-white/25 transition group-hover:translate-x-1 group-hover:text-blue-300" />
          </div>
        </Link>

        <Link
          href="/admin/beats/new"
          className="group rounded-2xl border border-white/10 bg-white/[0.025] p-5 transition hover:border-blue-400/20 hover:bg-blue-500/[0.045]"
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">
                Publicar un nuevo beat
              </p>

              <p className="mt-1 text-sm text-white/30">
                Añade audio, portada,
                archivos y licencias.
              </p>
            </div>

            <ArrowRight className="h-5 w-5 text-white/25 transition group-hover:translate-x-1 group-hover:text-blue-300" />
          </div>
        </Link>
      </section>
    </div>
  );
}