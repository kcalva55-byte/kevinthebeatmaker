import Image from "next/image";
import Link from "next/link";
import { Bell, LogOut, Search } from "lucide-react";

import { logout } from "../../app/studio/actions";

export default function DashboardHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#030712]/80 px-5 py-4 backdrop-blur-2xl sm:px-7">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
            KTB Studio
          </p>

          <h1 className="mt-1 text-xl font-black sm:text-2xl">
            Panel de administración
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2.5 md:flex">
            <Search size={18} className="text-slate-500" />

            <input
              type="search"
              placeholder="Buscar..."
              className="w-40 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
            />
          </div>

          <button
            type="button"
            aria-label="Notificaciones"
            className="relative rounded-full border border-white/10 bg-white/[0.035] p-3 transition hover:bg-white/[0.07]"
          >
            <Bell size={20} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-blue-500" />
          </button>

          <Link
            href="/studio/configuracion"
            className="relative h-11 w-11 overflow-hidden rounded-full border border-blue-400/30"
          >
            <Image
              src="/images/logo-k.jpg"
              alt="Perfil de KTB Studio"
              fill
              sizes="44px"
              className="object-cover"
            />
          </Link>

          <form action={logout}>
            <button
              type="submit"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
              className="rounded-full border border-white/10 bg-white/[0.035] p-3 text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={20} />
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}