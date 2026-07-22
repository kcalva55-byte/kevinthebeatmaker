"use client";

import { ReactNode, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Menu, Search } from "lucide-react";

import AdminSidebar from "./AdminSidebar";

interface AdminShellProps {
  children: ReactNode;
}

const pageTitles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/beats": "Beats",
  "/admin/beats/new": "Nuevo beat",
  "/admin/orders": "Pedidos",
  "/admin/customers": "Clientes",
  "/admin/sales": "Ventas",
  "/admin/analytics": "Estadísticas",
  "/admin/settings": "Configuración",
};

function getPageTitle(pathname: string) {
  if (pageTitles[pathname]) {
    return pageTitles[pathname];
  }

  if (pathname.startsWith("/admin/beats/")) {
    return "Editar beat";
  }

  if (pathname.startsWith("/admin/orders/")) {
    return "Detalle del pedido";
  }

  return "Panel de administración";
}

export default function AdminShell({
  children,
}: AdminShellProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] =
    useState(false);

  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const pageTitle = getPageTitle(pathname);

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <AdminSidebar
        isMobileOpen={isMobileMenuOpen}
        onMobileClose={() => setIsMobileMenuOpen(false)}
      />

      <div className="min-h-screen lg:pl-[280px]">
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-white/10 bg-[#05070b]/85 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Abrir menú"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/65 transition hover:bg-white/[0.07] hover:text-white lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="truncate text-lg font-bold tracking-tight sm:text-xl">
                {pageTitle}
              </p>

              <p className="hidden text-xs text-white/40 sm:block">
                Panel de administración de KTB Studio
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative hidden xl:block">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

              <input
                type="search"
                placeholder="Buscar..."
                className="h-11 w-64 rounded-xl border border-white/10 bg-white/[0.03] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <button
              type="button"
              aria-label="Notificaciones"
              className="relative flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/55 transition hover:bg-white/[0.07] hover:text-white"
            >
              <Bell className="h-5 w-5" />

              <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-blue-500 ring-2 ring-[#05070b]" />
            </button>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-sm font-bold shadow-lg shadow-blue-950/40">
              KT
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}