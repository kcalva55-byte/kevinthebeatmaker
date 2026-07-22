import type { Metadata } from "next";
import { Inter } from "next/font/google";

import "./globals.css";

import CursorGlow from "../components/animations/CursorGlow";
import IntroLoader from "../components/animations/IntroLoader";
import CartProvider from "../components/cart/CartProvider";
import AmbientBackground from "../components/effects/AmbientBackground";
import MoodProvider from "../components/providers/MoodProvider";
import BeatPlayerProvider from "../components/providers/BeatPlayerProvider";
import FloatingBeatPlayer from "../components/player/FloatingBeatPlayer";
import { mapSupabaseBeatsToPlayer } from "../lib/supabase/beatMapper";
import { createClient } from "../lib/supabase/server";
import CartDrawer from "../components/cart/CartDrawer";
import CartButton from "../components/cart/CartButton";
import PayPalProvider from "../components/paypal/PayPalProvider";
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    "https://kevinthebeatmaker.com",
  ),

  title: {
    default:
      "Kevin The Beatmaker | KTB Studio",
    template: "%s | KTB Studio",
  },

  description:
    "KTB Studio es la plataforma oficial de Kevin The Beatmaker. Producción musical, mezcla, mastering, grabación de voces y beats exclusivos.",

  keywords: [
    "Kevin The Beatmaker",
    "KTB Studio",
    "Beatmaker Ecuador",
    "Productor musical",
    "Producción musical",
    "Mixing",
    "Mastering",
    "Grabación de voces",
    "Reggaeton",
    "Trap",
    "Detroit",
    "Afrobeat",
    "Beats",
  ],

  authors: [
    {
      name: "Kevin The Beatmaker",
    },
  ],

  creator: "Kevin The Beatmaker",

  openGraph: {
    title:
      "Kevin The Beatmaker | KTB Studio",

    description:
      "Producción musical profesional, mezcla, mastering, grabación de voces y beats exclusivos.",

    url: "https://kevinthebeatmaker.com",

    siteName: "KTB Studio",

    locale: "es_EC",

    type: "website",
  },

  icons: {
    icon: "/favicon.ico",
  },
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
console.log("SUPABASE BEATS:", publishedBeats);
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
      </body>
    </html>
  );
}