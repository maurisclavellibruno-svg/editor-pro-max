import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSessionProvider } from "@/components/admin/AdminSessionProvider";
import { AdminNav } from "@/components/admin/AdminNav";
import { LoyaltyCheckInPrompts } from "@/components/admin/LoyaltyCheckInPrompts";
import { getPendingLoyaltyCheckIns } from "@/lib/crm";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  const pendingCheckIns = await getPendingLoyaltyCheckIns();

  return (
    <AdminSessionProvider>
      <div className="min-h-screen bg-surface-alt">
        <AdminNav />
        <LoyaltyCheckInPrompts
          initial={pendingCheckIns.map((b) => ({
            bookingId: b.id,
            customerName: `${b.customer.firstName} ${b.customer.lastName}`,
            serviceName: b.service.name,
            startAt: b.startAt.toISOString(),
          }))}
        />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </AdminSessionProvider>
  );
}
