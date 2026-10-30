"use client";

import { useState } from "react";
import { resolveLoyaltyCheckIn } from "@/actions/loyaltyCard";

interface PendingCheckIn {
  bookingId: string;
  customerName: string;
  serviceName: string;
  startAt: string; // ISO — serialized across the server/client boundary
}

// Shown at the top of every admin page: for each loyalty-club customer
// whose booking time already passed, asks "¿vino hoy?" so staff doesn't
// have to remember to add the stamp by hand. Answering removes it from the
// list immediately (optimistic) — no need to wait on the server round-trip.
export function LoyaltyCheckInPrompts({ initial }: { initial: PendingCheckIn[] }) {
  const [pending, setPending] = useState(initial);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function resolve(bookingId: string, attended: boolean) {
    setResolvingId(bookingId);
    setError(null);
    setPending((prev) => prev.filter((p) => p.bookingId !== bookingId));
    try {
      await resolveLoyaltyCheckIn({ bookingId, attended });
    } catch (err) {
      // Put it back if the server actually rejected it.
      setPending((prev) => [...initial.filter((p) => p.bookingId === bookingId), ...prev]);
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setResolvingId(null);
    }
  }

  if (pending.length === 0) return null;

  return (
    <div className="mx-auto max-w-6xl px-6 pt-6">
      <div className="rounded-2xl border border-accent/30 bg-accent-soft/60 p-4">
        <p className="mb-3 text-sm font-semibold text-ink">
          ¿Quiénes vinieron? Sumales el sello del club de fidelidad.
        </p>
        <div className="space-y-2">
          {pending.map((p) => (
            <div
              key={p.bookingId}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-card"
            >
              <p className="text-sm text-ink">
                <span className="font-medium">{p.customerName}</span> — {p.serviceName} ·{" "}
                {new Date(p.startAt).toLocaleString("es-UY", {
                  dateStyle: "short",
                  timeStyle: "short",
                  timeZone: "America/Montevideo",
                })}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={resolvingId === p.bookingId}
                  onClick={() => resolve(p.bookingId, true)}
                  className="rounded-full bg-accent px-4 py-1.5 text-xs font-medium text-white hover:bg-accent-hover disabled:opacity-50"
                >
                  Sí, vino
                </button>
                <button
                  type="button"
                  disabled={resolvingId === p.bookingId}
                  onClick={() => resolve(p.bookingId, false)}
                  className="rounded-full border border-line px-4 py-1.5 text-xs font-medium text-ink-muted hover:bg-surface-alt disabled:opacity-50"
                >
                  No vino
                </button>
              </div>
            </div>
          ))}
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
}
