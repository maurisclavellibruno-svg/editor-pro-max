"use client";

import { useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin, { DateClickArg } from "@fullcalendar/interaction";
import esLocale from "@fullcalendar/core/locales/es";
import type { EventClickArg, EventDropArg, EventInput } from "@fullcalendar/core";
import { rescheduleBooking } from "@/actions/admin-bookings";
import { BookingDetailModal, type BookingEventProps } from "@/components/admin/BookingDetailModal";
import { NewBookingModal } from "@/components/admin/NewBookingModal";

interface Service {
  id: string;
  name: string;
  duration: number;
  price: number;
}

interface Employee {
  id: string;
  name: string;
}

export function AgendaCalendar({ employees, services }: { employees: Employee[]; services: Service[] }) {
  const calendarRef = useRef<FullCalendar>(null);
  const [selectedEvent, setSelectedEvent] = useState<BookingEventProps | null>(null);
  const [newSlot, setNewSlot] = useState<Date | null>(null);
  const [employeeFilter, setEmployeeFilter] = useState<string>("");

  function refetch() {
    calendarRef.current?.getApi().refetchEvents();
  }

  async function handleEventDrop(info: EventDropArg) {
    try {
      await rescheduleBooking({
        bookingId: info.event.id,
        startAt: info.event.start!.toISOString(),
      });
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "No se pudo reprogramar el turno");
      info.revert();
    }
  }

  function handleEventClick(info: EventClickArg) {
    const props = info.event.extendedProps as Omit<BookingEventProps, "id" | "start" | "end">;
    setSelectedEvent({
      id: info.event.id,
      start: info.event.start!,
      end: info.event.end!,
      ...props,
    });
  }

  function handleDateClick(info: DateClickArg) {
    setNewSlot(info.date);
  }

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-card">
      {employees.length > 1 && (
        <div className="mb-4 flex items-center gap-2">
          <span className="text-sm font-medium text-ink-soft">Barbero:</span>
          <select
            value={employeeFilter}
            onChange={(e) => {
              setEmployeeFilter(e.target.value);
              refetch();
            }}
            className="rounded-xl border border-line px-3 py-2 text-sm"
          >
            <option value="">Todos</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay",
        }}
        locale={esLocale}
        firstDay={1}
        height="auto"
        slotMinTime="08:00:00"
        slotMaxTime="21:00:00"
        editable
        selectable
        eventDrop={handleEventDrop}
        eventClick={handleEventClick}
        dateClick={handleDateClick}
        events={async (info, successCallback, failureCallback) => {
          try {
            const employeeParam = employeeFilter ? `&employeeId=${employeeFilter}` : "";
            const res = await fetch(
              `/api/admin/bookings?start=${info.startStr}&end=${info.endStr}${employeeParam}`,
            );
            const data = await res.json();
            successCallback(data.events as EventInput[]);
          } catch (err) {
            failureCallback(err as Error);
          }
        }}
      />

      {selectedEvent && (
        <BookingDetailModal
          booking={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onChanged={() => {
            setSelectedEvent(null);
            refetch();
          }}
        />
      )}

      {newSlot && employees.length > 0 && (
        <NewBookingModal
          startAt={newSlot}
          employees={employees}
          defaultEmployeeId={employeeFilter || employees[0].id}
          services={services}
          onClose={() => setNewSlot(null)}
          onCreated={() => {
            setNewSlot(null);
            refetch();
          }}
        />
      )}
    </div>
  );
}
