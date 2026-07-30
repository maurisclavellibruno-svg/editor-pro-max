"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { createTransaction, deleteTransaction } from "@/actions/transactions";

type ManualEntryMethod = "CASH" | "TRANSFER" | "MERCADO_PAGO" | "DEBIT" | "CREDIT";
type PaymentMethod = ManualEntryMethod | "MEMBERSHIP_CREDIT" | "GIFT_CARD";

interface Transaction {
  id: string;
  type: "INCOME" | "EXPENSE";
  amount: number;
  method: PaymentMethod | null;
  description: string;
  date: string;
}

const MANUAL_ENTRY_METHOD_LABELS: Record<ManualEntryMethod, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  MERCADO_PAGO: "Mercado Pago",
  DEBIT: "Débito",
  CREDIT: "Crédito",
};

// Manual entries only ever use the methods above — membership credits and
// gift cards are booking-specific payment flows recorded elsewhere — but
// this covers every PaymentMethod value in case one ever shows up here
// (e.g. edited directly in the database), for display purposes only.
const METHOD_LABELS: Record<PaymentMethod, string> = {
  ...MANUAL_ENTRY_METHOD_LABELS,
  MEMBERSHIP_CREDIT: "Crédito de membresía",
  GIFT_CARD: "Gift card",
};

export function TransactionsLedger({ transactions }: { transactions: Transaction[] }) {
  const [list, setList] = useState(transactions);
  const [form, setForm] = useState({
    type: "EXPENSE" as "INCOME" | "EXPENSE",
    amount: "",
    method: "CASH" as ManualEntryMethod,
    description: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    await createTransaction(form);
    setList([
      {
        id: crypto.randomUUID(),
        type: form.type,
        amount: Number(form.amount),
        method: form.method,
        description: form.description,
        date: form.date,
      },
      ...list,
    ]);
    setForm({ ...form, amount: "", description: "" });
    setSaving(false);
  }

  async function handleDelete(id: string) {
    await deleteTransaction(id);
    setList(list.filter((t) => t.id !== id));
  }

  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-muted">
        Movimientos manuales (ingresos y egresos)
      </h2>

      <form onSubmit={handleSubmit} className="mb-6 flex flex-wrap items-end gap-2 border-b border-line pb-6">
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as "INCOME" | "EXPENSE" })}
          className="rounded-xl border border-line px-3 py-2 text-sm"
        >
          <option value="EXPENSE">Egreso</option>
          <option value="INCOME">Ingreso</option>
        </select>
        <input
          type="date"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="rounded-xl border border-line px-3 py-2 text-sm"
        />
        <input
          type="number"
          step="0.01"
          required
          placeholder="Monto"
          value={form.amount}
          onChange={(e) => setForm({ ...form, amount: e.target.value })}
          className="w-28 rounded-xl border border-line px-3 py-2 text-sm"
        />
        <select
          value={form.method}
          onChange={(e) => setForm({ ...form, method: e.target.value as ManualEntryMethod })}
          className="rounded-xl border border-line px-3 py-2 text-sm"
        >
          {Object.entries(MANUAL_ENTRY_METHOD_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <input
          type="text"
          required
          placeholder="Descripción"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="min-w-[160px] flex-1 rounded-xl border border-line px-3 py-2 text-sm"
        />
        <Button type="submit" size="sm" variant="accent" disabled={saving}>
          + Agregar
        </Button>
      </form>

      <div className="space-y-2">
        {list.map((t) => (
          <div key={t.id} className="flex items-center justify-between text-sm">
            <span>
              {t.date} · {t.description}{" "}
              <span className="text-ink-muted">({t.method ? METHOD_LABELS[t.method] : "—"})</span>
            </span>
            <div className="flex items-center gap-3">
              <span className={t.type === "INCOME" ? "font-medium text-accent" : "font-medium text-red-600"}>
                {t.type === "INCOME" ? "+" : "-"}${t.amount}
              </span>
              <button className="text-red-600" onClick={() => handleDelete(t.id)}>
                Quitar
              </button>
            </div>
          </div>
        ))}
        {list.length === 0 && <p className="text-sm text-ink-muted">Sin movimientos manuales todavía.</p>}
      </div>
    </section>
  );
}
