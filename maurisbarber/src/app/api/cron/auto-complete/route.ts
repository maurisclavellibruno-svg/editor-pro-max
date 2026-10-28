import { NextRequest, NextResponse } from "next/server";
import { autoCompletePastBookings } from "@/lib/autoComplete";

// Same pattern as /api/cron/reminders — called periodically from
// instrumentation.ts, or by an external cron if preferred.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = request.headers.get("authorization")?.replace("Bearer ", "");
    if (provided !== secret) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const completed = await autoCompletePastBookings();
  return NextResponse.json({ completed });
}
