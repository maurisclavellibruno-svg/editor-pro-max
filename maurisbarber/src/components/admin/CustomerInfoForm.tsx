"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateCustomerContact } from "@/actions/customers";

interface CustomerInfo {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  instagram: string | null;
  birthDate: string;
}

export function CustomerInfoForm({ customer }: { customer: CustomerInfo }) {
  const [form, setForm] = useState({
    ...customer,
    email: customer.email ?? "",
    instagram: customer.instagram ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await updateCustomerContact(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-muted">Datos de contacto</h2>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
          <Field label="Apellido" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
        </div>
        <Field label="Teléfono" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
        <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} type="email" />
        <Field
          label="Instagram"
          value={form.instagram}
          onChange={(v) => setForm({ ...form, instagram: v })}
        />
        <Field
          label="Fecha de nacimiento"
          value={form.birthDate}
          onChange={(v) => setForm({ ...form, birthDate: v })}
          type="date"
        />
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
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink-soft">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line px-4 py-2.5"
      />
    </label>
  );
}
