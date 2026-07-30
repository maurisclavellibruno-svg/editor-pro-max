"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { deactivateGiftCard, issueGiftCard } from "@/actions/giftcards";

interface GiftCard {
  id: string;
  code: string;
  initialAmount: number;
  remainingAmount: number;
  active: boolean;
  customerName: string | null;
  expiresAt: string | null;
}

export function GiftCardsManager({ giftCards }: { giftCards: GiftCard[] }) {
  const [list, setList] = useState(giftCards);
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Gift cards</h1>
        <Button variant="accent" onClick={() => setShowForm(true)}>
          + Emitir gift card
        </Button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-3">Código</th>
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Saldo</th>
              <th className="px-5 py-3">Vence</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {list.map((g) => (
              <tr key={g.id}>
                <td className="px-5 py-3 font-mono font-medium text-ink">{g.code}</td>
                <td className="px-5 py-3 text-ink-muted">{g.customerName ?? "—"}</td>
                <td className="px-5 py-3 text-ink-muted">
                  ${g.remainingAmount} / ${g.initialAmount}
                </td>
                <td className="px-5 py-3 text-ink-muted">{g.expiresAt ?? "Sin vencimiento"}</td>
                <td className="px-5 py-3">
                  {g.active ? (
                    <button
                      type="button"
                      className="text-red-600"
                      onClick={async () => {
                        await deactivateGiftCard(g.id);
                        setList(list.map((x) => (x.id === g.id ? { ...x, active: false } : x)));
                      }}
                    >
                      Desactivar
                    </button>
                  ) : (
                    <span className="text-ink-muted">Inactiva</span>
                  )}
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-muted">
                  Todavía no emitiste ninguna gift card.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showForm && (
        <IssueGiftCardModal
          onClose={() => setShowForm(false)}
          onIssued={(card) => setList([card, ...list])}
        />
      )}
    </div>
  );
}

function IssueGiftCardModal({
  onClose,
  onIssued,
}: {
  onClose: () => void;
  onIssued: (card: GiftCard) => void;
}) {
  const [amount, setAmount] = useState(1000);
  const [customerPhone, setCustomerPhone] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [issuedCode, setIssuedCode] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const result = await issueGiftCard({ amount, customerPhone, expiresAt });
    setSaving(false);
    setIssuedCode(result.code);
    onIssued({
      id: crypto.randomUUID(),
      code: result.code,
      initialAmount: amount,
      remainingAmount: amount,
      active: true,
      customerName: null,
      expiresAt: expiresAt || null,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-floating">
        <h2 className="text-lg font-semibold text-ink">Emitir gift card</h2>
        {issuedCode ? (
          <div className="mt-4">
            <p className="text-sm text-ink-muted">Código generado:</p>
            <p className="mt-1 rounded-xl bg-surface-alt px-4 py-3 font-mono text-lg font-semibold text-ink">
              {issuedCode}
            </p>
            <Button type="button" variant="accent" className="mt-4 w-full" onClick={onClose}>
              Listo
            </Button>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Monto ($)</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full rounded-xl border border-line px-4 py-3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Teléfono del cliente (opcional)</span>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Vencimiento (opcional)</span>
              <input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-3"
              />
            </label>
            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit" variant="accent" className="flex-1" disabled={saving}>
                {saving ? "Emitiendo…" : "Emitir"}
              </Button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
