import { ReactNode } from "react";

interface LegalLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function LegalLayout({
  title,
  description,
  children,
}: LegalLayoutProps) {
  return (
    <main className="mx-auto max-w-5xl px-6 py-20">
      <div className="mb-10">
        <h1 className="text-4xl font-bold tracking-tight">
          {title}
        </h1>

        {description && (
          <p className="mt-3 text-muted-foreground">
            {description}
          </p>
        )}
      </div>

      <div className="rounded-2xl border bg-card p-8 shadow-sm">
        {children}
      </div>
    </main>
  );
}