// One-time data fix for the December 2026 Meta Ads launch. Run once on the
// server that owns the real database:
//   npm run db:fix-launch
// Safe to re-run — every write is an upsert or an idempotent update.
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Fixed UTC-3 offset (Montevideo has no DST) — "15:00 local" on day D is
// "D 18:00:00Z".
function montevideo(dateStr: string, time: string): Date {
  return new Date(`${dateStr}T${time}:00.000-03:00`);
}

async function main() {
  // ---------------------------------------------------------------------
  // 1. Business hours — must match what the availability engine offers.
  // ---------------------------------------------------------------------
  const hours = [
    { dayOfWeek: 0, isClosed: true, openTime: "00:00", closeTime: "00:00" }, // domingo
    { dayOfWeek: 1, isClosed: true, openTime: "00:00", closeTime: "00:00" }, // lunes
    { dayOfWeek: 2, isClosed: false, openTime: "18:00", closeTime: "20:30" }, // martes
    { dayOfWeek: 3, isClosed: true, openTime: "00:00", closeTime: "00:00" }, // miércoles
    { dayOfWeek: 4, isClosed: false, openTime: "15:00", closeTime: "20:00" }, // jueves
    { dayOfWeek: 5, isClosed: false, openTime: "13:30", closeTime: "20:00" }, // viernes
    { dayOfWeek: 6, isClosed: false, openTime: "12:00", closeTime: "20:00" }, // sábado
  ];
  for (const h of hours) {
    await prisma.businessHours.upsert({ where: { dayOfWeek: h.dayOfWeek }, update: h, create: h });
  }
  console.log("✓ Horarios actualizados");

  // ---------------------------------------------------------------------
  // 2. Service catalog — "fiestas" promo runs 1–20/12/2026; Corte has a
  //    fixed $750 on 24/12 and 31/12 (no promo those two days).
  // ---------------------------------------------------------------------
  const promoStartsAt = montevideo("2026-12-01", "00:00");
  const promoEndsAt = montevideo("2026-12-20", "23:59");

  const services = [
    {
      slug: "asesoria-corte",
      name: "Asesoría + corte",
      description:
        "Antes de tocar la tijera, analizo tu cara, tu pelo y tu estilo de vida. Te explico qué corte te favorece y por qué, y te lo hago en el momento. Te llevás un PDF con tu corte, cómo peinarte y qué productos usar.",
      price: 2650,
      duration: 75,
      featured: true,
      badge: "El más elegido",
      category: "general",
      displayOrder: 1,
      promoPrice: 2390,
      promoStartsAt,
      promoEndsAt,
      specialPrice: null as number | null,
      specialDates: [] as string[],
    },
    {
      slug: "asesoria-online",
      name: "Asesoría online",
      description:
        "Por videollamada, estés donde estés. Me mandás fotos antes, analizamos juntos tu cara y te digo exactamente qué corte pedir. Te llega un PDF para mostrárselo a tu barbero.",
      price: 1650,
      duration: 30,
      featured: false,
      badge: null,
      category: "general",
      displayOrder: 2,
      promoPrice: 1490,
      promoStartsAt,
      promoEndsAt,
      specialPrice: null,
      specialDates: [],
    },
    {
      slug: "corte-premium",
      name: "Corte Premium",
      description: "El corte completo más black mask para limpiar la piel. Salís renovado de pies a cabeza.",
      price: 880,
      duration: 55,
      featured: false,
      badge: null,
      category: "general",
      displayOrder: 3,
      promoPrice: 790,
      promoStartsAt,
      promoEndsAt,
      specialPrice: null,
      specialDates: [],
    },
    {
      slug: "corte",
      name: "Corte",
      description: "Corte con tijera y máquina, terminado con peinado y producto. Para el que ya sabe lo que quiere.",
      price: 720,
      duration: 45,
      featured: false,
      badge: null,
      category: "general",
      displayOrder: 4,
      promoPrice: 650,
      promoStartsAt,
      promoEndsAt,
      // Agenda de fiestas: $750 fijo esos dos días, sin promo.
      specialPrice: 750,
      specialDates: ["2026-12-24", "2026-12-31"],
    },
    {
      slug: "mechas-verano",
      name: "Mechas de verano",
      description: "Reflejos suaves que aclaran sin cambiar tu color. Quedan naturales y casi no necesitan mantenimiento.",
      price: 1780,
      duration: 75,
      featured: false,
      badge: null,
      category: "color",
      displayOrder: 5,
      promoPrice: null,
      promoStartsAt: null,
      promoEndsAt: null,
      specialPrice: null,
      specialDates: [],
    },
    {
      slug: "mechas",
      name: "Mechas",
      description: "Aclarado en partes del pelo para darle contraste y luz. Desde algo sutil hasta algo bien notorio: lo definimos juntos.",
      price: 2100,
      duration: 180,
      featured: false,
      badge: null,
      category: "color",
      displayOrder: 6,
      promoPrice: null,
      promoStartsAt: null,
      promoEndsAt: null,
      specialPrice: null,
      specialDates: [],
    },
    {
      slug: "color-global",
      name: "Color global",
      description: "Todo el pelo de un mismo tono, parejo e intenso. Para un cambio total o para emparejar tu color.",
      price: 2400,
      duration: 240,
      featured: false,
      badge: null,
      category: "color",
      displayOrder: 7,
      promoPrice: null,
      promoStartsAt: null,
      promoEndsAt: null,
      specialPrice: null,
      specialDates: [],
    },
  ];

  for (const s of services) {
    const existing = await prisma.service.findFirst({ where: { name: s.name } });
    if (existing) {
      await prisma.service.update({ where: { id: existing.id }, data: { ...s, active: true } });
    } else {
      await prisma.service.create({ data: { ...s, active: true, color: "#C6A15B" } });
    }
  }
  console.log("✓ Catálogo de servicios actualizado");

  // Retired services — deactivated, not deleted, so past bookings that
  // reference them stay intact.
  const retired = await prisma.service.updateMany({
    where: { name: { in: ["Asesoria presencial", "Asesoría presencial", "Corte VIP"] } },
    data: { active: false },
  });
  console.log(`✓ ${retired.count} servicio(s) retirado(s) (Asesoria presencial, Corte VIP)`);

  // ---------------------------------------------------------------------
  // 3. Remove the two specific reviews from the public site.
  // ---------------------------------------------------------------------
  const hiddenReviews = await prisma.review.updateMany({
    where: {
      OR: [
        { name: { contains: "zans", mode: "insensitive" } },
        { text: { contains: "final feliz", mode: "insensitive" } },
        { name: { contains: "orejon", mode: "insensitive" } },
      ],
    },
    data: { approved: false },
  });
  console.log(`✓ ${hiddenReviews.count} reseña(s) ocultada(s)`);
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
