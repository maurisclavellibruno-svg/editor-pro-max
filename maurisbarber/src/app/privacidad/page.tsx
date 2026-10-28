import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de privacidad — MaurisBarber",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-20">
      <Link href="/" className="text-sm font-medium text-ink-muted hover:text-ink">
        ← Volver al inicio
      </Link>
      <h1 className="font-display mt-6 text-3xl font-semibold tracking-tight text-ink">
        Política de privacidad
      </h1>
      <p className="mt-2 text-sm text-ink-muted">Última actualización: {new Date().toLocaleDateString("es-UY")}</p>

      <div className="mt-8 space-y-6 text-ink-soft">
        <section>
          <h2 className="font-semibold text-ink">Qué datos recolectamos</h2>
          <p className="mt-2">
            Cuando reservás un turno en maurisbarber.tech recolectamos tu nombre, apellido, teléfono y,
            si lo indicás, tu email. Si dejás una reseña, guardamos el nombre y el texto que escribas.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-ink">Para qué los usamos</h2>
          <p className="mt-2">
            Usamos estos datos exclusivamente para gestionar tus turnos: confirmarlos, recordártelos, y
            contactarte por WhatsApp o email si hace falta coordinar algo relacionado a tu reserva. No
            vendemos ni compartimos tus datos con terceros con fines publicitarios.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-ink">Con quién los compartimos</h2>
          <p className="mt-2">
            Solo con los proveedores que necesitamos para operar la web: el proveedor de hosting que aloja
            el sitio, y el proveedor de email (Resend) que envía las confirmaciones y recordatorios.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-ink">Tus derechos</h2>
          <p className="mt-2">
            Podés pedirnos en cualquier momento que te mostremos, corrijamos o eliminemos tus datos,
            escribiéndonos por WhatsApp o a nuestro email de contacto.
          </p>
        </section>

        <section>
          <h2 className="font-semibold text-ink">Contacto</h2>
          <p className="mt-2">MaurisBarber — Montevideo, Uruguay. Teléfono: 098 341 762.</p>
        </section>
      </div>
    </main>
  );
}
