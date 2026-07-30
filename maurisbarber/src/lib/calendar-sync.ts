import { isGoogleCalendarConfigured, syncBookingToGoogleCalendar } from "@/lib/integrations/google-calendar";

// Best-effort Google Calendar mirror for a newly created booking. Never
// throws — the database is the source of truth, this is a convenience sync
// for barbers who want their bookings alongside their personal calendar.
export async function syncBookingBestEffort(title: string, description: string, startAt: Date, endAt: Date) {
  if (!isGoogleCalendarConfigured()) return;
  try {
    await syncBookingToGoogleCalendar({ title, description, startAt, endAt });
  } catch (err) {
    console.error("[google-calendar] sync failed", err);
  }
}
