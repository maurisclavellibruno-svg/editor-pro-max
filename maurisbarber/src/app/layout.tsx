import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { Suspense } from "react";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { MetaPixel } from "@/components/MetaPixel";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

// Serif display face for the public site — carries the "premium barbershop"
// personality that the previous generic sans-everywhere look lacked.
const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "https://maurisbarber.tech"),
  title: "MaurisBarber — Asesoría de imagen y cortes en Montevideo",
  description:
    "Antes de cortar, analizamos tu cara y tu estilo para elegir el corte que mejor te queda. Asesoría + corte, cortes y color en Montevideo. Reservá online.",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "MaurisBarber — Asesoría de imagen y cortes en Montevideo",
    description:
      "Antes de cortar, analizamos tu cara y tu estilo para elegir el corte que mejor te queda. Asesoría + corte, cortes y color en Montevideo.",
    type: "website",
    locale: "es_UY",
  },
};

export const viewport: Viewport = {
  themeColor: "#0E0D0B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${playfair.variable} font-sans antialiased`}>
        <Suspense fallback={null}>
          <MetaPixel />
        </Suspense>
        <CustomCursor />
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
