"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  deleteBlockedDate,
  deleteBreakTime,
  upsertBlockedDate,
  upsertBreakTime,
  upsertBusinessHours,
} from "@/actions/schedule";

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

interface Hours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}
interface Break {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  label: string;
}
interface Block {
  id: string;
  startDate: string;
  endDate: string;
  reason: string;
  type: "HOLIDAY" | "VACATION" | "MANUAL_BLOCK";
}

export function HoursManager({
  hours,
  breaks,
  blocks,
}: {
  hours: Hours[];
  breaks: Break[];
  blocks: Block[];
}) {
  return (
    <div className="space-y-10">
      <h1 className="text-2xl font-semibold text-ink">Horarios</h1>
      <BusinessHoursSection hours={hours} />
      <BreaksSection breaks={breaks} />
      <BlocksSection blocks={blocks} />
    </div>
  );
}

function BusinessHoursSection({ hours }: { hours: Hours[] }) {
  const [rows, setRows] = useState(
    Array.from({ length: 7 }, (_, dayOfWeek) => {
      const existing = hours.find((h) => h.dayOfWeek === dayOfWeek);
      return existing ?? { dayOfWeek, openTime: "09:00", closeTime: "19:00", isClosed: true };
    }),
  );
  const [saving, setSaving] = useState<number | null>(null);

  async function save(row: Hours) {
    setSaving(row.dayOfWeek);
    await upsertBusinessHours(row);
    setSaving(null);
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-muted">
        Horario de apertura y cierre
      </h2>
      <div className="divide-y divide-line rounded-2xl border border-line bg-white shadow-card">
        {rows.map((row, i) => (
          <div key={row.dayOfWeek} className="flex flex-wrap items-center gap-3 px-5 py-4">
            <span className="w-28 text-sm font-medium text-ink">{DAY_NAMES[row.dayOfWeek]}</span>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!row.isClosed}
                onChange={(e) => {
                  const next = [...rows];
                  next[i] = { ...row, isClosed: !e.target.checked };
                  setRows(next);
                }}
              />
              Abierto
            </label>
            {!row.isClosed && (
              <>
                <input
                  type="time"
                  value={row.openTime}
                  onChange={(e) => {
                    const next = [...rows];
                    next[i] = { ...row, openTime: e.target.value };
                    setRows(next);
                  }}
                  className="rounded-xl border border-line px-3 py-2 text-sm"
                />
                <span className="text-ink-muted">a</span>
                <input
                  type="time"
                  value={row.closeTime}
                  onChange={(e) => {
                    const next = [...rows];
                    next[i] = { ...row, closeTime: e.target.value };
                    setRows(next);
                  }}
                  className="rounded-xl border border-line px-3 py-2 text-sm"
                />
              </>
            )}
            <Button
              size="sm"
              variant="outline"
              className="ml-auto"
              onClick={() => save(row)}
              disabled={saving === row.dayOfWeek}
            >
              {saving === row.dayOfWeek ? "Guardando…" : "Guardar"}
            </Button>
          </div>
        ))}
      </div>
    </section>
  );
}

function BreaksSection({ breaks }: { breaks: Break[] }) {
  const [list, setList] = useState(breaks);
  const [form, setForm] = useState({ dayOfWeek: 2, startTime: "13:00", endTime: "14:00", label: "Almuerzo" });

  async function add() {
    await upsertBreakTime(form);
    setList([...list, { ...form, id: crypto.randomUUID() }]);
  }

  async function remove(id: string) {
    await deleteBreakTime(id);
    setList(list.filter((b) => b.id !== id));
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-muted">
        Descansos y almuerzo
      </h2>
      <div className="space-y-2 rounded-2xl border border-line bg-white p-5 shadow-card">
        {list.map((b) => (
          <div key={b.id} className="flex items-center justify-between text-sm">
            <span>
              {DAY_NAMES[b.dayOfWeek]}: {b.startTime}–{b.endTime} ({b.label})
            </span>
            <button className="text-red-600" onClick={() => remove(b.id)}>
              Quitar
            </button>
          </div>
        ))}
        <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-line pt-4">
          <select
            value={form.dayOfWeek}
            onChange={(e) => setForm({ ...form, dayOfWeek: Number(e.target.value) })}
            className="rounded-xl border border-line px-3 py-2 text-sm"
          >
            {DAY_NAMES.map((name, i) => (
              <option key={name} value={i}>
                {name}
              </option>
            ))}
          </select>
          <input
            type="time"
            value={form.startTime}
            onChange={(e) => setForm({ ...form, startTime: e.target.value })}
            className="rounded-xl border border-line px-3 py-2 text-sm"
          />
          <input
            type="time"
            value={form.endTime}
            onChange={(e) => setForm({ ...form, endTime: e.target.value })}
            className="rounded-xl border border-line px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={form.label}
            onChange={(e) => setForm({ ...form, label: e.target.value })}
            placeholder="Etiqueta"
            className="w-32 rounded-xl border border-line px-3 py-2 text-sm"
          />
          <Button size="sm" variant="accent" onClick={add}>
            + Agregar
          </Button>
        </div>
      </div>
    </section>
  );
}

function BlocksSection({ blocks }: { blocks: Block[] }) {
  const [list, setList] = useState(blocks);
  const [form, setForm] = useState<Omit<Block, "id">>({
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date().toISOString().slice(0, 10),
    reason: "",
    type: "MANUAL_BLOCK",
  });

  async function add() {
    await upsertBlockedDate(form);
    setList([{ ...form, id: crypto.randomUUID() }, ...list]);
  }

  async function remove(id: string) {
    await deleteBlockedDate(id);
    setList(list.filter((b) => b.id !== id));
  }

  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-ink-muted">
        Días libres, vacaciones y feriados
      </h2>
      <div className="space-y-2 rounded-2xl border border-line bg-white p-5 shadow-card">
        {list.map((b) => (
          <div key={b.id} className="flex items-center justify-between text-sm">
            <span>
              {b.startDate} → {b.endDate}: {b.reason}{" "}
              <span className="text-ink-muted">
                ({b.type === "HOLIDAY" ? "Feriado" : b.type === "VACATION" ? "Vacaciones" : "Bloqueo manual"})
              </span>
            </span>
            <button className="text-red-600" onClick={() => remove(b.id)}>
              Quitar
            </button>
          </div>
        ))}
        <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-line pt-4">
          <input
            type="date"
            value={form.startDate}
            onChange={(e) => setForm({ ...form, startDate: e.target.value })}
            className="rounded-xl border border-line px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={form.endDate}
            onChange={(e) => setForm({ ...form, endDate: e.target.value })}
            className="rounded-xl border border-line px-3 py-2 text-sm"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value as Block["type"] })}
            className="rounded-xl border border-line px-3 py-2 text-sm"
          >
            <option value="MANUAL_BLOCK">Bloqueo manual</option>
            <option value="HOLIDAY">Feriado</option>
            <option value="VACATION">Vacaciones</option>
          </select>
          <input
            type="text"
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            placeholder="Motivo"
            className="w-40 rounded-xl border border-line px-3 py-2 text-sm"
          />
          <Button size="sm" variant="accent" onClick={add}>
            + Agregar
          </Button>
        </div>
      </div>
    </section>
  );
}
