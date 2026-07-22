import {
  Crown,
  DollarSign,
  UserCheck,
  Users,
} from "lucide-react";

interface TopCustomer {
  name: string;
  amount: number;
}

interface CustomerStatsProps {
  totalCustomers: number;
  activeCustomers: number;
  totalRevenue: number;
  topCustomer: TopCustomer | null;
  currency?: string;
}

function formatMoney(
  value: number,
  currency: string,
) {
  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
  }).format(
    Number.isFinite(value) ? value : 0,
  );
}

export default function CustomerStats({
  totalCustomers,
  activeCustomers,
  totalRevenue,
  topCustomer,
  currency = "USD",
}: CustomerStatsProps) {
  return (
    <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/40">
              Clientes registrados
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalCustomers}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
            <Users className="h-5 w-5 text-blue-400" />
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/40">
              Clientes activos
            </p>

            <p className="mt-2 text-3xl font-bold">
              {activeCustomers}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10">
            <UserCheck className="h-5 w-5 text-emerald-300" />
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/40">
              Ingresos generados
            </p>

            <p className="mt-2 text-3xl font-bold">
              {formatMoney(
                totalRevenue,
                currency,
              )}
            </p>
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-500/10">
            <DollarSign className="h-5 w-5 text-emerald-300" />
          </div>
        </div>
      </article>

      <article className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-white/40">
              Cliente con mayor gasto
            </p>

            {topCustomer ? (
              <>
                <p className="mt-2 truncate text-lg font-bold">
                  {topCustomer.name}
                </p>

                <p className="mt-1 text-sm font-semibold text-amber-300">
                  {formatMoney(
                    topCustomer.amount,
                    currency,
                  )}
                </p>
              </>
            ) : (
              <p className="mt-2 text-lg font-semibold text-white/35">
                Sin clientes
              </p>
            )}
          </div>

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-500/10">
            <Crown className="h-5 w-5 text-amber-300" />
          </div>
        </div>
      </article>
    </section>
  );
}