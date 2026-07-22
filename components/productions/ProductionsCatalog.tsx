"use client";

import { useMemo, useState } from "react";
import {
  ExternalLink,
  Play,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import {
  productionArtists,
  productions,
} from "@/data/productions";

function getYouTubeVideoId(url: string) {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.hostname.includes("youtu.be")) {
      return parsedUrl.pathname.split("/").filter(Boolean)[0] ?? "";
    }

    if (parsedUrl.hostname.includes("youtube.com")) {
      return parsedUrl.searchParams.get("v") ?? "";
    }

    return "";
  } catch {
    return "";
  }
}

function getThumbnailUrl(youtubeUrl: string) {
  const videoId = getYouTubeVideoId(youtubeUrl);

  if (!videoId) {
    return "";
  }

  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export default function ProductionsCatalog() {
  const [selectedArtist, setSelectedArtist] = useState("Todos");
  const [search, setSearch] = useState("");

  const filteredProductions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return productions.filter((production) => {
      const matchesArtist =
        selectedArtist === "Todos" ||
        production.artist === selectedArtist;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        production.title.toLowerCase().includes(normalizedSearch) ||
        production.artist.toLowerCase().includes(normalizedSearch) ||
        production.services.some((service) =>
          service.toLowerCase().includes(normalizedSearch),
        );

      return matchesArtist && matchesSearch;
    });
  }, [search, selectedArtist]);

  return (
    <section className="relative overflow-hidden px-6 pb-28 pt-12 sm:px-8 lg:px-12">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-blue-600/10 blur-[140px]" />

      <div className="relative mx-auto w-full max-w-7xl">
        <div className="mx-auto max-w-4xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">
            KTB Studio
          </p>

          <h1 className="mt-4 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
            Producciones
          </h1>

          <p className="mx-auto mt-6 max-w-3xl text-base leading-8 text-white/60 sm:text-lg">
            Explora trabajos reales en los que participé realizando beats,
            grabación de voces, mezcla y mastering para diferentes artistas.
          </p>
        </div>

        <div className="mt-14 grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-center">
            <p className="text-3xl font-bold text-white">
              {productions.length}+
            </p>

            <p className="mt-2 text-sm text-white/50">
              Producciones
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-center">
            <p className="text-3xl font-bold text-white">
              {productionArtists.length - 1}
            </p>

            <p className="mt-2 text-sm text-white/50">
              Artistas
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 text-center">
            <p className="text-3xl font-bold text-white">
              100%
            </p>

            <p className="mt-2 text-sm text-white/50">
              Trabajos reales
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-3xl border border-white/10 bg-white/[0.025] p-4 sm:p-6">
          <div className="flex flex-col gap-5">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/35"
                size={19}
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Buscar canción, artista o servicio..."
                className="h-12 w-full rounded-2xl border border-white/10 bg-black/20 pl-12 pr-4 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <div>
              <div className="mb-3 flex items-center gap-2 text-sm text-white/45">
                <SlidersHorizontal size={17} />
                Filtrar por artista
              </div>

              <div className="flex flex-wrap gap-2">
                {productionArtists.map((artist) => {
                  const isActive = selectedArtist === artist;

                  return (
                    <button
                      key={artist}
                      type="button"
                      onClick={() => setSelectedArtist(artist)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? "border-blue-500 bg-blue-500 text-white shadow-lg shadow-blue-950/30"
                          : "border-white/10 bg-white/[0.035] text-white/60 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                      }`}
                    >
                      {artist}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-sm text-white/45">
            {filteredProductions.length}{" "}
            {filteredProductions.length === 1
              ? "producción encontrada"
              : "producciones encontradas"}
          </p>

          {(selectedArtist !== "Todos" || search.length > 0) && (
            <button
              type="button"
              onClick={() => {
                setSelectedArtist("Todos");
                setSearch("");
              }}
              className="text-sm font-semibold text-blue-400 transition hover:text-blue-300"
            >
              Limpiar filtros
            </button>
          )}
        </div>

        {filteredProductions.length > 0 ? (
          <div className="mt-8 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
            {filteredProductions.map((production) => {
              const thumbnailUrl = getThumbnailUrl(
                production.youtubeUrl,
              );

              return (
                <article
                  key={production.id}
                  className="group overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035] transition duration-300 hover:-translate-y-1 hover:border-blue-500/40 hover:bg-white/[0.05]"
                >
                  <a
                    href={production.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Ver ${production.title} de ${production.artist} en YouTube`}
                    className="relative block aspect-video overflow-hidden bg-white/5"
                  >
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt={`${production.artist} - ${production.title}`}
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm text-white/30">
                        Miniatura no disponible
                      </div>
                    )}

                    <div className="absolute inset-0 bg-black/25 transition duration-300 group-hover:bg-black/45" />

                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-2xl shadow-black/50 transition duration-300 group-hover:scale-110">
                        <Play
                          size={27}
                          className="ml-1 fill-current"
                        />
                      </div>
                    </div>
                  </a>

                  <div className="p-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-400">
                      {production.artist}
                    </p>

                    <h2 className="mt-2 text-2xl font-bold text-white">
                      {production.title}
                    </h2>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {production.services.map((service) => (
                        <span
                          key={service}
                          className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1.5 text-xs text-white/60"
                        >
                          {service}
                        </span>
                      ))}
                    </div>

                    <a
                      href={production.youtubeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-blue-400 transition hover:text-blue-300"
                    >
                      Ver en YouTube
                      <ExternalLink size={17} />
                    </a>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
            <h2 className="text-xl font-semibold text-white">
              No encontramos producciones
            </h2>

            <p className="mt-3 text-sm text-white/45">
              Prueba con otro artista o cambia el texto de búsqueda.
            </p>

            <button
              type="button"
              onClick={() => {
                setSelectedArtist("Todos");
                setSearch("");
              }}
              className="mt-6 rounded-full bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              Mostrar todas
            </button>
          </div>
        )}
      </div>
    </section>
  );
}