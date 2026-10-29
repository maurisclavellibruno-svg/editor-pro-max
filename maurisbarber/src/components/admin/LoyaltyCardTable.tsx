"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { addLoyaltyStamp, redeemLoyaltyCard, removeLoyaltyStamp } from "@/actions/loyaltyCard";
import { LOYALTY_CARD_GOAL } from "@/lib/loyaltyCard";

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  loyaltyCardStamps: number;
  loyaltyCardRedemptions: number;
}

export function LoyaltyCardTable({ members }: { members: Member[] }) {
  const [rows, setRows] = useState(members);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function update(id: string, patch: Partial<Member>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  // Optimistic: the dots update the instant you tap, before the server
  // round-trip resolves — this is the button Mauris taps most, often with a
  // client waiting right there, so any visible lag reads as "did that even
  // register?" Roll back only if the server actually rejects it.
  async function handleAdd(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const previous = row.loyaltyCardStamps;
    update(id, { loyaltyCardStamps: Math.min(previous + 1, LOYALTY_CARD_GOAL) });
    setSavingId(id);
    setError(null);
    try {
      await addLoyaltyStamp(id);
    } catch (err) {
      update(id, { loyaltyCardStamps: previous });
      setError(err instanceof Error ? err.message : "No se pudo sumar el sello");
    } finally {
      setSavingId(null);
    }
  }

  async function handleRemove(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const previous = row.loyaltyCardStamps;
    update(id, { loyaltyCardStamps: Math.max(previous - 1, 0) });
    setSavingId(id);
    setError(null);
    try {
      await removeLoyaltyStamp(id);
    } catch (err) {
      update(id, { loyaltyCardStamps: previous });
      setError(err instanceof Error ? err.message : "No se pudo quitar el sello");
    } finally {
      setSavingId(null);
    }
  }

  async function handleRedeem(id: string) {
    const row = rows.find((r) => r.id === id);
    if (!row) return;
    const previous = row;
    update(id, { loyaltyCardStamps: 0, loyaltyCardRedemptions: previous.loyaltyCardRedemptions + 1 });
    setSavingId(id);
    setError(null);
    try {
      await redeemLoyaltyCard(id);
    } catch (err) {
      update(id, { loyaltyCardStamps: previous.loyaltyCardStamps, loyaltyCardRedemptions: previous.loyaltyCardRedemptions });
      setError(err instanceof Error ? err.message : "No se pudo canjear");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}
      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Sellos</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {rows.map((m) => (
              <tr key={m.id} className="hover:bg-surface-alt">
                <td className="px-5 py-3">
                  <Link href={`/admin/clientes/${m.id}`} className="font-medium text-ink hover:text-accent">
                    {m.firstName} {m.lastName}
                  </Link>
                  <p className="text-xs text-ink-muted">{m.phone}</p>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: LOYALTY_CARD_GOAL }).map((_, i) => (
                      <span
                        key={i}
                        className={`h-4 w-4 rounded-full border ${
                          i < m.loyaltyCardStamps ? "border-accent bg-accent" : "border-line bg-white"
                        }`}
                      />
                    ))}
                    <span className="ml-2 text-xs text-ink-muted">
                      {m.loyaltyCardStamps}/{LOYALTY_CARD_GOAL}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={savingId === m.id || m.loyaltyCardStamps >= LOYALTY_CARD_GOAL}
                      onClick={() => handleAdd(m.id)}
                    >
                      +1
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={savingId === m.id || m.loyaltyCardStamps <= 0}
                      onClick={() => handleRemove(m.id)}
                    >
                      -1
                    </Button>
                    {m.loyaltyCardStamps >= LOYALTY_CARD_GOAL && (
                      <Button size="sm" variant="accent" disabled={savingId === m.id} onClick={() => handleRedeem(m.id)}>
                        Canjear
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-8 text-center text-ink-muted">
                  Todavía nadie se anotó al club.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
