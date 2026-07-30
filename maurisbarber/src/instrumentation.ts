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

  setInterval(
    () => {
      fetch(`${baseUrl}/api/cron/reminders`, {
        headers: secret ? { authorization: `Bearer ${secret}` } : undefined,
      }).catch((err) => console.error("[reminders] scan failed", err));
    },
    intervalMinutes * 60 * 1000,
  );
}
