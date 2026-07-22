import Button from "../ui/Button";

export default function CTA() {
  return (
    <section
  id="contacto"
  className="py-32 px-6"
>
      <div className="mx-auto max-w-5xl rounded-3xl border border-blue-500/20 bg-gradient-to-r from-blue-900/40 to-cyan-900/30 p-12 text-center">

        <h2 className="text-5xl font-black">
          ¿Listo para llevar tu música al siguiente nivel?
        </h2>

        <p className="mt-6 text-gray-300 text-lg">
          Trabajemos juntos para crear un sonido profesional que destaque en cualquier plataforma.
        </p>

        <div className="mt-10">
          <Button>Reservar una sesión</Button>
        </div>

      </div>
    </section>
  );
}