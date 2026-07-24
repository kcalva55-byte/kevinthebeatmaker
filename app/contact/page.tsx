import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
} from "lucide-react";

import {
  FaInstagram,
  FaTiktok,
  FaSpotify,
  FaYoutube,
} from "react-icons/fa";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Ponte en contacto con Kevin The Beatmaker para producción musical, beats personalizados y colaboraciones.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-[#05070c] text-white">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[520px] w-[850px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-indigo-500/[0.07] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-white/55 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <section className="pb-16 pt-16 text-center sm:pb-20 sm:pt-24">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300">
            <MessageCircle className="h-4 w-4" />
            Contacto
          </div>

          <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
            Trabajemos juntos
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/55 sm:text-lg">
            ¿Tienes un proyecto musical? Ponte en contacto conmigo
            y conversemos sobre cómo podemos hacerlo realidad.
          </p>
        </section>

        {/* Aquí construiremos las tarjetas de contacto */}
      </div>
    </main>
  );
}