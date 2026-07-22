"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Music2,
  Package,
  PlusCircle,
  Settings,
  Users,
  X,
} from "lucide-react";

import LogoutButton from "./LogoutButton";

interface AdminSidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const navigationItems = [
  {
    label: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Beats",
    href: "/admin/beats",
    icon: Music2,
  },
  {
    label: "Nuevo beat",
    href: "/admin/beats/new",
    icon: PlusCircle,
  },
  {
    label: "Pedidos",
    href: "/admin/orders",
    icon: Package,
  },
  {
    label: "Clientes",
    href: "/admin/customers",
    icon: Users,
  },
  {
    label: "Configuración",
    href: "/admin/settings",
    icon: Settings,
  },
];

export default function AdminSidebar({
  isMobileOpen = false,
  onMobileClose,
}: AdminSidebarProps) {
  const pathname = usePathname();

  function isActiveRoute(href: string) {
    if (href === "/admin/dashboard") {
      return pathname === href;
    }

    if (href === "/admin/beats") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {isMobileOpen ? (
        <button
          type="button"
          aria-label="Cerrar menú"
          onClick={onMobileClose}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-[280px] flex-col",
          "border-r border-white/10 bg-[#070a10]",
          "transition-transform duration-300 lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-20 items-center justify-between border-b border-white/10 px-6">
          <Link
            href="/admin/dashboard"
            onClick={onMobileClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-500/10">
              <Music2 className="h-5 w-5 text-blue-400" />
            </div>

            <div>
              <p className="font-bold tracking-tight text-white">
                KTB Studio
              </p>

              <p className="text-xs text-white/40">
                Administración
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onMobileClose}
            aria-label="Cerrar menú"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-white/50 transition hover:bg-white/5 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          <p className="mb-3 px-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/30">
            Menú principal
          </p>

          <nav className="space-y-1.5">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const active = isActiveRoute(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={[
                    "group flex items-center gap-3 rounded-xl px-4 py-3",
                    "text-sm font-medium transition",
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-950/30"
                      : "text-white/55 hover:bg-white/[0.05] hover:text-white",
                  ].join(" ")}
                >
                  <Icon
                    className={[
                      "h-5 w-5 shrink-0 transition",
                      active
                        ? "text-white"
                        : "text-white/35 group-hover:text-blue-400",
                    ].join(" ")}
                  />

                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="border-t border-white/10 p-4">
          <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-sm font-semibold text-white">
              Kevin The Beatmaker
            </p>

            <p className="mt-1 text-xs text-white/40">
              Administrador
            </p>
          </div>

          <LogoutButton />
        </div>
      </aside>
    </>
  );
}