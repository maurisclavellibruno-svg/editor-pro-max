import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Términos de servicio — MaurisBarber",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <Link href="/" className="text-sm font-medium text-ink-muted hover:text-ink">
        ← Volver al inicio
      </Link>
      <h1 className="font-display mt-6 text-3xl font-semibold tracking-tight text-ink">
        Términos de servicio
      </h1>
      <p className="mt-2 text-sm text-ink-muted">Última actualización: {new Date().toLocaleDateString("es-UY")}</p>

      <div className="mt-8 space-y-6 text-ink-soft">
        <section>
          <h2 className="font-semibold text-ink">Reservas</h2>
          <p className="mt-2">
            Al reservar un turno en maurisbarber.tech confirmás los datos de contacto que dejás
            (nombre, teléfono y, opcionalmente, email) para que podamos gestionar tu cita.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-ink">Pagos</h2>
          <p className="mt-2">
            El pago se realiza en el local al finalizar el servicio. Los precios mostrados en la web
            pueden cambiar sin previo aviso.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-ink">Cancelaciones</h2>
          <p className="mt-2">
            Podés cancelar o reprogramar tu turno escribiéndonos por WhatsApp con la mayor anticipación
            posible.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-ink">Contacto</h2>
          <p className="mt-2">MaurisBarber — Montevideo, Uruguay. Teléfono: 091 552 626.</p>
        </section>
      </div>
    </main>
  );
}
