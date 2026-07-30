"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";
import { customerContactSchema, customerNotesSchema } from "@/schemas/customer";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

export async function updateCustomerContact(input: unknown) {
  await requireAdmin();
  const data = customerContactSchema.parse(input);

  await prisma.customer.update({
    where: { id: data.id },
    data: {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      email: data.email || null,
      instagram: data.instagram || null,
      birthDate: data.birthDate ? new Date(data.birthDate + "T00:00:00") : null,
    },
  });

  revalidatePath(`/admin/clientes/${data.id}`);
  revalidatePath("/admin/clientes");
}

export async function updateCustomerNotes(input: unknown) {
  await requireAdmin();
  const data = customerNotesSchema.parse(input);

  await prisma.customer.update({
    where: { id: data.id },
    data: {
      favoriteCut: data.favoriteCut || null,
      beardPreference: data.beardPreference || null,
      musicPreference: data.musicPreference || null,
      likesToTalk:
        data.likesToTalk === "true" ? true : data.likesToTalk === "false" ? false : null,
      productsUsed: data.productsUsed || null,
      hairColor: data.hairColor || null,
      generalPreferences: data.generalPreferences || null,
      likedNotes: data.likedNotes || null,
      dislikedNotes: data.dislikedNotes || null,
      notes: data.notes || "",
    },
  });

  revalidatePath(`/admin/clientes/${data.id}`);
}

export async function addCustomerPhoto(customerId: string, formData: FormData) {
  await requireAdmin();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Seleccioná una imagen");
  }
  const caption = String(formData.get("caption") ?? "");

  const url = await saveUploadedFile(file, `customers/${customerId}`);
  await prisma.customerPhoto.create({ data: { customerId, url, caption } });

  revalidatePath(`/admin/clientes/${customerId}`);
}

export async function deleteCustomerPhoto(photoId: string, customerId: string) {
  await requireAdmin();
  await prisma.customerPhoto.delete({ where: { id: photoId } });
  revalidatePath(`/admin/clientes/${customerId}`);
}
