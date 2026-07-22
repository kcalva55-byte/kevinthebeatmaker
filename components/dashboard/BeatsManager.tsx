"use client";

import {
  Check,
  CheckCircle2,
  ChevronDown,
  Edit3,
  FileAudio,
  ImageIcon,
  LoaderCircle,
  Music2,
  Plus,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  useTransition,
  type FormEvent,
} from "react";

import {
  changeBeatStatus,
  createBeat,
  deleteBeat,
  updateBeat,
} from "../../app/studio/beats/actions";

export type BeatStatus = "Publicado" | "Borrador";

export type AdminBeat = {
  id: string;
  title: string;
  genre: string;
  bpm: number;
  musicalKey: string;
  price: number;
  plays: number;
  status: BeatStatus;
  cover: string;
};

type BeatsManagerProps = {
  initialBeats: AdminBeat[];
  loadingError?: string;
};

type BeatFormData = {
  title: string;
  genre: string;
  bpm: string;
  musicalKey: string;
  price: string;
  status: BeatStatus;
  coverName: string;
  audioName: string;
};

type ActionNotice = {
  type: "success" | "error";
  message: string;
};

const genres = [
  "Todos",
  "Reggaetón",
  "Trap",
  "Detroit",
  "Afrobeat",
];

const emptyForm: BeatFormData = {
  title: "",
  genre: "Reggaetón",
  bpm: "",
  musicalKey: "",
  price: "",
  status: "Borrador",
  coverName: "",
  audioName: "",
};

function formatPlays(plays: number) {
  return new Intl.NumberFormat("es-EC").format(plays);
}

export default function BeatsManager({
  initialBeats,
  loadingError = "",
}: BeatsManagerProps) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  const [beats, setBeats] =
    useState<AdminBeat[]>(initialBeats);

  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("Todos");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBeat, setEditingBeat] =
    useState<AdminBeat | null>(null);

  const [formData, setFormData] =
    useState<BeatFormData>(emptyForm);

  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const [notice, setNotice] =
    useState<ActionNotice | null>(null);

  const [workingBeatId, setWorkingBeatId] =
    useState<string | null>(null);

  useEffect(() => {
    setBeats(initialBeats);
  }, [initialBeats]);

  useEffect(() => {
    if (!notice) return;

    const timer = window.setTimeout(() => {
      setNotice(null);
    }, 4500);

    return () => {
      window.clearTimeout(timer);
    };
  }, [notice]);

  const filteredBeats = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return beats.filter((beat) => {
      const matchesSearch =
        !normalizedSearch ||
        beat.title
          .toLowerCase()
          .includes(normalizedSearch) ||
        beat.genre
          .toLowerCase()
          .includes(normalizedSearch) ||
        beat.musicalKey
          .toLowerCase()
          .includes(normalizedSearch);

      const matchesGenre =
        genre === "Todos" || beat.genre === genre;

      return matchesSearch && matchesGenre;
    });
  }, [beats, genre, search]);

  const openCreateModal = () => {
    setEditingBeat(null);
    setFormData(emptyForm);
    setFormError("");
    setFormSuccess("");
    setModalOpen(true);
  };

  const openEditModal = (beat: AdminBeat) => {
    setEditingBeat(beat);

    setFormData({
      title: beat.title,
      genre: beat.genre,
      bpm: String(beat.bpm),
      musicalKey: beat.musicalKey,
      price: String(beat.price),
      status: beat.status,
      coverName: "",
      audioName: "",
    });

    setFormError("");
    setFormSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (isPending) return;

    setModalOpen(false);
    setEditingBeat(null);
    setFormData(emptyForm);
    setFormError("");
    setFormSuccess("");
  };

  const updateField = <
    K extends keyof BeatFormData,
  >(
    field: K,
    value: BeatFormData[K],
  ) => {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));

    setFormError("");
    setFormSuccess("");
  };

  const refreshData = () => {
    router.refresh();
  };

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const formElement = event.currentTarget;
    const payload = new FormData(formElement);

    payload.set(
      "status",
      formData.status === "Publicado"
        ? "published"
        : "draft",
    );

    setFormError("");
    setFormSuccess("");

    startTransition(async () => {
      const result = editingBeat
        ? await updateBeat(editingBeat.id, payload)
        : await createBeat(payload);

      if (!result.success) {
        setFormError(result.message);
        return;
      }

      setFormSuccess(result.message);

      refreshData();

      window.setTimeout(() => {
        setModalOpen(false);
        setEditingBeat(null);
        setFormData(emptyForm);
        setFormError("");
        setFormSuccess("");
        formElement.reset();
      }, 1100);
    });
  };

  const handleStatusChange = (
    beat: AdminBeat,
  ) => {
    const nextStatus =
      beat.status === "Publicado"
        ? "draft"
        : "published";

    const nextVisualStatus: BeatStatus =
      nextStatus === "published"
        ? "Publicado"
        : "Borrador";

    setWorkingBeatId(beat.id);
    setNotice(null);

    startTransition(async () => {
      const result = await changeBeatStatus(
        beat.id,
        nextStatus,
      );

      if (!result.success) {
        setNotice({
          type: "error",
          message: result.message,
        });

        setWorkingBeatId(null);
        return;
      }

      setBeats((current) =>
        current.map((item) =>
          item.id === beat.id
            ? {
                ...item,
                status: nextVisualStatus,
              }
            : item,
        ),
      );

      setNotice({
        type: "success",
        message: result.message,
      });

      setWorkingBeatId(null);
      refreshData();
    });
  };

  const handleDelete = (beat: AdminBeat) => {
    const confirmed = window.confirm(
      `¿Seguro que deseas eliminar "${beat.title}"?\n\nTambién se eliminarán su portada y audio.`,
    );

    if (!confirmed) return;

    setWorkingBeatId(beat.id);
    setNotice(null);

    startTransition(async () => {
      const result = await deleteBeat(beat.id);

      if (!result.success) {
        setNotice({
          type: "error",
          message: result.message,
        });

        setWorkingBeatId(null);
        return;
      }

      setBeats((current) =>
        current.filter(
          (item) => item.id !== beat.id,
        ),
      );

      setNotice({
        type: "success",
        message: result.message,
      });

      setWorkingBeatId(null);
      refreshData();
    });
  };

  return (
    <>
      <section className="flex flex-col justify-between gap-6 xl:flex-row xl:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
            Biblioteca musical
          </p>

          <h2 className="mt-3 text-3xl font-black sm:text-4xl">
            Gestión de beats
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Administra tu catálogo, precios,
            información musical y estado de
            publicación.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-6 py-3.5 font-semibold shadow-lg shadow-blue-600/25 transition hover:-translate-y-1 hover:bg-blue-500"
        >
          <Plus size={20} />
          Añadir nuevo beat
        </button>
      </section>

      {loadingError && (
        <div className="mt-7 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-300">
          {loadingError}
        </div>
      )}

      {notice && (
        <div
          aria-live="polite"
          className={`mt-7 flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm ${
            notice.type === "success"
              ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-300"
              : "border-red-400/20 bg-red-500/10 text-red-300"
          }`}
        >
          {notice.type === "success" && (
            <CheckCircle2 size={19} />
          )}

          {notice.message}
        </div>
      )}

      <section className="mt-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-5 shadow-2xl backdrop-blur-xl sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 lg:max-w-md">
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
          </div>

          <div className="relative">
            <select
              value={genre}
              onChange={(event) =>
                setGenre(event.target.value)
              }
              className="w-full appearance-none rounded-2xl border border-white/10 bg-[#09111f] py-3 pl-4 pr-11 text-sm font-semibold text-white outline-none lg:w-52"
            >
              {genres.map((item) => (
                <option key={item} value={item}>
                  {item === "Todos"
                    ? "Todos los géneros"
                    : item}
                </option>
              ))}
            </select>

            <ChevronDown
              size={18}
              className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
          </div>
        </div>

        <div className="mt-7 overflow-hidden rounded-[1.5rem] border border-white/10">
          <div className="hidden grid-cols-[2fr_.8fr_.7fr_.7fr_.7fr_.8fr_1fr] gap-4 border-b border-white/10 bg-white/[0.025] px-5 py-4 text-xs font-semibold uppercase tracking-[0.15em] text-slate-500 xl:grid">
            <span>Beat</span>
            <span>Género</span>
            <span>BPM / Key</span>
            <span>Precio</span>
            <span>Reproducciones</span>
            <span>Estado</span>

            <span className="text-right">
              Acciones
            </span>
          </div>

          <div className="divide-y divide-white/5">
            {filteredBeats.length > 0 ? (
              filteredBeats.map((beat) => {
                const isWorking =
                  isPending &&
                  workingBeatId === beat.id;

                return (
                  <article
                    key={beat.id}
                    className="grid gap-5 bg-white/[0.012] p-5 transition hover:bg-white/[0.035] xl:grid-cols-[2fr_.8fr_.7fr_.7fr_.7fr_.8fr_1fr] xl:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div
                        className="h-16 w-16 shrink-0 rounded-2xl border border-white/10 bg-cover bg-center"
                        style={{
                          backgroundImage: `linear-gradient(to top, rgba(3,7,18,.45), transparent), url("${beat.cover}")`,
                        }}
                      />

                      <div className="min-w-0">
                        <p className="truncate font-bold">
                          {beat.title}
                        </p>

                        <p className="mt-1 max-w-[180px] truncate text-xs text-slate-500">
                          ID: {beat.id}
                        </p>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 xl:hidden">
                        Género
                      </p>

                      <p className="mt-1 text-sm font-semibold xl:mt-0">
                        {beat.genre}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 xl:hidden">
                        BPM / Tonalidad
                      </p>

                      <p className="mt-1 text-sm xl:mt-0">
                        {beat.bpm} ·{" "}
                        {beat.musicalKey}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 xl:hidden">
                        Precio
                      </p>

                      <p className="mt-1 font-bold xl:mt-0">
                        ${beat.price.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-600 xl:hidden">
                        Reproducciones
                      </p>

                      <p className="mt-1 text-sm xl:mt-0">
                        {formatPlays(beat.plays)}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isWorking}
                      onClick={() =>
                        handleStatusChange(beat)
                      }
                      title={
                        beat.status === "Publicado"
                          ? "Pasar a borrador"
                          : "Publicar beat"
                      }
                      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:cursor-wait disabled:opacity-50 ${
                        beat.status === "Publicado"
                          ? "bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"
                          : "bg-amber-500/10 text-amber-300 hover:bg-amber-500/20"
                      }`}
                    >
                      {isWorking ? (
                        <LoaderCircle
                          size={13}
                          className="animate-spin"
                        />
                      ) : (
                        <span
                          className={`h-2 w-2 rounded-full ${
                            beat.status ===
                            "Publicado"
                              ? "bg-emerald-400"
                              : "bg-amber-400"
                          }`}
                        />
                      )}

                      {beat.status}
                    </button>

                    <div className="flex items-center gap-2 xl:justify-end">
                      <button
                        type="button"
                        disabled={isWorking}
                        onClick={() =>
                          openEditModal(beat)
                        }
                        aria-label={`Editar ${beat.title}`}
                        className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-slate-400 transition hover:border-blue-400/30 hover:bg-blue-500/10 hover:text-blue-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Edit3 size={18} />
                      </button>

                      <button
                        type="button"
                        disabled={isWorking}
                        onClick={() =>
                          handleDelete(beat)
                        }
                        aria-label={`Eliminar ${beat.title}`}
                        className="rounded-xl border border-white/10 bg-white/[0.035] p-2.5 text-slate-400 transition hover:border-red-400/30 hover:bg-red-500/10 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        {isWorking ? (
                          <LoaderCircle
                            size={18}
                            className="animate-spin"
                          />
                        ) : (
                          <Trash2 size={18} />
                        )}
                      </button>
                    </div>
                  </article>
                );
              })
            ) : (
              <div className="flex flex-col items-center px-6 py-20 text-center">
                <Music2
                  size={42}
                  className="text-slate-700"
                />

                <p className="mt-4 text-lg font-bold">
                  No encontramos beats
                </p>

                <p className="mt-2 text-sm text-slate-500">
                  Cambia el filtro o prueba otra
                  búsqueda.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-5 flex flex-col justify-between gap-3 text-sm text-slate-500 sm:flex-row">
          <p>
            Mostrando {filteredBeats.length} de{" "}
            {beats.length} beats
          </p>

          <p>
            {
              beats.filter(
                (beat) =>
                  beat.status === "Publicado",
              ).length
            }{" "}
            publicados
          </p>
        </div>
      </section>

      {modalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={
            editingBeat
              ? "Editar beat"
              : "Añadir nuevo beat"
          }
          className="fixed inset-0 z-[200] flex items-center justify-center overflow-y-auto bg-black/75 p-4 backdrop-blur-xl"
        >
          <div className="my-8 w-full max-w-3xl overflow-hidden rounded-[2rem] border border-white/10 bg-[#07101f] shadow-[0_35px_120px_rgba(0,0,0,.65)]">
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
                  KTB Studio
                </p>

                <h3 className="mt-2 text-2xl font-black">
                  {editingBeat
                    ? "Editar beat"
                    : "Añadir nuevo beat"}
                </h3>
              </div>

              <button
                type="button"
                disabled={isPending}
                onClick={closeModal}
                aria-label="Cerrar formulario"
                className="rounded-xl border border-white/10 bg-white/5 p-2.5 text-slate-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="p-6 sm:p-8"
            >
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-300">
                    Título del beat *
                  </span>

                  <input
                    type="text"
                    name="title"
                    required
                    disabled={isPending}
                    value={formData.title}
                    onChange={(event) =>
                      updateField(
                        "title",
                        event.target.value,
                      )
                    }
                    placeholder="Ejemplo: Night Drive"
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:opacity-50"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-slate-300">
                    Género *
                  </span>

                  <select
                    name="genre"
                    required
                    disabled={isPending}
                    value={formData.genre}
                    onChange={(event) =>
                      updateField(
                        "genre",
                        event.target.value,
                      )
                    }
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-[#091324] px-4 py-3.5 outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    {genres
                      .filter(
                        (item) =>
                          item !== "Todos",
                      )
                      .map((item) => (
                        <option
                          key={item}
                          value={item}
                        >
                          {item}
                        </option>
                      ))}
                  </select>
                </label>

                <label>
                  <span className="text-sm font-semibold text-slate-300">
                    Tonalidad *
                  </span>

                  <input
                    type="text"
                    name="musicalKey"
                    required
                    disabled={isPending}
                    value={formData.musicalKey}
                    onChange={(event) =>
                      updateField(
                        "musicalKey",
                        event.target.value,
                      )
                    }
                    placeholder="Ejemplo: Am"
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:opacity-50"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-slate-300">
                    BPM *
                  </span>

                  <input
                    type="number"
                    name="bpm"
                    min="1"
                    required
                    disabled={isPending}
                    value={formData.bpm}
                    onChange={(event) =>
                      updateField(
                        "bpm",
                        event.target.value,
                      )
                    }
                    placeholder="95"
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:opacity-50"
                  />
                </label>

                <label>
                  <span className="text-sm font-semibold text-slate-300">
                    Precio USD *
                  </span>

                  <input
                    type="number"
                    name="price"
                    min="0"
                    step="0.01"
                    required
                    disabled={isPending}
                    value={formData.price}
                    onChange={(event) =>
                      updateField(
                        "price",
                        event.target.value,
                      )
                    }
                    placeholder="49"
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3.5 outline-none transition placeholder:text-slate-600 focus:border-blue-500 disabled:opacity-50"
                  />
                </label>

                <label className="sm:col-span-2">
                  <span className="text-sm font-semibold text-slate-300">
                    Estado
                  </span>

                  <select
                    disabled={isPending}
                    value={formData.status}
                    onChange={(event) =>
                      updateField(
                        "status",
                        event.target
                          .value as BeatStatus,
                      )
                    }
                    className="mt-3 w-full rounded-2xl border border-white/10 bg-[#091324] px-4 py-3.5 outline-none focus:border-blue-500 disabled:opacity-50"
                  >
                    <option value="Borrador">
                      Borrador
                    </option>

                    <option value="Publicado">
                      Publicado
                    </option>
                  </select>
                </label>
              </div>

              <div className="mt-7 grid gap-5 sm:grid-cols-2">
                <label className="cursor-pointer rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.025] p-6 text-center transition hover:border-blue-400/40 hover:bg-blue-500/5">
                  <ImageIcon
                    size={30}
                    className="mx-auto text-blue-400"
                  />

                  <p className="mt-3 font-semibold">
                    {editingBeat
                      ? "Cambiar portada"
                      : "Subir portada"}
                  </p>

                  <p className="mt-2 truncate text-xs text-slate-500">
                    {formData.coverName ||
                      (editingBeat
                        ? "Opcional: conserva la actual"
                        : "WebP, JPG o PNG")}
                  </p>

                  <input
                    type="file"
                    name="cover"
                    required={!editingBeat}
                    disabled={isPending}
                    accept="image/png,image/jpeg,image/webp"
                    className="hidden"
                    onChange={(event) =>
                      updateField(
                        "coverName",
                        event.target.files?.[0]
                          ?.name || "",
                      )
                    }
                  />
                </label>

                <label className="cursor-pointer rounded-[1.5rem] border border-dashed border-white/15 bg-white/[0.025] p-6 text-center transition hover:border-blue-400/40 hover:bg-blue-500/5">
                  <FileAudio
                    size={30}
                    className="mx-auto text-blue-400"
                  />

                  <p className="mt-3 font-semibold">
                    {editingBeat
                      ? "Cambiar audio"
                      : "Subir audio"}
                  </p>

                  <p className="mt-2 truncate text-xs text-slate-500">
                    {formData.audioName ||
                      (editingBeat
                        ? "Opcional: conserva el actual"
                        : "MP3 o WAV")}
                  </p>

                  <input
                    type="file"
                    name="audio"
                    required={!editingBeat}
                    disabled={isPending}
                    accept="audio/mpeg,audio/wav,audio/x-wav"
                    className="hidden"
                    onChange={(event) =>
                      updateField(
                        "audioName",
                        event.target.files?.[0]
                          ?.name || "",
                      )
                    }
                  />
                </label>
              </div>

              {formError && (
                <p
                  aria-live="polite"
                  className="mt-6 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300"
                >
                  {formError}
                </p>
              )}

              {formSuccess && (
                <div
                  aria-live="polite"
                  className="mt-6 flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300"
                >
                  <CheckCircle2 size={19} />
                  {formSuccess}
                </div>
              )}

              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={closeModal}
                  className="rounded-full border border-white/10 px-6 py-3.5 font-semibold text-slate-300 transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-7 py-3.5 font-semibold shadow-lg shadow-blue-600/25 transition hover:-translate-y-0.5 hover:bg-blue-500 disabled:cursor-wait disabled:opacity-60"
                >
                  {isPending ? (
                    <>
                      <LoaderCircle
                        size={19}
                        className="animate-spin"
                      />

                      {editingBeat
                        ? "Actualizando..."
                        : "Guardando..."}
                    </>
                  ) : editingBeat ? (
                    <>
                      <Check size={19} />
                      Guardar cambios
                    </>
                  ) : (
                    <>
                      <Upload size={19} />
                      Guardar beat
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}