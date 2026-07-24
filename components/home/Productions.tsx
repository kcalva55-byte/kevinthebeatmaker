"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Play } from "lucide-react";

import { featuredProductions } from "@/data/productions";
function getYouTubeThumbnail(url: string) {
  try {
    const parsed = new URL(url);

    let id = "";

    if (parsed.hostname.includes("youtu.be")) {
      id = parsed.pathname.slice(1);
    } else {
      id = parsed.searchParams.get("v") ?? "";
    }

    return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
  } catch {
    return "/images/placeholder.jpg";
  }
}
export default function Productions() {
  const [artist, setArtist] = useState("Todos");

  const featuredArtists = [
    "Todos",
    ...Array.from(
      new Set(
        featuredProductions.map(
          (production) => production.artist,
        ),
      ),
    ),
  ];

  const productions = useMemo(() => {
    if (artist === "Todos") {
      return featuredProductions;
    }

    return featuredProductions.filter(
      (production) => production.artist === artist,
    );
  }, [artist]);

  return (
    <section
      id="producciones"
      className="px-6 py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="text-center">
          <span className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
            Producciones
          </span>


          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-white/70 sm:text-xl">
  Estas son algunas de las producciones en las que participé como productor
  musical, ingeniero de grabación, mezcla y mastering.
</p>
        </div>

        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {featuredArtists.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setArtist(item)}
              className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                artist === item
                  ? "bg-blue-500 text-white"
                  : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="mt-16 grid gap-8 md:grid-cols-2 xl:grid-cols-3">
          {productions.map((production) => (
            <article
              key={production.id}
              className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.05] hover:shadow-2xl hover:shadow-blue-950/20"
            >
              <a
                href={production.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Ver ${production.title} de ${production.artist} en YouTube`}
                className="relative block aspect-video overflow-hidden bg-black"
              >
                <img
  src={getYouTubeThumbnail(production.youtubeUrl)}
  alt={`${production.title} de ${production.artist}`}
  loading="lazy"
  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
/>

                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/15 to-transparent" />

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white shadow-xl backdrop-blur-md transition-all duration-300 group-hover:scale-110 group-hover:border-blue-400/60 group-hover:bg-blue-600">
                    <Play
                      size={28}
                      fill="currentColor"
                      className="ml-1"
                    />
                  </span>
                </div>

                <span className="absolute bottom-4 left-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 text-xs font-medium text-white/80 backdrop-blur-md">
                  Ver en YouTube
                  <ExternalLink size={13} />
                </span>
              </a>

              <div className="p-6">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                  {production.artist}
                </p>

                <h3 className="mt-2 text-xl font-bold text-white">
                  {production.title}
                </h3>

                <div className="mt-4 flex flex-wrap gap-2">
                  {production.services.map((service) => (
                    <span
                      key={service}
                      className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs text-white/55"
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-lg font-semibold text-white">
            ¿Quieres ver más de mi trabajo?
          </p>

          <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-white/50 sm:text-base">
            Explora todas las producciones y descubre proyectos realizados para
            distintos artistas.
          </p>

          <Link
            href="/producciones"
            className="group mt-7 inline-flex items-center gap-3 rounded-full border border-blue-500/40 bg-blue-600/10 px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:border-blue-400 hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-600/20"
          >
            Ver todas las producciones

            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}