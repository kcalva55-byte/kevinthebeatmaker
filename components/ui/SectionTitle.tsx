interface Props {
  subtitle: string;
  title: string;
}

export default function SectionTitle({
  subtitle,
  title,
}: Props) {
  return (
    <div className="mb-14 text-center">
      <p className="mb-3 text-sm font-semibold tracking-[6px] uppercase text-blue-400">
        {subtitle}
      </p>

      <h2 className="text-4xl font-black md:text-5xl">
        {title}
      </h2>
    </div>
  );
}