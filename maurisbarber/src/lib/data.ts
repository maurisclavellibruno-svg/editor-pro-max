import { prisma } from "@/lib/prisma";

export async function getBarbershop() {
  const shop = await prisma.barbershop.findFirst();
  if (!shop) {
    throw new Error(
      "No hay datos del negocio en la base. Corré `npm run db:seed` para cargar los datos iniciales de MaurisBarber.",
    );
  }
  return shop;
}

export async function getActiveServices() {
  return prisma.service.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } });
}

export async function getBusinessHours() {
  return prisma.businessHours.findMany({ orderBy: { dayOfWeek: "asc" } });
}
