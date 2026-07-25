import type { MetadataRoute } from "next";

import { createClient } from "../lib/supabase/server";

const siteUrl = "https://kevinthebeatmaker.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: beats, error } = await supabase
    .from("beats")
    .select("slug, updated_at, created_at")
    .eq("status", "published")
    .not("slug", "is", null);

  if (error) {
    console.error(
      "No se pudieron cargar los beats para el sitemap:",
      error.message,
    );
  }

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/licenses`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${siteUrl}/help`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const beatPages: MetadataRoute.Sitemap =
    beats?.map((beat) => ({
      url: `${siteUrl}/beats/${beat.slug}`,
      lastModified: new Date(
        beat.updated_at || beat.created_at || Date.now(),
      ),
      changeFrequency: "weekly",
      priority: 0.8,
    })) ?? [];

  return [...staticPages, ...beatPages];
}