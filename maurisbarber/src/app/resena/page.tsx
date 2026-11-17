import type { Metadata } from "next";
import Link from "next/link";
import { ReviewForm } from "@/components/landing/ReviewForm";

export const metadata: Metadata = {
  title: "Dejanos tu reseña — MaurisBarber",
  description: "Contanos cómo te fue en tu asesoría o corte en MaurisBarber.",
};

export default function ResenaPage() {
  return (
    <main className="theme-dark min-h-screen bg-noir px-6 py-20 text-ivory sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <Link href="/" className="text-sm font-medium text-ivory-soft hover:text-ivory">
          ← Volver al inicio
        </Link>
        <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight text-ivory sm:text-5xl">
          ¿Cómo te fue?
        </h1>
        <p className="mt-4 text-lg text-ivory-soft">Tu reseña se revisa antes de publicarse.</p>
      </div>
      <div className="mt-12">
        <ReviewForm />
      </div>
    </main>
  );
}
