import type { Metadata } from "next";
import Link from "next/link";
import { LoyaltyCardForm } from "@/components/landing/LoyaltyCardForm";
import { LOYALTY_CARD_GOAL, LOYALTY_CARD_WINDOW_DAYS } from "@/lib/loyaltyCard";

export const metadata: Metadata = {
  title: "Club de fidelidad — MaurisBarber",
  description: "Sumate al club de MaurisBarber: cada 6 cortes, el sexto es gratis.",
};

export default function FidelidadPage() {
  return (
    <main className="theme-dark min-h-screen bg-noir px-6 py-20 text-ivory sm:py-28">
      <div className="mx-auto max-w-2xl text-center">
        <Link href="/" className="text-sm font-medium text-ivory-soft hover:text-ivory">
          ← Volver al inicio
        </Link>
        <h1 className="font-display mt-6 text-4xl font-semibold tracking-tight text-ivory sm:text-5xl">
          Club MaurisBarber
        </h1>
        <p className="mt-4 text-lg text-ivory-soft">
          Dejá tus datos una sola vez. En cada visita te sumamos un sello, y al corte número{" "}
          {LOYALTY_CARD_GOAL} te invitamos nosotros.
        </p>
        <p className="mt-2 text-sm text-ivory-soft/80">
          Eso sí: los primeros {LOYALTY_CARD_GOAL - 1} tienen que ser dentro de{" "}
          {Math.round(LOYALTY_CARD_WINDOW_DAYS / 30)} meses desde el primero, o se reinicia el contador.
        </p>
      </div>

      <div className="mt-12">
        <LoyaltyCardForm />
      </div>
    </main>
  );
}
