import { prisma } from "@/lib/prisma";
import { notifications } from "@/lib/notifications";

const REMINDER_HOURS_BEFORE = Number(process.env.REMINDER_HOURS_BEFORE ?? 24);

// Scans for upcoming bookings that haven't been reminded yet and sends one
// reminder each. Meant to be called periodically (see instrumentation.ts).
export async function sendDueReminders(): Promise<number> {
  const now = new Date();
  const windowEnd = new Date(now.getTime() + REMINDER_HOURS_BEFORE * 60 * 60 * 1000);

  const dueBookings = await prisma.booking.findMany({
    where: {
      status: { in: ["PENDING", "CONFIRMED"] },
      reminderSentAt: null,
      startAt: { gte: now, lte: windowEnd },
    },
    include: { customer: true, service: true },
  });

  for (const booking of dueBookings) {
    await notifications.notifyCustomerReminder({
      customerName: `${booking.customer.firstName} ${booking.customer.lastName}`,
      customerPhone: booking.customer.phone,
      customerEmail: booking.customer.email,
      serviceName: booking.service.name,
      startAt: booking.startAt,
      price: Number(booking.price),
    });
    await prisma.booking.update({ where: { id: booking.id }, data: { reminderSentAt: new Date() } });
  }

  return dueBookings.length;
}
