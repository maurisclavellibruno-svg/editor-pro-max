import { getInactiveCustomers } from "@/lib/crm";
import { getBarbershop } from "@/lib/data";
import { normalizeUyPhone, whatsappHref } from "@/lib/whatsapp";

export const dynamic = "force-dynamic";

export default async function InactivosPage({
  searchParams,
}: {
  searchParams: Promise<{ dias?: string }>;
}) {
  const { dias } = await searchParams;
  const minDays = Number(dias) > 0 ? Number(dias) : 30;
  const [customers, shop] = await Promise.all([getInactiveCustomers(minDays), getBarbershop()]);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Clientes inactivos</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Clientes que ya se agendaron antes pero no volvieron a reservar en un tiempo. Ofreceles un
          descuento para que vuelvan.
        </p>
      </div>

      <form method="get" className="mb-6 flex items-center gap-3">
        <label className="text-sm text-ink-soft">
          Mostrar los que no vienen hace más de{" "}
          <select
            name="dias"
            defaultValue={String(minDays)}
            className="rounded-xl border border-line bg-white px-3 py-2 text-sm"
          >
            <option value="14">14 días</option>
            <option value="30">30 días</option>
            <option value="45">45 días</option>
            <option value="60">60 días</option>
            <option value="90">90 días</option>
          </select>
        </label>
        <button type="submit" className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-white hover:bg-black">
          Filtrar
        </button>
      </form>

      <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-card">
        <table className="w-full text-sm">
          <thead className="bg-surface-alt text-left text-xs uppercase tracking-wider text-ink-muted">
            <tr>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Teléfono</th>
              <th className="px-5 py-3">Último turno</th>
              <th className="px-5 py-3">Sin reservar hace</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {customers.map((c) => {
              const message = `Hola ${c.firstName}! Hace rato no te vemos por ${shop.name} y te extrañamos. Te queremos regalar un 10% de descuento en tu próximo corte — ¿reservamos?`;
              return (
                <tr key={c.id} className="hover:bg-surface-alt">
                  <td className="px-5 py-3 font-medium text-ink">
                    {c.firstName} {c.lastName}
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{c.phone}</td>
                  <td className="px-5 py-3 text-ink-muted">
                    {c.lastBookingAt?.toLocaleDateString("es-UY")}
                  </td>
                  <td className="px-5 py-3 font-medium text-ink">{c.daysSinceLastVisit} días</td>
                  <td className="px-5 py-3 text-right">
                    <a
                      href={whatsappHref(normalizeUyPhone(c.phone), message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-full bg-[#25D366] px-4 py-2 text-xs font-medium text-white hover:opacity-90"
                    >
                      Ofrecer 10% por WhatsApp
                    </a>
                  </td>
                </tr>
              );
            })}
            {customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-ink-muted">
                  No hay clientes inactivos con ese filtro — buena señal.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
