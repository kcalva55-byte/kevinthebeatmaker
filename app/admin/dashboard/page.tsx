import AdminDashboard, {
  type DashboardData,
  type DashboardLicenseRevenue,
  type DashboardMostPlayedBeat,
  type DashboardRecentOrder,
  type DashboardSalePoint,
  type DashboardTopBeat,
} from "../../../components/admin/dashboard/AdminDashboard";

import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

interface OrderRow {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string | null;
  total: number | string | null;
  currency: string | null;
  paid_at: string | null;
  created_at: string;
}

interface OrderItemRow {
  order_id: string;
  beat_id: string;
  beat_title: string | null;
  license_name: string | null;
  unit_price: number | string | null;
}

interface BeatRow {
  id: string;
  title: string;
  status: string | null;
  plays: number | null;
  cover_url: string | null;
}

function isPaidStatus(status: string | null) {
  return ["paid", "completed", "approved"].includes(
    status?.toLowerCase() ?? "",
  );
}

function getDayKey(value: Date) {
  const year = value.getFullYear();

  const month = String(
    value.getMonth() + 1,
  ).padStart(2, "0");

  const day = String(value.getDate()).padStart(
    2,
    "0",
  );

  return `${year}-${month}-${day}`;
}

function createSalesTimeline(
  paidOrders: OrderRow[],
): DashboardSalePoint[] {
  const totalsByDay = new Map<string, number>();

  const monthLabels = [
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

  for (const order of paidOrders) {
    const dateValue =
      order.paid_at || order.created_at;

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      continue;
    }

    const key = getDayKey(date);
    const amount = Number(order.total ?? 0);

    totalsByDay.set(
      key,
      (totalsByDay.get(key) ?? 0) +
        (Number.isFinite(amount) ? amount : 0),
    );
  }

  const points: DashboardSalePoint[] = [];
  const today = new Date();

  today.setHours(12, 0, 0, 0);

  for (
    let offset = 29;
    offset >= 0;
    offset -= 1
  ) {
    const date = new Date(today);

    date.setDate(today.getDate() - offset);

    const key = getDayKey(date);

    const day = String(date.getDate()).padStart(
      2,
      "0",
    );

    const month =
      monthLabels[date.getMonth()] ?? "";

    points.push({
      date: key,
      label: `${day}-${month}`,
      total: totalsByDay.get(key) ?? 0,
    });
  }

  return points;
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  const [
    ordersResult,
    orderItemsResult,
    beatsResult,
  ] = await Promise.all([
    supabase
      .from("orders")
      .select(
        `
          id,
          customer_name,
          customer_email,
          status,
          total,
          currency,
          paid_at,
          created_at
        `,
      )
      .order("created_at", {
        ascending: false,
      }),

    supabase
      .from("order_items")
      .select(
        `
          order_id,
          beat_id,
          beat_title,
          license_name,
          unit_price
        `,
      ),

    supabase
      .from("beats")
      .select(
        `
          id,
          title,
          status,
          plays,
          cover_url
        `,
      )
      .order("plays", {
        ascending: false,
      }),
  ]);

  const firstError =
    ordersResult.error ||
    orderItemsResult.error ||
    beatsResult.error;

  if (firstError) {
    return (
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6">
          <h1 className="text-xl font-semibold text-red-200">
            No fue posible cargar el Dashboard
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-200/70">
            {firstError.message}
          </p>
        </div>
      </div>
    );
  }

  const orders =
    (ordersResult.data ?? []) as OrderRow[];

  const orderItems =
    (orderItemsResult.data ??
      []) as OrderItemRow[];

  const beats =
    (beatsResult.data ?? []) as BeatRow[];

  const paidOrders = orders.filter((order) =>
    isPaidStatus(order.status),
  );

  const paidOrderIds = new Set(
    paidOrders.map((order) => order.id),
  );

  const paidItems = orderItems.filter((item) =>
    paidOrderIds.has(item.order_id),
  );

  const totalRevenue = paidOrders.reduce(
    (total, order) => {
      const amount = Number(order.total ?? 0);

      return (
        total +
        (Number.isFinite(amount) ? amount : 0)
      );
    },
    0,
  );

  const customerEmails = new Set(
    paidOrders
      .map((order) =>
        order.customer_email
          ?.trim()
          .toLowerCase(),
      )
      .filter(
        (email): email is string =>
          Boolean(email),
      ),
  );

  const beatSalesMap = new Map<
    string,
    DashboardTopBeat
  >();

  for (const item of paidItems) {
    const beatId =
      item.beat_id || "unknown-beat";

    const amount = Number(
      item.unit_price ?? 0,
    );

    const current =
      beatSalesMap.get(beatId) ?? {
        beatId,
        title:
          item.beat_title ||
          "Beat sin título",
        sales: 0,
        revenue: 0,
      };

    current.sales += 1;

    current.revenue += Number.isFinite(
      amount,
    )
      ? amount
      : 0;

    beatSalesMap.set(beatId, current);
  }

  const topBeats = Array.from(
    beatSalesMap.values(),
  )
    .sort((a, b) => {
      if (b.sales !== a.sales) {
        return b.sales - a.sales;
      }

      return b.revenue - a.revenue;
    })
    .slice(0, 5);

  const licenseRevenueMap = new Map<
    string,
    DashboardLicenseRevenue
  >();

  for (const item of paidItems) {
    const licenseName =
      item.license_name?.trim() ||
      "Sin licencia";

    const amount = Number(
      item.unit_price ?? 0,
    );

    const current =
      licenseRevenueMap.get(
        licenseName,
      ) ?? {
        licenseName,
        sales: 0,
        revenue: 0,
      };

    current.sales += 1;

    current.revenue += Number.isFinite(
      amount,
    )
      ? amount
      : 0;

    licenseRevenueMap.set(
      licenseName,
      current,
    );
  }

  const revenueByLicense = Array.from(
    licenseRevenueMap.values(),
  ).sort(
    (a, b) => b.revenue - a.revenue,
  );

  const recentOrders: DashboardRecentOrder[] =
    orders.slice(0, 6).map((order) => ({
      id: order.id,
      customerName:
        order.customer_name ||
        "Cliente sin nombre",
      customerEmail:
        order.customer_email ||
        "Sin correo",
      status:
        order.status || "unknown",
      total: Number(order.total ?? 0),
      currency:
        order.currency || "USD",
      createdAt: order.created_at,
    }));

  const mostPlayedBeats: DashboardMostPlayedBeat[] =
    beats
      .filter(
        (beat) =>
          Number(beat.plays ?? 0) > 0,
      )
      .slice(0, 5)
      .map((beat) => ({
        id: beat.id,
        title: beat.title,
        plays: Number(beat.plays ?? 0),
        coverUrl: beat.cover_url,
      }));

  const dashboardData: DashboardData = {
    totalRevenue,

    totalOrders:
      paidOrders.length,

    totalCustomers:
      customerEmails.size,

    productsSold:
      paidItems.length,

    publishedBeats: beats.filter(
      (beat) =>
        beat.status?.toLowerCase() ===
        "published",
    ).length,

    totalPlays: beats.reduce(
      (total, beat) =>
        total +
        Number(beat.plays ?? 0),
      0,
    ),

    salesLast30Days:
      createSalesTimeline(paidOrders),

    recentOrders,
    topBeats,
    revenueByLicense,
    mostPlayedBeats,
  };

  return (
    <AdminDashboard
      data={dashboardData}
    />
  );
}