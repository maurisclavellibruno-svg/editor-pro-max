"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { submitReviewSchema } from "@/schemas/review";
import { isRateLimited } from "@/lib/rate-limit";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

export interface SubmitReviewResult {
  ok: boolean;
  error?: string;
}

// Public: anyone can submit a review, but it stays hidden from the landing
// page until an admin approves it (see approveReview below).
export async function submitReview(formData: FormData): Promise<SubmitReviewResult> {
  const headersList = await headers();
  const ip = headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (isRateLimited(`review:${ip}`, 3, 60 * 60 * 1000)) {
    return { ok: false, error: "Demasiados intentos. Probá de nuevo más tarde." };
  }

  const parsed = submitReviewSchema.safeParse({
    name: formData.get("name"),
    rating: formData.get("rating"),
    text: formData.get("text"),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Datos inválidos" };
  }

  await prisma.review.create({
    data: {
      name: parsed.data.name,
      rating: parsed.data.rating,
      text: parsed.data.text,
    },
  });

  return { ok: true };
}

export async function approveReview(id: string) {
  await requireAdmin();
  await prisma.review.update({ where: { id }, data: { approved: true } });
  revalidatePath("/admin/resenas");
  revalidatePath("/");
}

export async function deleteReview(id: string) {
  await requireAdmin();
  await prisma.review.delete({ where: { id } });
  revalidatePath("/admin/resenas");
  revalidatePath("/");
}
