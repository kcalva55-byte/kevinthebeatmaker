import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  MessageCircle,
} from "lucide-react";
import {
  FaInstagram,
  FaSpotify,
  FaTiktok,
  FaYoutube,
} from "react-icons/fa";

import { createClient } from "../../lib/supabase/server";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Ponte en contacto con Kevin The Beatmaker para producción musical, beats personalizados y colaboraciones.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface ContactSettings {
  studio_name: string | null;
  producer_name: string | null;
  contact_email: string | null;
  support_email: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  spotify_url: string | null;
}

async function getContactSettings() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("site_settings")
    .select(
      `
        studio_name,
        producer_name,
        contact_email,
        support_email,
        instagram_url,
        youtube_url,
        tiktok_url,
        spotify_url
      `,
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error(
      "Error loading contact settings:",
      error.message,
    );

    return null;
  }

  return data as ContactSettings | null;
}

export default async function ContactPage() {
  const settings = await getContactSettings();

  const producerName =
    settings?.producer_name || "Kevin The Beatmaker";

  const studioName =
    settings?.studio_name || "KTB Studio";

  const email =
    settings?.contact_email ||
    settings?.support_email ||
    "";

  const contactItems = [
    {
      title: "Instagram",
      description:
        "Contenido, novedades y proyectos recientes.",
      href: settings?.instagram_url,
      action: "Abrir Instagram",
      icon: FaInstagram,
    },
    {
      title: "TikTok",
      description:
        "Videos, procesos creativos y contenido musical.",
      href: settings?.tiktok_url,
      action: "Abrir TikTok",
      icon: FaTiktok,
    },
    {
      title: "YouTube",
      description:
        "Producciones, lanzamientos y contenido audiovisual.",
      href: settings?.youtube_url,
      action: "Ver canal",
      icon: FaYoutube,
    },
    {
      title: "Spotify",
      description:
        "Escucha producciones y lanzamientos disponibles.",
      href: settings?.spotify_url,
      action: "Abrir Spotify",
      icon: FaSpotify,
    },
  ].filter((item) => Boolean(item.href));

  return (
    <main className="min-h-screen overflow-hidden bg-[#05070c] text-white">
      {/* Luces ambientales */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[520px] w-[850px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />

        <div className="absolute bottom-0 right-0 h-[420px] w-[420px] rounded-full bg-indigo-500/[0.07] blur-[130px]" />

        <div className="absolute left-[-180px] top-[35%] h-[360px] w-[360px] rounded-full bg-cyan-500/[0.04] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10">
        <Link
          href="/"
          className="group inline-flex items-center gap-2 text-sm text-white/55 transition duration-300 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Volver al inicio
        </Link>

        {/* Hero con foto */}
        <section className="grid items-center gap-12 pb-16 pt-14 sm:pb-20 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:pt-24">
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/20 bg-blue-500/10 px-4 py-2 text-sm font-medium text-blue-300 shadow-[0_0_30px_-12px_rgba(59,130,246,0.8)]">
              <MessageCircle className="h-4 w-4" />
              Contacto
            </div>

            <h1 className="mt-7 text-4xl font-bold tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Trabajemos juntos
            </h1>

            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-white/55 sm:text-lg lg:mx-0">
              ¿Tienes un proyecto musical? Ponte en contacto conmigo
              y conversemos sobre cómo podemos hacerlo realidad.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[380px] lg:mr-0">
            <div className="absolute -inset-6 rounded-[2.8rem] bg-blue-600/15 blur-3xl" />

            <div className="group relative aspect-[4/5] overflow-hidden rounded-[2.3rem] border border-blue-400/20 bg-white/[0.03] shadow-[0_35px_100px_-35px_rgba(37,99,235,0.55)] transition duration-700 ease-out hover:-translate-y-2 hover:border-blue-300/35 hover:shadow-[0_45px_110px_-35px_rgba(37,99,235,0.75)]">
              <Image
                src="/images/kevin-studio.png"
                alt="Kevin The Beatmaker trabajando en su estudio"
                fill
                priority
                sizes="(max-width: 1024px) 90vw, 35vw"
                className="object-cover object-center transition duration-1000 ease-out group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#05070c] via-[#05070c]/10 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
                <p className="text-xl font-semibold tracking-tight text-white">
                  {producerName}
                </p>

                <p className="mt-1 text-sm text-white/55">
                  {studioName}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contacto y redes */}
        <section className="grid gap-6 lg:grid-cols-[1.1fr_1.9fr]">
          <div className="group relative overflow-hidden rounded-3xl border border-blue-400/20 bg-gradient-to-br from-blue-600/15 to-white/[0.03] p-7 transition duration-500 ease-out hover:-translate-y-2 hover:border-blue-300/40 hover:shadow-[0_25px_70px_-25px_rgba(37,99,235,0.45)] sm:p-9">
            <div className="pointer-events-none absolute -right-20 -top-20 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl transition duration-700 group-hover:bg-blue-500/20" />

            <div className="relative">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300 transition duration-500 group-hover:-rotate-3 group-hover:scale-110 group-hover:border-blue-300/40 group-hover:bg-blue-500/20">
                <Mail className="h-7 w-7" />
              </div>

              <p className="mt-8 text-sm font-medium uppercase tracking-[0.18em] text-blue-300">
                Contacto directo
              </p>

              <h2 className="mt-3 text-2xl font-bold tracking-tight">
                Hablemos de tu proyecto
              </h2>

              <p className="mt-4 text-sm leading-7 text-white/55">
                Escríbeme para producción musical, beats personalizados,
                mezcla, mastering o grabación de voces.
              </p>

              {email ? (
                <>
                  <p className="mt-7 break-all text-sm font-medium text-white/70">
                    {email}
                  </p>

                  <a
                    href={`mailto:${email}?subject=${encodeURIComponent(
                      `Proyecto musical para ${studioName}`,
                    )}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition duration-300 hover:-translate-y-1 hover:bg-blue-500 hover:shadow-blue-500/30"
                  >
                    <Mail className="h-4 w-4" />
                    Enviar correo
                  </a>
                </>
              ) : (
                <p className="mt-7 text-sm text-white/40">
                  Agrega un correo desde el panel administrativo.
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            {contactItems.map((item) => {
              const Icon = item.icon;

              return (
                <a
                  key={item.title}
                  href={item.href ?? "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative flex min-h-[240px] flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-7 transition duration-500 ease-out hover:-translate-y-2 hover:scale-[1.015] hover:border-blue-400/35 hover:bg-blue-500/[0.07] hover:shadow-[0_25px_70px_-25px_rgba(37,99,235,0.4)]"
                >
                  <div className="pointer-events-none absolute -right-16 -top-16 h-36 w-36 rounded-full bg-blue-500/0 blur-3xl transition duration-700 group-hover:bg-blue-500/15" />

                  <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-500/10 text-blue-300 transition duration-500 group-hover:-rotate-3 group-hover:scale-110 group-hover:border-blue-300/40 group-hover:bg-blue-500/20">
                    <Icon className="h-6 w-6" />
                  </div>

                  <h2 className="relative mt-6 text-xl font-semibold">
                    {item.title}
                  </h2>

                  <p className="relative mt-3 text-sm leading-6 text-white/50">
                    {item.description}
                  </p>

                  <span className="relative mt-auto inline-flex items-center gap-2 pt-7 text-sm font-semibold text-blue-300 transition duration-300 group-hover:gap-3 group-hover:text-blue-200">
                    {item.action}
                    <span aria-hidden="true">→</span>
                  </span>
                </a>
              );
            })}
          </div>
        </section>

        {/* Bloque final */}
        <section className="group relative mt-20 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] px-6 py-10 text-center transition duration-500 hover:border-blue-400/20 sm:px-10">
          <div className="pointer-events-none absolute left-1/2 top-0 h-32 w-96 -translate-x-1/2 rounded-full bg-blue-500/[0.06] blur-3xl transition duration-700 group-hover:bg-blue-500/10" />

          <div className="relative">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-blue-300">
              {studioName}
            </p>

            <h2 className="mx-auto mt-4 max-w-2xl text-2xl font-bold tracking-tight sm:text-3xl">
              Lleva tu idea al siguiente nivel
            </h2>

            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">
              Cuéntame qué sonido buscas, qué servicio necesitas y en
              qué etapa se encuentra tu proyecto. Te responderé con la
              mejor opción para trabajar juntos.
            </p>

            <p className="mt-7 text-sm text-white/35">
              {producerName} · {studioName}
            </p>
          </div>
        </section>

        <div className="h-20" />
      </div>
    </main>
  );
}