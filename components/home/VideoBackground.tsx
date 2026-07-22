export default function VideoBackground() {
  return (
    <video
      autoPlay
      muted
      loop
      playsInline
      className="absolute inset-0 h-full w-full object-cover opacity-20"
    >
      <source src="/videos/hero.mp4" type="video/mp4" />
    </video>
  );
}