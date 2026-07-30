import { BookingWizard } from "@/components/booking/BookingWizard";
import { getActiveServices } from "@/lib/data";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ReservarPage() {
  const [services, employees] = await Promise.all([
    getActiveServices(),
    prisma.employee.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <BookingWizard
      services={services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: Number(s.price),
        duration: s.duration,
        color: s.color,
      }))}
      employees={employees.map((e) => ({ id: e.id, name: e.name }))}
    />
  );
}
