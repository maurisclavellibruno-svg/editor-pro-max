import { prisma } from "@/lib/prisma";
import { ServicesManager } from "@/components/admin/ServicesManager";

export const dynamic = "force-dynamic";

export default async function ServiciosPage() {
  const services = await prisma.service.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <ServicesManager
      services={services.map((s) => ({
        id: s.id,
        name: s.name,
        description: s.description,
        price: Number(s.price),
        duration: s.duration,
        color: s.color,
        imageUrl: s.imageUrl,
        active: s.active,
        schedulingMode: s.schedulingMode,
        frequencyMinutes: s.frequencyMinutes,
        manualSlots: s.manualSlots,
        allowsParallel: s.allowsParallel,
      }))}
    />
  );
}
