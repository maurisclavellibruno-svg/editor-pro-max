import { notFound } from "next/navigation";
import { getCustomerDetail } from "@/lib/crm";
import { CustomerInfoForm } from "@/components/admin/CustomerInfoForm";
import { CustomerNotesForm } from "@/components/admin/CustomerNotesForm";
import { CustomerPhotos } from "@/components/admin/CustomerPhotos";
import { CustomerHistory } from "@/components/admin/CustomerHistory";

export const dynamic = "force-dynamic";

const STATUS_LABELS: Record<string, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmado",
  CANCELLED: "Cancelado",
  COMPLETED: "Completado",
  NO_SHOW: "Ausente",
};

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const customer = await getCustomerDetail(id);
  if (!customer) notFound();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          {customer.firstName} {customer.lastName}
        </h1>
        <div className="mt-2 flex gap-6 text-sm text-ink-muted">
          <span>{customer.stats.visitCount} visitas</span>
          <span>
            Última visita:{" "}
            {customer.stats.lastVisitAt ? customer.stats.lastVisitAt.toLocaleDateString("es-UY") : "—"}
          </span>
          <span className="font-medium text-ink">Total gastado: ${customer.stats.totalSpent}</span>
        </div>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <CustomerInfoForm
          customer={{
            id: customer.id,
            firstName: customer.firstName,
            lastName: customer.lastName,
            phone: customer.phone,
            email: customer.email,
            instagram: customer.instagram,
            birthDate: customer.birthDate ? customer.birthDate.toISOString().slice(0, 10) : "",
          }}
        />
        <CustomerNotesForm
          customer={{
            id: customer.id,
            favoriteCut: customer.favoriteCut,
            beardPreference: customer.beardPreference,
            musicPreference: customer.musicPreference,
            likesToTalk: customer.likesToTalk,
            productsUsed: customer.productsUsed,
            hairColor: customer.hairColor,
            generalPreferences: customer.generalPreferences,
            likedNotes: customer.likedNotes,
            dislikedNotes: customer.dislikedNotes,
            notes: customer.notes,
          }}
        />
      </div>

      <CustomerPhotos
        customerId={customer.id}
        photos={customer.photos.map((p) => ({ id: p.id, url: p.url, caption: p.caption }))}
      />

      <CustomerHistory
        bookings={customer.bookings.map((b) => ({
          id: b.id,
          serviceName: b.service.name,
          startAt: b.startAt,
          price: Number(b.price),
          paymentMethod: b.paymentMethod,
          status: STATUS_LABELS[b.status] ?? b.status,
        }))}
      />
    </div>
  );
}
