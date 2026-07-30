"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateCustomerNotes } from "@/actions/customers";

interface CustomerNotes {
  id: string;
  favoriteCut: string | null;
  beardPreference: string | null;
  musicPreference: string | null;
  likesToTalk: boolean | null;
  productsUsed: string | null;
  hairColor: string | null;
  generalPreferences: string | null;
  likedNotes: string | null;
  dislikedNotes: string | null;
  notes: string;
}

export function CustomerNotesForm({ customer }: { customer: CustomerNotes }) {
  const [form, setForm] = useState({
    id: customer.id,
    favoriteCut: customer.favoriteCut ?? "",
    beardPreference: customer.beardPreference ?? "",
    musicPreference: customer.musicPreference ?? "",
    likesToTalk:
      customer.likesToTalk === true ? "true" : customer.likesToTalk === false ? "false" : "unknown",
    productsUsed: customer.productsUsed ?? "",
    hairColor: customer.hairColor ?? "",
    generalPreferences: customer.generalPreferences ?? "",
    likedNotes: customer.likedNotes ?? "",
    dislikedNotes: customer.dislikedNotes ?? "",
    notes: customer.notes ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await updateCustomerNotes(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <h2 className="mb-1 text-sm font-semibold uppercase tracking-wider text-ink-muted">Notas privadas</h2>
      <p className="mb-4 text-xs text-ink-muted">Solo vos las ves. Ayudan a recibirlo mejor la próxima vez.</p>
      <div className="space-y-3">
        <Field label="Corte favorito" value={form.favoriteCut} onChange={(v) => setForm({ ...form, favoriteCut: v })} />
        <Field
          label="Cómo le gusta la barba"
          value={form.beardPreference}
          onChange={(v) => setForm({ ...form, beardPreference: v })}
        />
        <Field
          label="Música que escucha"
          value={form.musicPreference}
          onChange={(v) => setForm({ ...form, musicPreference: v })}
        />
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-soft">¿Le gusta conversar?</span>
          <select
            value={form.likesToTalk}
            onChange={(e) => setForm({ ...form, likesToTalk: e.target.value })}
            className="w-full rounded-xl border border-line px-4 py-2.5"
          >
            <option value="unknown">No sabemos</option>
            <option value="true">Sí, le gusta conversar</option>
            <option value="false">Prefiere silencio</option>
          </select>
        </label>
        <Field
          label="Productos utilizados"
          value={form.productsUsed}
          onChange={(v) => setForm({ ...form, productsUsed: v })}
        />
        <Field label="Color de pelo" value={form.hairColor} onChange={(v) => setForm({ ...form, hairColor: v })} />
        <Field
          label="Preferencias generales"
          value={form.generalPreferences}
          onChange={(v) => setForm({ ...form, generalPreferences: v })}
        />
        <Field label="Qué le gustó" value={form.likedNotes} onChange={(v) => setForm({ ...form, likedNotes: v })} />
        <Field
          label="Qué le molestó"
          value={form.dislikedNotes}
          onChange={(v) => setForm({ ...form, dislikedNotes: v })}
        />
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-soft">Otros detalles</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full rounded-xl border border-line px-4 py-2.5"
          />
        </label>
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" variant="accent" size="sm" disabled={saving}>
            {saving ? "Guardando…" : "Guardar"}
          </Button>
          {saved && <span className="text-sm text-accent">Guardado ✓</span>}
        </div>
      </div>
    </form>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink-soft">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line px-4 py-2.5"
      />
    </label>
  );
}
