"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { productSaleSchema, productSchema } from "@/schemas/product";

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session) throw new Error("No autorizado");
}

export async function upsertProduct(input: unknown) {
  await requireAdmin();
  const data = productSchema.parse(input);

  const payload = {
    name: data.name,
    description: data.description ?? "",
    price: data.price,
    imageUrl: data.imageUrl || null,
    active: data.active,
    stock: data.stock ?? null,
  };

  if (data.id) {
    await prisma.product.update({ where: { id: data.id }, data: payload });
  } else {
    await prisma.product.create({ data: payload });
  }

  revalidatePath("/admin/productos");
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  const saleCount = await prisma.productSale.count({ where: { productId: id } });
  if (saleCount > 0) {
    // Preserve sales history: products with past sales are deactivated,
    // never hard-deleted.
    await prisma.product.update({ where: { id }, data: { active: false } });
  } else {
    await prisma.product.delete({ where: { id } });
  }
  revalidatePath("/admin/productos");
}

export async function recordProductSale(input: unknown) {
  await requireAdmin();
  const data = productSaleSchema.parse(input);

  const product = await prisma.product.findUnique({ where: { id: data.productId } });
  if (!product || !product.active) throw new Error("Producto no disponible");
  if (product.stock !== null && product.stock < data.quantity) {
    throw new Error("No hay suficiente stock");
  }

  let customerId: string | null = null;
  if (data.customerPhone) {
    const customer = await prisma.customer.findUnique({ where: { phone: data.customerPhone } });
    customerId = customer?.id ?? null;
  }

  await prisma.$transaction([
    prisma.productSale.create({
      data: {
        productId: product.id,
        customerId,
        quantity: data.quantity,
        unitPrice: product.price,
        paymentMethod: data.paymentMethod,
        date: new Date(),
      },
    }),
    ...(product.stock !== null
      ? [prisma.product.update({ where: { id: product.id }, data: { stock: { decrement: data.quantity } } })]
      : []),
  ]);

  revalidatePath("/admin/productos");
  revalidatePath("/admin/estadisticas");
}
