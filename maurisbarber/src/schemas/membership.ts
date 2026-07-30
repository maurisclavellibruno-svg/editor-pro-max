import { z } from "zod";

export const membershipPlanSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  description: z.string().trim().max(500).optional().default(""),
  price: z.coerce.number().min(0),
  credits: z.coerce.number().int().min(1, "Debe incluir al menos 1 crédito"),
  validityDays: z.coerce.number().int().min(1, "La vigencia debe ser de al menos 1 día"),
  active: z.coerce.boolean().default(true),
});

export type MembershipPlanInput = z.infer<typeof membershipPlanSchema>;

export const sellMembershipSchema = z.object({
  planId: z.string().cuid(),
  customerPhone: z.string().trim().min(6, "Teléfono inválido"),
  firstName: z.string().trim().min(1),
  lastName: z.string().trim().min(1),
});

export type SellMembershipInput = z.infer<typeof sellMembershipSchema>;
