import { z } from "zod";

const timeRegex = /^\d{2}:\d{2}$/;

export const serviceSchema = z
  .object({
    id: z.string().cuid().optional(),
    name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
    description: z.string().trim().max(500).optional().default(""),
    price: z.coerce.number().min(0, "El precio no puede ser negativo"),
    duration: z.coerce.number().int().min(5, "La duración mínima es 5 minutos"),
    color: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Color inválido"),
    imageUrl: z.string().trim().optional().or(z.literal("")),
    active: z.coerce.boolean().default(true),
    schedulingMode: z.enum(["CONSECUTIVE", "CUSTOM_FREQUENCY", "MANUAL"]),
    frequencyMinutes: z.coerce.number().int().min(1).optional(),
    manualSlots: z.array(z.string().regex(timeRegex)).optional().default([]),
    allowsParallel: z.coerce.boolean().default(false),
  })
  .superRefine((data, ctx) => {
    if (data.schedulingMode === "CUSTOM_FREQUENCY" && !data.frequencyMinutes) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["frequencyMinutes"],
        message: "Indicá cada cuántos minutos se repiten los turnos",
      });
    }
    if (data.schedulingMode === "MANUAL" && data.manualSlots.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["manualSlots"],
        message: "Agregá al menos un horario manual",
      });
    }
  });

export type ServiceInput = z.infer<typeof serviceSchema>;

export const businessHoursSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  openTime: z.string().regex(timeRegex),
  closeTime: z.string().regex(timeRegex),
  isClosed: z.boolean(),
});

export const breakTimeSchema = z.object({
  id: z.string().cuid().optional(),
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(timeRegex),
  endTime: z.string().regex(timeRegex),
  label: z.string().trim().min(1).max(60),
});

export const blockedDateSchema = z.object({
  id: z.string().cuid().optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  reason: z.string().trim().min(1).max(200),
  type: z.enum(["HOLIDAY", "VACATION", "MANUAL_BLOCK"]),
});
