// Mercado Pago Checkout Pro integration — creates a payment preference and
// returns its checkout URL. Gated behind MERCADOPAGO_ACCESS_TOKEN; without it,
// throws a clear "not configured" error rather than failing silently.
//
// NOT verified against a live Mercado Pago account — this follows the
// documented Checkout Preferences API (POST /checkout/preferences) as of
// this writing, but test it against your own sandbox credentials
// (https://www.mercadopago.com.uy/developers) before relying on it.

export interface PaymentLinkRequest {
  bookingId: string;
  title: string;
  price: number;
  payerEmail?: string;
  successUrl: string;
}

export function isMercadoPagoConfigured(): boolean {
  return Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN);
}

export async function createMercadoPagoLink(request: PaymentLinkRequest): Promise<string> {
  const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error(
      "Mercado Pago no está configurado. Definí MERCADOPAGO_ACCESS_TOKEN en el .env con tu access token de https://www.mercadopago.com.uy/developers/panel/app.",
    );
  }

  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          title: request.title,
          quantity: 1,
          unit_price: request.price,
          currency_id: "UYU",
        },
      ],
      payer: request.payerEmail ? { email: request.payerEmail } : undefined,
      external_reference: request.bookingId,
      back_urls: {
        success: request.successUrl,
        failure: request.successUrl,
        pending: request.successUrl,
      },
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Mercado Pago rechazó la solicitud (${response.status}): ${body}`);
  }

  const data = (await response.json()) as { init_point?: string };
  if (!data.init_point) throw new Error("Mercado Pago no devolvió un link de pago");
  return data.init_point;
}
