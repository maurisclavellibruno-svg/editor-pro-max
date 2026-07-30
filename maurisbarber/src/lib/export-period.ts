import { NextRequest } from "next/server";
import type { Period } from "@/lib/period";
import { getRangeForPeriod } from "@/lib/period";

export function parsePeriodFromRequest(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = (searchParams.get("period") as Period) || "month";
  const dateParam = searchParams.get("date");
  const reference = dateParam ? new Date(dateParam + "T00:00:00") : new Date();
  return { period, range: getRangeForPeriod(period, reference) };
}
