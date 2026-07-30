import { prisma } from "@/lib/prisma";
import { dateWithMinutes, dayOfWeek, minutesToTime, rangesOverlap, timeToMinutes } from "@/lib/time";

const BLOCKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED"] as const;

export interface AvailabilityInput {
  serviceId: string;
  /** "YYYY-MM-DD", interpreted in the server's local timezone. */
  date: string;
  employeeId?: string;
}

/**
 * Returns the list of bookable "HH:mm" start times for a service on a given
 * day, taking into account business hours, breaks, blocked dates, and
 * existing bookings.
 *
 * Key rule for "trabajo en paralelo": an existing booking only consumes the
 * barber's capacity (blocks other slots) when its service has
 * allowsParallel = false. A booking for a parallel-enabled service (e.g. hair
 * color processing) does not block anything else during its time span.
 */
export async function getAvailableSlots({
  serviceId,
  date,
  employeeId,
}: AvailabilityInput): Promise<string[]> {
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service || !service.active) return [];

  const employee = employeeId
    ? await prisma.employee.findUnique({ where: { id: employeeId } })
    : await prisma.employee.findFirst({ where: { active: true } });
  if (!employee) return [];

  const dow = dayOfWeek(date);

  const hours = await prisma.businessHours.findUnique({ where: { dayOfWeek: dow } });
  if (!hours || hours.isClosed) return [];

  const dayStart = new Date(date + "T00:00:00");
  const dayEnd = new Date(date + "T23:59:59.999");
  const fullDayBlock = await prisma.blockedDate.findFirst({
    where: { startDate: { lte: dayEnd }, endDate: { gte: dayStart } },
  });
  if (fullDayBlock) return [];

  const breaks = await prisma.breakTime.findMany({ where: { dayOfWeek: dow } });

  const openMin = timeToMinutes(hours.openTime);
  const closeMin = timeToMinutes(hours.closeTime);
  const duration = service.duration;

  const candidateStarts = buildCandidateStarts(service, openMin, closeMin);

  const dayBookings = await prisma.booking.findMany({
    where: {
      employeeId: employee.id,
      status: { in: [...BLOCKING_STATUSES] },
      startAt: { lt: dayEnd },
      endAt: { gt: dayStart },
    },
    include: { service: true },
  });

  // Only bookings whose service does NOT allow parallel work consume capacity.
  const blockingBookings = dayBookings.filter((b) => !b.service.allowsParallel);

  const now = new Date();
  const isToday = isTodayStr(date);

  return candidateStarts
    .filter((startMin) => startMin + duration <= closeMin)
    .filter((startMin) => {
      const endMin = startMin + duration;
      const overlapsBreak = breaks.some((brk) =>
        rangesOverlap(startMin, endMin, timeToMinutes(brk.startTime), timeToMinutes(brk.endTime)),
      );
      if (overlapsBreak) return false;

      const slotStart = dateWithMinutes(date, startMin);
      const slotEnd = dateWithMinutes(date, endMin);
      const overlapsBooking = blockingBookings.some((b) =>
        rangesOverlap(slotStart.getTime(), slotEnd.getTime(), b.startAt.getTime(), b.endAt.getTime()),
      );
      if (overlapsBooking) return false;

      if (isToday && slotStart.getTime() <= now.getTime()) return false;

      return true;
    })
    .map(minutesToTime)
    .sort();
}

function buildCandidateStarts(
  service: { schedulingMode: string; duration: number; frequencyMinutes: number | null; manualSlots: string[] },
  openMin: number,
  closeMin: number,
): number[] {
  switch (service.schedulingMode) {
    case "MANUAL":
      return service.manualSlots.map(timeToMinutes);
    case "CUSTOM_FREQUENCY": {
      const step = service.frequencyMinutes ?? service.duration;
      const starts: number[] = [];
      for (let t = openMin; t < closeMin; t += step) starts.push(t);
      return starts;
    }
    case "CONSECUTIVE":
    default: {
      const starts: number[] = [];
      for (let t = openMin; t < closeMin; t += service.duration) starts.push(t);
      return starts;
    }
  }
}

function isTodayStr(dateStr: string): boolean {
  const today = new Date();
  const [year, month, day] = dateStr.split("-").map(Number);
  return today.getFullYear() === year && today.getMonth() === month - 1 && today.getDate() === day;
}

/**
 * Re-validates that a specific start time is still available. Used server-side
 * right before creating a booking, so a stale client can't submit a slot that
 * was taken in the meantime.
 */
export async function isSlotAvailable(input: AvailabilityInput & { time: string }): Promise<boolean> {
  const slots = await getAvailableSlots(input);
  return slots.includes(input.time);
}

/**
 * Direct overlap check against existing bookings, without requiring the
 * candidate time to land on a generated slot. Used by the admin agenda for
 * manual bookings and drag-to-reschedule, which aren't bound to the public
 * booking grid. Respects the same "trabajo en paralelo" exemption.
 */
export async function hasBookingConflict(
  employeeId: string,
  startAt: Date,
  endAt: Date,
  excludeBookingId?: string,
): Promise<boolean> {
  const overlapping = await prisma.booking.findMany({
    where: {
      employeeId,
      status: { in: [...BLOCKING_STATUSES] },
      startAt: { lt: endAt },
      endAt: { gt: startAt },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    include: { service: true },
  });
  return overlapping.some((b) => !b.service.allowsParallel);
}
