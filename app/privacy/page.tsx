import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidad",
  description:
    "Consulta la política de privacidad de Kevin The Beatmaker y KTB Studio.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen px-6 pb-24 pt-32">
      <section className="mx-auto max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-blue-400">
          Información legal
        </p>

        <h1 className="mt-5 text-4xl font-bold text-white sm:text-5xl">
          Política de privacidad
        </h1>

        <div className="mt-10 space-y-8 leading-8 text-white/65">
          <section>
            <h2 className="text-xl font-semibold text-white">
              Información que recopilamos
            </h2>

            <p className="mt-3">
              Podemos recopilar los datos que proporciones voluntariamente al
              realizar una compra, completar un formulario o comunicarte con
              nosotros, como tu nombre, correo electrónico y datos relacionados
              con tu pedido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Uso de la información
            </h2>

            <p className="mt-3">
              La información se utiliza para procesar pedidos, entregar
              productos digitales, responder consultas y mejorar la experiencia
              dentro del sitio web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Pagos y servicios externos
            </h2>

            <p className="mt-3">
              Los pagos pueden ser procesados mediante plataformas externas.
              KTB Studio no almacena directamente la información completa de
              tarjetas bancarias utilizada durante una transacción.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Protección de los datos
            </h2>

            <p className="mt-3">
              Aplicamos medidas razonables para proteger la información
              personal frente a accesos no autorizados, pérdida o uso
              indebido.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white">
              Contacto
            </h2>

            <p className="mt-3">
              Para realizar consultas sobre esta política o solicitar la
              actualización o eliminación de tus datos, puedes comunicarte por
              medio de los canales de contacto disponibles en este sitio web.
            </p>
          </section>
        </div>
      </section>
    </main>
  );
}