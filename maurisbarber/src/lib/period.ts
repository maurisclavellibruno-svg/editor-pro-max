export type Period = "day" | "week" | "month" | "year";

export interface DateRange {
  start: Date;
  end: Date; // exclusive
}

// Weeks start on Monday to match the agenda (firstDay=1 in FullCalendar).
export function getRangeForPeriod(period: Period, reference: Date = new Date()): DateRange {
  const start = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());

  switch (period) {
    case "day": {
      const end = new Date(start);
      end.setDate(end.getDate() + 1);
      return { start, end };
    }
    case "week": {
      const dow = start.getDay();
      const diffToMonday = dow === 0 ? -6 : 1 - dow;
      start.setDate(start.getDate() + diffToMonday);
      const end = new Date(start);
      end.setDate(end.getDate() + 7);
      return { start, end };
    }
    case "month": {
      const monthStart = new Date(start.getFullYear(), start.getMonth(), 1);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      return { start: monthStart, end };
    }
    case "year": {
      const yearStart = new Date(start.getFullYear(), 0, 1);
      const end = new Date(start.getFullYear() + 1, 0, 1);
      return { start: yearStart, end };
    }
  }
}

export function eachDay(range: DateRange): Date[] {
  const days: Date[] = [];
  const cursor = new Date(range.start);
  while (cursor < range.end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
