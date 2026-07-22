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
        preload="metadata"
        className="h-full w-full object-cover opacity-30"
      >
        <source src="/videos/hero-studio.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-slate-950/55" />

      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-slate-950/35" />

      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/40" />
    </div>
  );
}