// Runs once when the Next.js server starts. Schedules a periodic call to
// /api/cron/reminders instead of importing the reminders/email logic
// directly — that logic depends on Node-only packages (nodemailer) which
// can't be bundled into the edge-safe instrumentation build, while a plain
// fetch() call is safe in any runtime.
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const globalForReminders = globalThis as unknown as { remindersIntervalStarted?: boolean };
  if (globalForReminders.remindersIntervalStarted) return;
  globalForReminders.remindersIntervalStarted = true;

  const intervalMinutes = Number(process.env.REMINDER_CHECK_INTERVAL_MINUTES ?? 15);
  const baseUrl = process.env.NEXTAUTH_URL ?? `http://localhost:${process.env.PORT ?? 3000}`;
  const secret = process.env.CRON_SECRET;

  // All on the same cadence — each one is a cheap scan, so there's no
  // reason to stagger them.
  const endpoints = [
    "reminders", // upcoming-booking reminder emails
    "auto-complete", // marks past bookings COMPLETED — see src/lib/autoComplete.ts
    "expire-loyalty", // resets stale loyalty-card cycles — see src/lib/loyaltyCardExpiry.ts
    "review-requests", // post-visit "leave us a review" emails — see src/lib/reviewRequests.ts
  ];

  for (const endpoint of endpoints) {
    setInterval(
      () => {
        fetch(`${baseUrl}/api/cron/${endpoint}`, {
          headers: secret ? { authorization: `Bearer ${secret}` } : undefined,
        }).catch((err) => console.error(`[${endpoint}] scan failed`, err));
      },
      intervalMinutes * 60 * 1000,
    );
  }
}
