export default function HeroVideo() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <video
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="h-full w-full object-cover opacity-65"
      >
        <source
          src="/videos/hero-studio.mp4"
          type="video/mp4"
        />
      </video>

      {/* Capa oscura principal */}
      <div className="absolute inset-0 bg-slate-950/30" />

      {/* Degradado lateral para mejorar la lectura del texto */}
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950/70 via-slate-950/20 to-transparent" />

      {/* Degradado superior e inferior */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-slate-950/20" />
    </div>
  );
}