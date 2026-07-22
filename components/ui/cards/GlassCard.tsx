interface Props {
  children: React.ReactNode;
}

export default function GlassCard({
  children,
}: Props) {
  return (
    <div
      className="
      rounded-3xl
      border
      border-blue-500/20
      bg-white/5
      backdrop-blur-xl
      p-8
      transition
      hover:border-blue-500
      hover:-translate-y-2
      duration-300
      "
    >
      {children}
    </div>
  );
}