import { z } from "zod";

export const transactionSchema = z.object({
  type: z.enum(["INCOME", "EXPENSE"]),
  amount: z.coerce.number().positive("El monto debe ser mayor a 0"),
  method: z.enum(["CASH", "TRANSFER", "MERCADO_PAGO", "DEBIT", "CREDIT"]).optional(),
  description: z.string().trim().min(1, "Ingresá una descripción").max(200),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type TransactionInput = z.infer<typeof transactionSchema>;
