interface Props {
  subtitle: string;
  title: string;
}

export default function SectionTitle({
  subtitle,
  title,
}: Props) {
  return (
    <div className="text-center mb-20">

      <p className="uppercase tracking-[8px] text-blue-400 mb-4">

        {subtitle}

      </p>

      <h2 className="text-5xl font-black">

        {title}

      </h2>

    </div>
  );
}