import { Check, Minus } from "lucide-react";
import type { PublicLicense } from "./LicenseCard";

interface LicenseComparisonProps {
  licenses: PublicLicense[];
}

function BooleanValue({ value }: { value: boolean }) {
  return value ? (
    <Check
      aria-label="Incluido"
      className="mx-auto h-5 w-5 text-emerald-400"
      strokeWidth={3}
    />
  ) : (
    <Minus
      aria-label="No incluido"
      className="mx-auto h-5 w-5 text-white/20"
    />
  );
}

function getAudioFormatValue(
  audioFormat: string | null,
  format: "mp3" | "wav",
) {
  const normalized = audioFormat?.toLowerCase() || "";

  if (format === "mp3") {
    return normalized.includes("mp3") || normalized.length === 0;
  }

  return normalized.includes("wav");
}

export default function LicenseComparison({
  licenses,
}: LicenseComparisonProps) {
  if (licenses.length === 0) {
    return null;
  }

  return (
    <section className="mt-24">
      <div className="mb-8 max-w-2xl">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-blue-300">
          Comparación
        </p>

        <h2 className="mt-3 text-3xl font-bold tracking-tight text-white">
          Compara todas las licencias
        </h2>

        <p className="mt-4 leading-7 text-white/55">
          Revisa los formatos, permisos comerciales y beneficios
          incluidos antes de elegir la licencia adecuada para tu
          lanzamiento.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02]">
                <th className="px-6 py-5 text-left text-sm font-medium text-white/50">
                  Característica
                </th>

                {licenses.map((license) => {
                  const isExclusive = license.exclusive;
                  const isPremium = license.name
                    .toLowerCase()
                    .includes("premium");

                  return (
                    <th
                      key={license.id}
                      className="px-6 py-5 text-center"
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-sm font-semibold text-white">
                          {license.name}
                        </span>

                        {isExclusive && (
                          <span className="rounded-full border border-amber-400/25 bg-amber-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-amber-300">
                            Exclusiva
                          </span>
                        )}

                        {!isExclusive && isPremium && (
                          <span className="rounded-full border border-blue-400/25 bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-blue-300">
                            Más popular
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.07]">
              <tr>
                <td className="px-6 py-5 text-sm text-white/60">
                  Archivo MP3
                </td>

                {licenses.map((license) => (
                  <td key={license.id} className="px-6 py-5">
                    <BooleanValue
                      value={getAudioFormatValue(
                        license.audio_format,
                        "mp3",
                      )}
                    />
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-5 text-sm text-white/60">
                  Archivo WAV
                </td>

                {licenses.map((license) => (
                  <td key={license.id} className="px-6 py-5">
                    <BooleanValue
                      value={getAudioFormatValue(
                        license.audio_format,
                        "wav",
                      )}
                    />
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-5 text-sm text-white/60">
                  Distribución digital
                </td>

                {licenses.map((license) => (
                  <td key={license.id} className="px-6 py-5">
                    <BooleanValue
                      value={
                        license.digital_distribution_allowed
                      }
                    />
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-5 text-sm text-white/60">
                  Monetización
                </td>

                {licenses.map((license) => (
                  <td key={license.id} className="px-6 py-5">
                    <BooleanValue
                      value={license.monetization_allowed}
                    />
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-5 text-sm text-white/60">
                  Video musical
                </td>

                {licenses.map((license) => (
                  <td key={license.id} className="px-6 py-5">
                    <BooleanValue
                      value={license.music_video_allowed}
                    />
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-5 text-sm text-white/60">
                  Difusión en radio
                </td>

                {licenses.map((license) => (
                  <td key={license.id} className="px-6 py-5">
                    <BooleanValue
                      value={license.radio_allowed}
                    />
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-5 text-sm text-white/60">
                  Presentaciones pagadas
                </td>

                {licenses.map((license) => (
                  <td key={license.id} className="px-6 py-5">
                    <BooleanValue
                      value={
                        license.paid_performances_allowed
                      }
                    />
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-5 text-sm text-white/60">
                  Archivos del proyecto
                </td>

                {licenses.map((license) => (
                  <td key={license.id} className="px-6 py-5">
                    <BooleanValue
                      value={license.project_files_included}
                    />
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-5 text-sm text-white/60">
                  Derechos exclusivos
                </td>

                {licenses.map((license) => (
                  <td key={license.id} className="px-6 py-5">
                    <BooleanValue value={license.exclusive} />
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-5 text-sm text-white/60">
                  Beat retirado del catálogo
                </td>

                {licenses.map((license) => (
                  <td key={license.id} className="px-6 py-5">
                    <BooleanValue value={license.exclusive} />
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}