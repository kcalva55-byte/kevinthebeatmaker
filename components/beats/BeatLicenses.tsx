"use client";

import {
  Check,
  Crown,
  FileArchive,
  FileAudio,
  ShoppingCart,
  Sparkles,
  X,
} from "lucide-react";

import { useCart } from "../cart/CartProvider";

type License = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  audio_format: string;

  distribution_limit: number | null;
  streams_limit: number | null;

  digital_distribution_allowed: boolean;
  monetization_allowed: boolean;
  project_files_included: boolean;

  music_video_allowed: boolean;
  radio_allowed: boolean;
  paid_performances_allowed: boolean;

  exclusive: boolean;
};

type BeatLicensesProps = {
  beatId: string;
  beatTitle: string;
  beatCoverUrl: string | null;
  licenses: License[];
  color: string;
};

type Feature = {
  label: string;
  included: boolean;
  detail?: string;
};

function getLicenseType(
  name: string,
  exclusive: boolean,
) {
  const normalizedName = name.toLowerCase();

  if (
    exclusive ||
    normalizedName.includes("exclusiva")
  ) {
    return "exclusive";
  }

  if (normalizedName.includes("premium")) {
    return "premium";
  }

  return "basic";
}

function getAudioFormats(audioFormat: string) {
  const normalized = audioFormat.toLowerCase();

  return {
    mp3:
      normalized.includes("mp3") ||
      normalized.length === 0,
    wav: normalized.includes("wav"),
    stems:
      normalized.includes("stem") ||
      normalized.includes("trackout") ||
      normalized.includes("pistas"),
  };
}

function FeatureItem({
  feature,
  color,
  exclusive,
}: {
  feature: Feature;
  color: string;
  exclusive: boolean;
}) {
  return (
    <li
      className={[
        "flex items-start gap-3 rounded-xl px-3 py-2.5 transition",
        feature.included
          ? "bg-white/[0.025] text-white/80"
          : "text-white/35",
      ].join(" ")}
    >
      <span
        className={[
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          feature.included
            ? exclusive
              ? "bg-amber-400/15 text-amber-300"
              : "text-white"
            : "bg-white/[0.05] text-white/25",
        ].join(" ")}
        style={
          feature.included && !exclusive
            ? {
                backgroundColor: `${color}22`,
                color,
              }
            : undefined
        }
      >
        {feature.included ? (
          <Check
            className="h-3.5 w-3.5"
            strokeWidth={3}
          />
        ) : (
          <X
            className="h-3.5 w-3.5"
            strokeWidth={2.5}
          />
        )}
      </span>

      <span className="min-w-0">
        <span
          className={
            feature.included
              ? "font-medium text-white/85"
              : "text-white/35"
          }
        >
          {feature.label}
        </span>

        {feature.detail && (
          <span className="mt-0.5 block text-xs leading-5 text-white/40">
            {feature.detail}
          </span>
        )}
      </span>
    </li>
  );
}

export default function BeatLicenses({
  beatId,
  beatTitle,
  beatCoverUrl,
  licenses,
  color,
}: BeatLicensesProps) {
  const { addItem, containsLicense } = useCart();

  if (licenses.length === 0) {
    return (
      <section className="mt-16">
        <div className="rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center">
          <h2 className="text-2xl font-black text-white">
            Licencias no disponibles
          </h2>

          <p className="mt-3 text-sm text-slate-400">
            Este beat todavía no tiene licencias activas.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mt-20">
      <div className="mb-10 max-w-3xl">
        <p
          className="text-sm font-bold uppercase tracking-[0.28em]"
          style={{ color }}
        >
          Elige tu licencia
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
          Licencias disponibles
        </h2>

        <p className="mt-4 text-slate-400">
          Compara los formatos, permisos comerciales y
          beneficios incluidos para elegir la mejor opción para
          tu lanzamiento.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {licenses.map((license) => {
          const price = Number(license.price) || 0;
          const isInCart = containsLicense(license.id);

          const licenseType = getLicenseType(
            license.name,
            license.exclusive,
          );

          const isExclusive =
            licenseType === "exclusive";
          const isPremium = licenseType === "premium";

          const formats = getAudioFormats(
            license.audio_format,
          );

          const features: Feature[] = [
            {
              label: "Archivo MP3",
              included: formats.mp3,
            },
            {
              label: "Archivo WAV",
              included: formats.wav,
              detail: formats.wav
                ? "Audio en alta calidad."
                : undefined,
            },
            {
              label: "Distribución digital",
              included:
                license.digital_distribution_allowed,
              detail:
                license.digital_distribution_allowed
                  ? "Spotify, Apple Music, YouTube Music y otras plataformas."
                  : "No permite publicar en plataformas digitales.",
            },
            {
              label: "Monetización",
              included:
                license.monetization_allowed,
              detail: license.monetization_allowed
                ? "Puedes generar ingresos con tu lanzamiento."
                : "El contenido no puede generar ingresos.",
            },
            {
              label: "Video musical",
              included:
                license.music_video_allowed,
            },
            {
              label: "Difusión en radio",
              included: license.radio_allowed,
            },
            {
              label: "Presentaciones pagadas",
              included:
                license.paid_performances_allowed,
            },
            {
              label: "Archivos del proyecto",
              included:
                license.project_files_included,
            },
            {
              label: "Stems o pistas separadas",
              included:
                formats.stems ||
                license.project_files_included,
            },
            {
              label: "Derechos exclusivos",
              included: license.exclusive,
              detail: license.exclusive
                ? "El beat se retira del catálogo después de la compra."
                : "Otros artistas todavía pueden comprar una licencia.",
            },
          ];

          return (
            <article
              key={license.id}
              className={[
                "group relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-6 backdrop-blur-xl transition duration-500 hover:-translate-y-2 sm:p-7",
                isExclusive
                  ? "border-amber-400/40 bg-gradient-to-b from-amber-400/[0.11] via-white/[0.035] to-white/[0.02] shadow-[0_25px_100px_rgba(245,158,11,0.13)]"
                  : isPremium
                    ? "border-white/20 bg-white/[0.055] shadow-[0_25px_100px_rgba(0,0,0,0.22)]"
                    : "border-white/10 bg-white/[0.03] hover:border-white/20",
              ].join(" ")}
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-20 blur-3xl transition duration-500 group-hover:scale-125"
                style={{
                  backgroundColor: isExclusive
                    ? "#f59e0b"
                    : color,
                }}
              />

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-10 top-0 h-px"
                style={{
                  background: isExclusive
                    ? "linear-gradient(to right, transparent, rgba(252,211,77,.7), transparent)"
                    : `linear-gradient(to right, transparent, ${color}, transparent)`,
                }}
              />

              <div className="relative z-10 flex items-center justify-between gap-4">
                <div
                  className={[
                    "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.14em]",
                    isExclusive
                      ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
                      : "border-white/10 bg-white/[0.04] text-white/60",
                  ].join(" ")}
                  style={
                    isPremium
                      ? {
                          borderColor: `${color}55`,
                          backgroundColor: `${color}18`,
                          color,
                        }
                      : undefined
                  }
                >
                  {isExclusive ? (
                    <Crown className="h-3.5 w-3.5" />
                  ) : isPremium ? (
                    <Sparkles className="h-3.5 w-3.5" />
                  ) : (
                    <FileAudio className="h-3.5 w-3.5" />
                  )}

                  {isExclusive
                    ? "Exclusiva"
                    : isPremium
                      ? "Más popular"
                      : "Licencia"}
                </div>
              </div>

              <div className="relative z-10 mt-7">
                <h3 className="text-3xl font-black tracking-[-0.04em] text-white">
                  {license.name}
                </h3>

                <p className="mt-4 min-h-[72px] text-sm leading-7 text-slate-400">
                  {license.description ||
                    (isExclusive
                      ? "La opción más completa para adquirir los derechos exclusivos del beat."
                      : isPremium
                        ? "Ideal para artistas que desean publicar y monetizar su música profesionalmente."
                        : "Pensada para proyectos personales y usos no comerciales.")}
                </p>

                <div className="mt-7 flex flex-wrap items-end gap-x-3 gap-y-1">
                  <span
                    className={[
                      "text-4xl font-black tracking-[-0.05em]",
                      isExclusive
                        ? "text-amber-300"
                        : "text-white",
                    ].join(" ")}
                    style={
                      !isExclusive
                        ? { color }
                        : undefined
                    }
                  >
                    ${price.toFixed(2)}
                  </span>

                  <span className="pb-1 text-sm text-slate-500">
                    USD · pago único
                  </span>
                </div>
              </div>

              <div className="relative z-10 my-7 h-px bg-white/10" />

              <ul className="relative z-10 flex flex-1 flex-col gap-1">
                {features.map((feature) => (
                  <FeatureItem
                    key={feature.label}
                    feature={feature}
                    color={color}
                    exclusive={isExclusive}
                  />
                ))}
              </ul>

              {isExclusive && (
                <div className="relative z-10 mt-6 rounded-2xl border border-amber-400/20 bg-amber-400/[0.07] p-4">
                  <div className="flex items-start gap-3">
                    <Crown className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />

                    <div>
                      <p className="text-sm font-semibold text-amber-200">
                        Compra exclusiva
                      </p>

                      <p className="mt-1 text-xs leading-5 text-amber-100/55">
                        El beat se retirará del catálogo después
                        de completar la compra.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={() =>
                  addItem({
                    licenseId: license.id,
                    beatId,
                    beatTitle,
                    beatCoverUrl,
                    licenseName: license.name,
                    audioFormat:
                      license.audio_format,
                    price,
                    exclusive:
                      license.exclusive,
                  })
                }
                disabled={isInCart}
                className={[
                  "relative z-10 mt-8 inline-flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl px-6 text-sm font-black transition duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60",
                  isExclusive
                    ? "bg-amber-400 text-black shadow-[0_14px_45px_rgba(245,158,11,0.22)] hover:bg-amber-300"
                    : "text-white",
                ].join(" ")}
                style={
                  !isExclusive
                    ? {
                        backgroundColor: color,
                        boxShadow: `0 14px 38px ${color}35`,
                      }
                    : undefined
                }
              >
                <ShoppingCart className="h-4 w-4" />

                {isInCart
                  ? "Ya está en el carrito"
                  : "Comprar licencia"}
              </button>

              <div className="relative z-10 mt-4 flex items-center justify-center gap-2 text-xs text-white/30">
                {isExclusive ? (
                  <Crown className="h-3.5 w-3.5" />
                ) : license.project_files_included ? (
                  <FileArchive className="h-3.5 w-3.5" />
                ) : (
                  <FileAudio className="h-3.5 w-3.5" />
                )}

                Documento de licencia incluido
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}