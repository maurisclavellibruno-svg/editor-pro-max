import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Inter } from "next/font/google";
import "./globals.css";
import { PwaRegister } from "@/components/PwaRegister";
import { CustomCursor } from "@/components/ui/CustomCursor";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MaurisBarber — Reservá tu turno",
  description:
    "Barbería exclusiva en Montevideo. Reservá tu turno online en segundos. Cortes, barba y color con estilo premium.",
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#111111",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} ${bricolage.variable} font-sans antialiased`}>
        <CustomCursor />
        {children}
        <PwaRegister />
      </body>
    </html>
  );
}
