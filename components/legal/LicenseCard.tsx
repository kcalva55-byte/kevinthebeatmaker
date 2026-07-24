import Link from "next/link";
import {
  Check,
  Crown,
  FileArchive,
  FileAudio,
  Mic2,
  Radio,
  ShoppingCart,
  Sparkles,
  Video,
  X,
} from "lucide-react";

export interface PublicLicense {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  audio_format: string | null;

  distribution_limit: number | null;
  streams_limit: number | null;

  digital_distribution_allowed: boolean;
  monetization_allowed: boolean;
  project_files_included: boolean;

  music_video_allowed: boolean;
  radio_allowed: boolean;
  paid_performances_allowed: boolean;
  exclusive: boolean;
}

interface LicenseCardProps {
  license: PublicLicense;
  featured?: boolean;
  currency?: string;
}

interface LicenseFeature {
  label: string;
  included: boolean;
  detail?: string;
}

function formatPrice(
  value: number | string,
  currency: string,
) {
  const numericPrice =
    typeof value === "string" ? Number(value) : value;

  if (!Number.isFinite(numericPrice)) {
    return String(value);
  }

  return new Intl.NumberFormat("es-EC", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

function getLicenseType(name: string, exclusive: boolean) {
  const normalizedName = name.toLowerCase();

  if (exclusive || normalizedName.includes("exclusiva")) {
    return "exclusive";
  }

  if (normalizedName.includes("premium")) {
    return "premium";
  }

  return "basic";
}

function getAudioFormatFeatures(audioFormat: string | null) {
  const normalizedFormat =
    audioFormat?.toLowerCase() || "";

  return {
    mp3:
      normalizedFormat.includes("mp3") ||
      normalizedFormat.length === 0,
    wav: normalizedFormat.includes("wav"),
    stems:
      normalizedFormat.includes("stem") ||
      normalizedFormat.includes("trackout") ||
      normalizedFormat.includes("pistas"),
  };
}

function FeatureItem({
  feature,
  exclusive,
}: {
  feature: LicenseFeature;
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
              : "bg-blue-500/15 text-blue-300"
            : "bg-white/[0.05] text-white/25",
        ].join(" ")}
      >
        {feature.included ? (
          <Check className="h-3.5 w-3.5" strokeWidth={3} />
        ) : (
          <X className="h-3.5 w-3.5" strokeWidth={2.5} />
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

export default function LicenseCard({
  license,
  featured = false,
  currency = "USD",
}: LicenseCardProps) {
  const licenseType = getLicenseType(
    license.name,
    license.exclusive,
  );

  const isExclusive = licenseType === "exclusive";
  const isPremium = licenseType === "premium";
  const audioFormats = getAudioFormatFeatures(
    license.audio_format,
  );

  const features: LicenseFeature[] = [
    {
      label: "Archivo MP3",
      included: audioFormats.mp3,
      detail: audioFormats.mp3
        ? "Archivo listo para escuchar y publicar."
        : undefined,
    },
    {
      label: "Archivo WAV",
      included: audioFormats.wav,
      detail: audioFormats.wav
        ? "Audio en alta calidad."
        : undefined,
    },
    {
      label: "Distribución digital",
      included: license.digital_distribution_allowed,
      detail: license.digital_distribution_allowed
        ? "Spotify, Apple Music, YouTube Music y otras plataformas."
        : "No permite distribuir la canción en plataformas digitales.",
    },
    {
      label: "Monetización",
      included: license.monetization_allowed,
      detail: license.monetization_allowed
        ? "Puedes generar ingresos con tu lanzamiento."
        : "El contenido no puede generar ingresos.",
    },
    {
      label: "Video musical",
      included: license.music_video_allowed,
    },
    {
      label: "Difusión en radio",
      included: license.radio_allowed,
    },
    {
      label: "Presentaciones pagadas",
      included: license.paid_performances_allowed,
    },
    {
      label: "Archivos del proyecto",
      included: license.project_files_included,
      detail: license.project_files_included
        ? "Incluye archivos adicionales disponibles para esta licencia."
        : undefined,
    },
    {
      label: "Stems o pistas separadas",
      included:
        audioFormats.stems ||
        license.project_files_included,
    },
    {
      label: "Derechos exclusivos",
      included: license.exclusive,
      detail: license.exclusive
        ? "El beat deja de ofrecerse a nuevos compradores."
        : "Otros artistas todavía pueden comprar una licencia.",
    },
  ];

  const cardClasses = isExclusive
    ? "border-amber-400/40 bg-gradient-to-b from-amber-400/[0.11] via-white/[0.035] to-white/[0.02] shadow-[0_25px_100px_rgba(245,158,11,0.13)] hover:border-amber-300/60"
    : featured || isPremium
      ? "border-blue-500/55 bg-gradient-to-b from-blue-500/[0.12] via-white/[0.04] to-white/[0.02] shadow-[0_25px_100px_rgba(37,99,235,0.16)] hover:border-blue-400/75"
      : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.045]";

  return (
    <article
      className={[
        "group relative flex h-full flex-col overflow-hidden rounded-[2rem] border p-6 transition duration-500 hover:-translate-y-2 sm:p-8",
        cardClasses,
      ].join(" ")}
    >
      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-[90px] transition duration-500 group-hover:scale-125",
          isExclusive
            ? "bg-amber-400/20"
            : isPremium || featured
              ? "bg-blue-500/25"
              : "bg-white/[0.06]",
        ].join(" ")}
      />

      <div
        aria-hidden="true"
        className={[
          "pointer-events-none absolute inset-x-10 top-0 h-px",
          isExclusive
            ? "bg-gradient-to-r from-transparent via-amber-300/70 to-transparent"
            : isPremium || featured
              ? "bg-gradient-to-r from-transparent via-blue-300/70 to-transparent"
              : "bg-gradient-to-r from-transparent via-white/20 to-transparent",
        ].join(" ")}
      />

      <div className="relative z-10 flex min-h-8 items-start justify-between gap-4">
        <div
          className={[
            "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em]",
            isExclusive
              ? "border-amber-400/30 bg-amber-400/10 text-amber-300"
              : isPremium || featured
                ? "border-blue-400/30 bg-blue-500/10 text-blue-300"
                : "border-white/10 bg-white/[0.04] text-white/50",
          ].join(" ")}
        >
          {isExclusive ? (
            <Crown className="h-3.5 w-3.5" />
          ) : isPremium || featured ? (
            <Sparkles className="h-3.5 w-3.5" />
          ) : (
            <FileAudio className="h-3.5 w-3.5" />
          )}

          {isExclusive
            ? "Exclusiva"
            : isPremium || featured
              ? "Más popular"
              : "Licencia"}
        </div>
      </div>

      <div className="relative z-10 mt-7">
        <h2 className="text-3xl font-black tracking-[-0.04em] text-white">
          {license.name}
        </h2>

        <p className="mt-4 min-h-[72px] text-sm leading-7 text-white/55">
          {license.description ||
            (isExclusive
              ? "La opción más completa para obtener los derechos exclusivos del beat."
              : isPremium
                ? "Pensada para artistas que desean publicar y monetizar su música profesionalmente."
                : "Ideal para proyectos personales y lanzamientos sin explotación comercial.")}
        </p>
      </div>

      <div className="relative z-10 mt-7">
        <div className="flex flex-wrap items-end gap-x-3 gap-y-1">
          <span
            className={[
              "text-4xl font-black tracking-[-0.05em] sm:text-5xl",
              isExclusive
                ? "text-amber-300"
                : isPremium || featured
                  ? "text-blue-300"
                  : "text-white",
            ].join(" ")}
          >
            {formatPrice(license.price, currency)}
          </span>

          <span className="pb-1 text-sm text-white/35">
            pago único
          </span>
        </div>
      </div>

      <div className="relative z-10 my-7 h-px bg-white/10" />

      <div className="relative z-10 mb-3 flex items-center gap-2">
        <Mic2
          className={[
            "h-4 w-4",
            isExclusive
              ? "text-amber-300"
              : "text-blue-300",
          ].join(" ")}
        />

        <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/45">
          Incluye
        </p>
      </div>

      <ul className="relative z-10 flex flex-1 flex-col gap-1">
        {features.map((feature) => (
          <FeatureItem
            key={feature.label}
            feature={feature}
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
                Después de completar la compra, el beat se
                retirará del catálogo para evitar nuevas ventas.
              </p>
            </div>
          </div>
        </div>
      )}

      <Link
        href="/#beats"
        className={[
          "relative z-10 mt-8 inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl px-5 text-sm font-bold transition duration-300 hover:-translate-y-0.5",
          isExclusive
            ? "bg-amber-400 text-black shadow-[0_14px_45px_rgba(245,158,11,0.22)] hover:bg-amber-300"
            : isPremium || featured
              ? "bg-blue-600 text-white shadow-[0_14px_45px_rgba(37,99,235,0.25)] hover:bg-blue-500"
              : "border border-white/15 bg-white/[0.05] text-white hover:border-white/25 hover:bg-white/[0.09]",
        ].join(" ")}
      >
        <ShoppingCart className="h-4 w-4" />
        Elegir un beat
      </Link>

      <div className="relative z-10 mt-4 flex items-center justify-center gap-2 text-xs text-white/30">
        {isExclusive ? (
          <Crown className="h-3.5 w-3.5" />
        ) : license.radio_allowed ? (
          <Radio className="h-3.5 w-3.5" />
        ) : license.music_video_allowed ? (
          <Video className="h-3.5 w-3.5" />
        ) : license.project_files_included ? (
          <FileArchive className="h-3.5 w-3.5" />
        ) : (
          <FileAudio className="h-3.5 w-3.5" />
        )}

        Documento de licencia incluido
      </div>
    </article>
  );
}