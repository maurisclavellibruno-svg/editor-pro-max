import { prisma } from "@/lib/prisma";
import { EmployeesManager } from "@/components/admin/EmployeesManager";

export const dynamic = "force-dynamic";

export default async function EmpleadosPage() {
  const employees = await prisma.employee.findMany({
    include: { user: { select: { email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return (
    <EmployeesManager
      employees={employees.map((e) => ({
        id: e.id,
        name: e.name,
        active: e.active,
        email: e.user?.email ?? null,
      }))}
    />
  );
}
