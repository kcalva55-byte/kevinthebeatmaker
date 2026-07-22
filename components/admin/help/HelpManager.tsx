"use client";

import {
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

interface HelpFaq {
  id: string;
  question: string;
  answer: string;
  sort_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
}

interface FaqFormState {
  question: string;
  answer: string;
  sort_order: string;
  published: boolean;
}

const EMPTY_FORM: FaqFormState = {
  question: "",
  answer: "",
  sort_order: "0",
  published: true,
};

export default function HelpManager() {
  const [faqs, setFaqs] = useState<HelpFaq[]>([]);
  const [form, setForm] =
    useState<FaqFormState>(EMPTY_FORM);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [expandedId, setExpandedId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadFaqs = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/help", {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "No se pudieron cargar las preguntas.",
        );
      }

      setFaqs(result.faqs ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No se pudieron cargar las preguntas.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadFaqs();
  }, [loadFaqs]);

  const filteredFaqs = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return faqs;
    }

    return faqs.filter((faq) => {
      return (
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      );
    });
  }, [faqs, search]);

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  function startEditing(faq: HelpFaq) {
    setEditingId(faq.id);

    setForm({
      question: faq.question,
      answer: faq.answer,
      sort_order: String(faq.sort_order),
      published: faq.published,
    });

    setMessage("");
    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const endpoint = editingId
        ? `/api/admin/help/${editingId}`
        : "/api/admin/help";

      const response = await fetch(endpoint, {
        method: editingId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: form.question,
          answer: form.answer,
          sort_order: Number(form.sort_order),
          published: form.published,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "No se pudo guardar la pregunta.",
        );
      }

      setMessage(
        editingId
          ? "Pregunta actualizada correctamente."
          : "Pregunta creada correctamente.",
      );

      resetForm();
      await loadFaqs();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "No se pudo guardar la pregunta.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(faq: HelpFaq) {
    const confirmed = window.confirm(
      `¿Eliminar la pregunta “${faq.question}”?`,
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(faq.id);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/help/${faq.id}`,
        {
          method: "DELETE",
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "No se pudo eliminar la pregunta.",
        );
      }

      if (editingId === faq.id) {
        resetForm();
      }

      setMessage("Pregunta eliminada correctamente.");
      await loadFaqs();
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "No se pudo eliminar la pregunta.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function togglePublished(faq: HelpFaq) {
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/admin/help/${faq.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: faq.question,
            answer: faq.answer,
            sort_order: faq.sort_order,
            published: !faq.published,
          }),
        },
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error ||
            "No se pudo cambiar el estado.",
        );
      }

      setFaqs((currentFaqs) =>
        currentFaqs.map((currentFaq) =>
          currentFaq.id === faq.id
            ? {
                ...currentFaq,
                published: !faq.published,
              }
            : currentFaq,
        ),
      );
    } catch (toggleError) {
      setError(
        toggleError instanceof Error
          ? toggleError.message
          : "No se pudo cambiar el estado.",
      );
    }
  }

  return (
    <div className="space-y-8">
      <section className="rounded-3xl border border-white/10 bg-white/[0.035] p-6 sm:p-8">
        <div className="flex flex-col gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-medium text-blue-300">
              <BookOpen className="h-4 w-4" />
              Centro de Ayuda
            </div>

            <h2 className="mt-3 text-2xl font-bold text-white">
              {editingId
                ? "Editar pregunta"
                : "Nueva pregunta"}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/50">
              Las preguntas publicadas aparecerán
              automáticamente en la página pública de ayuda.
            </p>
          </div>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/70 transition hover:bg-white/[0.06] hover:text-white"
            >
              <X className="h-4 w-4" />
              Cancelar edición
            </button>
          )}
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-6"
        >
          <div>
            <label
              htmlFor="question"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              Pregunta
            </label>

            <input
              id="question"
              type="text"
              value={form.question}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  question: event.target.value,
                }))
              }
              placeholder="Ejemplo: ¿Cómo recibo mis archivos?"
              required
              className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <div>
            <label
              htmlFor="answer"
              className="mb-2 block text-sm font-medium text-white/70"
            >
              Respuesta
            </label>

            <textarea
              id="answer"
              value={form.answer}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  answer: event.target.value,
                }))
              }
              placeholder="Escribe una respuesta clara y completa."
              required
              rows={7}
              className="w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="sort-order"
                className="mb-2 block text-sm font-medium text-white/70"
              >
                Orden
              </label>

              <input
                id="sort-order"
                type="number"
                min="0"
                step="1"
                value={form.sort_order}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    sort_order: event.target.value,
                  }))
                }
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition focus:border-blue-500/60 focus:ring-2 focus:ring-blue-500/10"
              />
            </div>

            <label className="flex min-h-12 cursor-pointer items-center justify-between rounded-xl border border-white/10 bg-black/20 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-white">
                  Publicada
                </p>

                <p className="mt-1 text-xs text-white/40">
                  Visible en la página pública
                </p>
              </div>

              <input
                type="checkbox"
                checked={form.published}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    published: event.target.checked,
                  }))
                }
                className="h-5 w-5 accent-blue-600"
              />
            </label>
          </div>

          {error && (
            <div className="rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              <Check className="h-4 w-4" />
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : editingId ? (
              <Pencil className="h-4 w-4" />
            ) : (
              <Plus className="h-4 w-4" />
            )}

            {saving
              ? "Guardando..."
              : editingId
                ? "Guardar cambios"
                : "Crear pregunta"}
          </button>
        </form>
      </section>

      <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.035]">
        <div className="border-b border-white/10 p-6 sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">
                Preguntas registradas
              </h2>

              <p className="mt-1 text-sm text-white/45">
                {faqs.length} preguntas en total
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Buscar preguntas..."
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-blue-500/50"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-blue-300" />
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-white/20" />

            <h3 className="mt-4 font-semibold text-white">
              No hay preguntas
            </h3>

            <p className="mt-2 text-sm text-white/45">
              Crea la primera pregunta para el Centro de Ayuda.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-white/[0.07]">
            {filteredFaqs.map((faq) => {
              const expanded = expandedId === faq.id;

              return (
                <article key={faq.id} className="p-5 sm:p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(
                          expanded ? null : faq.id,
                        )
                      }
                      className="flex flex-1 items-start gap-3 text-left"
                    >
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/[0.05] text-white/50">
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </span>

                      <span>
                        <span className="block font-medium text-white">
                          {faq.question}
                        </span>

                        <span className="mt-2 block text-xs text-white/35">
                          Orden: {faq.sort_order}
                        </span>
                      </span>
                    </button>

                    <div className="flex flex-wrap items-center gap-2 pl-11 lg:pl-0">
                      <button
                        type="button"
                        onClick={() =>
                          void togglePublished(faq)
                        }
                        className={[
                          "inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition",
                          faq.published
                            ? "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"
                            : "border-white/10 bg-white/[0.04] text-white/45",
                        ].join(" ")}
                      >
                        {faq.published ? (
                          <Eye className="h-3.5 w-3.5" />
                        ) : (
                          <EyeOff className="h-3.5 w-3.5" />
                        )}

                        {faq.published
                          ? "Publicada"
                          : "Oculta"}
                      </button>

                      <button
                        type="button"
                        onClick={() => startEditing(faq)}
                        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/60 transition hover:bg-white/[0.06] hover:text-white"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          void handleDelete(faq)
                        }
                        disabled={deletingId === faq.id}
                        className="inline-flex items-center gap-2 rounded-lg border border-red-400/15 px-3 py-2 text-xs font-medium text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                      >
                        {deletingId === faq.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}

                        Eliminar
                      </button>
                    </div>
                  </div>

                  {expanded && (
                    <div className="ml-11 mt-5 whitespace-pre-wrap rounded-xl border border-white/[0.07] bg-black/20 p-4 text-sm leading-7 text-white/60">
                      {faq.answer}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}