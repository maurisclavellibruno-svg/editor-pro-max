import { BookingWizard } from "@/components/booking/BookingWizard";
import { getActiveServices, getBarbershop } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReservarPage({
  searchParams,
}: {
  searchParams: Promise<{ servicio?: string; utm_source?: string; utm_campaign?: string; utm_content?: string }>;
}) {
  const [services, employees, shop] = await Promise.all([
    getActiveServices(),
    prisma.employee.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    getBarbershop(),
  ]);
  const { servicio, utm_source, utm_campaign, utm_content } = await searchParams;

  return (
    <BookingWizard
      services={services.map((s) => ({
        id: s.id,
        slug: s.slug,
        name: s.name,
        description: s.description,
        duration: s.duration,
        color: s.color,
        badge: s.badge,
        price: Number(s.price),
        promoPrice: s.promoPrice !== null ? Number(s.promoPrice) : null,
        promoStartsAt: s.promoStartsAt,
        promoEndsAt: s.promoEndsAt,
        specialPrice: s.specialPrice !== null ? Number(s.specialPrice) : null,
        specialDates: s.specialDates,
      }))}
      employees={employees.map((e) => ({ id: e.id, name: e.name }))}
      address={shop.address}
      whatsappNumber={shop.whatsappNumber}
      initialServiceSlug={servicio}
      utm={{ source: utm_source, campaign: utm_campaign, content: utm_content }}
    />
  );
}
