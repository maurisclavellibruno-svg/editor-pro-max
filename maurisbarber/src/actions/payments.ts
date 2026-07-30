"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createMercadoPagoLink } from "@/lib/integrations/mercadopago";
import { createStripeCheckoutLink } from "@/lib/integrations/stripe";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

// Generates an online payment link for a booking, so staff can send it to
// the customer (WhatsApp, email) instead of collecting payment in person.
// Requires MERCADOPAGO_ACCESS_TOKEN or STRIPE_SECRET_KEY to be configured —
// see src/lib/integrations/{mercadopago,stripe}.ts for setup instructions.
export async function generatePaymentLink(bookingId: string, provider: "mercadopago" | "stripe"): Promise<string> {
  await requireAdmin();

  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include: { service: true, customer: true } });
  if (!booking) throw new Error("Turno no encontrado");

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";

  if (provider === "mercadopago") {
    return createMercadoPagoLink({
      bookingId: booking.id,
      title: `${booking.service.name} — MaurisBarber`,
      price: Number(booking.price),
      payerEmail: booking.customer.email ?? undefined,
      successUrl: `${baseUrl}/reservar`,
    });
  }

  return createStripeCheckoutLink({
    bookingId: booking.id,
    title: `${booking.service.name} — MaurisBarber`,
    price: Number(booking.price),
    successUrl: `${baseUrl}/reservar`,
    cancelUrl: `${baseUrl}/reservar`,
  });
}
