import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Términos y condiciones",
  description:
    "Consulta los términos y condiciones de uso de Kevin The Beatmaker y KTB Studio.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen px-6 pb-24 pt-32">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
          Información legal
        </p>

        <h1 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
          Términos y condiciones
        </h1>

        <div className="mt-10 space-y-8 leading-8 text-white/65">
          <section>
            <h2 className="text-xl font-semibold text-white">
              Aceptación de los términos
            </h2>

            <p className="mt-3">
              Al utilizar este sitio web o adquirir cualquiera de los productos
              y servicios disponibles, aceptas los presentes términos y
              condiciones.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Productos digitales
            </h2>

            <p className="mt-3">
              Los beats, licencias, archivos de audio y demás productos
              digitales se entregan de acuerdo con las condiciones indicadas al
              momento de la compra.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Licencias de uso
            </h2>

            <p className="mt-3">
              La compra de un beat no implica automáticamente la transferencia
              total de sus derechos. El uso permitido dependerá del tipo de
              licencia adquirida: básica, premium o exclusiva.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Pagos
            </h2>

            <p className="mt-3">
              Todos los pagos deben completarse mediante los métodos
              disponibles en el sitio. El acceso al producto digital se
              habilitará una vez que el pago haya sido confirmado.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Reembolsos
            </h2>

            <p className="mt-3">
              Debido a la naturaleza digital de los productos, las compras
              generalmente no son reembolsables una vez que los archivos hayan
              sido entregados o descargados, salvo que exista un error técnico
              comprobable atribuible al sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Uso prohibido
            </h2>

            <p className="mt-3">
              No está permitido revender, redistribuir, compartir o reclamar
              como propio un beat o archivo adquirido fuera de los permisos
              establecidos en la licencia correspondiente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Modificaciones
            </h2>

            <p className="mt-3">
              KTB Studio puede actualizar estos términos cuando sea necesario.
              La versión vigente será la publicada en este sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Contacto
            </h2>

            <p className="mt-3">
              Para consultas relacionadas con estos términos, licencias o
              compras, puedes utilizar los canales de contacto disponibles en
              el sitio.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}