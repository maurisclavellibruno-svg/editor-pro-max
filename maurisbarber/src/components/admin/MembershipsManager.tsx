"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { deactivateMembershipPlan, sellMembership, upsertMembershipPlan } from "@/actions/memberships";

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  credits: number;
  validityDays: number;
  active: boolean;
}

interface Sold {
  id: string;
  planName: string;
  customerName: string;
  remainingCredits: number;
  expiresAt: string;
}

const emptyForm: Plan = {
  id: "",
  name: "",
  description: "",
  price: 0,
  credits: 4,
  validityDays: 90,
  active: true,
};

export function MembershipsManager({ plans, sold }: { plans: Plan[]; sold: Sold[] }) {
  const [list, setList] = useState(plans);
  const [showForm, setShowForm] = useState(false);
  const [showSellForm, setShowSellForm] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Membresías</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowSellForm(true)}>
            Vender membresía
          </Button>
          <Button variant="accent" onClick={() => setShowForm(true)}>
            + Nuevo plan
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((plan) => (
          <div key={plan.id} className="rounded-2xl border border-line bg-white p-5 shadow-card">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-medium text-ink">{plan.name}</p>
                  {!plan.active && (
                    <span className="rounded-full bg-surface-alt px-2 py-0.5 text-xs text-ink-muted">
                      Inactivo
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  ${plan.price} · {plan.credits} créditos · vence a los {plan.validityDays} días
                </p>
              </div>
              {plan.active && (
                <button
                  type="button"
                  className="text-sm font-medium text-red-600"
                  onClick={async () => {
                    await deactivateMembershipPlan(plan.id);
                    setList(list.map((p) => (p.id === plan.id ? { ...p, active: false } : p)));
                  }}
                >
                  Desactivar
                </button>
              )}
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-ink-muted">Todavía no creaste planes.</p>}
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-muted">
          Últimas membresías vendidas
        </h2>
        <div className="space-y-2 rounded-2xl border border-line bg-white p-5 shadow-card">
          {sold.map((s) => (
            <div key={s.id} className="flex items-center justify-between text-sm">
              <span>
                {s.customerName} — {s.planName}
              </span>
              <span className="text-ink-muted">
                Quedan {s.remainingCredits} · vence {s.expiresAt}
              </span>
            </div>
          ))}
          {sold.length === 0 && <p className="text-sm text-ink-muted">Todavía no se vendió ninguna.</p>}
        </div>
      </section>

      {showForm && (
        <PlanFormModal
          onClose={() => setShowForm(false)}
          onSaved={(plan) => {
            setList([...list, plan]);
            setShowForm(false);
          }}
        />
      )}
      {showSellForm && (
        <SellMembershipModal
          plans={list.filter((p) => p.active)}
          onClose={() => setShowSellForm(false)}
          onSold={() => setShowSellForm(false)}
        />
      )}
    </div>
  );
}

function PlanFormModal({
  onClose,
  onSaved,
}: {
  onClose: () => void;
  onSaved: (plan: Plan) => void;
}) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await upsertMembershipPlan({ ...form, id: form.id || undefined });
    setSaving(false);
    onSaved({ ...form, id: crypto.randomUUID() });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-2xl bg-white p-6 shadow-floating">
        <h2 className="text-lg font-semibold text-ink">Nuevo plan de membresía</h2>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Nombre</span>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border border-line px-4 py-3"
            />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Descripción</span>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full rounded-xl border border-line px-4 py-3"
            />
          </label>
          <div className="grid grid-cols-3 gap-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Precio ($)</span>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                className="w-full rounded-xl border border-line px-4 py-3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Créditos</span>
              <input
                type="number"
                value={form.credits}
                onChange={(e) => setForm({ ...form, credits: Number(e.target.value) })}
                className="w-full rounded-xl border border-line px-4 py-3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Vigencia (días)</span>
              <input
                type="number"
                value={form.validityDays}
                onChange={(e) => setForm({ ...form, validityDays: Number(e.target.value) })}
                className="w-full rounded-xl border border-line px-4 py-3"
              />
            </label>
          </div>
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

function SellMembershipModal({
  plans,
  onClose,
  onSold,
}: {
  plans: Plan[];
  onClose: () => void;
  onSold: () => void;
}) {
  const [planId, setPlanId] = useState(plans[0]?.id ?? "");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await sellMembership({ planId, firstName, lastName, customerPhone });
      onSold();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo vender la membresía");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-floating">
        <h2 className="text-lg font-semibold text-ink">Vender membresía</h2>
        <div className="mt-4 space-y-3">
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Plan</span>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3"
            >
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (${p.price})
                </option>
              ))}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Nombre</span>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-3"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1.5 block font-medium text-ink-soft">Apellido</span>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-xl border border-line px-4 py-3"
              />
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1.5 block font-medium text-ink-soft">Teléfono</span>
            <input
              type="text"
              required
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full rounded-xl border border-line px-4 py-3"
            />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="accent" className="flex-1" disabled={saving || !planId}>
              {saving ? "Guardando…" : "Vender"}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
