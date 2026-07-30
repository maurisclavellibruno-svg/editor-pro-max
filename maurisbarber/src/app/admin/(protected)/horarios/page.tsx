import { prisma } from "@/lib/prisma";
import { HoursManager } from "@/components/admin/HoursManager";

export const dynamic = "force-dynamic";

export default async function HorariosPage() {
  const [hours, breaks, blocks] = await Promise.all([
    prisma.businessHours.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.breakTime.findMany({ orderBy: { dayOfWeek: "asc" } }),
    prisma.blockedDate.findMany({ orderBy: { startDate: "desc" } }),
  ]);

  return (
    <HoursManager
      hours={hours}
      breaks={breaks}
      blocks={blocks.map((b) => ({
        id: b.id,
        startDate: b.startDate.toISOString().slice(0, 10),
        endDate: b.endDate.toISOString().slice(0, 10),
        reason: b.reason,
        type: b.type,
      }))}
    />
  );
}
