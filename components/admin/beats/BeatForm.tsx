"use client";

import Link from "next/link";
import {
  FormEvent,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ImageIcon,
  Loader2,
  Music2,
  Save,
  Star,
} from "lucide-react";

import { createClient } from "../../../lib/supabase/client";
import AudioUploader from "./uploads/AudioUploader";
import FileUploader from "./uploads/FileUploader";
import ImageUploader from "./uploads/ImageUploader";

type BeatStatus = "draft" | "published";

export interface EditableBeat {
  id: string;
  title: string;
  slug: string;
  genre: string | null;
  bpm: number | null;
  musical_key: string | null;
  price: number | string | null;
  status: string | null;
  description: string | null;
  tags: string[] | null;
  mood: string | null;
  duration_seconds: number | null;
  featured: boolean | null;
  preview_start: number | null;
  preview_end: number | null;
  cover_url: string | null;
  audio_url: string | null;
  wav_url: string | null;
  stems_url: string | null;
}

interface BeatFormProps {
  initialBeat?: EditableBeat;
}

interface BeatFormState {
  title: string;
  slug: string;
  genre: string;
  bpm: string;
  musicalKey: string;
  price: string;
  status: BeatStatus;

  description: string;
  tags: string;
  mood: string;
  durationSeconds: string;
  featured: boolean;
  previewStart: string;
  previewEnd: string;

  coverUrl: string;
  audioUrl: string;
  wavUrl: string;
  stemsUrl: string;
}

const initialState: BeatFormState = {
  title: "",
  slug: "",
  genre: "",
  bpm: "",
  musicalKey: "",
  price: "",
  status: "draft",

  description: "",
  tags: "",
  mood: "",
  durationSeconds: "",
  featured: false,
  previewStart: "0",
  previewEnd: "",

  coverUrl: "",
  audioUrl: "",
  wavUrl: "",
  stemsUrl: "",
};

function createSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseTags(value: string) {
  return Array.from(
    new Set(
      value
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export default function BeatForm({
  initialBeat,
}: BeatFormProps) {
  const router = useRouter();

const isEditing = Boolean(initialBeat);

const [form, setForm] = useState<BeatFormState>(() => {
  if (!initialBeat) {
    return initialState;
  }

  return {
    title: initialBeat.title ?? "",
    slug: initialBeat.slug ?? "",
    genre: initialBeat.genre ?? "",
    bpm:
      initialBeat.bpm !== null
        ? String(initialBeat.bpm)
        : "",
    musicalKey: initialBeat.musical_key ?? "",
    price:
      initialBeat.price !== null
        ? String(initialBeat.price)
        : "",
    status:
      initialBeat.status === "published"
        ? "published"
        : "draft",

    description: initialBeat.description ?? "",
    tags: initialBeat.tags?.join(", ") ?? "",
    mood: initialBeat.mood ?? "",
    durationSeconds:
      initialBeat.duration_seconds !== null
        ? String(initialBeat.duration_seconds)
        : "",
    featured: initialBeat.featured ?? false,
    previewStart: String(initialBeat.preview_start ?? 0),
    previewEnd:
      initialBeat.preview_end !== null
        ? String(initialBeat.preview_end)
        : "",

    coverUrl: initialBeat.cover_url ?? "",
    audioUrl: initialBeat.audio_url ?? "",
    wavUrl: initialBeat.wav_url ?? "",
    stemsUrl: initialBeat.stems_url ?? "",
  };
});

  const [slugWasEdited, setSlugWasEdited] =
  useState(Boolean(initialBeat));

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState("");

  const parsedTags = useMemo(
    () => parseTags(form.tags),
    [form.tags],
  );

  function updateField<K extends keyof BeatFormState>(
    field: K,
    value: BeatFormState[K],
  ) {
    setForm((currentForm) => ({
      ...currentForm,
      [field]: value,
    }));
  }

  function handleTitleChange(value: string) {
    setForm((currentForm) => ({
      ...currentForm,
      title: value,
      slug: slugWasEdited
        ? currentForm.slug
        : createSlug(value),
    }));
  }

  function handleSlugChange(value: string) {
    setSlugWasEdited(true);
    updateField("slug", createSlug(value));
  }

  function validateForm() {
    if (!form.title.trim()) {
      return "Escribe el nombre del beat.";
    }

    if (!form.slug.trim()) {
      return "El slug no puede estar vacío.";
    }

    if (!form.genre.trim()) {
      return "Escribe o selecciona el género.";
    }

    const bpm = Number(form.bpm);

    if (
      !Number.isInteger(bpm) ||
      bpm < 40 ||
      bpm > 300
    ) {
      return "El BPM debe ser un número entero entre 40 y 300.";
    }

    if (!form.musicalKey.trim()) {
      return "Escribe la tonalidad del beat.";
    }

    const price = Number(form.price);

    if (!Number.isFinite(price) || price < 0) {
      return "Escribe un precio válido.";
    }

    if (!form.coverUrl) {
      return "Sube una portada para el beat.";
    }

    if (!form.audioUrl) {
      return "Sube el MP3 de vista previa.";
    }

    if (form.durationSeconds) {
      const duration = Number(form.durationSeconds);

      if (
        !Number.isInteger(duration) ||
        duration <= 0
      ) {
        return "La duración debe expresarse en segundos enteros.";
      }
    }

    const previewStart = Number(
      form.previewStart || 0,
    );

    if (
      !Number.isInteger(previewStart) ||
      previewStart < 0
    ) {
      return "El inicio de la vista previa no es válido.";
    }

    if (form.previewEnd) {
      const previewEnd = Number(form.previewEnd);

      if (
        !Number.isInteger(previewEnd) ||
        previewEnd <= previewStart
      ) {
        return "El final de la vista previa debe ser mayor que el inicio.";
      }
    }

    return "";
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError = validateForm();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error(
          "Tu sesión expiró. Inicia sesión nuevamente.",
        );
      }

      let slugQuery = supabase
  .from("beats")
  .select("id")
  .eq("slug", form.slug.trim());

if (initialBeat) {
  slugQuery = slugQuery.neq("id", initialBeat.id);
}

const {
  data: existingBeat,
  error: slugCheckError,
} = await slugQuery.maybeSingle();

      if (slugCheckError) {
        throw slugCheckError;
      }

      if (existingBeat) {
        throw new Error(
          "Ya existe un beat con ese slug. Usa uno diferente.",
        );
      }

      const beatPayload = {
  title: form.title.trim(),
  slug: form.slug.trim(),
  genre: form.genre.trim(),
  bpm: Number(form.bpm),
  musical_key: form.musicalKey.trim(),
  price: Number(form.price),
  status: form.status,

  description: form.description.trim() || null,
  tags: parsedTags,
  mood: form.mood.trim() || null,

  duration_seconds: form.durationSeconds
    ? Number(form.durationSeconds)
    : null,

  featured: form.featured,

  preview_start: Number(form.previewStart || 0),

  preview_end: form.previewEnd
    ? Number(form.previewEnd)
    : null,

  cover_url: form.coverUrl,
  audio_url: form.audioUrl,
  wav_url: form.wavUrl || null,
  stems_url: form.stemsUrl || null,

  updated_by: user.id,
  updated_at: new Date().toISOString(),
};

if (initialBeat) {
  const { error: updateError } = await supabase
    .from("beats")
    .update(beatPayload)
    .eq("id", initialBeat.id);

  if (updateError) {
    throw updateError;
  }
} else {
  const { error: insertError } = await supabase
    .from("beats")
    .insert({
      ...beatPayload,
      plays: 0,
    });

  if (insertError) {
    throw insertError;
  }
}

      router.push("/admin/beats");
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No fue posible guardar el beat.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[1200px]">
      <div className="mb-8">
        <Link
          href="/admin/beats"
          className="inline-flex items-center gap-2 text-sm font-medium text-white/45 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a beats
        </Link>

        <p className="mt-7 text-sm font-semibold uppercase tracking-[0.22em] text-blue-400">
          Catálogo
        </p>

        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {isEditing ? "Editar beat" : "Nuevo beat"}
        </h1>

        <p className="mt-3 text-sm leading-6 text-white/45 sm:text-base">
          {isEditing
  ? "Actualiza la información y los archivos del instrumental."
  : "Sube los archivos y completa la información comercial del instrumental."}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="min-w-0 space-y-6">
          <section className="rounded-2xl border border-white/10 bg-white/[0.035]">
            <div className="border-b border-white/10 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-semibold">
                Información principal
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Datos que aparecerán en la tienda.
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:p-6">
              <div>
                <label
                  htmlFor="title"
                  className="mb-2 block text-sm font-medium text-white/70"
                >
                  Nombre del beat
                </label>

                <input
                  id="title"
                  type="text"
                  value={form.title}
                  onChange={(event) =>
                    handleTitleChange(event.target.value)
                  }
                  placeholder="Ejemplo: Night Drive"
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="mb-2 block text-sm font-medium text-white/70"
                >
                  Slug
                </label>

                <div className="flex h-12 overflow-hidden rounded-xl border border-white/10 bg-black/20 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10">
                  <span className="flex items-center border-r border-white/10 px-4 text-sm text-white/30">
                    /beats/
                  </span>

                  <input
                    id="slug"
                    type="text"
                    value={form.slug}
                    onChange={(event) =>
                      handleSlugChange(event.target.value)
                    }
                    placeholder="night-drive"
                    className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/25"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="genre"
                    className="mb-2 block text-sm font-medium text-white/70"
                  >
                    Género
                  </label>

                  <input
                    id="genre"
                    type="text"
                    list="beat-genres"
                    value={form.genre}
                    onChange={(event) =>
                      updateField(
                        "genre",
                        event.target.value,
                      )
                    }
                    placeholder="Reggaetón"
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <datalist id="beat-genres">
                    <option value="Reggaetón" />
                    <option value="Trap" />
                    <option value="Detroit" />
                    <option value="Afrobeat" />
                    <option value="Drill" />
                    <option value="Rap" />
                  </datalist>
                </div>

                <div>
                  <label
                    htmlFor="musicalKey"
                    className="mb-2 block text-sm font-medium text-white/70"
                  >
                    Tonalidad
                  </label>

                  <input
                    id="musicalKey"
                    type="text"
                    value={form.musicalKey}
                    onChange={(event) =>
                      updateField(
                        "musicalKey",
                        event.target.value,
                      )
                    }
                    placeholder="Am"
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="bpm"
                    className="mb-2 block text-sm font-medium text-white/70"
                  >
                    BPM
                  </label>

                  <input
                    id="bpm"
                    type="number"
                    min="40"
                    max="300"
                    step="1"
                    value={form.bpm}
                    onChange={(event) =>
                      updateField(
                        "bpm",
                        event.target.value,
                      )
                    }
                    placeholder="95"
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>

                <div>
                  <label
                    htmlFor="price"
                    className="mb-2 block text-sm font-medium text-white/70"
                  >
                    Precio base
                  </label>

                  <div className="flex h-12 overflow-hidden rounded-xl border border-white/10 bg-black/20 focus-within:border-blue-500/50 focus-within:ring-4 focus-within:ring-blue-500/10">
                    <span className="flex items-center border-r border-white/10 px-4 text-sm text-white/40">
                      $
                    </span>

                    <input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        updateField(
                          "price",
                          event.target.value,
                        )
                      }
                      placeholder="30.00"
                      className="min-w-0 flex-1 bg-transparent px-4 text-sm text-white outline-none placeholder:text-white/25"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="mb-2 block text-sm font-medium text-white/70"
                >
                  Descripción
                </label>

                <textarea
                  id="description"
                  rows={5}
                  value={form.description}
                  onChange={(event) =>
                    updateField(
                      "description",
                      event.target.value,
                    )
                  }
                  placeholder="Describe el estilo, ambiente y características del beat..."
                  className="w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="mood"
                    className="mb-2 block text-sm font-medium text-white/70"
                  >
                    Mood
                  </label>

                  <input
                    id="mood"
                    type="text"
                    list="beat-moods"
                    value={form.mood}
                    onChange={(event) =>
                      updateField(
                        "mood",
                        event.target.value,
                      )
                    }
                    placeholder="Dark"
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                  />

                  <datalist id="beat-moods">
                    <option value="Dark" />
                    <option value="Chill" />
                    <option value="Sad" />
                    <option value="Happy" />
                    <option value="Romantic" />
                    <option value="Energetic" />
                  </datalist>
                </div>

                <div>
                  <label
                    htmlFor="durationSeconds"
                    className="mb-2 block text-sm font-medium text-white/70"
                  >
                    Duración en segundos
                  </label>

                  <input
                    id="durationSeconds"
                    type="number"
                    min="1"
                    step="1"
                    value={form.durationSeconds}
                    onChange={(event) =>
                      updateField(
                        "durationSeconds",
                        event.target.value,
                      )
                    }
                    placeholder="180"
                    className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="tags"
                  className="mb-2 block text-sm font-medium text-white/70"
                >
                  Etiquetas
                </label>

                <input
                  id="tags"
                  type="text"
                  value={form.tags}
                  onChange={(event) =>
                    updateField(
                      "tags",
                      event.target.value,
                    )
                  }
                  placeholder="reggaeton, oscuro, romántico, club"
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                />

                <p className="mt-2 text-xs text-white/30">
                  Separa cada etiqueta con una coma.
                </p>

                {parsedTags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {parsedTags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-blue-400/20 bg-blue-500/10 px-3 py-1 text-xs text-blue-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.035]">
            <div className="border-b border-white/10 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-semibold">
                Archivos del beat
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Sube la portada, vista previa y archivos
                descargables.
              </p>
            </div>

            <div className="grid min-w-0 gap-6 p-5 sm:p-6">
              <ImageUploader
                value={form.coverUrl}
                onChange={(url) =>
                  updateField("coverUrl", url)
                }
              />

              <AudioUploader
                value={form.audioUrl}
                onChange={(url) =>
                  updateField("audioUrl", url)
                }
              />

              <FileUploader
                type="wav"
                value={form.wavUrl}
                onChange={(url) =>
                  updateField("wavUrl", url)
                }
              />

              <FileUploader
                type="stems"
                value={form.stemsUrl}
                onChange={(url) =>
                  updateField("stemsUrl", url)
                }
              />
            </div>
          </section>

          <section className="rounded-2xl border border-white/10 bg-white/[0.035]">
            <div className="border-b border-white/10 px-5 py-5 sm:px-6">
              <h2 className="text-lg font-semibold">
                Vista previa
              </h2>

              <p className="mt-1 text-sm text-white/40">
                Define el fragmento que escucharán los clientes.
              </p>
            </div>

            <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <label
                  htmlFor="previewStart"
                  className="mb-2 block text-sm font-medium text-white/70"
                >
                  Inicio en segundos
                </label>

                <input
                  id="previewStart"
                  type="number"
                  min="0"
                  step="1"
                  value={form.previewStart}
                  onChange={(event) =>
                    updateField(
                      "previewStart",
                      event.target.value,
                    )
                  }
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label
                  htmlFor="previewEnd"
                  className="mb-2 block text-sm font-medium text-white/70"
                >
                  Final en segundos
                </label>

                <input
                  id="previewEnd"
                  type="number"
                  min="1"
                  step="1"
                  value={form.previewEnd}
                  onChange={(event) =>
                    updateField(
                      "previewEnd",
                      event.target.value,
                    )
                  }
                  placeholder="60"
                  className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10"
                />
              </div>
            </div>
          </section>

          {errorMessage ? (
            <div className="rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm leading-6 text-red-200">
              {errorMessage}
            </div>
          ) : null}
        </div>

        <aside className="space-y-6 xl:sticky xl:top-28 xl:self-start">
          <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-5">
            <h2 className="font-semibold">Publicación</h2>

            <p className="mt-1 text-sm leading-6 text-white/40">
              Decide si aparecerá inmediatamente en la
              tienda.
            </p>

            <select
              value={form.status}
              onChange={(event) =>
                updateField(
                  "status",
                  event.target.value as BeatStatus,
                )
              }
              className="mt-5 h-12 w-full rounded-xl border border-white/10 bg-[#0a0d13] px-4 text-sm text-white outline-none focus:border-blue-500/50"
            >
              <option value="draft">Borrador</option>
              <option value="published">
                Publicado
              </option>
            </select>

            <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(event) =>
                  updateField(
                    "featured",
                    event.target.checked,
                  )
                }
                className="h-4 w-4 accent-blue-600"
              />

              <Star className="h-5 w-5 text-blue-400" />

              <div>
                <p className="text-sm font-medium">
                  Beat destacado
                </p>

                <p className="mt-1 text-xs text-white/35">
                  Mostrar en áreas principales.
                </p>
              </div>
            </label>
          </section>

          <section className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.035]">
            <div className="aspect-square bg-black/20">
              {form.coverUrl ? (
                <img
                  src={form.coverUrl}
                  alt="Vista previa de la portada"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center px-6 text-center">
                  <ImageIcon className="h-10 w-10 text-white/20" />

                  <p className="mt-4 text-sm font-medium text-white/55">
                    Vista previa
                  </p>

                  <p className="mt-1 text-xs text-white/30">
                    La portada aparecerá aquí.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t border-white/10 p-4">
              <div className="flex items-center gap-3">
                <Music2 className="h-5 w-5 shrink-0 text-blue-400" />

                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {form.title || "Nuevo beat"}
                  </p>

                  <p className="mt-0.5 truncate text-xs text-white/35">
                    {form.genre || "Sin género"}
                    {form.bpm
                      ? ` · ${form.bpm} BPM`
                      : ""}
                  </p>
                </div>
              </div>

              {form.audioUrl ? (
                <audio
                  controls
                  src={form.audioUrl}
                  className="mt-4 w-full"
                />
              ) : null}
            </div>
          </section>

          <div className="grid gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Save className="h-5 w-5" />
              )}

              {isSubmitting
  ? "Guardando..."
  : isEditing
    ? "Guardar cambios"
    : "Guardar beat"}
            </button>

            <Link
              href="/admin/beats"
              className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-semibold text-white/60 transition hover:bg-white/[0.07] hover:text-white"
            >
              Cancelar
            </Link>
          </div>
        </aside>
      </form>
    </div>
  );
}