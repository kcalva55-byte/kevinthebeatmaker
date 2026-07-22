import Image from "next/image";
import Link from "next/link";
import { LockKeyhole, LogIn, Mail } from "lucide-react";

import { login } from "./actions";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function LoginPage({
  searchParams,
}: LoginPageProps) {
  const params = await searchParams;
  const error = params.error;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#030712] px-5 py-12 text-white">
      <div
        aria-hidden="true"
        className="absolute -left-40 -top-40 h-[520px] w-[520px] rounded-full bg-blue-600/20 blur-[170px]"
      />

      <div
        aria-hidden="true"
        className="absolute -bottom-52 -right-36 h-[560px] w-[560px] rounded-full bg-cyan-500/10 blur-[190px]"
      />

      <div className="absolute inset-0 opacity-[0.025]">
        <div className="h-full w-full bg-[linear-gradient(rgba(255,255,255,.8)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.8)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      <section className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#07101f]/85 p-7 shadow-[0_35px_120px_rgba(0,0,0,.65)] backdrop-blur-2xl sm:p-9">
        <div className="flex flex-col items-center text-center">
          <div className="relative h-20 w-20 overflow-hidden rounded-[1.5rem] border border-blue-400/30 shadow-[0_0_45px_rgba(37,99,235,.35)]">
            <Image
              src="/images/logo-k.jpg"
              alt="Logo de KTB Studio"
              fill
              sizes="80px"
              priority
              className="object-cover"
            />
          </div>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.32em] text-blue-400">
            KTB Studio
          </p>

          <h1 className="mt-3 text-3xl font-black">
            Acceso administrativo
          </h1>

          <p className="mt-3 leading-7 text-slate-400">
            Inicia sesión para administrar beats, clientes, reservas y ventas.
          </p>
        </div>

        <form action={login} className="mt-8 space-y-5">
          <label className="block">
            <span className="text-sm font-semibold text-slate-300">
              Correo electrónico
            </span>

            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 transition focus-within:border-blue-500">
              <Mail size={19} className="shrink-0 text-slate-500" />

              <input
                type="email"
                name="email"
                required
                autoComplete="email"
                placeholder="correo@ejemplo.com"
                className="w-full bg-transparent py-3.5 text-white outline-none placeholder:text-slate-600"
              />
            </div>
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-slate-300">
              Contraseña
            </span>

            <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 transition focus-within:border-blue-500">
              <LockKeyhole
                size={19}
                className="shrink-0 text-slate-500"
              />

              <input
                type="password"
                name="password"
                required
                autoComplete="current-password"
                placeholder="Tu contraseña"
                className="w-full bg-transparent py-3.5 text-white outline-none placeholder:text-slate-600"
              />
            </div>
          </label>

          {error && (
            <p className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-blue-600 px-7 py-4 font-bold shadow-lg shadow-blue-600/25 transition hover:-translate-y-1 hover:bg-blue-500 active:scale-[0.98]"
          >
            <LogIn size={20} />
            Iniciar sesión
          </button>
        </form>

        <div className="mt-7 border-t border-white/10 pt-6 text-center">
          <Link
            href="/"
            className="text-sm font-semibold text-slate-500 transition hover:text-blue-400"
          >
            Volver a la página principal
          </Link>
        </div>
      </section>
    </main>
  );
}