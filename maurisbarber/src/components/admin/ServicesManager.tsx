"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { deleteService, upsertService } from "@/actions/services";

type SchedulingMode = "CONSECUTIVE" | "CUSTOM_FREQUENCY" | "MANUAL";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  color: string;
  imageUrl: string | null;
  active: boolean;
  schedulingMode: SchedulingMode;
  frequencyMinutes: number | null;
  manualSlots: string[];
  allowsParallel: boolean;
}

const emptyForm: Service = {
  id: "",
  name: "",
  description: "",
  price: 0,
  duration: 30,
  color: "#16a34a",
  imageUrl: "",
  active: true,
  schedulingMode: "CONSECUTIVE",
  frequencyMinutes: 15,
  manualSlots: [],
  allowsParallel: false,
};

export function ServicesManager({ services }: { services: Service[] }) {
  const [editing, setEditing] = useState<Service | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Servicios</h1>
        <Button
          variant="accent"
          onClick={() => {
            setEditing({ ...emptyForm });
            setShowForm(true);
          }}
        >
          + Nuevo servicio
        </Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {services.map((service) => (
          <div key={service.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: service.color }} />
                  <p className="font-medium text-ink">{service.name}</p>
                  {!service.active && (
                    <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-ink-muted">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  ${service.price} · {service.duration} min ·{" "}
                  {service.schedulingMode === "CONSECUTIVE" && "Turnos consecutivos"}
                  {service.schedulingMode === "CUSTOM_FREQUENCY" && `Cada ${service.frequencyMinutes} min`}
                  {service.schedulingMode === "MANUAL" && "Horarios manuales"}
                  {service.allowsParallel && " · Trabajo en paralelo"}
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className="text-sm font-medium text-ink-muted hover:text-ink"
                  onClick={() => {
                    setEditing(service);
                    setShowForm(true);
                  }}
                >
                  Editar
                </button>
                <button
                  type="button"
                  className="text-sm font-medium text-red-600 hover:text-red-700"
                  onClick={async () => {
                    if (confirm(`¿Eliminar "${service.name}"?`)) {
                      await deleteService(service.id);
                    }
                  }}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showForm && editing && (
        <ServiceFormModal
          service={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

function ServiceFormModal({
  service,
  onClose,
  onSaved,
}: {
  service: Service;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState(service);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await upsertService({ ...form, id: form.id || undefined });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el servicio");
    } finally {
      setSaving(false);
    }
  }

  function addManualSlot() {
    setForm((f) => ({ ...f, manualSlots: [...f.manualSlots, "09:00"] }));
  }

  function updateManualSlot(index: number, value: string) {
    setForm((f) => ({
      ...f,
      manualSlots: f.manualSlots.map((s, i) => (i === index ? value : s)),
    }));
  }

  function removeManualSlot(index: number) {
    setForm((f) => ({ ...f, manualSlots: f.manualSlots.filter((_, i) => i !== index) }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-floating"
      >
        <h2 className="text-lg font-semibold text-ink">
          {form.id ? "Editar servicio" : "Nuevo servicio"}
        </h2>

        <div className="mt-4 space-y-4">
          <TextField label="Nombre" value={form.name} onChange={(v) => setForm({ ...form, name: v })} />
          <TextArea
            label="Descripción"
            value={form.description}
            onChange={(v) => setForm({ ...form, description: v })}
          />

          <div className="grid grid-cols-2 gap-3">
            <NumberField
              label="Precio ($)"
              value={form.price}
              onChange={(v) => setForm({ ...form, price: v })}
            />
            <NumberField
              label="Duración (min)"
              value={form.duration}
              onChange={(v) => setForm({ ...form, duration: v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Color</span>
              <input
                type="color"
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                className="h-11 w-full rounded-xl border border-line"
              />
            </label>
            <label className="flex items-center gap-2 self-end pb-3 text-sm">
              <input
                type="checkbox"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <span className="font-medium text-ink-soft">Activo</span>
            </label>
          </div>

          <TextField
            label="Imagen (URL, opcional)"
            value={form.imageUrl ?? ""}
            onChange={(v) => setForm({ ...form, imageUrl: v })}
          />

          <div className="rounded-xl border border-line p-4">
            <p className="mb-3 text-sm font-semibold text-ink">Configuración avanzada de turnos</p>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Modo de agenda</span>
              <select
                value={form.schedulingMode}
                onChange={(e) => setForm({ ...form, schedulingMode: e.target.value as SchedulingMode })}
                className="w-full rounded-xl border border-line px-4 py-3"
              >
                <option value="CONSECUTIVE">Turnos consecutivos (cada duración del servicio)</option>
                <option value="CUSTOM_FREQUENCY">Frecuencia personalizada</option>
                <option value="MANUAL">Horarios manuales</option>
              </select>
            </label>

            {form.schedulingMode === "CUSTOM_FREQUENCY" && (
              <div className="mt-3">
                <NumberField
                  label="Repetir cada (minutos)"
                  value={form.frequencyMinutes ?? 15}
                  onChange={(v) => setForm({ ...form, frequencyMinutes: v })}
                />
              </div>
            )}

            {form.schedulingMode === "MANUAL" && (
              <div className="mt-3 space-y-2">
                <span className="block text-sm font-medium text-ink-soft">Horarios disponibles</span>
                {form.manualSlots.map((slot, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={slot}
                      onChange={(e) => updateManualSlot(i, e.target.value)}
                      className="w-full rounded-xl border border-line px-4 py-2"
                    />
                    <button
                      type="button"
                      onClick={() => removeManualSlot(i)}
                      className="text-sm text-red-600"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
                <button type="button" onClick={addManualSlot} className="text-sm font-medium text-accent">
                  + Agregar horario
                </button>
              </div>
            )}

            <label className="mt-4 flex items-start gap-2 text-sm">
              <input
                type="checkbox"
                className="mt-1"
                checked={form.allowsParallel}
                onChange={(e) => setForm({ ...form, allowsParallel: e.target.checked })}
              />
              <span>
                <span className="font-medium text-ink-soft">Permite trabajo en paralelo</span>
                <p className="text-ink-muted">
                  Mientras este servicio está en curso (ej: color actuando), el barbero puede atender
                  otro turno al mismo tiempo.
                </p>
              </span>
            </label>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={saving}>
              {saving ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink-soft">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-line px-4 py-3"
      />
    </label>
  );
}

function TextArea({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink-soft">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className="w-full rounded-xl border border-line px-4 py-3"
      />
    </label>
  );
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ink-soft">{label}</span>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-xl border border-line px-4 py-3"
      />
    </label>
  );
}
