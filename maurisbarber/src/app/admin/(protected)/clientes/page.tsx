import Link from "next/link";
import { searchCustomers } from "@/lib/crm";

export const dynamic = "force-dynamic";

export default async function ClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const customers = await searchCustomers(q);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-ink">Clientes</h1>
      </div>

      <form method="get" className="mb-6">
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder="Buscar por nombre, teléfono o email…"
          className="w-full max-w-md rounded-xl border border-line bg-white px-4 py-3 text-sm outline-none focus:border-accent"
        />
      </form>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Teléfono</th>
              <th className="px-5 py-3">Visitas</th>
              <th className="px-5 py-3">Última visita</th>
              <th className="px-5 py-3">Total gastado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-surface-alt">
                <td className="px-5 py-3">
                  <Link href={`/admin/clientes/${c.id}`} className="font-medium text-ink hover:text-accent">
                    {c.firstName} {c.lastName}
                  </Link>
                </td>
                <td className="px-5 py-3 text-ink-muted">{c.phone}</td>
                <td className="px-5 py-3 text-ink-muted">{c.stats.visitCount}</td>
                <td className="px-5 py-3 text-ink-muted">
                  {c.stats.lastVisitAt
                    ? c.stats.lastVisitAt.toLocaleDateString("es-UY")
                    : "—"}
                </td>
                <td className="px-5 py-3 font-medium text-ink">${c.stats.totalSpent}</td>
              </tr>
            ))}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-muted">
                  No se encontraron clientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
