import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Disc3,
  Gauge,
  Music2,
  ShoppingCart,
} from "lucide-react";

import BeatDetailPlayer from "../../../components/beats/BeatDetailPlayer";
import BeatLicenses from "../../../components/beats/BeatLicenses";
import RelatedBeats, {
  type RelatedBeat,
} from "../../../components/beats/RelatedBeats";
import Footer from "../../../components/layout/Footer";
import Navbar from "../../../components/layout/Navbar";
import { getBeatVisualStyle } from "../../../lib/supabase/beatColors";
import { createClient } from "../../../lib/supabase/server";

type BeatPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type BeatLicense = {
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
  position: number;
};

type LicenseCode =
  | "basic"
  | "premium"
  | "exclusive";

type LicenseTemplate = {
  code: LicenseCode;
  name: string;
  description: string | null;
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
  sort_order: number;
};

type PublicBeat = {
  id: string;
  title: string;
  slug: string | null;
  genre: string;
  bpm: number | string | null;
  musical_key: string | null;
  price: number | string | null;
  plays: number | null;
  cover_url: string | null;
  audio_url: string | null;
  created_at: string | null;
  beat_licenses: BeatLicense[] | null;
};

const beatSelection = `
  id,
  title,
  slug,
  genre,
  bpm,
  musical_key,
  price,
  plays,
  cover_url,
  audio_url,
  created_at,
  beat_licenses (
    id,
    name,
    description,
    price,
    audio_format,
    distribution_limit,
    streams_limit,
    digital_distribution_allowed,
    monetization_allowed,
    project_files_included,
    music_video_allowed,
    radio_allowed,
    paid_performances_allowed,
    exclusive,
    position
  )
`;

const relatedBeatSelection = `
  id,
  title,
  slug,
  genre,
  bpm,
  musical_key,
  price,
  cover_url
`;

function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}

function createSlug(value: unknown): string {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "";
  }

  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function isValidBeat(
  value: unknown,
): value is PublicBeat {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const beat = value as Partial<PublicBeat>;

  return (
    isUuid(beat.id) &&
    typeof beat.title === "string" &&
    beat.title.trim().length > 0 &&
    typeof beat.genre === "string" &&
    beat.genre.trim().length > 0
  );
}

function normalizeBeatResult(
  data: unknown,
): PublicBeat | null {
  const candidate = Array.isArray(data)
    ? data[0]
    : data;

  if (!isValidBeat(candidate)) {
    if (candidate) {
      console.error(
        "Supabase devolvió un beat incompleto:",
        candidate,
      );
    }

    return null;
  }

  return {
    id: candidate.id,
    title: candidate.title,

    slug:
      typeof candidate.slug === "string"
        ? candidate.slug
        : null,

    genre: candidate.genre,
    bpm: candidate.bpm ?? null,

    musical_key:
      typeof candidate.musical_key === "string"
        ? candidate.musical_key
        : null,

    price: candidate.price ?? null,
    plays: Number(candidate.plays) || 0,

    cover_url:
      typeof candidate.cover_url === "string"
        ? candidate.cover_url
        : null,

    audio_url:
      typeof candidate.audio_url === "string"
        ? candidate.audio_url
        : null,

    created_at:
      typeof candidate.created_at === "string"
        ? candidate.created_at
        : null,

    beat_licenses: Array.isArray(
      candidate.beat_licenses,
    )
      ? candidate.beat_licenses
      : [],
  };
}

function getLicenseCode(
  name: string,
  exclusive: boolean,
): LicenseCode {
  const normalizedName = name
    .trim()
    .toLowerCase();

  if (
    exclusive ||
    normalizedName.includes("exclus")
  ) {
    return "exclusive";
  }

  if (normalizedName.includes("premium")) {
    return "premium";
  }

  return "basic";
}

async function getLicenseTemplates(): Promise<
  LicenseTemplate[]
> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("license_templates")
    .select(
      `
        code,
        name,
        description,
        audio_format,
        distribution_limit,
        streams_limit,
        digital_distribution_allowed,
        monetization_allowed,
        project_files_included,
        music_video_allowed,
        radio_allowed,
        paid_performances_allowed,
        exclusive,
        sort_order
      `,
    )
    .eq("active", true)
    .order("sort_order", {
      ascending: true,
    });

  if (error) {
    console.error(
      "No se pudieron cargar las plantillas de licencias:",
      error.message,
    );

    return [];
  }

  return (data ?? []) as LicenseTemplate[];
}

async function getBeat(
  identifier: string,
): Promise<PublicBeat | null> {
  const supabase = await createClient();

  console.log("Buscando beat:", identifier);

  if (isUuid(identifier)) {
    const {
      data: beatById,
      error: idError,
    } = await supabase
      .from("beats")
      .select(beatSelection)
      .eq("id", identifier)
      .eq("status", "published")
      .maybeSingle();

    if (idError) {
      console.error(
        "No se pudo cargar el beat por ID:",
        idError.message,
      );
    }

    const normalizedBeat =
      normalizeBeatResult(beatById);

    if (normalizedBeat) {
      return normalizedBeat;
    }
  }

  const {
    data: beatBySlug,
    error: slugError,
  } = await supabase
    .from("beats")
    .select(beatSelection)
    .eq("slug", identifier)
    .eq("status", "published")
    .maybeSingle();

  if (slugError) {
    console.error(
      "No se pudo cargar el beat por slug:",
      slugError.message,
    );
  }

  const normalizedSlugBeat =
    normalizeBeatResult(beatBySlug);

  if (normalizedSlugBeat) {
    return normalizedSlugBeat;
  }

  /*
   * Respaldo para beats antiguos que todavía
   * no tienen slug guardado.
   */
  const {
    data: publishedBeats,
    error: fallbackError,
  } = await supabase
    .from("beats")
    .select(beatSelection)
    .eq("status", "published");

  if (fallbackError) {
    console.error(
      "No se pudo buscar el beat por título:",
      fallbackError.message,
    );

    return null;
  }

  const normalizedBeats = (
    (publishedBeats ?? []) as unknown[]
  )
    .map(normalizeBeatResult)
    .filter(
      (beat): beat is PublicBeat =>
        beat !== null,
    );

  return (
    normalizedBeats.find(
      (beat) =>
        createSlug(beat.title) === identifier,
    ) ?? null
  );
}

async function getRelatedBeats(
  currentBeat: PublicBeat,
): Promise<RelatedBeat[]> {
  if (
    !isUuid(currentBeat.id) ||
    typeof currentBeat.genre !== "string" ||
    !currentBeat.genre.trim()
  ) {
    console.error(
      "No se pueden cargar beats relacionados porque el beat es inválido:",
      currentBeat,
    );

    return [];
  }

  const supabase = await createClient();

  const {
    data: sameGenreData,
    error: sameGenreError,
  } = await supabase
    .from("beats")
    .select(relatedBeatSelection)
    .eq("status", "published")
    .eq("genre", currentBeat.genre)
    .neq("id", currentBeat.id)
    .order("created_at", {
      ascending: false,
    })
    .limit(3);

  if (sameGenreError) {
    console.error(
      "No se pudieron cargar los beats del mismo género:",
      sameGenreError.message,
    );
  }

  const sameGenreBeats =
    (sameGenreData as RelatedBeat[] | null) ?? [];

  if (sameGenreBeats.length >= 3) {
    return sameGenreBeats.slice(0, 3);
  }

  const excludedIds = [
    currentBeat.id,
    ...sameGenreBeats
      .map((beat) => beat.id)
      .filter(isUuid),
  ];

  const remainingAmount =
    3 - sameGenreBeats.length;

  const {
    data: additionalData,
    error: additionalError,
  } = await supabase
    .from("beats")
    .select(relatedBeatSelection)
    .eq("status", "published")
    .not(
      "id",
      "in",
      `(${excludedIds.join(",")})`,
    )
    .order("created_at", {
      ascending: false,
    })
    .limit(remainingAmount);

  if (additionalError) {
    console.error(
      "No se pudieron cargar beats adicionales:",
      additionalError.message,
    );

    return sameGenreBeats;
  }

  const additionalBeats =
    (additionalData as RelatedBeat[] | null) ?? [];

  return [
    ...sameGenreBeats,
    ...additionalBeats,
  ].slice(0, 3);
}

export async function generateMetadata({
  params,
}: BeatPageProps): Promise<Metadata> {
  const { slug } = await params;
  const beat = await getBeat(slug);

  if (!beat) {
    return {
      title: "Beat no encontrado",
      description:
        "El beat solicitado no está disponible.",
    };
  }

  const bpm = Number(beat.bpm) || 0;

  const description = `${beat.title}, beat de ${
    beat.genre
  } producido por Kevin The Beatmaker. ${
    bpm > 0
      ? `${bpm} BPM`
      : "BPM no especificado"
  } y tonalidad ${
    beat.musical_key || "no especificada"
  }.`;

  return {
    title: `${beat.title} | Kevin The Beatmaker`,
    description,

    openGraph: {
      title: `${beat.title} | Kevin The Beatmaker`,
      description,
      type: "music.song",

      images: beat.cover_url
        ? [
            {
              url: beat.cover_url,
              alt: `Portada de ${beat.title}`,
            },
          ]
        : [],
    },
  };
}

export default async function BeatPage({
  params,
}: BeatPageProps) {
  const { slug } = await params;
  const beat = await getBeat(slug);

  if (!beat) {
    notFound();
  }

  /*
   * Cargamos simultáneamente los beats
   * relacionados y las plantillas oficiales.
   */
  const [relatedBeats, licenseTemplates] =
    await Promise.all([
      getRelatedBeats(beat),
      getLicenseTemplates(),
    ]);

  const visualStyle = getBeatVisualStyle(
    beat.genre,
  );

  const price = Number(beat.price) || 0;
  const bpm = Number(beat.bpm) || 0;
  const plays = Number(beat.plays) || 0;

  /*
   * Creamos un mapa para encontrar rápidamente
   * la plantilla Básica, Premium o Exclusiva.
   */
  const templatesByCode = new Map<
    LicenseCode,
    LicenseTemplate
  >(
    licenseTemplates.map((template) => [
      template.code,
      template,
    ]),
  );

  /*
   * Conservamos el ID y precio específico de
   * beat_licenses para no romper el carrito.
   *
   * Los permisos, formatos y descripciones
   * se toman de license_templates.
   */
  const licenses = [
    ...(beat.beat_licenses ?? []),
  ]
    .map((license): BeatLicense => {
      const code = getLicenseCode(
        license.name,
        license.exclusive,
      );

      const template =
        templatesByCode.get(code);

      if (!template) {
        return license;
      }

      return {
        ...license,

        id: license.id,
        price: license.price,

        name: template.name,
        description: template.description,
        audio_format: template.audio_format,

        distribution_limit:
          template.distribution_limit,

        streams_limit:
          template.streams_limit,

        digital_distribution_allowed:
          template.digital_distribution_allowed,

        monetization_allowed:
          template.monetization_allowed,

        project_files_included:
          template.project_files_included,

        music_video_allowed:
          template.music_video_allowed,

        radio_allowed:
          template.radio_allowed,

        paid_performances_allowed:
          template.paid_performances_allowed,

        exclusive: template.exclusive,
        position: template.sort_order,
      };
    })
    .sort(
      (firstLicense, secondLicense) =>
        firstLicense.position -
        secondLicense.position,
    );

  return (
    <main className="min-h-screen overflow-hidden bg-[#030712]">
      <Navbar />

      <section className="relative pb-24 pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-40 h-[560px] w-[560px] -translate-x-1/2 rounded-full opacity-20 blur-[180px]"
          style={{
            backgroundColor: visualStyle.color,
          }}
        />

        <div className="container-custom relative z-10">
          <Link
            href="/#catalogo"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-slate-300 backdrop-blur-xl transition hover:border-white/20 hover:bg-white/[0.08] hover:text-white"
          >
            <ArrowLeft size={18} />

            Volver al catálogo
          </Link>

          <div className="mt-10 grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <div
                className="relative aspect-square overflow-hidden rounded-[2.5rem] border border-white/10 bg-[#07101f] bg-cover bg-center shadow-[0_35px_110px_rgba(0,0,0,.65)]"
                style={{
                  backgroundImage: beat.cover_url
                    ? `
                      linear-gradient(
                        to top,
                        rgba(3, 7, 18, 0.96),
                        rgba(3, 7, 18, 0.05)
                      ),
                      url("${beat.cover_url}")
                    `
                    : `
                      radial-gradient(
                        circle at 75% 15%,
                        ${visualStyle.color}55,
                        transparent 45%
                      )
                    `,
                }}
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: `radial-gradient(
                      circle at 75% 15%,
                      ${visualStyle.color},
                      transparent 45%
                    )`,
                  }}
                />

                <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10">
                  <p
                    className="text-xs font-bold uppercase tracking-[0.3em]"
                    style={{
                      color: visualStyle.color,
                    }}
                  >
                    Kevin The Beatmaker
                  </p>

                  <h1 className="mt-4 text-4xl font-black tracking-[-0.04em] sm:text-5xl">
                    {beat.title}
                  </h1>

                  <p className="mt-3 text-lg font-semibold text-slate-300">
                    Beat de {beat.genre}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:pt-5">
              <p
                className="text-sm font-bold uppercase tracking-[0.3em]"
                style={{
                  color: visualStyle.color,
                }}
              >
                Catálogo oficial
              </p>

              <h2 className="mt-5 text-5xl font-black tracking-[-0.05em] sm:text-6xl lg:text-7xl">
                {beat.title}
              </h2>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
                Beat de {beat.genre} producido por
                Kevin The Beatmaker, preparado para
                artistas que buscan identidad,
                potencia y calidad profesional.
              </p>

              <div className="mt-9 grid grid-cols-2 gap-4 sm:grid-cols-4">
                <InfoCard
                  icon={<Disc3 size={20} />}
                  label="Género"
                  value={beat.genre}
                  color={visualStyle.color}
                />

                <InfoCard
                  icon={<Gauge size={20} />}
                  label="BPM"
                  value={
                    bpm > 0
                      ? String(bpm)
                      : "N/A"
                  }
                  color={visualStyle.color}
                />

                <InfoCard
                  icon={<Music2 size={20} />}
                  label="Tonalidad"
                  value={
                    beat.musical_key || "N/A"
                  }
                  color={visualStyle.color}
                />

                <InfoCard
                  icon={<ShoppingCart size={20} />}
                  label="Precio base"
                  value={`$${price.toFixed(2)}`}
                  color={visualStyle.color}
                />
              </div>

              <div className="mt-8">
                <BeatDetailPlayer
                  beatId={beat.id}
                  title={beat.title}
                  audioUrl={beat.audio_url || ""}
                  color={visualStyle.color}
                  price={price}
                  initialPlays={plays}
                />
              </div>

              <div className="mt-6 flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                  {new Intl.NumberFormat(
                    "es-EC",
                  ).format(plays)}{" "}
                  reproducciones
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                  Audio de demostración
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2">
                  Licencia digital
                </span>
              </div>
            </div>
          </div>

          <BeatLicenses
            beatId={beat.id}
            beatTitle={beat.title}
            beatCoverUrl={beat.cover_url}
            licenses={licenses}
            color={visualStyle.color}
          />

          <RelatedBeats beats={relatedBeats} />
        </div>
      </section>

      <Footer />
    </main>
  );
}

type InfoCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  color: string;
};

function InfoCard({
  icon,
  label,
  value,
  color,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4 backdrop-blur-xl">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl"
        style={{
          color,
          backgroundColor: `${color}18`,
        }}
      >
        {icon}
      </div>

      <p className="mt-4 text-xs uppercase tracking-[0.18em] text-slate-600">
        {label}
      </p>

      <p className="mt-1 truncate font-black text-white">
        {value}
      </p>
    </div>
  );
}