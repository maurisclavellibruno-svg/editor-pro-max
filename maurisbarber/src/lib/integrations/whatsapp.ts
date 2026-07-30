// WhatsApp Business (Meta Cloud API) integration for sending confirmations
// and reminders. Gated behind WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID.
//
// NOT verified against a live WhatsApp Business account — this follows
// Meta's documented Cloud API (POST /{phone-number-id}/messages) as of this
// writing. Set it up at https://developers.facebook.com/docs/whatsapp/cloud-api.
//
// IMPORTANT limitation that only the business owner can resolve: Meta only
// allows free-form text messages (as sent by sendWhatsAppText below) within
// a 24-hour window after the customer last messaged you. Outside that
// window — which is the normal case for a scheduled reminder — WhatsApp
// requires a pre-approved message TEMPLATE instead. Create one in Meta
// Business Manager and pass its name via sendWhatsAppTemplate before relying
// on this for automated reminders; sendWhatsAppText alone will fail for
// business-initiated messages outside the 24h session.

export function isWhatsAppConfigured(): boolean {
  return Boolean(process.env.WHATSAPP_ACCESS_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID);
}

async function callMessagesApi(body: Record<string, unknown>): Promise<void> {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  if (!accessToken || !phoneNumberId) {
    throw new Error(
      "WhatsApp no está configurado. Definí WHATSAPP_ACCESS_TOKEN y WHATSAPP_PHONE_NUMBER_ID en el .env.",
    );
  }

  const response = await fetch(`https://graph.facebook.com/v20.0/${phoneNumberId}/messages`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ messaging_product: "whatsapp", ...body }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`WhatsApp rechazó el mensaje (${response.status}): ${errBody}`);
  }
}

/** Free-form text — only deliverable within 24h of the customer's last message. */
export async function sendWhatsAppText(toPhone: string, message: string): Promise<void> {
  await callMessagesApi({
    to: toPhone,
    type: "text",
    text: { body: message },
  });
}

/** Pre-approved template — required for business-initiated messages (reminders) outside the 24h session. */
export async function sendWhatsAppTemplate(
  toPhone: string,
  templateName: string,
  languageCode: string,
  bodyParams: string[],
): Promise<void> {
  await callMessagesApi({
    to: toPhone,
    type: "template",
    template: {
      name: templateName,
      language: { code: languageCode },
      components: bodyParams.length
        ? [{ type: "body", parameters: bodyParams.map((text) => ({ type: "text", text })) }]
        : undefined,
    },
  });
}
