import { prisma } from "@/lib/prisma";
import { notifications } from "@/lib/notifications";

const REVIEW_REQUEST_DELAY_MINUTES = Number(process.env.REVIEW_REQUEST_DELAY_MINUTES ?? 60);

// Scans for bookings whose end time passed at least REVIEW_REQUEST_DELAY_MINUTES
// ago and sends a "how did it go / leave us a review" email — only to
// customers with an email on file, since this isn't sent over WhatsApp.
// Meant to be called periodically (see instrumentation.ts).
export async function sendDueReviewRequests(): Promise<number> {
  const cutoff = new Date(Date.now() - REVIEW_REQUEST_DELAY_MINUTES * 60 * 1000);

  const dueBookings = await prisma.booking.findMany({
    where: {
      status: { not: "CANCELLED" },
      reviewRequestSentAt: null,
      endAt: { lte: cutoff },
      customer: { email: { not: null } },
    },
    include: { customer: true, service: true },
  });

  for (const booking of dueBookings) {
    if (!booking.customer.email) continue; // satisfies TS; already filtered above
    await notifications.notifyReviewRequest({
      customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
      customerEmail: booking.customer.email,
      serviceName: booking.service.name,
      alreadyInLoyaltyClub: booking.customer.loyaltyCardEnrolled,
    });
    await prisma.booking.update({ where: { id: booking.id }, data: { reviewRequestSentAt: new Date() } });
  }

  return dueBookings.length;
}
