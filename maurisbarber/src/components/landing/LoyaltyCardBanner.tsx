import Link from "next/link";
import { LOYALTY_CARD_GOAL } from "@/lib/loyaltyCard";

export function LoyaltyCardBanner() {
  return (
    <div className="w-full border-y border-gold/15 bg-noir-soft">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-6 py-10 text-center sm:flex-row sm:justify-between sm:text-left">
        <div>
          <p className="font-display text-xl font-semibold text-ivory">Club MaurisBarber</p>
          <p className="mt-1 text-sm text-ivory-soft">
            Cada {LOYALTY_CARD_GOAL} cortes, el número {LOYALTY_CARD_GOAL} lo invitamos nosotros.
          </p>
        </div>
        <Link
          href="/fidelidad"
          className="shrink-0 rounded-full border border-gold/40 px-6 py-3 text-sm font-medium text-gold transition-colors hover:border-gold hover:bg-gold/10"
        >
          Sumarme al club
        </Link>
      </div>
    </div>
  );
}
