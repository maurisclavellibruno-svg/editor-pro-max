import { z } from "zod";

export const barbershopSettingsSchema = z.object({
  name: z.string().trim().min(1, "El nombre es obligatorio").max(80),
  phone: z.string().trim().min(6, "Teléfono inválido").max(20),
  whatsappNumber: z.string().trim().min(6, "Número de WhatsApp inválido").max(20),
  instagramHandle: z.string().trim().min(1, "El usuario de Instagram es obligatorio").max(60),
  address: z.string().trim().min(1, "La dirección es obligatoria").max(200),
  mapsEmbedUrl: z.string().trim().url("URL de Google Maps inválida"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export type BarbershopSettingsInput = z.infer<typeof barbershopSettingsSchema>;
