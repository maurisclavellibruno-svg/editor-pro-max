import { z } from "zod";

export const joinLoyaltyCardSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  lastName: z.string().trim().min(1, "El apellido es obligatorio").max(80),
  phone: z.string().trim().min(6, "Teléfono inválido").max(20),
});

export type JoinLoyaltyCardInput = z.infer<typeof joinLoyaltyCardSchema>;
