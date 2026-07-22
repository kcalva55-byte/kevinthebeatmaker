import Link from "next/link";
import {
  CalendarDays,
  MessageSquare,
  Music2,
  Play,
  ShoppingBag,
  TrendingUp,
  Users,
} from "lucide-react";

import StatCard from "../../components/dashboard/StatCard";

const recentBeats = [
  {
    title: "Night Drive",
    genre: "Reggaetón",
    plays: "1,284",
  },
  {
    title: "No Mercy",
    genre: "Trap",
    plays: "923",
  },
  {
    title: "Cold City",
    genre: "Detroit",
    plays: "681",
  },
];

export default function StudioDashboardPage() {
  return (
    <div>
      <section className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
            Resumen general
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Bienvenido a KTB Studio
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Administra tus beats, solicitudes, clientes, ventas y reservas
            desde un solo lugar.
          </p>
        </div>

        <Link
          href="/studio/beats"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold shadow-lg shadow-blue-600/25 transition hover:-translate-y-1 hover:bg-blue-500"
        >
          <Music2 size={19} />
          Añadir nuevo beat
        </Link>
      </section>

      <section className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Beats publicados"
          value="12"
          detail="+2 este mes"
          icon={Music2}
        />

        <StatCard
          title="Solicitudes"
          value="8"
          detail="3 pendientes"
          icon={MessageSquare}
        />

        <StatCard
          title="Reservas"
          value="5"
          detail="Próximos 30 días"
          icon={CalendarDays}
        />

        <StatCard
          title="Ventas"
          value="$420"
          detail="+18% este mes"
          icon={ShoppingBag}
        />
      </section>

      <section className="mt-7 grid gap-7 xl:grid-cols-[1.35fr_.65fr]">
        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-400">
                Actividad de beats
              </p>

              <h3 className="mt-2 text-2xl font-black">
                Más reproducidos
              </h3>
            </div>

            <TrendingUp className="text-blue-400" />
          </div>

          <div className="mt-7 space-y-4">
            {recentBeats.map((beat, index) => (
              <div
                key={beat.title}
                className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.025] p-4"
              >
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600/15 text-blue-400">
                    <Play size={19} fill="currentColor" />
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-bold">{beat.title}</p>
                    <p className="mt-1 text-sm text-slate-500">
                      {beat.genre}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-bold">{beat.plays}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    reproducciones
                  </p>
                </div>

                <span className="hidden text-sm font-bold text-white/20 sm:block">
                  0{index + 1}
                </span>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 shadow-2xl backdrop-blur-xl sm:p-8">
          <p className="text-sm font-semibold text-slate-400">
            Accesos rápidos
          </p>

          <h3 className="mt-2 text-2xl font-black">
            Gestionar plataforma
          </h3>

          <div className="mt-7 space-y-3">
            <Link
              href="/studio/beats"
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.025] p-4 transition hover:bg-white/[0.06]"
            >
              <span className="flex items-center gap-3">
                <Music2 size={20} className="text-blue-400" />
                Beats
              </span>

              <span className="text-slate-600">12</span>
            </Link>

            <Link
              href="/studio/clientes"
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.025] p-4 transition hover:bg-white/[0.06]"
            >
              <span className="flex items-center gap-3">
                <Users size={20} className="text-blue-400" />
                Clientes
              </span>

              <span className="text-slate-600">24</span>
            </Link>

            <Link
              href="/studio/reservas"
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.025] p-4 transition hover:bg-white/[0.06]"
            >
              <span className="flex items-center gap-3">
                <CalendarDays size={20} className="text-blue-400" />
                Reservas
              </span>

              <span className="text-slate-600">5</span>
            </Link>

            <Link
              href="/studio/mensajes"
              className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.025] p-4 transition hover:bg-white/[0.06]"
            >
              <span className="flex items-center gap-3">
                <MessageSquare size={20} className="text-blue-400" />
                Mensajes
              </span>

              <span className="text-slate-600">8</span>
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}