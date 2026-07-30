"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { updateBookingPayment, updateBookingStatus } from "@/actions/admin-bookings";

export interface BookingEventProps {
  id: string;
  start: Date;
  end: Date;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
  paymentStatus: "UNPAID" | "PAID";
  paymentMethod: "CASH" | "TRANSFER" | "MERCADO_PAGO" | "DEBIT" | "CREDIT" | null;
  serviceName: string;
  price: number;
  customerName: string;
  customerPhone: string;
  notes: string;
}

const STATUS_LABELS: Record<BookingEventProps["status"], string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
  NO_SHOW: "Ausente",
};

const PAYMENT_METHOD_LABELS: Record<NonNullable<BookingEventProps["paymentMethod"]>, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  MERCADO_PAGO: "Mercado Pago",
  DEBIT: "Débito",
  CREDIT: "Crédito",
};

export function BookingDetailModal({
  booking,
  onClose,
  onChanged,
}: {
  booking: BookingEventProps;
  onClose: () => void;
  onChanged: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState(booking.paymentMethod ?? "CASH");

  async function setStatus(status: BookingEventProps["status"]) {
    setLoading(true);
    await updateBookingStatus({ bookingId: booking.id, status });
    setLoading(false);
    onChanged();
  }

  async function markPaid() {
    setLoading(true);
    await updateBookingPayment({ bookingId: booking.id, paymentStatus: "PAID", paymentMethod });
    setLoading(false);
    onChanged();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-floating">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-ink">{booking.customerName}</h2>
            <p className="text-sm text-ink-muted">{booking.customerPhone}</p>
          </div>
          <span className="rounded-full bg-surface-alt px-3 py-1 text-xs font-medium text-ink-soft">
            {STATUS_LABELS[booking.status]}
          </span>
        </div>

        <div className="mt-4 space-y-1 text-sm">
          <p>
            <span className="text-ink-muted">Servicio: </span>
            {booking.serviceName}
          </p>
          <p>
            <span className="text-ink-muted">Horario: </span>
            {booking.start.toLocaleString("es-UY", { dateStyle: "medium", timeStyle: "short" })} –{" "}
            {booking.end.toLocaleTimeString("es-UY", { timeStyle: "short" })}
          </p>
          <p>
            <span className="text-ink-muted">Precio: </span>${booking.price}
          </p>
          {booking.notes && (
            <p>
              <span className="text-ink-muted">Notas: </span>
              {booking.notes}
            </p>
          )}
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-2 text-sm font-semibold text-ink">Estado del turno</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="accent" disabled={loading} onClick={() => setStatus("CONFIRMED")}>
              Confirmar
            </Button>
            <Button size="sm" variant="outline" disabled={loading} onClick={() => setStatus("COMPLETED")}>
              Completado
            </Button>
            <Button size="sm" variant="outline" disabled={loading} onClick={() => setStatus("NO_SHOW")}>
              Ausente
            </Button>
            <Button size="sm" variant="outline" disabled={loading} onClick={() => setStatus("CANCELLED")}>
              Cancelar
            </Button>
          </div>
        </div>

        <div className="mt-5 border-t border-line pt-4">
          <p className="mb-2 text-sm font-semibold text-ink">Pago</p>
          {booking.paymentStatus === "PAID" ? (
            <p className="text-sm text-accent">Pagado</p>
          ) : (
            <div className="flex items-center gap-2">
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}
                className="rounded-xl border border-line px-3 py-2 text-sm"
              >
                {Object.entries(PAYMENT_METHOD_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <Button size="sm" variant="accent" disabled={loading} onClick={markPaid}>
                Marcar pagado
              </Button>
            </div>
          )}
        </div>

        <Button variant="ghost" className="mt-6 w-full" onClick={onClose}>
          Cerrar
        </Button>
      </div>
    </div>
  );
}
