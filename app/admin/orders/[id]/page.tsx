import { notFound } from "next/navigation";

import OrderDetail, {
  type OrderDetailData,
  type OrderDetailItem,
} from "../../../../components/admin/orders/OrderDetail";

import { createClient } from "../../../../lib/supabase/server";

interface AdminOrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error: orderError } =
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
      .eq("id", id)
      .maybeSingle();

  if (orderError) {
    return (
      <div className="mx-auto w-full max-w-[1400px]">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6">
          <h1 className="text-xl font-semibold text-red-200">
            No fue posible cargar el pedido
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-200/70">
            {orderError.message}
          </p>
        </div>
      </div>
    );
  }

  if (!order) {
    notFound();
  }

  const { data: items, error: itemsError } =
    await supabase
      .from("order_items")
      .select(
        `
          id,
          order_id,
          beat_id,
          license_id,
          beat_title,
          license_name,
          audio_format,
          unit_price,
          exclusive,
          created_at
        `,
      )
      .eq("order_id", id)
      .order("created_at", {
        ascending: true,
      });

  if (itemsError) {
    return (
      <div className="mx-auto w-full max-w-[1400px]">
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

  return (
    <OrderDetail
      order={order as OrderDetailData}
      items={(items ?? []) as OrderDetailItem[]}
    />
  );
}