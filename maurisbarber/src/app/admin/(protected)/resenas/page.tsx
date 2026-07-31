import { prisma } from "@/lib/prisma";
import { ReviewsManager } from "@/components/admin/ReviewsManager";

export const dynamic = "force-dynamic";

export default async function ReviewsPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <ReviewsManager
      reviews={reviews.map((r) => ({
        id: r.id,
        name: r.name,
        rating: r.rating,
        text: r.text,
        approved: r.approved,
        createdAt: r.createdAt.toISOString(),
      }))}
    />
  );
}
