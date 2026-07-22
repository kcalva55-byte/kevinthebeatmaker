"use client";

import Link from "next/link";
import {
  ArrowDownUp,
  Disc3,
  ExternalLink,
  Music2,
  Play,
  Search,
  SlidersHorizontal,
} from "lucide-react";
import { useMemo, useState } from "react";

import { useMood } from "../providers/MoodProvider";

type SortOption =
  | "recent"
  | "title"
  | "bpm-asc"
  | "bpm-desc";

type BeatWithOptionalSlug = {
  slug?: string;
};

const genreOptions = [
  "Todos",
  "Reggaetón",
  "Trap",
  "Detroit",
  "Afrobeat",
];

function createSlug(title: string) {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BeatCatalog() {
  const {
    beats,
    activeBeatIndex,
    setActiveBeatIndex,
  } = useMood();

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("Todos");
  const [sort, setSort] =
    useState<SortOption>("recent");

  const filteredBeats = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    const result = beats
      .map((beat, originalIndex) => ({
        beat,
        originalIndex,
      }))
      .filter(({ beat }) => {
        const musicalKey =
          beat.musicalKey || "";

        const matchesSearch =
          !normalizedSearch ||
          beat.title
            .toLowerCase()
            .includes(normalizedSearch) ||
          beat.genre
            .toLowerCase()
            .includes(normalizedSearch) ||
          musicalKey
            .toLowerCase()
            .includes(normalizedSearch);

        const normalizedSelectedGenre =
          genre
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        const normalizedBeatGenre =
          beat.genre
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();

        const matchesGenre =
          genre === "Todos" ||
          normalizedBeatGenre ===
            normalizedSelectedGenre;

        return matchesSearch && matchesGenre;
      });

    return [...result].sort((a, b) => {
      if (sort === "title") {
        return a.beat.title.localeCompare(
          b.beat.title,
          "es",
        );
      }

      if (sort === "bpm-asc") {
        return (
          Number(a.beat.bpm) -
          Number(b.beat.bpm)
        );
      }

      if (sort === "bpm-desc") {
        return (
          Number(b.beat.bpm) -
          Number(a.beat.bpm)
        );
      }

      return a.originalIndex - b.originalIndex;
    });
  }, [beats, genre, search, sort]);

  const selectBeat = (
    originalIndex: number,
  ) => {
    setActiveBeatIndex(originalIndex);

    document
      .querySelector("#inicio")
      ?.scrollIntoView({
        behavior: "smooth",
      });
  };

  const resetFilters = () => {
    setSearch("");
    setGenre("Todos");
    setSort("recent");
  };

  return (
    <section
      id="catalogo"
      className="relative overflow-hidden border-t border-white/5 py-28"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 top-20 h-[420px] w-[420px] rounded-full bg-blue-600/10 blur-[150px]"
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-0 left-0 h-[360px] w-[360px] rounded-full bg-cyan-500/5 blur-[140px]"
      />

      <div className="container-custom relative z-10">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-400">
              Catálogo oficial
            </p>

            <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Encuentra el sonido para tu próximo
              tema
            </h2>

            <p className="mt-5 max-w-2xl leading-8 text-slate-400">
              Explora los beats publicados de Kevin
              The Beatmaker y filtra por género,
              tonalidad o BPM.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm text-slate-300 backdrop-blur-xl">
            <Disc3
              size={18}
              className="text-blue-400"
            />

            {beats.length}{" "}
            {beats.length === 1
              ? "beat disponible"
              : "beats disponibles"}
          </div>
        </div>

        <div className="mt-12 rounded-[2rem] border border-white/10 bg-white/[0.025] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
          <div className="grid gap-4 lg:grid-cols-[1fr_220px_240px]">
            <label className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3.5">
              <Search
                size={19}
                className="shrink-0 text-slate-500"
              />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar por título, género o tonalidad..."
                className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
              />
            </label>

            <label className="relative">
              <SlidersHorizontal
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-500"
              />

              <select
                value={genre}
                onChange={(event) =>
                  setGenre(event.target.value)
                }
                className="w-full appearance-none rounded-2xl border border-white/10 bg-[#07101f] py-3.5 pl-12 pr-4 text-sm font-semibold text-white outline-none transition focus:border-blue-500"
              >
                {genreOptions.map((item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item === "Todos"
                      ? "Todos los géneros"
                      : item}
                  </option>
                ))}
              </select>
            </label>

            <label className="relative">
              <ArrowDownUp
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2 text-slate-500"
              />

              <select
                value={sort}
                onChange={(event) =>
                  setSort(
                    event.target
                      .value as SortOption,
                  )
                }
                className="w-full appearance-none rounded-2xl border border-white/10 bg-[#07101f] py-3.5 pl-12 pr-4 text-sm font-semibold text-white outline-none transition focus:border-blue-500"
              >
                <option value="recent">
                  Más recientes
                </option>

                <option value="title">
                  Nombre A–Z
                </option>

                <option value="bpm-asc">
                  BPM: menor a mayor
                </option>

                <option value="bpm-desc">
                  BPM: mayor a menor
                </option>
              </select>
            </label>
          </div>
        </div>

        {filteredBeats.length > 0 ? (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredBeats.map(
              ({ beat, originalIndex }) => {
                const isActive =
                  originalIndex ===
                  activeBeatIndex;

                const beatWithSlug =
                  beat as typeof beat &
                    BeatWithOptionalSlug;

                const slug =
                  beatWithSlug.slug ||
                  createSlug(beat.title);

                return (
                  <article
                    key={beat.id}
                    className={`group relative overflow-hidden rounded-[2rem] border bg-[#07101f]/85 p-3 shadow-2xl backdrop-blur-xl transition duration-500 hover:-translate-y-2 ${
                      isActive
                        ? "border-white/25"
                        : "border-white/10 hover:border-white/20"
                    }`}
                  >
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-20 blur-[90px]"
                      style={{
                        backgroundColor:
                          beat.color,
                      }}
                    />

                    <div
                      className="relative aspect-square overflow-hidden rounded-[1.5rem] border border-white/10 bg-cover bg-center"
                      style={{
                        backgroundImage: `
                          linear-gradient(
                            to top,
                            rgba(3, 7, 18, 0.96),
                            rgba(3, 7, 18, 0.08)
                          ),
                          url("${beat.cover}")
                        `,
                      }}
                    >
                      <div className="absolute inset-x-0 bottom-0 p-6">
                        <p
                          className="text-xs font-bold uppercase tracking-[0.25em]"
                          style={{
                            color: beat.color,
                          }}
                        >
                          {beat.genre}
                        </p>

                        <h3 className="mt-3 text-3xl font-black">
                          {beat.title}
                        </h3>

                        <p className="mt-2 text-sm text-slate-300">
                          {beat.bpm} BPM ·{" "}
                          {beat.musicalKey ||
                            "Tonalidad N/A"}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          selectBeat(originalIndex)
                        }
                        aria-label={`Reproducir ${beat.title}`}
                        className="absolute right-5 top-5 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-xl transition duration-300 hover:scale-110 active:scale-95"
                        style={{
                          backgroundColor:
                            beat.color,
                          boxShadow: `0 14px 36px ${beat.color}55`,
                        }}
                      >
                        <Play
                          size={23}
                          fill="currentColor"
                          className="translate-x-0.5"
                        />
                      </button>
                    </div>

                    <div className="relative flex items-center justify-between gap-4 px-3 py-5">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                          Kevin The Beatmaker
                        </p>

                        <p className="mt-2 truncate font-semibold text-slate-200">
                          Beat de {beat.genre}
                        </p>
                      </div>

                      {isActive && (
                        <div
                          className="shrink-0 rounded-full px-3 py-1.5 text-xs font-bold"
                          style={{
                            backgroundColor: `${beat.color}20`,
                            color: beat.color,
                          }}
                        >
                          Seleccionado
                        </div>
                      )}
                    </div>

                    <Link
  href={`/beats/${slug}`}
  className="mx-3 mb-3 flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-bold text-white transition hover:border-white/20 hover:bg-white/10"
>
                      Ver detalles

                      <ExternalLink size={16} />
                    </Link>
                  </article>
                );
              },
            )}
          </div>
        ) : (
          <div className="mt-8 flex flex-col items-center rounded-[2rem] border border-white/10 bg-white/[0.025] px-6 py-20 text-center">
            <Music2
              size={48}
              className="text-slate-700"
            />

            <h3 className="mt-5 text-2xl font-black">
              No encontramos beats
            </h3>

            <p className="mt-3 max-w-md leading-7 text-slate-500">
              Prueba con otro título o cambia el
              filtro de género.
            </p>

            <button
              type="button"
              onClick={resetFilters}
              className="mt-7 rounded-full border border-white/10 bg-white/5 px-6 py-3 font-semibold transition hover:bg-white/10"
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>
    </section>
  );
}