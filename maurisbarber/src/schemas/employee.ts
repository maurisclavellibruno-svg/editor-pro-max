import { z } from "zod";

export const employeeSchema = z.object({
  id: z.string().cuid().optional(),
  name: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  active: z.coerce.boolean().default(true),
});

export type EmployeeInput = z.infer<typeof employeeSchema>;

export const employeeLoginSchema = z.object({
  employeeId: z.string().cuid(),
  email: z.string().trim().email("Email inválido"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

export type EmployeeLoginInput = z.infer<typeof employeeLoginSchema>;
