import { getLoyaltyCardCustomers } from "@/lib/crm";
import { LoyaltyCardTable } from "@/components/admin/LoyaltyCardTable";

export const dynamic = "force-dynamic";

export default async function FidelidadAdminPage() {
  const members = await getLoyaltyCardCustomers();

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-ink">Club de fidelidad</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Sumá un sello cada vez que un cliente del club viene a cortarse. Al sexto, el corte es gratis.
        </p>
      </div>
      <LoyaltyCardTable
        members={members.map((m) => ({
          id: m.id,
          firstName: m.firstName,
          lastName: m.lastName,
          phone: m.phone,
          loyaltyCardStamps: m.loyaltyCardStamps,
          loyaltyCardRedemptions: m.loyaltyCardRedemptions,
        }))}
      />
    </div>
  );
}
