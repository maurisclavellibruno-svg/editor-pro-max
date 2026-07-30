import { BookingWizard } from "@/components/booking/BookingWizard";
import { getActiveServices } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function ReservarPage() {
  const services = await getActiveServices();

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
    />
  );
}
