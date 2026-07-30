"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { redeemPoints } from "@/actions/loyalty";

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
  memberships,
  giftCards,
}: {
  customerId: string;
  loyaltyPoints: number;
  memberships: Membership[];
  giftCards: GiftCard[];
}) {
  const [points, setPoints] = useState(loyaltyPoints);
  const [redeemAmount, setRedeemAmount] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
