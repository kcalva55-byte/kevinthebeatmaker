import OrdersManager, {
  type AdminOrder,
} from "../../../components/admin/orders/OrdersManager";

import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

interface OrderItemReference {
  order_id: string;
}

export default async function AdminOrdersPage() {
  const supabase = await createClient();

  const { data: orders, error: ordersError } =
    await supabase
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
          terms_accepted,
          paid_at,
          created_at
        `,
      )
      .order("created_at", {
        ascending: false,
      });

  if (ordersError) {
    return (
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6">
          <h1 className="text-xl font-semibold text-red-200">
            No fue posible cargar los pedidos
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-200/70">
            {ordersError.message}
          </p>
        </div>
      </div>
    );
  }

  const orderIds = (orders ?? []).map(
    (order) => order.id,
  );

  let orderItems: OrderItemReference[] = [];

  if (orderIds.length > 0) {
    const { data, error: itemsError } =
      await supabase
        .from("order_items")
        .select("order_id")
        .in("order_id", orderIds);

    if (itemsError) {
      return (
        <div className="mx-auto w-full max-w-[1500px]">
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

    orderItems =
      (data ?? []) as OrderItemReference[];
  }

  const itemCounts = orderItems.reduce(
    (counts, item) => {
      counts.set(
        item.order_id,
        (counts.get(item.order_id) ?? 0) + 1,
      );

      return counts;
    },
    new Map<string, number>(),
  );

  const preparedOrders: AdminOrder[] = (
    orders ?? []
  ).map((order) => ({
    ...order,
    items_count: itemCounts.get(order.id) ?? 0,
  })) as AdminOrder[];

  return (
    <OrdersManager initialOrders={preparedOrders} />
  );
}