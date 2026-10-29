"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { joinLoyaltyCard } from "@/actions/loyaltyCard";

export function LoyaltyCardForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("firstName", firstName);
    formData.set("lastName", lastName);
    formData.set("phone", phone);

    const result = await joinLoyaltyCard(formData);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "No pudimos registrarte. Probá de nuevo.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-gold/15 bg-noir p-8 text-center">
        <p className="font-display text-lg font-semibold text-ivory">¡Ya sos parte del club!</p>
        <p className="mt-2 text-ivory-soft">
          Te vamos a ir sumando un sello en cada visita. Al sexto, el corte es gratis.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border border-gold/15 bg-noir p-8">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ivory-soft">Nombre</span>
          <input
            type="text"
            required
            maxLength={80}
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full rounded-xl border border-gold/20 bg-noir-soft px-4 py-3 text-ivory outline-none transition-colors focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-noir"
          />
        </label>
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ivory-soft">Apellido</span>
          <input
            type="text"
            required
            maxLength={80}
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full rounded-xl border border-gold/20 bg-noir-soft px-4 py-3 text-ivory outline-none transition-colors focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-noir"
          />
        </label>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ivory-soft">Teléfono</span>
        <input
          type="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full rounded-xl border border-gold/20 bg-noir-soft px-4 py-3 text-ivory outline-none transition-colors focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-noir"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="gold" size="md" className="w-full" disabled={submitting}>
        {submitting ? "Registrando..." : "Sumarme al club"}
      </Button>
    </form>
  );
}
