import Link from "next/link";
import {
  ArrowUpRight,
  Gauge,
  Music2,
} from "lucide-react";
    
import { getBeatVisualStyle } from "../../lib/supabase/beatColors";

export type RelatedBeat = {
  id: string;
  title: string;
  slug: string | null;
  genre: string;
  bpm: number | string | null;
  musical_key: string | null;
  price: number | string | null;
  cover_url: string | null;
};

type RelatedBeatsProps = {
  beats: RelatedBeat[];
};

function formatPrice(value: number | string | null) {
  const price = Number(value) || 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

export default function RelatedBeats({
  beats,
}: RelatedBeatsProps) {
  if (beats.length === 0) {
    return null;
  }

  return (
    <section className="mt-24">
      <div className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-black uppercase tracking-[0.28em] text-blue-400">
            Sigue explorando
          </p>

          <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white sm:text-4xl">
            Beats relacionados
          </h2>

          <p className="mt-3 max-w-2xl leading-7 text-slate-400">
            Descubre otros beats con un estilo similar que
            también podrían encajar con tu próximo proyecto.
          </p>
        </div>

        <Link
          href="/#catalogo"
          className="inline-flex w-fit items-center gap-2 text-sm font-bold text-slate-400 transition hover:text-white"
        >
          Ver catálogo completo
          <ArrowUpRight size={17} />
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {beats.map((beat) => {
          const visualStyle = getBeatVisualStyle(
            beat.genre,
          );

          const destination = `/beats/${
            beat.slug || beat.id
          }`;

          const bpm = Number(beat.bpm) || 0;

          return (
            <article
              key={beat.id}
              className="group overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20"
            >
              <Link
                href={destination}
                className="block"
              >
                <div
                  className="relative aspect-square overflow-hidden bg-[#07101f] bg-cover bg-center"
                  style={{
                    backgroundImage: beat.cover_url
                      ? `
                        linear-gradient(
                          to top,
                          rgba(3, 7, 18, 0.88),
                          rgba(3, 7, 18, 0.02) 60%
                        ),
                        url("${beat.cover_url}")
                      `
                      : `
                        radial-gradient(
                          circle at 70% 20%,
                          ${visualStyle.color}66,
                          transparent 50%
                        )
                      `,
                  }}
                >
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-25"
                    style={{
                      background: `radial-gradient(
                        circle at 65% 25%,
                        ${visualStyle.color},
                        transparent 48%
                      )`,
                    }}
                  />

                  <div className="absolute left-5 top-5">
                    <span
                      className="rounded-full border px-3 py-1.5 text-xs font-black uppercase tracking-[0.18em] backdrop-blur-xl"
                      style={{
                        color: visualStyle.color,
                        borderColor: `${visualStyle.color}55`,
                        backgroundColor: `${visualStyle.color}18`,
                      }}
                    >
                      {beat.genre}
                    </span>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-6">
                    <h3 className="text-2xl font-black tracking-[-0.03em] text-white">
                      {beat.title}
                    </h3>

                    <p className="mt-2 text-sm font-semibold text-slate-300">
                      Kevin The Beatmaker
                    </p>
                  </div>
                </div>
              </Link>

              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-slate-400">
                    <Gauge size={14} />
                    {bpm > 0 ? `${bpm} BPM` : "BPM N/A"}
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-slate-400">
                    <Music2 size={14} />
                    {beat.musical_key || "Tonalidad N/A"}
                  </span>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-600">
                      Desde
                    </p>

                    <p className="mt-1 text-xl font-black text-white">
                      {formatPrice(beat.price)}
                    </p>
                  </div>

                  <Link
                    href={destination}
                    aria-label={`Ver ${beat.title}`}
                    className="grid h-12 w-12 place-items-center rounded-full bg-blue-600 text-white transition hover:bg-blue-500 active:scale-95"
                  >
                    <ArrowUpRight size={19} />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}