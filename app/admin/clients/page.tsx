import ClientsManager, {
  type AdminClient,
} from "../../../components/admin/clients/ClientsManager";

import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

interface OrderRow {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  artist_name: string | null;
  status: string | null;
  currency: string | null;
  total: number | string | null;
  created_at: string;
  paid_at: string | null;
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

export default async function AdminClientsPage() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("orders")
    .select(
      `
        id,
        customer_name,
        customer_email,
        artist_name,
        status,
        currency,
        total,
        created_at,
        paid_at
      `,
    )
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <div className="mx-auto w-full max-w-[1540px]">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6">
          <h1 className="text-xl font-semibold text-red-200">
            No fue posible cargar los clientes
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-200/70">
            {error.message}
          </p>
        </div>
      </div>
    );
  }

  const orders =
    (data ?? []) as OrderRow[];

  const clientMap = new Map<
    string,
    AdminClient
  >();

  for (const order of orders) {
    const normalizedEmail =
      order.customer_email
        ?.trim()
        .toLowerCase();

    if (!normalizedEmail) {
      continue;
    }

    const total = Number(
      order.total ?? 0,
    );

    const safeTotal = Number.isFinite(total)
      ? total
      : 0;

    const paid = isPaidStatus(
      order.status,
    );

    const pending = isPendingStatus(
      order.status,
    );

    const current =
      clientMap.get(normalizedEmail);

    if (!current) {
      clientMap.set(normalizedEmail, {
        id: normalizedEmail,
        name:
          order.customer_name?.trim() ||
          "Cliente sin nombre",
        email: normalizedEmail,
        artistName:
          order.artist_name?.trim() ||
          null,
        totalOrders: 1,
        paidOrders: paid ? 1 : 0,
        pendingOrders: pending ? 1 : 0,
        totalSpent: paid ? safeTotal : 0,
        currency:
          order.currency || "USD",
        firstOrderAt:
          order.created_at,
        lastOrderAt:
          order.created_at,
        lastOrderId:
          order.id,
        lastOrderStatus:
          order.status || "unknown",
      });

      continue;
    }

    current.totalOrders += 1;

    if (paid) {
      current.paidOrders += 1;
      current.totalSpent += safeTotal;
    }

    if (pending) {
      current.pendingOrders += 1;
    }

    if (
      !current.artistName &&
      order.artist_name?.trim()
    ) {
      current.artistName =
        order.artist_name.trim();
    }

    const currentFirstDate = new Date(
      current.firstOrderAt,
    );

    const orderDate = new Date(
      order.created_at,
    );

    if (
      !Number.isNaN(orderDate.getTime()) &&
      (Number.isNaN(
        currentFirstDate.getTime(),
      ) ||
        orderDate.getTime() <
          currentFirstDate.getTime())
    ) {
      current.firstOrderAt =
        order.created_at;
    }

    const currentLastDate = new Date(
      current.lastOrderAt,
    );

    if (
      !Number.isNaN(orderDate.getTime()) &&
      (Number.isNaN(
        currentLastDate.getTime(),
      ) ||
        orderDate.getTime() >
          currentLastDate.getTime())
    ) {
      current.lastOrderAt =
        order.created_at;

      current.lastOrderId =
        order.id;

      current.lastOrderStatus =
        order.status || "unknown";

      current.name =
        order.customer_name?.trim() ||
        current.name;

      current.currency =
        order.currency ||
        current.currency;
    }
  }

  const clients = Array.from(
    clientMap.values(),
  ).sort((a, b) => {
    const dateA = new Date(
      a.lastOrderAt,
    ).getTime();

    const dateB = new Date(
      b.lastOrderAt,
    ).getTime();

    return dateB - dateA;
  });

  return (
    <ClientsManager
      clients={clients}
    />
  );
}