import { notFound } from "next/navigation";

import ClientProfile, {
  type ClientOrder,
  type ClientProfileData,
} from "../../../../components/admin/clients/ClientProfile";

import { createClient } from "../../../../lib/supabase/server";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    email: string;
  }>;
}

interface OrderRow {
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
  created_at: string;
  paid_at: string | null;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  beat_id: string | null;
  beat_title: string | null;
  license_name: string | null;
  audio_format: string | null;
  unit_price: number | string | null;
  exclusive: boolean | null;
}

function isPaidStatus(status: string | null) {
  return [
    "paid",
    "completed",
    "approved",
  ].includes(status?.toLowerCase() ?? "");
}

function isPendingStatus(status: string | null) {
  return [
    "pending",
    "created",
  ].includes(status?.toLowerCase() ?? "");
}

export default async function ClientProfilePage({
  params,
}: PageProps) {
  const { email } = await params;

  const decodedEmail =
    decodeURIComponent(email)
      .trim()
      .toLowerCase();

  if (!decodedEmail) {
    notFound();
  }

  const supabase = await createClient();

  const {
    data: ordersData,
    error: ordersError,
  } = await supabase
    .from("orders")
    .select(
      `
        id,
        customer_name,
        customer_email,
        artist_name,
        status,
        payment_provider,
        payment_reference,
        currency,
        subtotal,
        total,
        created_at,
        paid_at
      `,
    )
    .ilike(
      "customer_email",
      decodedEmail,
    )
    .order("created_at", {
      ascending: false,
    });

  if (ordersError) {
    return (
      <div className="mx-auto w-full max-w-[1540px]">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6">
          <h1 className="text-xl font-semibold text-red-200">
            No fue posible cargar el cliente
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-200/70">
            {ordersError.message}
          </p>
        </div>
      </div>
    );
  }

  const orders =
    (ordersData ?? []) as OrderRow[];

  if (orders.length === 0) {
    notFound();
  }

  const orderIds = orders.map(
    (order) => order.id,
  );

  const {
    data: itemsData,
    error: itemsError,
  } = await supabase
    .from("order_items")
    .select(
      `
        id,
        order_id,
        beat_id,
        beat_title,
        license_name,
        audio_format,
        unit_price,
        exclusive
      `,
    )
    .in("order_id", orderIds);

  if (itemsError) {
    return (
      <div className="mx-auto w-full max-w-[1540px]">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6">
          <h1 className="text-xl font-semibold text-red-200">
            No fue posible cargar los productos
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-200/70">
            {itemsError.message}
          </p>
        </div>
      </div>
    );
  }

  const items =
    (itemsData ?? []) as OrderItemRow[];

  const itemsByOrder = new Map<
    string,
    OrderItemRow[]
  >();

  for (const item of items) {
    const current =
      itemsByOrder.get(item.order_id) ?? [];

    current.push(item);

    itemsByOrder.set(
      item.order_id,
      current,
    );
  }

  const paidOrders = orders.filter(
    (order) =>
      isPaidStatus(order.status),
  );

  const pendingOrders = orders.filter(
    (order) =>
      isPendingStatus(order.status),
  );

  const totalSpent = paidOrders.reduce(
    (total, order) => {
      const amount = Number(
        order.total ?? 0,
      );

      return (
        total +
        (Number.isFinite(amount)
          ? amount
          : 0)
      );
    },
    0,
  );

  const averageOrderValue =
    paidOrders.length > 0
      ? totalSpent / paidOrders.length
      : 0;

  const oldestOrder =
    orders[orders.length - 1];

  const newestOrder = orders[0];

  const clientOrders: ClientOrder[] =
    orders.map((order) => ({
      id: order.id,
      status:
        order.status || "unknown",
      total: Number(order.total ?? 0),
      subtotal: Number(
        order.subtotal ?? 0,
      ),
      currency:
        order.currency || "USD",
      paymentProvider:
        order.payment_provider,
      paymentReference:
        order.payment_reference,
      createdAt: order.created_at,
      paidAt: order.paid_at,

      products: (
        itemsByOrder.get(order.id) ?? []
      ).map((item) => ({
        id: item.id,
        beatId: item.beat_id,
        beatTitle:
          item.beat_title ||
          "Beat sin título",
        licenseName:
          item.license_name ||
          "Licencia",
        audioFormat:
          item.audio_format ||
          "No especificado",
        unitPrice: Number(
          item.unit_price ?? 0,
        ),
        exclusive:
          item.exclusive === true,
      })),
    }));

  const client: ClientProfileData = {
    name:
      newestOrder.customer_name?.trim() ||
      "Cliente sin nombre",

    email:
      newestOrder.customer_email?.trim() ||
      decodedEmail,

    artistName:
      orders.find(
        (order) =>
          Boolean(
            order.artist_name?.trim(),
          ),
      )?.artist_name?.trim() || null,

    totalOrders:
      orders.length,

    paidOrders:
      paidOrders.length,

    pendingOrders:
      pendingOrders.length,

    totalSpent,

    averageOrderValue,

    currency:
      newestOrder.currency || "USD",

    firstOrderAt:
      oldestOrder.created_at,

    lastOrderAt:
      newestOrder.created_at,

    orders:
      clientOrders,
  };

  return (
    <ClientProfile client={client} />
  );
}