// Stripe Checkout Session integration via the raw REST API (no SDK
// dependency, to keep this optional feature from adding weight to the
// production bundle). Gated behind STRIPE_SECRET_KEY.
//
// NOT verified against a live Stripe account — this follows Stripe's
// documented Checkout Sessions API (POST /v1/checkout/sessions, form-encoded
// body) as of this writing, but test it against your own test-mode keys
// (https://dashboard.stripe.com/test/apikeys) before relying on it.

export interface PaymentLinkRequest {
  bookingId: string;
  title: string;
  price: number;
  successUrl: string;
  cancelUrl: string;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function createStripeCheckoutLink(request: PaymentLinkRequest): Promise<string> {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "Stripe no está configurado. Definí STRIPE_SECRET_KEY en el .env con tu clave secreta de https://dashboard.stripe.com/apikeys.",
    );
  }

  const currency = process.env.STRIPE_CURRENCY ?? "uyu";
  const body = new URLSearchParams({
    mode: "payment",
    success_url: request.successUrl,
    cancel_url: request.cancelUrl,
    "line_items[0][price_data][currency]": currency,
    "line_items[0][price_data][product_data][name]": request.title,
    "line_items[0][price_data][unit_amount]": String(Math.round(request.price * 100)),
    "line_items[0][quantity]": "1",
    "metadata[bookingId]": request.bookingId,
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`Stripe rechazó la solicitud (${response.status}): ${errBody}`);
  }

  const data = (await response.json()) as { url?: string };
  if (!data.url) throw new Error("Stripe no devolvió una URL de checkout");
  return data.url;
}
