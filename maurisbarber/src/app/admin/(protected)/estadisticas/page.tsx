import { getRangeForPeriod, type Period } from "@/lib/period";
import { getDashboardStats } from "@/lib/stats";
import { prisma } from "@/lib/prisma";
import { StatsDashboard } from "@/components/admin/StatsDashboard";
import { TransactionsLedger } from "@/components/admin/TransactionsLedger";

export const dynamic = "force-dynamic";

export default async function EstadisticasPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string; date?: string }>;
}) {
  const { period: rawPeriod, date } = await searchParams;
  const period: Period = (["day", "week", "month", "year"].includes(rawPeriod ?? "")
    ? rawPeriod
    : "month") as Period;
  const reference = date ? new Date(date + "T00:00:00") : new Date();
  const range = getRangeForPeriod(period, reference);

  const [fullStats, transactions] = await Promise.all([
    getDashboardStats(range),
    prisma.transaction.findMany({ orderBy: { date: "desc" }, take: 20 }),
  ]);
  // Drop `range` (Date objects) before passing to the client component.
  const stats = { ...fullStats, range: undefined };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-ink">Estadísticas y finanzas</h1>
      <StatsDashboard period={period} stats={stats} />
      <TransactionsLedger
        transactions={transactions.map((t) => ({
          id: t.id,
          type: t.type,
          amount: Number(t.amount),
          method: t.method,
          description: t.description,
          date: t.date.toISOString().slice(0, 10),
        }))}
      />
    </div>
  );
}
