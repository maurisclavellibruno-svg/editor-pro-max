"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { redeemPoints } from "@/actions/loyalty";
import {
  addLoyaltyStamp,
  enrollInLoyaltyCard,
  redeemLoyaltyCard,
  removeLoyaltyStamp,
} from "@/actions/loyaltyCard";
import { LOYALTY_CARD_GOAL } from "@/lib/loyaltyCard";

interface Membership {
  id: string;
  planName: string;
  remainingCredits: number;
  expiresAt: string;
}

interface GiftCard {
  code: string;
  remainingAmount: number;
}

export function CustomerLoyaltyCard({
  customerId,
  loyaltyPoints,
  loyaltyCardEnrolled,
  loyaltyCardStamps,
  loyaltyCardRedemptions,
  memberships,
  giftCards,
}: {
  customerId: string;
  loyaltyPoints: number;
  loyaltyCardEnrolled: boolean;
  loyaltyCardStamps: number;
  loyaltyCardRedemptions: number;
  memberships: Membership[];
  giftCards: GiftCard[];
}) {
  const [points, setPoints] = useState(loyaltyPoints);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [enrolled, setEnrolled] = useState(loyaltyCardEnrolled);
  const [stamps, setStamps] = useState(loyaltyCardStamps);
  const [redemptions, setRedemptions] = useState(loyaltyCardRedemptions);
  const [cardSaving, setCardSaving] = useState(false);
  const [cardError, setCardError] = useState<string | null>(null);

  async function handleRedeem() {
    setSaving(true);
    setError(null);
    try {
      await redeemPoints({ customerId, points: redeemAmount });
      setPoints(points - redeemAmount);
      setRedeemAmount(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo canjear");
    } finally {
      setSaving(false);
    }
  }

  async function handleEnroll() {
    setCardSaving(true);
    setCardError(null);
    try {
      await enrollInLoyaltyCard(customerId);
      setEnrolled(true);
    } catch (err) {
      setCardError(err instanceof Error ? err.message : "No se pudo inscribir");
    } finally {
      setCardSaving(false);
    }
  }

  async function handleAddStamp() {
    setCardSaving(true);
    setCardError(null);
    try {
      await addLoyaltyStamp(customerId);
      setStamps((s) => Math.min(s + 1, LOYALTY_CARD_GOAL));
    } catch (err) {
      setCardError(err instanceof Error ? err.message : "No se pudo sumar el sello");
    } finally {
      setCardSaving(false);
    }
  }

  async function handleRemoveStamp() {
    setCardSaving(true);
    setCardError(null);
    try {
      await removeLoyaltyStamp(customerId);
      setStamps((s) => Math.max(s - 1, 0));
    } catch (err) {
      setCardError(err instanceof Error ? err.message : "No se pudo quitar el sello");
    } finally {
      setCardSaving(false);
    }
  }

  async function handleRedeemCard() {
    setCardSaving(true);
    setCardError(null);
    try {
      await redeemLoyaltyCard(customerId);
      setStamps(0);
      setRedemptions((r) => r + 1);
    } catch (err) {
      setCardError(err instanceof Error ? err.message : "No se pudo canjear");
    } finally {
      setCardSaving(false);
    }
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-muted">
        Fidelización
      </h2>

      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-soft">
          Puntos acumulados: <span className="font-semibold text-ink">{points}</span>
        </p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={points}
            placeholder="Cant."
            value={redeemAmount || ""}
            onChange={(e) => setRedeemAmount(Number(e.target.value))}
            className="w-20 rounded-xl border border-line px-3 py-2 text-sm"
          />
          <Button size="sm" variant="outline" disabled={saving || redeemAmount < 1} onClick={handleRedeem}>
            Canjear
          </Button>
        </div>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-4 border-t border-line pt-4">
        <p className="mb-2 text-sm font-medium text-ink-soft">Tarjeta de fidelidad (club de cortes)</p>
        {!enrolled ? (
          <Button size="sm" variant="outline" disabled={cardSaving} onClick={handleEnroll}>
            Inscribir en el club
          </Button>
        ) : (
          <div>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: LOYALTY_CARD_GOAL }).map((_, i) => (
                <span
                  key={i}
                  className={`h-4 w-4 rounded-full border ${
                    i < stamps ? "border-accent bg-accent" : "border-line bg-white"
                  }`}
                />
              ))}
              <span className="ml-2 text-sm text-ink-muted">
                {stamps}/{LOYALTY_CARD_GOAL}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button size="sm" variant="outline" disabled={cardSaving || stamps >= LOYALTY_CARD_GOAL} onClick={handleAddStamp}>
                +1 sello
              </Button>
              <Button size="sm" variant="ghost" disabled={cardSaving || stamps <= 0} onClick={handleRemoveStamp}>
                -1
              </Button>
              {stamps >= LOYALTY_CARD_GOAL && (
                <Button size="sm" variant="accent" disabled={cardSaving} onClick={handleRedeemCard}>
                  Canjear corte gratis
                </Button>
              )}
            </div>
            {redemptions > 0 && (
              <p className="mt-2 text-xs text-ink-muted">Cortes gratis canjeados hasta ahora: {redemptions}</p>
            )}
          </div>
        )}
        {cardError && <p className="mt-2 text-sm text-red-600">{cardError}</p>}
      </div>

      {memberships.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2 text-sm font-medium text-ink-soft">Membresías activas</p>
          {memberships.map((m) => (
            <p key={m.id} className="text-sm text-ink-muted">
              {m.planName}: {m.remainingCredits} créditos (vence {m.expiresAt})
            </p>
          ))}
        </div>
      )}

      {giftCards.length > 0 && (
        <div className="mt-4 border-t border-line pt-4">
          <p className="mb-2 text-sm font-medium text-ink-soft">Gift cards activas</p>
          {giftCards.map((g) => (
            <p key={g.code} className="font-mono text-sm text-ink-muted">
              {g.code}: ${g.remainingAmount}
            </p>
          ))}
        </div>
      )}
    </section>
  );
}
