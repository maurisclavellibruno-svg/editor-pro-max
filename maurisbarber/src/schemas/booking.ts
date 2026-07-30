import { z } from "zod";

export const createBookingSchema = z.object({
  serviceId: z.string().cuid(),
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
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;

export const availabilityQuerySchema = z.object({
  serviceId: z.string().cuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});
