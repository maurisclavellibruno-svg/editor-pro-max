import { NextRequest, NextResponse } from "next/server";
import { sendDueReminders } from "@/lib/reminders";

// Alternative to the in-process interval in instrumentation.ts: an external
// cron (host crontab, uptime monitor, etc.) can hit this endpoint instead.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = request.headers.get("authorization")?.replace("Bearer ", "");
    if (provided !== secret) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const sent = await sendDueReminders();
  return NextResponse.json({ sent });
}
