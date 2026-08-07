import { z } from "zod";

export const productSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(100),
  description: z.string().trim().max(500).optional().default(""),
  price: z.coerce.number().min(0, "El precio no puede ser negativo"),
  // Prisma returns null (not undefined) for an unset column, and the admin
  // form passes that straight through — accept it here too.
  imageUrl: z.string().trim().nullable().optional().transform((v) => v ?? ""),
  active: z.coerce.boolean().default(true),
  stock: z.coerce.number().int().min(0).nullable().optional(),
});

export type ProductInput = z.infer<typeof productSchema>;

export const productSaleSchema = z.object({
  productId: z.string().cuid(),
  quantity: z.coerce.number().int().min(1, "La cantidad debe ser al menos 1"),
  paymentMethod: z.enum(["CASH", "TRANSFER", "MERCADO_PAGO", "DEBIT", "CREDIT"]).optional(),
  customerPhone: z.string().trim().optional().or(z.literal("")),
});

export type ProductSaleInput = z.infer<typeof productSaleSchema>;
