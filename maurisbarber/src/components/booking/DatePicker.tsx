"use client";

const DAY_LABELS = ["dom", "lun", "mar", "mié", "jue", "vie", "sáb"];

function toDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

interface DatePickerProps {
  selectedDate: string | null;
  onSelect: (date: string) => void;
  daysAhead?: number;
}

export function DatePicker({ selectedDate, onSelect, daysAhead = 21 }: DatePickerProps) {
  const days = Array.from({ length: daysAhead }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() + i);
    return date;
  });

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {days.map((date) => {
        const dateStr = toDateStr(date);
        const isSelected = dateStr === selectedDate;
        return (
          <button
            key={dateStr}
            type="button"
            onClick={() => onSelect(dateStr)}
            className={`flex min-w-[64px] shrink-0 flex-col items-center rounded-2xl border px-3 py-3 transition-colors ${
              isSelected
                ? "border-gold bg-gold text-noir"
                : "border-gold/15 bg-noir-soft text-ivory hover:border-gold/40"
            }`}
          >
            <span className="text-xs uppercase opacity-70">{DAY_LABELS[date.getDay()]}</span>
            <span className="text-lg font-semibold">{date.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
}
