import { NextRequest, NextResponse } from "next/server";
import { sendDueReviewRequests } from "@/lib/reviewRequests";

// Same pattern as /api/cron/reminders.
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (secret) {
    const provided = request.headers.get("authorization")?.replace("Bearer ", "");
    if (provided !== secret) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }
  }

  const sent = await sendDueReviewRequests();
  return NextResponse.json({ sent });
}
