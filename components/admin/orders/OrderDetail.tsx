import OrderActions from "./OrderActions";
import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileAudio,
  Hash,
  Mail,
  Music2,
  Package,
  ReceiptText,
  ShieldCheck,
  User,
  UserRoundPen,
  XCircle,
} from "lucide-react";

export interface OrderDetailData {
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
}

export interface OrderDetailItem {
  id: string;
  order_id: string;
  beat_id: string;
  license_id: string;
  beat_title: string | null;
  license_name: string | null;
  audio_format: string | null;
  unit_price: number | string | null;
  exclusive: boolean | null;
  created_at: string;
}

interface OrderDetailProps {
  order: OrderDetailData;
  items: OrderDetailItem[];
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
    month: "long",
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
      return "border-white/10 bg-white/5 text-white/55";
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
      return <CheckCircle2 className="h-4 w-4" />;

    case "cancelled":
    case "canceled":
    case "failed":
      return <XCircle className="h-4 w-4" />;

    default:
      return <Clock3 className="h-4 w-4" />;
  }
}

export default function OrderDetail({
  order,
  items,
}: OrderDetailProps) {
  const orderNumber = order.id.slice(0, 8).toUpperCase();

  return (
    <div className="mx-auto w-full max-w-[1400px]">
      <div className="mb-8">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/45 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a pedidos
        </Link>

        <div className="mt-7 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-400">
              Detalle de venta
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Pedido #{orderNumber}
              </h1>

              <span
                className={[
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                  getStatusClasses(order.status),
                ].join(" ")}
              >
                <StatusIcon status={order.status} />
                {getStatusLabel(order.status)}
              </span>
            </div>

            <p className="mt-3 text-sm text-white/40">
              Creado el {formatDate(order.created_at)}
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-white/30">
              Total del pedido
            </p>

            <p className="mt-1 text-2xl font-bold text-white">
              {formatMoney(order.total, order.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
            <div className="border-b border-white/10 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <Package className="h-5 w-5 text-blue-400" />

                <div>
                  <h2 className="text-lg font-semibold">
                    Productos comprados
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    {items.length}{" "}
                    {items.length === 1 ? "producto" : "productos"} en
                    este pedido.
                  </p>
                </div>
              </div>
            </div>

            {items.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Package className="mx-auto h-10 w-10 text-white/20" />

                <p className="mt-4 font-medium text-white/60">
                  No hay productos registrados
                </p>
              </div>
            ) : (
              <div className="divide-y divide-white/10">
                {items.map((item, index) => (
                  <article
                    key={item.id}
                    className="p-5 sm:p-6"
                  >
                    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                      <div className="flex min-w-0 gap-4">
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
                          <Music2 className="h-6 w-6 text-blue-400" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-white/30">
                            Producto {index + 1}
                          </p>

                          <h3 className="mt-1 truncate text-lg font-semibold text-white">
                            {item.beat_title || "Beat sin título"}
                          </h3>

                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
                              <ShieldCheck className="h-3.5 w-3.5" />
                              {item.license_name || "Sin licencia"}
                            </span>

                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/55">
                              <FileAudio className="h-3.5 w-3.5" />
                              {item.audio_format || "Sin formato"}
                            </span>

                            {item.exclusive ? (
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-400/20 bg-purple-500/10 px-3 py-1 text-xs font-semibold text-purple-300">
                                <BadgeCheck className="h-3.5 w-3.5" />
                                Exclusiva
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 sm:text-right">
                        <p className="text-xs text-white/35">
                          Precio
                        </p>

                        <p className="mt-1 text-lg font-bold">
                          {formatMoney(
                            item.unit_price,
                            order.currency,
                          )}
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-xs text-white/30">
                          ID del beat
                        </p>

                        <p className="mt-1 truncate font-mono text-xs text-white/55">
                          {item.beat_id}
                        </p>
                      </div>

                      <div className="rounded-xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-xs text-white/30">
                          ID de licencia
                        </p>

                        <p className="mt-1 truncate font-mono text-xs text-white/55">
                          {item.license_id}
                        </p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.035]">
            <div className="border-b border-white/10 px-5 py-5 sm:px-6">
              <div className="flex items-center gap-3">
                <ReceiptText className="h-5 w-5 text-blue-400" />

                <div>
                  <h2 className="text-lg font-semibold">
                    Resumen económico
                  </h2>

                  <p className="mt-1 text-sm text-white/40">
                    Valores registrados durante la compra.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="text-white/45">Subtotal</span>

                <span className="font-medium">
                  {formatMoney(order.subtotal, order.currency)}
                </span>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-white">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-white">
                    {formatMoney(order.total, order.currency)}
                  </span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
            <OrderActions
  orderId={order.id}
  beatId={items[0]?.beat_id ?? null}
  isPaid={["paid", "completed", "approved"].includes(
    order.status?.toLowerCase() ?? "",
  )}
/>
          <section className="rounded-2xl border border-white/10 bg-white/[0.035]">
            <div className="border-b border-white/10 px-5 py-5">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-400" />

                <h2 className="font-semibold">Cliente</h2>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/30">
                  Nombre
                </p>

                <p className="mt-2 font-medium text-white">
                  {order.customer_name || "Sin nombre"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-white/30">
                  Correo
                </p>

                {order.customer_email ? (
                  <a
                    href={`mailto:${order.customer_email}`}
                    className="mt-2 flex items-center gap-2 break-all text-sm text-blue-300 transition hover:text-blue-200"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    {order.customer_email}
                  </a>
                ) : (
                  <p className="mt-2 text-sm text-white/45">—</p>
                )}
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-white/30">
                  Nombre artístico
                </p>

                <p className="mt-2 flex items-center gap-2 text-sm text-white/65">
                  <UserRoundPen className="h-4 w-4 text-white/35" />
                  {order.artist_name || "No especificado"}
                </p>
              </div>

              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center gap-2">
                  {order.terms_accepted ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-300" />
                  )}

                  <p className="text-sm text-white/55">
                    {order.terms_accepted
                      ? "Aceptó los términos"
                      : "No consta aceptación de términos"}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.035]">
            <div className="border-b border-white/10 px-5 py-5">
              <div className="flex items-center gap-3">
                <CreditCard className="h-5 w-5 text-emerald-300" />

                <h2 className="font-semibold">Pago</h2>
              </div>
            </div>

            <div className="space-y-5 p-5">
              <div>
                <p className="text-xs uppercase tracking-wider text-white/30">
                  Estado
                </p>

                <span
                  className={[
                    "mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold",
                    getStatusClasses(order.status),
                  ].join(" ")}
                >
                  <StatusIcon status={order.status} />
                  {getStatusLabel(order.status)}
                </span>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-white/30">
                  Proveedor
                </p>

                <p className="mt-2 text-sm font-medium capitalize text-white/70">
                  {order.payment_provider || "No especificado"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-white/30">
                  Referencia
                </p>

                <p className="mt-2 flex items-start gap-2 break-all font-mono text-xs text-white/60">
                  <Hash className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                  {order.payment_reference || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-white/30">
                  Fecha de pago
                </p>

                <p className="mt-2 flex items-start gap-2 text-sm text-white/60">
                  <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                  {formatDate(order.paid_at)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <p className="text-xs uppercase tracking-wider text-white/30">
              ID completo del pedido
            </p>

            <p className="mt-3 break-all font-mono text-xs leading-5 text-white/50">
              {order.id}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}