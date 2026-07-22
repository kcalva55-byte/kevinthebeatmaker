import Link from "next/link";
import {
  Check,
  Crown,
  Disc3,
  FileAudio,
  Music2,
  Radio,
  Video,
} from "lucide-react";

export interface PublicLicense {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  audio_format: string | null;
  distribution_limit: number | null;
  streams_limit: number | null;
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

function formatNumber(value: number | null) {
  if (value === null) {
    return "Ilimitado";
  }

  return new Intl.NumberFormat("es-EC").format(value);
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
    maximumFractionDigits: 2,
  }).format(numericPrice);
}

export default function LicenseCard({
  license,
  featured = false,
  currency = "USD",
}: LicenseCardProps) {
  const features = [
    {
      icon: FileAudio,
      label: `Formato: ${license.audio_format || "No especificado"}`,
    },
    {
      icon: Disc3,
      label: `${formatNumber(
        license.distribution_limit,
      )} copias distribuidas`,
    },
    {
      icon: Music2,
      label: `${formatNumber(
        license.streams_limit,
      )} reproducciones`,
    },
    {
      icon: Video,
      label: license.music_video_allowed
        ? "Video musical permitido"
        : "Video musical no incluido",
    },
    {
      icon: Radio,
      label: license.radio_allowed
        ? "Uso en radio permitido"
        : "Uso en radio no incluido",
    },
    {
      icon: Crown,
      label: license.paid_performances_allowed
        ? "Presentaciones pagadas permitidas"
        : "Presentaciones pagadas no incluidas",
    },
  ];

  return (
    <article
      className={[
        "relative flex h-full flex-col overflow-hidden rounded-3xl border p-6 transition duration-300 sm:p-8",
        featured
          ? "border-blue-500/60 bg-blue-500/[0.08] shadow-[0_20px_80px_rgba(37,99,235,0.18)]"
          : "border-white/10 bg-white/[0.035] hover:border-white/20",
      ].join(" ")}
    >
      {featured && !license.exclusive && (
        <div className="absolute right-5 top-5 rounded-full border border-blue-400/30 bg-blue-500/15 px-3 py-1 text-xs font-semibold text-blue-300">
          Más popular
        </div>
      )}

      {license.exclusive && (
        <div className="absolute right-5 top-5 flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
          <Crown className="h-3.5 w-3.5" />
          Exclusiva
        </div>
      )}

      <div className="pr-24">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-300">
          Licencia
        </p>

        <h2 className="mt-3 text-2xl font-bold text-white">
          {license.name}
        </h2>
      </div>

      <p className="mt-4 min-h-12 text-sm leading-6 text-white/60">
        {license.description ||
          "Una licencia diseñada para publicar y monetizar tu proyecto musical."}
      </p>

      <div className="mt-7">
        <span className="text-4xl font-bold tracking-tight text-white">
          {formatPrice(license.price, currency)}
        </span>

        <span className="ml-2 text-sm text-white/45">
          pago único
        </span>
      </div>

      <div className="my-7 h-px bg-white/10" />

      <ul className="flex flex-1 flex-col gap-4">
        {features.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="flex items-start gap-3 text-sm leading-6 text-white/70"
          >
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-300">
              <Check className="h-3.5 w-3.5" />
            </span>

            <span className="flex items-start gap-2">
              <Icon className="mt-1 h-4 w-4 shrink-0 text-white/35" />
              {label}
            </span>
          </li>
        ))}

        {license.exclusive && (
          <li className="flex items-start gap-3 text-sm font-medium leading-6 text-amber-200">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-400/10">
              <Check className="h-3.5 w-3.5" />
            </span>

            El beat se retira del catálogo después de la compra
          </li>
        )}
      </ul>

      <Link
        href="/#beats"
        className={[
          "mt-8 inline-flex h-12 items-center justify-center rounded-xl px-5 text-sm font-semibold transition",
          featured || license.exclusive
            ? "bg-blue-600 text-white hover:bg-blue-500"
            : "border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08]",
        ].join(" ")}
      >
        Elegir un beat
      </Link>
    </article>
  );
}