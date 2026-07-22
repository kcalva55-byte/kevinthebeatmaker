"use client";

import { useCart } from "../cart/CartProvider";

type License = {
  id: string;
  name: string;
  description: string | null;
  price: number | string;
  audio_format: string;
  distribution_limit: number | null;
  streams_limit: number | null;
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

function formatNumber(value: number | null) {
  if (value === null) {
    return "Ilimitado";
  }

  return new Intl.NumberFormat("es-EC").format(value);
}

export default function BeatLicenses({
  beatId,
  beatTitle,
  beatCoverUrl,
  licenses,
  color,
}: BeatLicensesProps) {
  const {
    addItem,
    containsLicense,
  } = useCart();

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
    <section className="mt-16">
      <div className="mb-8">
        <p
          className="text-sm font-bold uppercase tracking-[0.28em]"
          style={{ color }}
        >
          Elige tu licencia
        </p>

        <h2 className="mt-3 text-3xl font-black tracking-[-0.03em] text-white sm:text-4xl">
          Licencias disponibles
        </h2>

        <p className="mt-3 max-w-2xl text-slate-400">
          Selecciona la licencia que mejor se adapte a tu
          lanzamiento y a tus necesidades comerciales.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {licenses.map((license) => {
          const price =
            Number(license.price) || 0;

          const isInCart =
            containsLicense(license.id);

          return (
            <article
              key={license.id}
              className="relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-white/20 sm:p-7"
            >
              <div
                aria-hidden="true"
                className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-20 blur-3xl"
                style={{
                  backgroundColor: color,
                }}
              />

              {license.exclusive && (
                <span
                  className="relative z-10 mb-5 w-fit rounded-full px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-white"
                  style={{
                    backgroundColor: color,
                  }}
                >
                  Exclusiva
                </span>
              )}

              <div className="relative z-10">
                <h3 className="text-2xl font-black text-white">
                  {license.name}
                </h3>

                <p className="mt-3 min-h-12 text-sm leading-6 text-slate-400">
                  {license.description ||
                    "Licencia comercial para utilizar este beat."}
                </p>

                <div className="mt-7">
                  <span
                    className="text-4xl font-black tracking-[-0.04em]"
                    style={{ color }}
                  >
                    ${price.toFixed(2)}
                  </span>

                  <span className="ml-2 text-sm text-slate-500">
                    USD
                  </span>
                </div>
              </div>

              <ul className="relative z-10 mt-7 flex-1 space-y-3 border-t border-white/10 pt-6 text-sm text-slate-300">
                <li className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Formato
                  </span>

                  <strong className="text-right text-white">
                    {license.audio_format}
                  </strong>
                </li>

                <li className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Distribución
                  </span>

                  <strong className="text-right text-white">
                    {formatNumber(
                      license.distribution_limit,
                    )}
                  </strong>
                </li>

                <li className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Reproducciones
                  </span>

                  <strong className="text-right text-white">
                    {formatNumber(
                      license.streams_limit,
                    )}
                  </strong>
                </li>

                <li className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Videoclip
                  </span>

                  <strong className="text-right text-white">
                    {license.music_video_allowed
                      ? "Permitido"
                      : "No incluido"}
                  </strong>
                </li>

                <li className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Radio
                  </span>

                  <strong className="text-right text-white">
                    {license.radio_allowed
                      ? "Permitido"
                      : "No incluido"}
                  </strong>
                </li>

                <li className="flex justify-between gap-4">
                  <span className="text-slate-500">
                    Shows pagados
                  </span>

                  <strong className="text-right text-white">
                    {license.paid_performances_allowed
                      ? "Permitidos"
                      : "No incluidos"}
                  </strong>
                </li>
              </ul>

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
                className="relative z-10 mt-8 w-full rounded-full px-6 py-3.5 font-black text-white transition hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
                style={{
                  backgroundColor: color,
                  boxShadow: `0 14px 38px ${color}35`,
                }}
              >
                {isInCart
                  ? "Ya está en el carrito"
                  : "Comprar licencia"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}