import { prisma } from "@/lib/prisma";
import { dateWithMinutes, dayOfWeek, minutesToTime, rangesOverlap, timeToMinutes } from "@/lib/time";

const BLOCKING_STATUSES = ["PENDING", "CONFIRMED", "COMPLETED"] as const;

export interface AvailabilityInput {
  serviceId: string;
  /** "YYYY-MM-DD", interpreted in the server's local timezone. */
  date: string;
  /** Omit (or leave undefined) to check across every active barber. */
  employeeId?: string;
}

type ServiceForScheduling = {
  schedulingMode: string;
  duration: number;
  frequencyMinutes: number | null;
  manualSlots: string[];
};

/**
 * Returns the list of bookable "HH:mm" start times for a service on a given
 * day, taking into account business hours, breaks, blocked dates, and
 * existing bookings.
 *
 * With no `employeeId`, a slot is included if AT LEAST ONE active barber is
 * free then (used for the public "cualquier barbero disponible" option).
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

  const employees = employeeId
    ? await prisma.employee.findMany({ where: { id: employeeId } })
    : await prisma.employee.findMany({ where: { active: true } });
  if (employees.length === 0) return [];

  const dayInfo = await getDayInfo(date);
  if (!dayInfo) return [];

  const slotSet = new Set<string>();
  for (const employee of employees) {
    const slots = await getAvailableSlotsForEmployee(service, employee.id, date, dayInfo);
    for (const slot of slots) slotSet.add(slot);
  }
  return Array.from(slotSet).sort();
}

/**
 * Like `getAvailableSlots`, but also returns which specific employee is free
 * for each slot — needed to actually assign a barber when the customer picks
 * "cualquiera disponible".
 */
async function getAvailableSlotsForEmployee(
  service: ServiceForScheduling,
  employeeId: string,
  date: string,
  dayInfo: DayInfo,
): Promise<string[]> {
  const { openMin, closeMin, breaks } = dayInfo;
  const duration = service.duration;
  const candidateStarts = buildCandidateStarts(service, openMin, closeMin);

  const dayStart = new Date(date + "T00:00:00");
  const dayEnd = new Date(date + "T23:59:59.999");

  const dayBookings = await prisma.booking.findMany({
    where: {
      employeeId,
      status: { in: [...BLOCKING_STATUSES] },
      startAt: { lt: dayEnd },
      endAt: { gt: dayStart },
    },
    include: { service: true },
  });
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

interface DayInfo {
  openMin: number;
  closeMin: number;
  breaks: { startTime: string; endTime: string }[];
}

async function getDayInfo(date: string): Promise<DayInfo | null> {
  const dow = dayOfWeek(date);

  const hours = await prisma.businessHours.findUnique({ where: { dayOfWeek: dow } });
  if (!hours || hours.isClosed) return null;

  const dayStart = new Date(date + "T00:00:00");
  const dayEnd = new Date(date + "T23:59:59.999");
  const fullDayBlock = await prisma.blockedDate.findFirst({
    where: { startDate: { lte: dayEnd }, endDate: { gte: dayStart } },
  });
  if (fullDayBlock) return null;

  const breaks = await prisma.breakTime.findMany({ where: { dayOfWeek: dow } });

  return {
    openMin: timeToMinutes(hours.openTime),
    closeMin: timeToMinutes(hours.closeTime),
    breaks,
  };
}

function buildCandidateStarts(
  service: ServiceForScheduling,
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
 * Finds the soonest real bookable slot, scanning forward from today across
 * the shop's oldest active service (used as a representative default for the
 * "próxima disponibilidad" banner on the landing page — no fabricated
 * numbers, just an actual open slot from the availability engine).
 */
export async function getNextAvailableSlot(maxDaysAhead = 14): Promise<{ date: string; time: string } | null> {
  const service = await prisma.service.findFirst({
    where: { active: true },
    orderBy: { createdAt: "asc" },
  });
  if (!service) return null;

  const today = new Date();
  for (let i = 0; i < maxDaysAhead; i++) {
    const day = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i);
    const dateStr = `${day.getFullYear()}-${String(day.getMonth() + 1).padStart(2, "0")}-${String(day.getDate()).padStart(2, "0")}`;
    const slots = await getAvailableSlots({ serviceId: service.id, date: dateStr });
    if (slots.length > 0) {
      return { date: dateStr, time: slots[0] };
    }
  }
  return null;
}

/**
 * Picks a specific employee to assign a booking to. If `employeeId` is given,
 * validates that barber is free at `time`; otherwise returns the first active
 * barber who is. Returns null if nobody is available (e.g. a race with
 * another booking submitted moments earlier).
 */
export async function pickAvailableEmployee(input: AvailabilityInput & { time: string }): Promise<string | null> {
  const service = await prisma.service.findUnique({ where: { id: input.serviceId } });
  if (!service || !service.active) return null;

  const employees = input.employeeId
    ? await prisma.employee.findMany({ where: { id: input.employeeId } })
    : await prisma.employee.findMany({ where: { active: true } });
  if (employees.length === 0) return null;

  const dayInfo = await getDayInfo(input.date);
  if (!dayInfo) return null;

  for (const employee of employees) {
    const slots = await getAvailableSlotsForEmployee(service, employee.id, input.date, dayInfo);
    if (slots.includes(input.time)) return employee.id;
  }
  return null;
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
