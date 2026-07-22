import type { Metadata } from "next";

import ProductionsCatalog from "@/components/productions/ProductionsCatalog";

export const metadata: Metadata = {
  title: "Producciones",
  description:
    "Explora las producciones musicales realizadas por Kevin The Beatmaker.",
};

export default function ProductionsPage() {
  return (
    <main className="min-h-screen pt-28">
      <ProductionsCatalog />
    </main>
  );
}