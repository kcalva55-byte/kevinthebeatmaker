import type { MetadataRoute } from "next";

const siteUrl = "https://kevinthebeatmaker.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/checkout/",
        "/cart/",
      ],
    },

    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}