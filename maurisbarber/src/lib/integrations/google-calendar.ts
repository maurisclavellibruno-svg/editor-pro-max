// Google Calendar sync — mirrors a booking into a Google Calendar so the
// barber can see it alongside their personal calendar. Gated behind
// GOOGLE_CALENDAR_CLIENT_ID/SECRET/REFRESH_TOKEN/CALENDAR_ID.
//
// NOT verified against a live Google account — this follows the documented
// OAuth2 token-refresh flow and Calendar API v3 (POST /calendars/{id}/events)
// as of this writing. To set it up: create OAuth2 credentials in
// https://console.cloud.google.com/apis/credentials, enable the Calendar
// API, and generate a refresh token for the barber's Google account (e.g.
// via Google's OAuth Playground) with the
// https://www.googleapis.com/auth/calendar scope.
//
// This is called best-effort from booking creation — failures are logged,
// never block the booking itself, since the calendar sync is a convenience,
// not the source of truth (the database is).

export function isGoogleCalendarConfigured(): boolean {
  return Boolean(
    process.env.GOOGLE_CALENDAR_CLIENT_ID &&
      process.env.GOOGLE_CALENDAR_CLIENT_SECRET &&
      process.env.GOOGLE_CALENDAR_REFRESH_TOKEN &&
      process.env.GOOGLE_CALENDAR_ID,
  );
}

async function getAccessToken(): Promise<string> {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CALENDAR_CLIENT_ID!,
    client_secret: process.env.GOOGLE_CALENDAR_CLIENT_SECRET!,
    refresh_token: process.env.GOOGLE_CALENDAR_REFRESH_TOKEN!,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });

  if (!response.ok) {
    throw new Error(`No se pudo renovar el token de Google (${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Google no devolvió un access token");
  return data.access_token;
}

export interface CalendarEvent {
  title: string;
  description?: string;
  startAt: Date;
  endAt: Date;
}

/** Creates the event and returns its Google event ID (store it if you need to update/delete it later). */
export async function syncBookingToGoogleCalendar(event: CalendarEvent): Promise<string> {
  if (!isGoogleCalendarConfigured()) {
    throw new Error("Google Calendar no está configurado (ver GOOGLE_CALENDAR_* en .env.example)");
  }

  const accessToken = await getAccessToken();
  const calendarId = process.env.GOOGLE_CALENDAR_ID!;

  const response = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: event.title,
        description: event.description,
        start: { dateTime: event.startAt.toISOString() },
        end: { dateTime: event.endAt.toISOString() },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Google Calendar rechazó el evento (${response.status}): ${await response.text()}`);
  }

  const data = (await response.json()) as { id?: string };
  if (!data.id) throw new Error("Google Calendar no devolvió un id de evento");
  return data.id;
}
