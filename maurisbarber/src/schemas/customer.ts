import { z } from "zod";

const optionalText = z.string().trim().max(1000).optional().or(z.literal(""));

export const customerContactSchema = z.object({
  id: z.string().cuid(),
  firstName: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  lastName: z.string().trim().min(1, "El apellido es obligatorio").max(80),
  phone: z.string().trim().min(6, "Teléfono inválido").max(20),
  email: z.string().trim().email("Email inválido").optional().or(z.literal("")),
  instagram: z.string().trim().max(60).optional().or(z.literal("")),
  birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
});

export type CustomerContactInput = z.infer<typeof customerContactSchema>;

export const customerNotesSchema = z.object({
  id: z.string().cuid(),
  favoriteCut: optionalText,
  beardPreference: optionalText,
  musicPreference: optionalText,
  likesToTalk: z.enum(["true", "false", "unknown"]).optional(),
  productsUsed: optionalText,
  hairColor: optionalText,
  generalPreferences: optionalText,
  likedNotes: optionalText,
  dislikedNotes: optionalText,
  notes: optionalText,
});

export type CustomerNotesInput = z.infer<typeof customerNotesSchema>;
