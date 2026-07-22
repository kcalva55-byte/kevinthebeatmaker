import Reveal from "../animations/Reveal";
import BeatPlayer from "../player/BeatPlayer";
import SectionTitle from "../ui/SectionTitle";

export default function FeaturedBeats() {
  return (
    <section
      id="beats"
      className="relative overflow-hidden border-t border-white/5 py-28"
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none absolute left-1/2 top-1/2
          h-96 w-96 -translate-x-1/2 -translate-y-1/2
          rounded-full bg-blue-600/10 blur-[150px]
        "
      />

      <div className="container-custom relative z-10">
        <Reveal>
          <SectionTitle
            subtitle="Beats destacados"
            title="Escucha mi sonido"
          />
        </Reveal>

        <Reveal delay={0.15}>
          <BeatPlayer />
        </Reveal>
      </div>
    </section>
  );
}