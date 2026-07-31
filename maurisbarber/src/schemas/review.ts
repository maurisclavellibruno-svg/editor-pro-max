import { z } from "zod";

export const submitReviewSchema = z.object({
  name: z.string().trim().min(1, "Ingresá tu nombre").max(80),
  rating: z.coerce.number().int().min(1, "Elegí una calificación").max(5),
  text: z.string().trim().min(10, "Contanos un poco más (mínimo 10 caracteres)").max(600),
});

export type SubmitReviewInput = z.infer<typeof submitReviewSchema>;
