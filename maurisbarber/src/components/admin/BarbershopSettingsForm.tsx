"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateBarbershopSettings } from "@/actions/barbershop";

interface Shop {
  name: string;
  phone: string;
  whatsappNumber: string;
  instagramHandle: string;
  address: string;
  mapsEmbedUrl: string;
  description: string;
}

export function BarbershopSettingsForm({ shop }: { shop: Shop }) {
  const [form, setForm] = useState(shop);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await updateBarbershopSettings(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-xl rounded-2xl border border-line bg-white p-6 shadow-card">
      <div className="space-y-3">
        <Field label="Nombre del negocio" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Teléfono (se muestra en la web)"
            value={form.phone}
            onChange={(v) => setForm({ ...form, phone: v })}
          />
          <Field
            label="Número de WhatsApp"
            value={form.whatsappNumber}
            onChange={(v) => setForm({ ...form, whatsappNumber: v })}
          />
        </div>
        <p className="-mt-2 text-xs text-ink-muted">
          El de WhatsApp va con código de país, sin espacios ni el +: ej. 59891552626.
        </p>
        <Field
          label="Usuario de Instagram (sin @)"
          value={form.instagramHandle}
          onChange={(v) => setForm({ ...form, instagramHandle: v })}
        />
        <Field label="Dirección" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
        <Field
          label="URL de Google Maps (embed)"
          value={form.mapsEmbedUrl}
          onChange={(v) => setForm({ ...form, mapsEmbedUrl: v })}
        />
        <label className="block text-sm">
          <span className="mb-1.5 block font-medium text-ink-soft">Descripción</span>
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full rounded-xl border border-line px-4 py-2.5"
          />
        </label>

        {error && <p className="text-sm text-red-600">{error}</p>}

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

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
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
