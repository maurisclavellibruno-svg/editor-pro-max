import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "mauris@maurisbarber.com";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "change-me-strong-password";

  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Mauris",
      passwordHash: await bcrypt.hash(adminPassword, 10),
    },
  });

  await prisma.employee.upsert({
    where: { userId: user.id },
    update: {},
    create: { name: "Mauris", userId: user.id },
  });

  const existingShop = await prisma.barbershop.findFirst();
  if (!existingShop) {
    await prisma.barbershop.create({
      data: {
        name: "MaurisBarber",
        phone: "091 552 626",
        whatsappNumber: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "59891552626",
        instagramHandle: "maurisbarber",
        address: "Av. Gonzalo Ramírez 1686 Apto. 002, Montevideo, Uruguay",
        mapsEmbedUrl:
          "https://www.google.com/maps?q=Av.+Gonzalo+Ram%C3%ADrez+1686,+Montevideo,+Uruguay&output=embed",
        description:
          "Barbería exclusiva en el corazón de Montevideo. Cortes, barba y color con estilo premium.",
      },
    });
  }

  // Business hours: Tuesday–Saturday 09:00–19:00, closed Sunday/Monday.
  const hours = [
    { dayOfWeek: 0, isClosed: true, openTime: "00:00", closeTime: "00:00" },
    { dayOfWeek: 1, isClosed: true, openTime: "00:00", closeTime: "00:00" },
    { dayOfWeek: 2, isClosed: false, openTime: "09:00", closeTime: "19:00" },
    { dayOfWeek: 3, isClosed: false, openTime: "09:00", closeTime: "19:00" },
    { dayOfWeek: 4, isClosed: false, openTime: "09:00", closeTime: "19:00" },
    { dayOfWeek: 5, isClosed: false, openTime: "09:00", closeTime: "19:00" },
    { dayOfWeek: 6, isClosed: false, openTime: "09:00", closeTime: "18:00" },
  ];
  for (const h of hours) {
    await prisma.businessHours.upsert({
      where: { dayOfWeek: h.dayOfWeek },
      update: h,
      create: h,
    });
  }

  const existingBreaks = await prisma.breakTime.findMany();
  if (existingBreaks.length === 0) {
    for (const dayOfWeek of [2, 3, 4, 5, 6]) {
      await prisma.breakTime.create({
        data: { dayOfWeek, startTime: "13:00", endTime: "14:00", label: "Almuerzo" },
      });
    }
  }

  const existingServices = await prisma.service.findMany();
  if (existingServices.length === 0) {
    await prisma.service.createMany({
      data: [
        {
          name: "Corte Clásico",
          description: "Corte de cabello a tijera y máquina, incluye lavado y peinado.",
          price: 600,
          duration: 30,
          color: "#16a34a",
          schedulingMode: "CONSECUTIVE",
          allowsParallel: false,
        },
        {
          name: "Corte + Barba",
          description: "Corte completo más perfilado y afeitado de barba.",
          price: 900,
          duration: 45,
          color: "#0ea5e9",
          schedulingMode: "CONSECUTIVE",
          allowsParallel: false,
        },
        {
          name: "Afeitado Clásico",
          description: "Afeitado tradicional con toalla caliente y navaja.",
          price: 500,
          duration: 30,
          color: "#8b5cf6",
          schedulingMode: "CUSTOM_FREQUENCY",
          frequencyMinutes: 15,
          allowsParallel: false,
        },
        {
          name: "Color / Platinado",
          description:
            "Aplicación de color. Durante el tiempo de procesado el barbero puede atender otro turno.",
          price: 1500,
          duration: 40,
          color: "#f59e0b",
          schedulingMode: "CONSECUTIVE",
          allowsParallel: true,
        },
      ],
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
