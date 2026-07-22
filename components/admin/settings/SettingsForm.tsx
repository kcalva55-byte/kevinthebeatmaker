"use client";

import { useState } from "react";
import {
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  Globe2,
  Loader2,
  Mail,
  MessageCircle,
  Save,
  Settings2,
  Share2,
  ShoppingBag,
} from "lucide-react";

export interface SiteSettings {
  id: string;

  studio_name: string;
  producer_name: string;

  contact_email: string | null;
  support_email: string | null;
  phone: string | null;
  whatsapp: string | null;

  site_url: string | null;
  instagram_url: string | null;
  youtube_url: string | null;
  tiktok_url: string | null;
  facebook_url: string | null;

  currency: string;
  country: string;
  timezone: string;

  order_email_enabled: boolean;
  download_expiration_minutes: number;

  legal_name: string | null;
  legal_identification: string | null;
  legal_address: string | null;

  terms_text: string | null;
  privacy_text: string | null;
  license_footer_text: string | null;

  created_at?: string;
  updated_at?: string;
}

interface SettingsFormProps {
  initialSettings: SiteSettings;
}

type SettingsSection =
  | "general"
  | "contact"
  | "social"
  | "orders"
  | "legal";

interface ApiResponse {
  success?: boolean;
  error?: string;
  settings?: SiteSettings;
}

const inputClasses =
  "mt-2 h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10";

const textareaClasses =
  "mt-2 min-h-32 w-full resize-y rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-blue-500/40 focus:ring-2 focus:ring-blue-500/10";

function normalizeNullable(value: string) {
  const trimmedValue = value.trim();

  return trimmedValue || null;
}

export default function SettingsForm({
  initialSettings,
}: SettingsFormProps) {
  const [settings, setSettings] =
    useState<SiteSettings>(initialSettings);

  const [activeSection, setActiveSection] =
    useState<SettingsSection>("general");

  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] =
    useState("");
  const [errorMessage, setErrorMessage] =
    useState("");

  function updateField<Key extends keyof SiteSettings>(
    key: Key,
    value: SiteSettings[Key],
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setSuccessMessage("");
    setErrorMessage("");
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setIsSaving(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const response = await fetch(
        "/api/admin/settings",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studio_name: settings.studio_name.trim(),
            producer_name:
              settings.producer_name.trim(),

            contact_email: normalizeNullable(
              settings.contact_email || "",
            ),

            support_email: normalizeNullable(
              settings.support_email || "",
            ),

            phone: normalizeNullable(
              settings.phone || "",
            ),

            whatsapp: normalizeNullable(
              settings.whatsapp || "",
            ),

            site_url: normalizeNullable(
              settings.site_url || "",
            ),

            instagram_url: normalizeNullable(
              settings.instagram_url || "",
            ),

            youtube_url: normalizeNullable(
              settings.youtube_url || "",
            ),

            tiktok_url: normalizeNullable(
              settings.tiktok_url || "",
            ),

            facebook_url: normalizeNullable(
              settings.facebook_url || "",
            ),

            currency: settings.currency
              .trim()
              .toUpperCase(),

            country: settings.country.trim(),
            timezone: settings.timezone.trim(),

            order_email_enabled:
              settings.order_email_enabled,

            download_expiration_minutes:
              Number(
                settings.download_expiration_minutes,
              ),

            legal_name: normalizeNullable(
              settings.legal_name || "",
            ),

            legal_identification: normalizeNullable(
              settings.legal_identification || "",
            ),

            legal_address: normalizeNullable(
              settings.legal_address || "",
            ),

            terms_text: normalizeNullable(
              settings.terms_text || "",
            ),

            privacy_text: normalizeNullable(
              settings.privacy_text || "",
            ),

            license_footer_text: normalizeNullable(
              settings.license_footer_text || "",
            ),
          }),
        },
      );

      const result =
        (await response.json()) as ApiResponse;

      if (!response.ok || !result.success) {
        throw new Error(
          result.error ||
            "No se pudo guardar la configuración.",
        );
      }

      if (result.settings) {
        setSettings(result.settings);
      }

      setSuccessMessage(
        "Configuración guardada correctamente.",
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la configuración.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  const sections: Array<{
    id: SettingsSection;
    label: string;
    description: string;
    icon: typeof Settings2;
  }> = [
    {
      id: "general",
      label: "General",
      description: "Identidad y ubicación",
      icon: Settings2,
    },
    {
      id: "contact",
      label: "Contacto",
      description: "Correos y teléfonos",
      icon: Mail,
    },
    {
      id: "social",
      label: "Redes sociales",
      description: "Enlaces públicos",
      icon: Share2,
    },
    {
      id: "orders",
      label: "Pedidos",
      description: "Entrega y moneda",
      icon: ShoppingBag,
    },
    {
      id: "legal",
      label: "Legal",
      description: "Términos y licencias",
      icon: FileText,
    },
  ];

  return (
    <form
      onSubmit={handleSubmit}
      className="mx-auto w-full max-w-[1540px]"
    >
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025] px-5 py-6 sm:px-7 sm:py-8">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-400/15 bg-blue-500/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
              <Settings2 className="h-3.5 w-3.5" />
              Configuración
            </div>

            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
              Configuración de KTB Studio
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40 sm:text-base">
              Administra los datos generales,
              contacto, redes, pedidos y textos
              legales de la tienda.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white shadow-lg shadow-blue-600/15 transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}

            {isSaving
              ? "Guardando..."
              : "Guardar cambios"}
          </button>
        </div>
      </section>

      {successMessage ? (
        <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-500/10 px-5 py-4 text-sm text-emerald-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {successMessage}
        </div>
      ) : null}

      {errorMessage ? (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
          {errorMessage}
        </div>
      ) : null}

      <section className="mt-6 grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)]">
        <aside className="h-fit rounded-3xl border border-white/10 bg-white/[0.025] p-3 xl:sticky xl:top-28">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon;

              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() =>
                    setActiveSection(section.id)
                  }
                  className={[
                    "flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left transition",
                    activeSection === section.id
                      ? "border border-blue-400/20 bg-blue-500/10 text-white"
                      : "border border-transparent text-white/45 hover:bg-white/[0.045] hover:text-white",
                  ].join(" ")}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035]">
                    <Icon className="h-4 w-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-semibold">
                      {section.label}
                    </p>

                    <p className="mt-1 truncate text-xs text-white/30">
                      {section.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </aside>

        <div className="min-w-0">
          {activeSection === "general" ? (
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
              <header className="border-b border-white/10 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <Building2 className="h-5 w-5 text-blue-300" />

                  <div>
                    <h2 className="font-semibold">
                      Información general
                    </h2>

                    <p className="mt-1 text-sm text-white/35">
                      Identidad principal y ubicación
                      del negocio.
                    </p>
                  </div>
                </div>
              </header>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <label className="text-sm text-white/55">
                  Nombre del estudio
                  <input
                    required
                    value={settings.studio_name}
                    onChange={(event) =>
                      updateField(
                        "studio_name",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                    placeholder="KTB Studio"
                  />
                </label>

                <label className="text-sm text-white/55">
                  Nombre del productor
                  <input
                    required
                    value={settings.producer_name}
                    onChange={(event) =>
                      updateField(
                        "producer_name",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                    placeholder="Kevin The Beatmaker"
                  />
                </label>

                <label className="text-sm text-white/55">
                  País
                  <input
                    required
                    value={settings.country}
                    onChange={(event) =>
                      updateField(
                        "country",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                    placeholder="Ecuador"
                  />
                </label>

                <label className="text-sm text-white/55">
                  Zona horaria
                  <div className="relative">
                    <Clock3 className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-white/25" />

                    <input
                      required
                      value={settings.timezone}
                      onChange={(event) =>
                        updateField(
                          "timezone",
                          event.target.value,
                        )
                      }
                      className={`${inputClasses} pl-11`}
                      placeholder="America/Guayaquil"
                    />
                  </div>
                </label>

                <label className="text-sm text-white/55 sm:col-span-2">
                  URL pública del sitio
                  <div className="relative">
                    <Globe2 className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-white/25" />

                    <input
                      value={settings.site_url || ""}
                      onChange={(event) =>
                        updateField(
                          "site_url",
                          event.target.value,
                        )
                      }
                      className={`${inputClasses} pl-11`}
                      placeholder="https://ktbstudio.com"
                    />
                  </div>
                </label>
              </div>
            </section>
          ) : null}

          {activeSection === "contact" ? (
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
              <header className="border-b border-white/10 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-300" />

                  <div>
                    <h2 className="font-semibold">
                      Información de contacto
                    </h2>

                    <p className="mt-1 text-sm text-white/35">
                      Datos que utilizarán los clientes
                      para comunicarse.
                    </p>
                  </div>
                </div>
              </header>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <label className="text-sm text-white/55">
                  Correo principal
                  <input
                    type="email"
                    value={settings.contact_email || ""}
                    onChange={(event) =>
                      updateField(
                        "contact_email",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                    placeholder="contacto@ktbstudio.com"
                  />
                </label>

                <label className="text-sm text-white/55">
                  Correo de soporte
                  <input
                    type="email"
                    value={settings.support_email || ""}
                    onChange={(event) =>
                      updateField(
                        "support_email",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                    placeholder="soporte@ktbstudio.com"
                  />
                </label>

                <label className="text-sm text-white/55">
                  Teléfono
                  <input
                    value={settings.phone || ""}
                    onChange={(event) =>
                      updateField(
                        "phone",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                    placeholder="+593..."
                  />
                </label>

                <label className="text-sm text-white/55">
                  WhatsApp
                  <div className="relative">
                    <MessageCircle className="pointer-events-none absolute left-4 top-1/2 mt-1 h-4 w-4 -translate-y-1/2 text-white/25" />

                    <input
                      value={settings.whatsapp || ""}
                      onChange={(event) =>
                        updateField(
                          "whatsapp",
                          event.target.value,
                        )
                      }
                      className={`${inputClasses} pl-11`}
                      placeholder="+593..."
                    />
                  </div>
                </label>
              </div>
            </section>
          ) : null}

          {activeSection === "social" ? (
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
              <header className="border-b border-white/10 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <Share2 className="h-5 w-5 text-blue-300" />

                  <div>
                    <h2 className="font-semibold">
                      Redes sociales
                    </h2>

                    <p className="mt-1 text-sm text-white/35">
                      Enlaces oficiales de KTB Studio.
                    </p>
                  </div>
                </div>
              </header>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <label className="text-sm text-white/55">
                  Instagram
                  <input
                    value={settings.instagram_url || ""}
                    onChange={(event) =>
                      updateField(
                        "instagram_url",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                    placeholder="https://instagram.com/..."
                  />
                </label>

                <label className="text-sm text-white/55">
                  YouTube
                  <input
                    value={settings.youtube_url || ""}
                    onChange={(event) =>
                      updateField(
                        "youtube_url",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                    placeholder="https://youtube.com/..."
                  />
                </label>

                <label className="text-sm text-white/55">
                  TikTok
                  <input
                    value={settings.tiktok_url || ""}
                    onChange={(event) =>
                      updateField(
                        "tiktok_url",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                    placeholder="https://tiktok.com/@..."
                  />
                </label>

                <label className="text-sm text-white/55">
                  Facebook
                  <input
                    value={settings.facebook_url || ""}
                    onChange={(event) =>
                      updateField(
                        "facebook_url",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                    placeholder="https://facebook.com/..."
                  />
                </label>
              </div>
            </section>
          ) : null}

          {activeSection === "orders" ? (
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
              <header className="border-b border-white/10 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-blue-300" />

                  <div>
                    <h2 className="font-semibold">
                      Pedidos y entregas
                    </h2>

                    <p className="mt-1 text-sm text-white/35">
                      Moneda y comportamiento de las
                      descargas.
                    </p>
                  </div>
                </div>
              </header>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <label className="text-sm text-white/55">
                  Moneda
                  <input
                    required
                    maxLength={3}
                    value={settings.currency}
                    onChange={(event) =>
                      updateField(
                        "currency",
                        event.target.value.toUpperCase(),
                      )
                    }
                    className={inputClasses}
                    placeholder="USD"
                  />
                </label>

                <label className="text-sm text-white/55">
                  Expiración de descargas
                  <div className="relative">
                    <input
                      required
                      type="number"
                      min={5}
                      max={10080}
                      value={
                        settings.download_expiration_minutes
                      }
                      onChange={(event) =>
                        updateField(
                          "download_expiration_minutes",
                          Number(event.target.value),
                        )
                      }
                      className={`${inputClasses} pr-24`}
                    />

                    <span className="pointer-events-none absolute right-4 top-1/2 mt-1 -translate-y-1/2 text-xs text-white/30">
                      minutos
                    </span>
                  </div>
                </label>

                <label className="sm:col-span-2">
                  <div className="flex items-center justify-between gap-5 rounded-2xl border border-white/10 bg-black/15 p-5">
                    <div>
                      <p className="text-sm font-semibold">
                        Correos automáticos de pedidos
                      </p>

                      <p className="mt-1 text-xs leading-5 text-white/35">
                        Permite enviar los archivos y la
                        licencia después de confirmar el
                        pago.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        updateField(
                          "order_email_enabled",
                          !settings.order_email_enabled,
                        )
                      }
                      aria-pressed={
                        settings.order_email_enabled
                      }
                      className={[
                        "relative h-7 w-12 shrink-0 rounded-full transition",
                        settings.order_email_enabled
                          ? "bg-blue-600"
                          : "bg-white/15",
                      ].join(" ")}
                    >
                      <span
                        className={[
                          "absolute top-1 h-5 w-5 rounded-full bg-white transition",
                          settings.order_email_enabled
                            ? "left-6"
                            : "left-1",
                        ].join(" ")}
                      />
                    </button>
                  </div>
                </label>
              </div>
            </section>
          ) : null}

          {activeSection === "legal" ? (
            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.025]">
              <header className="border-b border-white/10 px-5 py-5 sm:px-6">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-300" />

                  <div>
                    <h2 className="font-semibold">
                      Información legal
                    </h2>

                    <p className="mt-1 text-sm text-white/35">
                      Datos comerciales, términos y
                      privacidad.
                    </p>
                  </div>
                </div>
              </header>

              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <label className="text-sm text-white/55">
                  Nombre legal
                  <input
                    value={settings.legal_name || ""}
                    onChange={(event) =>
                      updateField(
                        "legal_name",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                    placeholder="Nombre o razón social"
                  />
                </label>

                <label className="text-sm text-white/55">
                  Identificación legal
                  <input
                    value={
                      settings.legal_identification || ""
                    }
                    onChange={(event) =>
                      updateField(
                        "legal_identification",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                    placeholder="Cédula o RUC"
                  />
                </label>

                <label className="text-sm text-white/55 sm:col-span-2">
                  Dirección legal
                  <input
                    value={settings.legal_address || ""}
                    onChange={(event) =>
                      updateField(
                        "legal_address",
                        event.target.value,
                      )
                    }
                    className={inputClasses}
                    placeholder="Ciudad, provincia, país"
                  />
                </label>

                <label className="text-sm text-white/55 sm:col-span-2">
                  Términos y condiciones
                  <textarea
                    value={settings.terms_text || ""}
                    onChange={(event) =>
                      updateField(
                        "terms_text",
                        event.target.value,
                      )
                    }
                    className={textareaClasses}
                  />
                </label>

                <label className="text-sm text-white/55 sm:col-span-2">
                  Política de privacidad
                  <textarea
                    value={settings.privacy_text || ""}
                    onChange={(event) =>
                      updateField(
                        "privacy_text",
                        event.target.value,
                      )
                    }
                    className={textareaClasses}
                  />
                </label>

                <label className="text-sm text-white/55 sm:col-span-2">
                  Texto inferior de licencias
                  <textarea
                    value={
                      settings.license_footer_text || ""
                    }
                    onChange={(event) =>
                      updateField(
                        "license_footer_text",
                        event.target.value,
                      )
                    }
                    className={textareaClasses}
                  />
                </label>
              </div>
            </section>
          ) : null}
        </div>
      </section>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}

          {isSaving
            ? "Guardando..."
            : "Guardar configuración"}
        </button>
      </div>
    </form>
  );
}