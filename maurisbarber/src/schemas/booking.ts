import { z } from "zod";

export const createBookingSchema = z.object({
  serviceId: z.string().cuid(),
  employeeId: z.string().cuid().optional().or(z.literal("")),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha inválida"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "Horario inválido"),
  firstName: z.string().trim().min(1, "Ingresá tu nombre").max(80),
  lastName: z.string().trim().min(1, "Ingresá tu apellido").max(80),
  phone: z
    .string()
    .trim()
    .min(6, "Ingresá un teléfono válido")
    .max(20),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  // Sent as the literal string "true"/"false" by the checkbox in
  // BookingWizard — NOT z.coerce.boolean(), which would treat the string
  // "false" as truthy (any non-empty string coerces to true).
  joinLoyaltyCard: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  // Captured from the ad's URL (utm_source/utm_campaign/utm_content) and
  // carried through to here so which campaign drove a booking is visible in
  // its notes — see actions/booking.ts. FormData.get() returns null (not
  // undefined) for an absent field, which plain .optional() rejects — same
  // gotcha as Prisma's nullable columns, so .nullable() first.
  utmSource: z.string().trim().max(60).nullable().optional().transform((v) => v ?? ""),
  utmCampaign: z.string().trim().max(60).nullable().optional().transform((v) => v ?? ""),
  utmContent: z.string().trim().max(60).nullable().optional().transform((v) => v ?? ""),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const availabilityQuerySchema = z.object({
  serviceId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  employeeId: z.string().cuid().optional().or(z.literal("")),
});
