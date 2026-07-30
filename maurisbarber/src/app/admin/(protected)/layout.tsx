import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AdminSessionProvider } from "@/components/admin/AdminSessionProvider";
import { AdminNav } from "@/components/admin/AdminNav";

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/admin/login");

  return (
    <AdminSessionProvider>
      <div className="min-h-screen bg-surface-alt">
        <AdminNav />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </AdminSessionProvider>
  );
}
