import { prisma } from "@/lib/prisma";
import { ProductsManager } from "@/components/admin/ProductsManager";

export const dynamic = "force-dynamic";

export default async function ProductosPage() {
  const products = await prisma.product.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <ProductsManager
      products={products.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        price: Number(p.price),
        imageUrl: p.imageUrl,
        active: p.active,
        stock: p.stock,
      }))}
    />
  );
}
