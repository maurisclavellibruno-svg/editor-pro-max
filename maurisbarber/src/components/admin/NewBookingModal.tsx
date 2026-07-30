"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createManualBooking } from "@/actions/admin-bookings";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

export function NewBookingModal({
  startAt,
  employeeId,
  services,
  onClose,
  onCreated,
}: {
  startAt: Date;
  employeeId: string;
  services: Service[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await createManualBooking({
        serviceId,
        employeeId,
        startAt: startAt.toISOString(),
        firstName,
        lastName,
        phone,
        notes,
      });
      onCreated();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear el turno");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-floating">
        <h2 className="text-lg font-semibold text-ink">Nueva reserva manual</h2>
        <p className="mt-1 text-sm text-ink-muted">
          {startAt.toLocaleString("es-UY", { dateStyle: "medium", timeStyle: "short" })}
        </p>

        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Servicio</span>
            <select
              value={serviceId}
              onChange={(e) => setServiceId(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.duration} min · ${s.price})
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nombre" value={firstName} onChange={setFirstName} />
            <Field label="Apellido" value={lastName} onChange={setLastName} />
          </div>
          <Field label="Teléfono" value={phone} onChange={setPhone} />
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Notas (opcional)</span>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="w-full rounded-xl border border-line px-4 py-3"
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={saving}>
              {saving ? "Guardando…" : "Crear turno"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink-soft">{label}</span>
      <input
        type="text"
        required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line px-4 py-3"
      />
    </label>
  );
}
