import { prisma } from "@/lib/prisma";

// Hours of grace after a booking's end time before auto-completing it —
// gives same-day room to mark a genuine NO_SHOW by hand before the sweep
// assumes the client came in.
const GRACE_HOURS = 3;

// Bookings left at PENDING/CONFIRMED are very likely to have actually
// happened — in practice staff rarely remembers to flip them to COMPLETED
// by hand. Once a booking's end time is safely in the past, auto-complete
// it instead of leaving it stuck forever (which was silently breaking visit
// counts, loyalty, and the inactive-customers list).
export async function autoCompletePastBookings(): Promise<number> {
  const cutoff = new Date(Date.now() - GRACE_HOURS * 60 * 60 * 1000);

  const result = await prisma.booking.updateMany({
    where: { status: { in: ["PENDING", "CONFIRMED"] }, endAt: { lt: cutoff } },
    data: { status: "COMPLETED" },
  });

  return result.count;
}
