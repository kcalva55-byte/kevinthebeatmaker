import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import CursorGlow from "../components/animations/CursorGlow";
import IntroLoader from "../components/animations/IntroLoader";
import CartButton from "../components/cart/CartButton";
import CartDrawer from "../components/cart/CartDrawer";
import CartProvider from "../components/cart/CartProvider";
import AmbientBackground from "../components/effects/AmbientBackground";
import PayPalProvider from "../components/paypal/PayPalProvider";
import FloatingBeatPlayer from "../components/player/FloatingBeatPlayer";
import BeatPlayerProvider from "../components/providers/BeatPlayerProvider";
import MoodProvider from "../components/providers/MoodProvider";
import JsonLd from "../components/seo/JsonLd";
import { mapSupabaseBeatsToPlayer } from "../lib/supabase/beatMapper";
import { createClient } from "../lib/supabase/server";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const siteUrl = "https://kevinthebeatmaker.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),

  title: {
    default: "Kevin The Beatmaker | KTB Studio",
    template: "%s | KTB Studio",
  },

  description:
    "Producción musical profesional, mezcla, mastering, grabación de voces y venta de beats exclusivos.",

  applicationName: "Kevin The Beatmaker",

  authors: [
    {
      name: "Kevin The Beatmaker",
      url: siteUrl,
    },
  ],

  creator: "Kevin The Beatmaker",
  publisher: "Kevin The Beatmaker",
  category: "Music",

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
      {
        url: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        url: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],

    apple: [
      {
        url: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },

  manifest: "/site.webmanifest",

  openGraph: {
    type: "website",
    locale: "es_EC",
    url: siteUrl,
    siteName: "Kevin The Beatmaker",

    title: "Kevin The Beatmaker | KTB Studio",

    description:
      "Producción musical profesional, mezcla, mastering, grabación de voces y venta de beats exclusivos.",

    images: [
      {
        url: "/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Kevin The Beatmaker en KTB Studio",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",

    title: "Kevin The Beatmaker | KTB Studio",

    description:
      "Producción musical profesional, mezcla, mastering, grabación de voces y venta de beats exclusivos.",

    images: ["/images/og-image.jpg"],
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",

  name: "Kevin The Beatmaker",
  alternateName: "KTB Studio",

  url: siteUrl,

  logo: `${siteUrl}/android-chrome-512x512.png`,

  image: `${siteUrl}/images/og-image.jpg`,

  description:
    "Producción musical profesional, mezcla, mastering, grabación de voces y venta de beats exclusivos.",

  areaServed: {
    "@type": "Country",
    name: "Ecuador",
  },

  founder: {
    "@type": "Person",
    name: "Kevin The Beatmaker",
  },

  serviceType: [
    "Producción musical",
    "Mezcla de audio",
    "Mastering",
    "Grabación de voces",
    "Venta de beats",
  ],

  knowsAbout: [
    "Reggaetón",
    "Trap",
    "Detroit",
    "Afrobeat",
    "Producción musical",
    "Mezcla",
    "Mastering",
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("beats")
    .select(
      `
        id,
        title,
        genre,
        bpm,
        musical_key,
        cover_url,
        audio_url,
        price,
        plays,
        slug,
        status,
        created_at
      `,
    )
    .eq("status", "published")
    .not("audio_url", "is", null)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    console.error(
      "No se pudieron cargar los beats públicos:",
      error.message,
    );
  }

  const publishedBeats =
    mapSupabaseBeatsToPlayer(data ?? []);

  return (
    <html lang="es">
      <body
        className={`${inter.variable} bg-[#030712] text-white antialiased`}
      >
        <CartProvider>
          <PayPalProvider>
            <MoodProvider initialBeats={publishedBeats}>
              <BeatPlayerProvider>
                <IntroLoader />

                <AmbientBackground />

                <CursorGlow />

                {children}

                <FloatingBeatPlayer />
              </BeatPlayerProvider>
            </MoodProvider>

            <CartDrawer />

            <CartButton />
          </PayPalProvider>
        </CartProvider>

        <JsonLd data={organizationJsonLd} />
      </body>
    </html>
  );
}