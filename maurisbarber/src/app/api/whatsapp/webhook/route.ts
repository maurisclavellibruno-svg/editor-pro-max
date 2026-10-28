import { NextRequest, NextResponse } from "next/server";

// Meta calls this with a GET request to verify the webhook URL when you
// register it in the app dashboard: it must echo back `hub.challenge`
// exactly, but only after confirming `hub.verify_token` matches the secret
// you typed into Meta's "Token de verificación" field.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new NextResponse(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Verificación fallida" }, { status: 403 });
}

// Incoming message/status events land here once the webhook is active.
// We don't need to act on them for confirmations/reminders (those are
// sent from the admin panel, not triggered by replies) — just acknowledge
// so Meta doesn't retry or disable the subscription.
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  console.log("[whatsapp-webhook] event received", JSON.stringify(body));
  return NextResponse.json({ ok: true });
}
