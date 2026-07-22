import CustomersManager from "../../../components/admin/customers/CustomersManager";

import type {
  AdminCustomer,
  CustomerCategory,
  CustomerPurchase,
} from "../../../components/admin/customers/types";

import { createClient } from "../../../lib/supabase/server";

export const dynamic = "force-dynamic";

interface CustomerOrderRow {
  id: string;
  customer_name: string | null;
  customer_email: string | null;
  artist_name: string | null;
  status: string | null;
  payment_provider: string | null;
  payment_reference: string | null;
  currency: string | null;
  total: number | string | null;
  paid_at: string | null;
  created_at: string;
}

interface OrderItemRow {
  id: string;
  order_id: string;
  beat_title: string | null;
  license_name: string | null;
  audio_format: string | null;
  unit_price: number | string | null;
  exclusive: boolean | null;
}

interface CustomerAccumulator {
  email: string;
  customerName: string;
  artistName: string | null;

  ordersCount: number;
  paidOrdersCount: number;
  productsCount: number;

  totalSpent: number;
  currency: string;

  firstPurchaseAt: string | null;
  lastPurchaseAt: string | null;

  purchases: CustomerPurchase[];
}

function isPaidStatus(status: string | null) {
  const normalizedStatus =
    status?.trim().toLowerCase();

  return (
    normalizedStatus === "paid" ||
    normalizedStatus === "completed" ||
    normalizedStatus === "approved"
  );
}

function normalizeEmail(email: string | null) {
  return email?.trim().toLowerCase() ?? "";
}

function getCustomerCategory(
  totalSpent: number,
  paidOrdersCount: number,
): CustomerCategory {
  if (totalSpent >= 500) {
    return "vip";
  }

  if (paidOrdersCount >= 5) {
    return "frequent";
  }

  if (paidOrdersCount >= 2) {
    return "active";
  }

  return "new";
}

function getValidDate(value: string | null) {
  if (!value) {
    return null;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? null
    : timestamp;
}

function getSafeNumber(
  value: number | string | null,
) {
  const numericValue = Number(value ?? 0);

  return Number.isFinite(numericValue)
    ? numericValue
    : 0;
}

export default async function AdminCustomersPage() {
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
        total,
        paid_at,
        created_at
      `,
    )
    .not("customer_email", "is", null)
    .order("created_at", {
      ascending: false,
    });

  if (ordersError) {
    return (
      <div className="mx-auto w-full max-w-[1500px]">
        <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6">
          <h1 className="text-xl font-semibold text-red-200">
            No fue posible cargar los clientes
          </h1>

          <p className="mt-2 text-sm leading-6 text-red-200/70">
            {ordersError.message}
          </p>
        </div>
      </div>
    );
  }

  const orders =
    (ordersData ?? []) as CustomerOrderRow[];

  const orderIds = orders.map(
    (order) => order.id,
  );

  let orderItems: OrderItemRow[] = [];

  if (orderIds.length > 0) {
    const {
      data: orderItemsData,
      error: orderItemsError,
    } = await supabase
      .from("order_items")
      .select(
        `
          id,
          order_id,
          beat_title,
          license_name,
          audio_format,
          unit_price,
          exclusive
        `,
      )
      .in("order_id", orderIds);

    if (orderItemsError) {
      return (
        <div className="mx-auto w-full max-w-[1500px]">
          <div className="rounded-2xl border border-red-400/20 bg-red-500/10 p-6">
            <h1 className="text-xl font-semibold text-red-200">
              No fue posible cargar las compras
            </h1>

            <p className="mt-2 text-sm leading-6 text-red-200/70">
              {orderItemsError.message}
            </p>
          </div>
        </div>
      );
    }

    orderItems =
      (orderItemsData ?? []) as OrderItemRow[];
  }

  const itemsByOrder = orderItems.reduce<
    Map<string, OrderItemRow[]>
  >((itemsMap, item) => {
    const currentItems =
      itemsMap.get(item.order_id) ?? [];

    currentItems.push(item);

    itemsMap.set(
      item.order_id,
      currentItems,
    );

    return itemsMap;
  }, new Map<string, OrderItemRow[]>());

  const groupedCustomers = orders.reduce<
    Map<string, CustomerAccumulator>
  >((customers, order) => {
    const email = normalizeEmail(
      order.customer_email,
    );

    if (!email) {
      return customers;
    }

    const existingCustomer =
      customers.get(email);

    const paid = isPaidStatus(order.status);

    const safeOrderTotal = getSafeNumber(
      order.total,
    );

    const purchaseDate =
      order.paid_at ?? order.created_at;

    const currentOrderItems =
      itemsByOrder.get(order.id) ?? [];

    const productsInOrder =
      currentOrderItems.length;

    const orderPurchases: CustomerPurchase[] =
      paid
        ? currentOrderItems.map((item) => ({
            id: item.id,

            beatTitle:
              item.beat_title?.trim() ||
              "Beat sin nombre",

            license:
              item.license_name?.trim() ||
              "Licencia sin nombre",

            total: getSafeNumber(
              item.unit_price,
            ),

            currency:
              order.currency?.trim() ||
              "USD",

            paymentStatus: order.status,

            paymentProvider:
              order.payment_provider,

            purchaseDate,

            downloadUrl: null,
          }))
        : [];

    if (!existingCustomer) {
      customers.set(email, {
        email,

        customerName:
          order.customer_name?.trim() ||
          "Cliente sin nombre",

        artistName:
          order.artist_name?.trim() ||
          null,

        ordersCount: 1,

        paidOrdersCount: paid ? 1 : 0,

        productsCount: paid
          ? productsInOrder
          : 0,

        totalSpent: paid
          ? safeOrderTotal
          : 0,

        currency:
          order.currency?.trim() ||
          "USD",

        firstPurchaseAt: paid
          ? purchaseDate
          : null,

        lastPurchaseAt: paid
          ? purchaseDate
          : null,

        purchases: orderPurchases,
      });

      return customers;
    }

    existingCustomer.ordersCount += 1;

    if (
      order.customer_name?.trim() &&
      existingCustomer.customerName ===
        "Cliente sin nombre"
    ) {
      existingCustomer.customerName =
        order.customer_name.trim();
    }

    if (
      order.artist_name?.trim() &&
      !existingCustomer.artistName
    ) {
      existingCustomer.artistName =
        order.artist_name.trim();
    }

    if (order.currency?.trim()) {
      existingCustomer.currency =
        order.currency.trim();
    }

    if (!paid) {
      return customers;
    }

    existingCustomer.paidOrdersCount += 1;

    existingCustomer.productsCount +=
      productsInOrder;

    existingCustomer.totalSpent +=
      safeOrderTotal;

    existingCustomer.purchases.push(
      ...orderPurchases,
    );

    const currentPurchaseTime =
      getValidDate(purchaseDate);

    const firstPurchaseTime =
      getValidDate(
        existingCustomer.firstPurchaseAt,
      );

    const lastPurchaseTime =
      getValidDate(
        existingCustomer.lastPurchaseAt,
      );

    if (
      currentPurchaseTime !== null &&
      (firstPurchaseTime === null ||
        currentPurchaseTime <
          firstPurchaseTime)
    ) {
      existingCustomer.firstPurchaseAt =
        purchaseDate;
    }

    if (
      currentPurchaseTime !== null &&
      (lastPurchaseTime === null ||
        currentPurchaseTime >
          lastPurchaseTime)
    ) {
      existingCustomer.lastPurchaseAt =
        purchaseDate;
    }

    return customers;
  }, new Map<string, CustomerAccumulator>());

  const preparedCustomers: AdminCustomer[] =
    Array.from(groupedCustomers.values())
      .map((customer) => ({
        ...customer,

        category: getCustomerCategory(
          customer.totalSpent,
          customer.paidOrdersCount,
        ),

        purchases: [
          ...customer.purchases,
        ].sort(
          (
            firstPurchase,
            secondPurchase,
          ) =>
            new Date(
              secondPurchase.purchaseDate,
            ).getTime() -
            new Date(
              firstPurchase.purchaseDate,
            ).getTime(),
        ),
      }))
      .sort(
        (
          firstCustomer,
          secondCustomer,
        ) => {
          if (
            secondCustomer.totalSpent !==
            firstCustomer.totalSpent
          ) {
            return (
              secondCustomer.totalSpent -
              firstCustomer.totalSpent
            );
          }

          const firstDate =
            getValidDate(
              firstCustomer.lastPurchaseAt,
            ) ?? 0;

          const secondDate =
            getValidDate(
              secondCustomer.lastPurchaseAt,
            ) ?? 0;

          return secondDate - firstDate;
        },
      );

  return (
    <CustomersManager
      initialCustomers={preparedCustomers}
    />
  );
}