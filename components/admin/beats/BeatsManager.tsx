"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Edit3,
  Loader2,
  Music2,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import DeleteBeatDialog from "./DeleteBeatDialog";

export interface AdminBeat {
  id: string;
  title: string;
  slug: string;
  genre: string | null;
  bpm: number | null;
  musical_key: string | null;
  price: number | string | null;
  status: string | null;
  cover_url: string | null;
  audio_url: string | null;
  plays: number | null;
  created_at: string;
  updated_at: string | null;
}

interface BeatsManagerProps {
  initialBeats: AdminBeat[];
}

interface DeleteResponse {
  success?: boolean;
  error?: string;
  code?: string;
  storageWarnings?: string[];
}

interface ArchiveResponse {
  success?: boolean;
  error?: string;
  status?: string;
}

function formatPrice(price: AdminBeat["price"]) {
  const numericPrice = Number(price ?? 0);

  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(
    Number.isFinite(numericPrice)
      ? numericPrice
      : 0,
  );
}

function formatDate(date: string) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("es-EC", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function getStatusLabel(status: string | null) {
  switch (status?.toLowerCase()) {
    case "published":
      return "Publicado";

    case "draft":
      return "Borrador";

    case "archived":
      return "Archivado";

    default:
      return status || "Sin estado";
  }
}

function getStatusClasses(status: string | null) {
  switch (status?.toLowerCase()) {
    case "published":
      return "border-emerald-400/20 bg-emerald-500/10 text-emerald-300";

    case "draft":
      return "border-amber-400/20 bg-amber-500/10 text-amber-300";

    case "archived":
      return "border-white/10 bg-white/5 text-white/45";

    default:
      return "border-blue-400/20 bg-blue-500/10 text-blue-300";
  }
}

async function readJsonResponse<T>(
  response: Response,
): Promise<T> {
  const responseText = await response.text();

  if (!responseText) {
    throw new Error(
      `El servidor devolvió una respuesta vacía. Código ${response.status}.`,
    );
  }

  try {
    return JSON.parse(responseText) as T;
  } catch {
    throw new Error(
      `El servidor devolvió una respuesta no válida. Código ${response.status}.`,
    );
  }
}

export default function BeatsManager({
  initialBeats,
}: BeatsManagerProps) {
  const router = useRouter();

  const [beats, setBeats] =
    useState<AdminBeat[]>(initialBeats);

  const [search, setSearch] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("all");

  const [genreFilter, setGenreFilter] =
    useState("all");

  const [
    selectedBeat,
    setSelectedBeat,
  ] = useState<AdminBeat | null>(null);

  const [
    deletingBeatId,
    setDeletingBeatId,
  ] = useState<string | null>(null);

  const [
    archivingBeatId,
    setArchivingBeatId,
  ] = useState<string | null>(null);

  const [
    deleteHasOrders,
    setDeleteHasOrders,
  ] = useState(false);

  const [
    deleteErrorMessage,
    setDeleteErrorMessage,
  ] = useState("");

  const [
    errorMessage,
    setErrorMessage,
  ] = useState("");

  const genres = useMemo(() => {
    return Array.from(
      new Set(
        beats
          .map((beat) => beat.genre?.trim())
          .filter(
            (genre): genre is string =>
              Boolean(genre),
          ),
      ),
    ).sort((a, b) =>
      a.localeCompare(b),
    );
  }, [beats]);

  const filteredBeats = useMemo(() => {
    const normalizedSearch =
      search.trim().toLowerCase();

    return beats.filter((beat) => {
      const matchesSearch =
        !normalizedSearch ||
        beat.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        beat.slug
          .toLowerCase()
          .includes(normalizedSearch) ||
        beat.genre
          ?.toLowerCase()
          .includes(normalizedSearch) ||
        beat.musical_key
          ?.toLowerCase()
          .includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "all" ||
        beat.status?.toLowerCase() ===
          statusFilter;

      const matchesGenre =
        genreFilter === "all" ||
        beat.genre === genreFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesGenre
      );
    });
  }, [
    beats,
    genreFilter,
    search,
    statusFilter,
  ]);

  function openDeleteDialog(
    beat: AdminBeat,
  ) {
    setDeleteErrorMessage("");
    setDeleteHasOrders(false);
    setSelectedBeat(beat);
  }

  function closeDeleteDialog() {
    if (
      deletingBeatId ||
      archivingBeatId
    ) {
      return;
    }

    setDeleteErrorMessage("");
    setDeleteHasOrders(false);
    setSelectedBeat(null);
  }

  async function handleDelete() {
    if (
      !selectedBeat ||
      deletingBeatId ||
      archivingBeatId
    ) {
      return;
    }

    const beatId = selectedBeat.id;

    setDeleteErrorMessage("");
    setErrorMessage("");
    setDeletingBeatId(beatId);

    try {
      const response = await fetch(
        `/api/admin/beats/${beatId}`,
        {
          method: "DELETE",
          cache: "no-store",
        },
      );

      const result =
        await readJsonResponse<DeleteResponse>(
          response,
        );

      if (
        response.status === 409 &&
        result.code === "BEAT_HAS_ORDERS"
      ) {
        setDeleteHasOrders(true);
        setDeleteErrorMessage("");
        return;
      }

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "No fue posible eliminar el beat.",
        );
      }

      setBeats((currentBeats) =>
        currentBeats.filter(
          (beat) => beat.id !== beatId,
        ),
      );

      if (
        result.storageWarnings?.length
      ) {
        setErrorMessage(
          "El beat se eliminó, pero algunos archivos no pudieron borrarse de Storage.",
        );
      }

      setSelectedBeat(null);
      setDeleteHasOrders(false);

      router.refresh();
    } catch (error) {
      setDeleteErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible eliminar el beat.",
      );
    } finally {
      setDeletingBeatId(null);
    }
  }

  async function handleArchive() {
    if (
      !selectedBeat ||
      deletingBeatId ||
      archivingBeatId
    ) {
      return;
    }

    const beatId = selectedBeat.id;

    setDeleteErrorMessage("");
    setArchivingBeatId(beatId);

    try {
      const response = await fetch(
        `/api/admin/beats/${beatId}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            action: "archive",
          }),
          cache: "no-store",
        },
      );

      const result =
        await readJsonResponse<ArchiveResponse>(
          response,
        );

      if (!response.ok) {
        throw new Error(
          result.error ||
            `No fue posible archivar el beat. Código ${response.status}.`,
        );
      }

      if (
        !result.success ||
        result.status !== "archived"
      ) {
        throw new Error(
          result.error ||
            "El servidor no confirmó que el beat fue archivado.",
        );
      }

      setBeats((currentBeats) =>
        currentBeats.map((beat) =>
          beat.id === beatId
            ? {
                ...beat,
                status: "archived",
                updated_at:
                  new Date().toISOString(),
              }
            : beat,
        ),
      );

      setDeleteErrorMessage("");
      setDeleteHasOrders(false);
      setSelectedBeat(null);

      router.refresh();
    } catch (error) {
      setDeleteErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible archivar el beat.",
      );
    } finally {
      setArchivingBeatId(null);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1500px]">
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-400">
            Catálogo
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Beats
          </h1>

          <p className="mt-3 text-sm leading-6 text-white/45 sm:text-base">
            Administra los beats disponibles
            en tu tienda.
          </p>
        </div>

        <Link
          href="/admin/beats/new"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500"
        >
          <Plus className="h-5 w-5" />
          Nuevo beat
        </Link>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.035]">
        <div className="border-b border-white/10 p-4 sm:p-5">
          <div className="grid gap-3 lg:grid-cols-[1fr_190px_190px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Buscar por título, género o tonalidad..."
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value,
                )
              }
              className="h-12 rounded-xl border border-white/10 bg-[#0a0d13] px-4 text-sm text-white outline-none focus:border-blue-500/50"
            >
              <option value="all">
                Todos los estados
              </option>

              <option value="published">
                Publicados
              </option>

              <option value="draft">
                Borradores
              </option>

              <option value="archived">
                Archivados
              </option>
            </select>

            <select
              value={genreFilter}
              onChange={(event) =>
                setGenreFilter(
                  event.target.value,
                )
              }
              className="h-12 rounded-xl border border-white/10 bg-[#0a0d13] px-4 text-sm text-white outline-none focus:border-blue-500/50"
            >
              <option value="all">
                Todos los géneros
              </option>

              {genres.map((genre) => (
                <option
                  key={genre}
                  value={genre}
                >
                  {genre}
                </option>
              ))}
            </select>
          </div>

          {errorMessage ? (
            <p className="mt-4 rounded-xl border border-amber-400/20 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {errorMessage}
            </p>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <p className="text-sm text-white/40">
            {filteredBeats.length}{" "}
            {filteredBeats.length === 1
              ? "beat"
              : "beats"}
          </p>
        </div>

        {filteredBeats.length === 0 ? (
          <div className="flex min-h-80 items-center justify-center px-6 py-16 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
                <Music2 className="h-7 w-7 text-white/25" />
              </div>

              <h2 className="mt-5 text-lg font-semibold">
                No se encontraron beats
              </h2>

              <p className="mt-2 text-sm text-white/40">
                Cambia los filtros o crea un
                nuevo beat.
              </p>

              <Link
                href="/admin/beats/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold transition hover:bg-blue-500"
              >
                <Plus className="h-4 w-4" />
                Crear beat
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full min-w-[1050px] border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-left">
                    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      Beat
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      Género
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      BPM / Tono
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      Precio
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      Estado
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      Plays
                    </th>

                    <th className="px-4 py-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                      Fecha
                    </th>

                    <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-white/30">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {filteredBeats.map(
                    (beat) => {
                      const isDeleting =
                        deletingBeatId ===
                        beat.id;

                      return (
                        <tr
                          key={beat.id}
                          className="border-b border-white/[0.07] transition last:border-b-0 hover:bg-white/[0.025]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                                {beat.cover_url ? (
                                  <img
                                    src={
                                      beat.cover_url
                                    }
                                    alt={`Portada de ${beat.title}`}
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <Music2 className="h-5 w-5 text-white/20" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <p className="max-w-52 truncate text-sm font-semibold text-white">
                                  {beat.title}
                                </p>

                                <p className="mt-1 max-w-52 truncate text-xs text-white/30">
                                  /{beat.slug}
                                </p>
                              </div>
                            </div>
                          </td>

                          <td className="px-4 py-4 text-sm text-white/60">
                            {beat.genre || "—"}
                          </td>

                          <td className="px-4 py-4">
                            <p className="text-sm text-white/65">
                              {beat.bpm ?? "—"}{" "}
                              BPM
                            </p>

                            <p className="mt-1 text-xs text-white/30">
                              {beat.musical_key ||
                                "Sin tonalidad"}
                            </p>
                          </td>

                          <td className="px-4 py-4 text-sm font-semibold text-white">
                            {formatPrice(
                              beat.price,
                            )}
                          </td>

                          <td className="px-4 py-4">
                            <span
                              className={[
                                "inline-flex rounded-full border px-3 py-1 text-xs font-semibold",
                                getStatusClasses(
                                  beat.status,
                                ),
                              ].join(" ")}
                            >
                              {getStatusLabel(
                                beat.status,
                              )}
                            </span>
                          </td>

                          <td className="px-4 py-4 text-sm text-white/60">
                            {beat.plays ?? 0}
                          </td>

                          <td className="px-4 py-4 text-sm text-white/45">
                            {formatDate(
                              beat.created_at,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              <Link
                                href={`/admin/beats/${beat.id}/edit`}
                                aria-label={`Editar ${beat.title}`}
                                title="Editar"
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/50 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-300"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Link>

                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteDialog(
                                    beat,
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                aria-label={`Eliminar ${beat.title}`}
                                title="Eliminar"
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/50 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    },
                  )}
                </tbody>
              </table>
            </div>

            <div className="divide-y divide-white/10 lg:hidden">
              {filteredBeats.map(
                (beat) => {
                  const isDeleting =
                    deletingBeatId === beat.id;

                  return (
                    <article
                      key={beat.id}
                      className="p-4 sm:p-5"
                    >
                      <div className="flex gap-4">
                        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/5">
                          {beat.cover_url ? (
                            <img
                              src={
                                beat.cover_url
                              }
                              alt={`Portada de ${beat.title}`}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <Music2 className="h-6 w-6 text-white/20" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <h2 className="truncate font-semibold">
                                {beat.title}
                              </h2>

                              <p className="mt-1 text-xs text-white/35">
                                {beat.genre ||
                                  "Sin género"}{" "}
                                ·{" "}
                                {beat.bpm ?? "—"}{" "}
                                BPM ·{" "}
                                {beat.musical_key ||
                                  "—"}
                              </p>
                            </div>

                            <span
                              className={[
                                "shrink-0 rounded-full border px-2.5 py-1 text-[11px] font-semibold",
                                getStatusClasses(
                                  beat.status,
                                ),
                              ].join(" ")}
                            >
                              {getStatusLabel(
                                beat.status,
                              )}
                            </span>
                          </div>

                          <div className="mt-4 flex items-end justify-between gap-3">
                            <div>
                              <p className="font-semibold">
                                {formatPrice(
                                  beat.price,
                                )}
                              </p>

                              <p className="mt-1 text-xs text-white/30">
                                {beat.plays ??
                                  0}{" "}
                                reproducciones ·{" "}
                                {formatDate(
                                  beat.created_at,
                                )}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <Link
                                href={`/admin/beats/${beat.id}/edit`}
                                aria-label={`Editar ${beat.title}`}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] text-white/55"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Link>

                              <button
                                type="button"
                                onClick={() =>
                                  openDeleteDialog(
                                    beat,
                                  )
                                }
                                disabled={
                                  isDeleting
                                }
                                aria-label={`Eliminar ${beat.title}`}
                                className="flex h-10 w-10 items-center justify-center rounded-xl border border-red-400/15 bg-red-500/5 text-red-300 disabled:opacity-50"
                              >
                                {isDeleting ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                },
              )}
            </div>
          </>
        )}
      </section>

      <DeleteBeatDialog
        beatTitle={
          selectedBeat?.title ?? ""
        }
        isOpen={Boolean(selectedBeat)}
        isDeleting={Boolean(
          deletingBeatId,
        )}
        isArchiving={Boolean(
          archivingBeatId,
        )}
        hasOrders={deleteHasOrders}
        errorMessage={
          deleteErrorMessage
        }
        onCancel={closeDeleteDialog}
        onConfirmDelete={handleDelete}
        onArchive={handleArchive}
      />
    </div>
  );
}