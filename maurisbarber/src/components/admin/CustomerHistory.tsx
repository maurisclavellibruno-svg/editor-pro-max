interface HistoryEntry {
  id: string;
  serviceName: string;
  startAt: Date;
  price: number;
  paymentMethod: string | null;
  status: string;
}

const PAYMENT_LABELS: Record<string, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  MERCADO_PAGO: "Mercado Pago",
  DEBIT: "Débito",
  CREDIT: "Crédito",
};

export function CustomerHistory({ bookings }: { bookings: HistoryEntry[] }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-6 shadow-card">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-ink-muted">
        Historial completo
      </h2>
      {bookings.length === 0 ? (
        <p className="text-sm text-ink-muted">Sin turnos registrados todavía.</p>
      ) : (
        <div className="divide-y divide-line">
          {bookings.map((b) => (
            <div key={b.id} className="flex items-center justify-between py-3 text-sm">
              <div>
                <p className="font-medium text-ink">{b.serviceName}</p>
                <p className="text-ink-muted">
                  {b.startAt.toLocaleString("es-UY", { dateStyle: "medium", timeStyle: "short" })}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium text-ink">${b.price}</p>
                <p className="text-ink-muted">
                  {b.status}
                  {b.paymentMethod ? ` · ${PAYMENT_LABELS[b.paymentMethod]}` : ""}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
