"use client";

import { useMemo, useState } from "react";

import CustomerStats from "./CustomerStats";
import CustomersTable from "./CustomersTable";
import type { AdminCustomer } from "./types";
import CustomerDrawer from "./CustomerDrawer";

interface CustomersManagerProps {
  initialCustomers: AdminCustomer[];
}

export default function CustomersManager({
  initialCustomers,
}: CustomersManagerProps) {
  const [selectedCustomer, setSelectedCustomer] =
    useState<AdminCustomer | null>(null);

  const statistics = useMemo(() => {
    const totalCustomers = initialCustomers.length;

    const activeCustomers = initialCustomers.filter(
      (customer) =>
        customer.category === "active" ||
        customer.category === "frequent" ||
        customer.category === "vip",
    ).length;

    const totalRevenue = initialCustomers.reduce(
      (total, customer) =>
        total + customer.totalSpent,
      0,
    );

    const topCustomer =
      initialCustomers.length > 0
        ? [...initialCustomers].sort(
            (firstCustomer, secondCustomer) =>
              secondCustomer.totalSpent -
              firstCustomer.totalSpent,
          )[0]
        : null;

    return {
      totalCustomers,
      activeCustomers,
      totalRevenue,
      topCustomer: topCustomer
        ? {
            name: topCustomer.customerName,
            amount: topCustomer.totalSpent,
          }
        : null,
    };
  }, [initialCustomers]);

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <section className="mb-8">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-400">
          Clientes
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          Clientes
        </h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/45 sm:text-base">
          Consulta tus compradores, su actividad y el
          valor generado en KTB Studio.
        </p>
      </section>

      <CustomerStats
        totalCustomers={statistics.totalCustomers}
        activeCustomers={statistics.activeCustomers}
        totalRevenue={statistics.totalRevenue}
        topCustomer={statistics.topCustomer}
      />

      <CustomersTable
        customers={initialCustomers}
        onSelectCustomer={(customer) =>
          setSelectedCustomer(customer)
        }
      />

      <CustomerDrawer
  customer={selectedCustomer}
  open={selectedCustomer !== null}
  onClose={() => setSelectedCustomer(null)}
/>
    </div>
  );
}