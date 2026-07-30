import { prisma } from "@/lib/prisma";
import { AgendaCalendar } from "@/components/admin/AgendaCalendar";

export const dynamic = "force-dynamic";

export default async function AgendaPage() {
  const [services, employees] = await Promise.all([
    prisma.service.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
    prisma.employee.findMany({ where: { active: true }, orderBy: { createdAt: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Agenda</h1>
      <AgendaCalendar
        employees={employees.map((e) => ({ id: e.id, name: e.name }))}
        services={services.map((s) => ({ id: s.id, name: s.name, duration: s.duration, price: Number(s.price) }))}
      />
    </div>
  );
}
