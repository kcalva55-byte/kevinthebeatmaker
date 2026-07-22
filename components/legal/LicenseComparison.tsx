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
    />
  ) : (
    <Minus
      aria-label="No incluido"
      className="mx-auto h-5 w-5 text-white/25"
    />
  );
}

function formatLimit(value: number | null) {
  if (value === null) {
    return "Ilimitado";
  }

  return new Intl.NumberFormat("es-EC").format(value);
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
          Revisa rápidamente los formatos, límites y permisos
          incluidos antes de elegir tu licencia.
        </p>
      </div>

      <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full border-collapse">
            <thead>
              <tr className="border-b border-white/10">
                <th className="px-6 py-5 text-left text-sm font-medium text-white/50">
                  Característica
                </th>

                {licenses.map((license) => (
                  <th
                    key={license.id}
                    className="px-6 py-5 text-center text-sm font-semibold text-white"
                  >
                    {license.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.07]">
              <tr>
                <td className="px-6 py-5 text-sm text-white/60">
                  Formato de audio
                </td>

                {licenses.map((license) => (
                  <td
                    key={license.id}
                    className="px-6 py-5 text-center text-sm font-medium text-white/80"
                  >
                    {license.audio_format || "No especificado"}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-5 text-sm text-white/60">
                  Límite de distribución
                </td>

                {licenses.map((license) => (
                  <td
                    key={license.id}
                    className="px-6 py-5 text-center text-sm font-medium text-white/80"
                  >
                    {formatLimit(license.distribution_limit)}
                  </td>
                ))}
              </tr>

              <tr>
                <td className="px-6 py-5 text-sm text-white/60">
                  Límite de reproducciones
                </td>

                {licenses.map((license) => (
                  <td
                    key={license.id}
                    className="px-6 py-5 text-center text-sm font-medium text-white/80"
                  >
                    {formatLimit(license.streams_limit)}
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
                    <BooleanValue value={license.radio_allowed} />
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
                  Derechos exclusivos
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