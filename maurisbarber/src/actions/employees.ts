"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import bcrypt from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { employeeLoginSchema, employeeSchema } from "@/schemas/employee";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

export async function upsertEmployee(input: unknown) {
  await requireAdmin();
  const data = employeeSchema.parse(input);

  if (data.id) {
    await prisma.employee.update({ where: { id: data.id }, data: { name: data.name, active: data.active } });
  } else {
    await prisma.employee.create({ data: { name: data.name, active: data.active } });
  }

  revalidatePath("/admin/empleados");
}

// Creates a login for an employee that doesn't have one yet, or resets the
// password/email for an existing one. Employees without a login can still be
// assigned bookings — they just can't sign in to the admin panel themselves.
export async function setEmployeeLogin(input: unknown) {
  await requireAdmin();
  const data = employeeLoginSchema.parse(input);

  const employee = await prisma.employee.findUnique({ where: { id: data.employeeId } });
  if (!employee) throw new Error("Empleado no encontrado");

  const passwordHash = await bcrypt.hash(data.password, 10);

  try {
    if (employee.userId) {
      await prisma.user.update({
        where: { id: employee.userId },
        data: { email: data.email, passwordHash, name: employee.name },
      });
    } else {
      const user = await prisma.user.create({
        data: { email: data.email, passwordHash, name: employee.name },
      });
      await prisma.employee.update({ where: { id: employee.id }, data: { userId: user.id } });
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      throw new Error("Ese email ya está en uso por otra cuenta");
    }
    throw err;
  }

  revalidatePath("/admin/empleados");
}
