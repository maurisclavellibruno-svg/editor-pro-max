import { NextRequest, NextResponse } from "next/server";
import { resetExpiredLoyaltyCards } from "@/lib/loyaltyCardExpiry";

// Same pattern as /api/cron/reminders and /api/cron/auto-complete.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = request.headers.get("authorization")?.replace("Bearer ", "");
    if (provided !== secret) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const reset = await resetExpiredLoyaltyCards();
  return NextResponse.json({ reset });
}
