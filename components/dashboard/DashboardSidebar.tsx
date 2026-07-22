"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BarChart3,
  CalendarDays,
  ChevronLeft,
  LayoutDashboard,
  MessageSquare,
  Music2,
  Settings,
  ShoppingBag,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";

const links = [
  {
    label: "Dashboard",
    href: "/studio",
    icon: LayoutDashboard,
  },
  {
    label: "Beats",
    href: "/studio/beats",
    icon: Music2,
  },
  {
    label: "Reservas",
    href: "/studio/reservas",
    icon: CalendarDays,
  },
  {
    label: "Mensajes",
    href: "/studio/mensajes",
    icon: MessageSquare,
  },
  {
    label: "Ventas",
    href: "/studio/ventas",
    icon: ShoppingBag,
  },
  {
    label: "Clientes",
    href: "/studio/clientes",
    icon: Users,
  },
  {
    label: "Estadísticas",
    href: "/studio/estadisticas",
    icon: BarChart3,
  },
  {
    label: "Configuración",
    href: "/studio/configuracion",
    icon: Settings,
  },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden min-h-screen w-72 shrink-0 border-r border-white/10 bg-[#050b16]/95 p-5 backdrop-blur-2xl lg:flex lg:flex-col">
      <Link href="/studio" className="flex items-center gap-3 px-2">
        <div className="relative h-12 w-12 overflow-hidden rounded-2xl border border-blue-400/30 shadow-[0_0_30px_rgba(37,99,235,.25)]">
          <Image
            src="/images/logo-k.jpg"
            alt="Logo de KTB Studio"
            fill
            sizes="48px"
            className="object-cover"
            priority
          />
        </div>

        <div>
          <p className="font-black text-white">KTB Studio</p>
          <p className="mt-1 text-xs uppercase tracking-[0.2em] text-blue-400">
            Administración
          </p>
        </div>
      </Link>

      <nav className="mt-10 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const active =
            link.href === "/studio"
              ? pathname === "/studio"
              : pathname.startsWith(link.href);

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${
                active
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                  : "text-slate-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon
                size={20}
                className={
                  active
                    ? "text-white"
                    : "text-slate-500 transition group-hover:text-blue-400"
                }
              />

              {link.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm font-semibold text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
        >
          <ChevronLeft size={19} />
          Volver a la web
        </Link>
      </div>
    </aside>
  );
}