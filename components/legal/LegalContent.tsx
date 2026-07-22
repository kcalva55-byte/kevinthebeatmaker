interface Props {
  content: string | null;
}

export default function LegalContent({ content }: Props) {
  if (!content) {
    return (
      <p className="text-muted-foreground">
        No hay contenido disponible.
      </p>
    );
  }

  return (
    <article
      className="prose prose-neutral dark:prose-invert max-w-none whitespace-pre-wrap"
    >
      {content}
    </article>
  );
}