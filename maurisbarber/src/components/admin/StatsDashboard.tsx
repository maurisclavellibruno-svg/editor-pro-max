"use client";

import Link from "next/link";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { Period } from "@/lib/period";
import type { DashboardStats } from "@/lib/stats";

const PERIOD_LABELS: Record<Period, string> = {
  day: "Hoy",
  week: "Semana",
  month: "Mes",
  year: "Año",
};

interface Props {
  period: Period;
  stats: Omit<DashboardStats, "range">;
}

export function StatsDashboard({ period, stats }: Props) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-1 rounded-full border border-line bg-white p-1">
          {(Object.keys(PERIOD_LABELS) as Period[]).map((p) => (
            <Link
              key={p}
              href={`/admin/estadisticas?period=${p}`}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                p === period ? "bg-ink text-white" : "text-ink-muted hover:bg-surface-alt"
              }`}
            >
              {PERIOD_LABELS[p]}
            </Link>
          ))}
        </div>
        <div className="flex gap-2">
          <a
            href={`/api/admin/export/excel?period=${period}`}
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-surface-alt"
          >
            Exportar Excel
          </a>
          <a
            href={`/api/admin/export/pdf?period=${period}`}
            className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink hover:bg-surface-alt"
          >
            Exportar PDF
          </a>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Kpi label="Ingresos reales" value={`$${round(stats.realRevenue)}`} accent />
        <Kpi label="Ingresos esperados" value={`$${round(stats.expectedRevenue)}`} />
        <Kpi label="Egresos" value={`$${round(stats.expenses)}`} />
        <Kpi
          label="Ganancia"
          value={`$${round(stats.profit)}`}
          accent={stats.profit >= 0}
          negative={stats.profit < 0}
        />
        <Kpi label="Ticket promedio" value={`$${round(stats.averageTicket)}`} />
        <Kpi label="Turnos completados" value={`${stats.completedCount}`} />
        <Kpi label="Cancelaciones" value={`${stats.cancelledCount}`} />
        <Kpi label="Ausencias" value={`${stats.noShowCount}`} />
        <Kpi label="Clientes nuevos" value={`${stats.newCustomers}`} />
        <Kpi label="Clientes recurrentes" value={`${stats.returningCustomers}`} />
        <Kpi label="Ocupación" value={`${Math.round(stats.occupancyPercent)}%`} />
        <Kpi label="Horas trabajadas" value={`${Math.round(stats.hoursWorked)}h`} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Ingresos por día
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.revenueByDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e3" />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`$${value}`, "Ingresos"]} />
              <Bar dataKey="revenue" fill="#16a34a" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-muted">
            Ingresos por servicio
          </h2>
          <div className="space-y-3">
            {stats.revenueByService.map((s) => (
              <div key={s.serviceName} className="flex items-center justify-between text-sm">
                <span className="text-ink">
                  {s.serviceName} <span className="text-ink-muted">({s.count})</span>
                </span>
                <span className="font-medium text-ink">${round(s.revenue)}</span>
              </div>
            ))}
            {stats.revenueByService.length === 0 && (
              <p className="text-sm text-ink-muted">Sin datos en este período.</p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-line bg-white p-6 shadow-card">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-muted">
          Ranking de clientes que más gastan
        </h2>
        <div className="space-y-2">
          {stats.topCustomers.map((c, i) => (
            <div key={c.name + i} className="flex items-center justify-between text-sm">
              <span className="text-ink">
                <span className="mr-2 text-ink-muted">#{i + 1}</span>
                {c.name}
              </span>
              <span className="font-medium text-ink">${round(c.totalSpent)}</span>
            </div>
          ))}
          {stats.topCustomers.length === 0 && (
            <p className="text-sm text-ink-muted">Todavía no hay pagos registrados.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  accent,
  negative,
}: {
  label: string;
  value: string;
  accent?: boolean;
  negative?: boolean;
}) {
  const color = negative ? "text-red-600" : accent ? "text-accent" : "text-ink";
  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      <p className="text-xs font-medium text-ink-muted">{label}</p>
      <p className={`mt-1 text-xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function round(n: number) {
  return Math.round(n).toLocaleString("es-UY");
}
