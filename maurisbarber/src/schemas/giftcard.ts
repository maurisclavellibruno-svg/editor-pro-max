import { z } from "zod";

export const issueGiftCardSchema = z.object({
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  customerPhone: z.string().trim().optional().or(z.literal("")),
  expiresAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
});

export type IssueGiftCardInput = z.infer<typeof issueGiftCardSchema>;
