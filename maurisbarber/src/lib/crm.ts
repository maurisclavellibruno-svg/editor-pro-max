import { prisma } from "@/lib/prisma";

export interface CustomerStats {
  visitCount: number;
  totalSpent: number;
  lastVisitAt: Date | null;
}

// Visit stats are derived from Booking history rather than stored as
// counters on Customer, so they can never drift out of sync with the
// (immutable) booking history.
export async function getCustomerStats(customerId: string): Promise<CustomerStats> {
  const [completed, paidAgg] = await Promise.all([
    prisma.booking.aggregate({
      where: { customerId, status: "COMPLETED" },
      _count: { _all: true },
      _max: { startAt: true },
    }),
    prisma.booking.aggregate({
      where: { customerId, status: "COMPLETED", paymentStatus: "PAID" },
      _sum: { price: true },
    }),
  ]);

  return {
    visitCount: completed._count._all,
    totalSpent: Number(paidAgg._sum.price ?? 0),
    lastVisitAt: completed._max.startAt,
  };
}

export async function searchCustomers(query: string) {
  const customers = await prisma.customer.findMany({
    where: query
      ? {
          OR: [
            { firstName: { contains: query, mode: "insensitive" } },
            { lastName: { contains: query, mode: "insensitive" } },
            { phone: { contains: query } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        }
      : undefined,
    orderBy: { updatedAt: "desc" },
    take: 100,
  });

  const withStats = await Promise.all(
    customers.map(async (customer) => ({
      ...customer,
      stats: await getCustomerStats(customer.id),
    })),
  );

  return withStats;
}

export async function getCustomerDetail(customerId: string) {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
    include: {
      photos: { orderBy: { createdAt: "desc" } },
      bookings: {
        orderBy: { startAt: "desc" },
        include: { service: true },
      },
      memberships: {
        where: { remainingCredits: { gt: 0 }, expiresAt: { gt: new Date() } },
        include: { plan: true },
      },
      giftCards: { where: { active: true, remainingAmount: { gt: 0 } } },
    },
  });
  if (!customer) return null;

  const stats = await getCustomerStats(customerId);
  return { ...customer, stats };
}
