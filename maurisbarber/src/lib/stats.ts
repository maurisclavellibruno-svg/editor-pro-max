import { prisma } from "@/lib/prisma";
import { timeToMinutes } from "@/lib/time";
import { eachDay, toDateStr, type DateRange } from "@/lib/period";

const WORKED_STATUSES = ["CONFIRMED", "COMPLETED"] as const;

export interface DashboardStats {
  range: DateRange;
  realRevenue: number;
  expectedRevenue: number;
  expenses: number;
  profit: number;
  bookingCount: number;
  completedCount: number;
  cancelledCount: number;
  noShowCount: number;
  averageTicket: number;
  newCustomers: number;
  returningCustomers: number;
  occupancyPercent: number;
  hoursWorked: number;
  hoursAvailable: number;
  revenueByDay: { date: string; revenue: number }[];
  revenueByService: { serviceName: string; revenue: number; count: number }[];
  topCustomers: { name: string; totalSpent: number }[];
}

export async function getDashboardStats(range: DateRange): Promise<DashboardStats> {
  const bookings = await prisma.booking.findMany({
    where: { startAt: { gte: range.start, lt: range.end } },
    include: { service: true, customer: true },
  });

  const nonCancelled = bookings.filter((b) => b.status !== "CANCELLED");
  const paidBookings = bookings.filter((b) => b.paymentStatus === "PAID");
  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const cancelled = bookings.filter((b) => b.status === "CANCELLED");
  const noShow = bookings.filter((b) => b.status === "NO_SHOW");
  const worked = bookings.filter((b) => WORKED_STATUSES.includes(b.status as (typeof WORKED_STATUSES)[number]));

  const bookingIncome = sumDecimal(paidBookings.map((b) => Number(b.price)));
  const [manualIncome, manualExpense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: "INCOME", date: { gte: range.start, lt: range.end } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { type: "EXPENSE", date: { gte: range.start, lt: range.end } },
      _sum: { amount: true },
    }),
  ]);

  const realRevenue = bookingIncome + Number(manualIncome._sum.amount ?? 0);
  const expenses = Number(manualExpense._sum.amount ?? 0);
  const expectedRevenue = sumDecimal(nonCancelled.map((b) => Number(b.price)));

  const averageTicket = completed.length > 0 ? realRevenue / completed.length : 0;

  const customerIds = Array.from(new Set(bookings.map((b) => b.customerId)));
  const customers = await prisma.customer.findMany({ where: { id: { in: customerIds } } });
  const newCustomers = customers.filter((c) => c.createdAt >= range.start && c.createdAt < range.end).length;
  const returningCustomers = customers.length - newCustomers;

  const hoursAvailable = (await getAvailableMinutesInRange(range)) / 60;
  const hoursWorked = worked.reduce((acc, b) => acc + (b.endAt.getTime() - b.startAt.getTime()) / 3_600_000, 0);
  const occupancyPercent = hoursAvailable > 0 ? Math.min(100, (hoursWorked / hoursAvailable) * 100) : 0;

  const revenueByDayMap = new Map<string, number>();
  for (const day of eachDay(range)) revenueByDayMap.set(toDateStr(day), 0);
  for (const b of paidBookings) {
    const key = toDateStr(b.startAt);
    revenueByDayMap.set(key, (revenueByDayMap.get(key) ?? 0) + Number(b.price));
  }

  const serviceMap = new Map<string, { serviceName: string; revenue: number; count: number }>();
  for (const b of nonCancelled) {
    const entry = serviceMap.get(b.serviceId) ?? { serviceName: b.service.name, revenue: 0, count: 0 };
    entry.count += 1;
    if (b.paymentStatus === "PAID") entry.revenue += Number(b.price);
    serviceMap.set(b.serviceId, entry);
  }

  const topCustomers = await getTopCustomers(10);

  return {
    range,
    realRevenue,
    expectedRevenue,
    expenses,
    profit: realRevenue - expenses,
    bookingCount: bookings.length,
    completedCount: completed.length,
    cancelledCount: cancelled.length,
    noShowCount: noShow.length,
    averageTicket,
    newCustomers,
    returningCustomers,
    occupancyPercent,
    hoursWorked,
    hoursAvailable,
    revenueByDay: Array.from(revenueByDayMap, ([date, revenue]) => ({ date, revenue })),
    revenueByService: Array.from(serviceMap.values()).sort((a, b) => b.revenue - a.revenue),
    topCustomers,
  };
}

export async function getTopCustomers(limit: number) {
  const grouped = await prisma.booking.groupBy({
    by: ["customerId"],
    where: { paymentStatus: "PAID" },
    _sum: { price: true },
    orderBy: { _sum: { price: "desc" } },
    take: limit,
  });

  const customers = await prisma.customer.findMany({
    where: { id: { in: grouped.map((g) => g.customerId) } },
  });
  const byId = new Map(customers.map((c) => [c.id, c]));

  return grouped
    .map((g) => {
      const customer = byId.get(g.customerId);
      return {
        name: customer ? `${customer.firstName} ${customer.lastName}` : "Cliente eliminado",
        totalSpent: Number(g._sum.price ?? 0),
      };
    })
    .filter((c) => c.totalSpent > 0);
}

async function getAvailableMinutesInRange(range: DateRange): Promise<number> {
  const [hours, breaks, blocks] = await Promise.all([
    prisma.businessHours.findMany(),
    prisma.breakTime.findMany(),
    prisma.blockedDate.findMany({ where: { startDate: { lt: range.end }, endDate: { gte: range.start } } }),
  ]);

  const hoursByDay = new Map(hours.map((h) => [h.dayOfWeek, h]));
  const breaksByDay = new Map<number, typeof breaks>();
  for (const brk of breaks) {
    breaksByDay.set(brk.dayOfWeek, [...(breaksByDay.get(brk.dayOfWeek) ?? []), brk]);
  }

  let totalMinutes = 0;
  for (const day of eachDay(range)) {
    const isBlocked = blocks.some((b) => b.startDate <= day && day < b.endDate);
    if (isBlocked) continue;

    const dayHours = hoursByDay.get(day.getDay());
    if (!dayHours || dayHours.isClosed) continue;

    const openMin = timeToMinutes(dayHours.openTime);
    const closeMin = timeToMinutes(dayHours.closeTime);
    const breakMinutes = (breaksByDay.get(day.getDay()) ?? []).reduce(
      (acc, b) => acc + (timeToMinutes(b.endTime) - timeToMinutes(b.startTime)),
      0,
    );
    totalMinutes += Math.max(0, closeMin - openMin - breakMinutes);
  }
  return totalMinutes;
}

function sumDecimal(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}
