"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/booking/DatePicker";
import { createBooking } from "@/actions/booking";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  color: string;
}

interface Employee {
  id: string;
  name: string;
}

type Step = "service" | "barbero" | "date" | "time" | "contact" | "done";

export function BookingWizard({ services, employees }: { services: Service[]; employees: Employee[] }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("service");
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [employeeId, setEmployeeId] = useState<string>("");
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  // Checked by default — opt-out, not opt-in. The club was going mostly
  // unnoticed as a passive banner; this is the highest-intent moment to
  // offer it (they're already booking), and it's a free, visible,
  // easy-to-uncheck toggle, not a dark pattern.
  const [joinLoyaltyCard, setJoinLoyaltyCard] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === serviceId) ?? null;
  const selectedEmployee = employees.find((e) => e.id === employeeId) ?? null;

  useEffect(() => {
    if (!serviceId || !date) return;
    setLoadingSlots(true);
    setTime(null);
    const employeeParam = employeeId ? `&employeeId=${employeeId}` : "";
    fetch(`/api/disponibilidad?serviceId=${serviceId}&date=${date}${employeeParam}`)
      .then((res) => res.json())
      .then((data) => setSlots(data.slots ?? []))
      .finally(() => setLoadingSlots(false));
  }, [serviceId, employeeId, date]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!serviceId || !date || !time) return;
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("serviceId", serviceId);
    formData.set("employeeId", employeeId);
    formData.set("date", date);
    formData.set("time", time);
    formData.set("firstName", firstName);
    formData.set("lastName", lastName);
    formData.set("phone", phone);
    formData.set("email", email);
    formData.set("joinLoyaltyCard", String(joinLoyaltyCard));

    let result;
    try {
      result = await createBooking(formData);
    } catch {
      setSubmitting(false);
      setError("No pudimos guardar tu reserva. Probá de nuevo.");
      return;
    }
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "No pudimos guardar tu reserva. Probá de nuevo.");
      return;
    }
    setStep("done");
  }

  return (
    <div className="theme-dark min-h-screen bg-noir">
      <div className="mx-auto max-w-xl px-6 py-16">
        <button
          type="button"
          onClick={() => router.push("/")}
          className="mb-8 text-sm font-medium text-ivory-soft hover:text-ivory"
        >
          ← Volver al inicio
        </button>

        <StepIndicator step={step} hasBarberoStep={employees.length > 1} />

        {step === "service" && (
          <div className="mt-8 animate-rise-in space-y-3">
            <h1 className="font-display text-2xl font-semibold text-ivory">¿Qué servicio querés reservar?</h1>
            {services.map((service) => (
              <button
                key={service.id}
                type="button"
                onClick={() => {
                  setServiceId(service.id);
                  setStep(employees.length > 1 ? "barbero" : "date");
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-gold/15 bg-noir-soft p-5 text-left transition-colors hover:border-gold/40"
              >
                <div>
                  <p className="font-medium text-ivory">{service.name}</p>
                  <p className="text-sm text-ivory-soft">{service.duration} min</p>
                </div>
                <p className="font-semibold text-gold">${service.price}</p>
              </button>
            ))}
          </div>
        )}

        {step === "barbero" && (
          <div className="mt-8 animate-rise-in space-y-3">
            <h1 className="font-display text-2xl font-semibold text-ivory">¿Con quién preferís tu turno?</h1>
            <p className="mt-1 text-sm text-ivory-soft">{selectedService?.name}</p>
            <button
              type="button"
              onClick={() => {
                setEmployeeId("");
                setStep("date");
              }}
              className="flex w-full items-center justify-between rounded-2xl border border-gold/15 bg-noir-soft p-5 text-left transition-colors hover:border-gold/40"
            >
              <p className="font-medium text-ivory">Cualquiera disponible</p>
            </button>
            {employees.map((employee) => (
              <button
                key={employee.id}
                type="button"
                onClick={() => {
                  setEmployeeId(employee.id);
                  setStep("date");
                }}
                className="flex w-full items-center justify-between rounded-2xl border border-gold/15 bg-noir-soft p-5 text-left transition-colors hover:border-gold/40"
              >
                <p className="font-medium text-ivory">{employee.name}</p>
              </button>
            ))}
            <BackButton onClick={() => setStep("service")} />
          </div>
        )}

        {step === "date" && (
          <div className="mt-8 animate-rise-in">
            <h1 className="font-display text-2xl font-semibold text-ivory">Elegí el día</h1>
            <p className="mt-1 text-sm text-ivory-soft">
              {selectedService?.name}
              {selectedEmployee && ` · ${selectedEmployee.name}`}
            </p>
            <div className="mt-6">
              <DatePicker
                selectedDate={date}
                onSelect={(d) => {
                  setDate(d);
                  setStep("time");
                }}
              />
            </div>
            <BackButton onClick={() => setStep(employees.length > 1 ? "barbero" : "service")} />
          </div>
        )}

        {step === "time" && (
          <div className="mt-8 animate-rise-in">
            <h1 className="font-display text-2xl font-semibold text-ivory">Elegí el horario</h1>
            <p className="mt-1 text-sm text-ivory-soft">
              {selectedService?.name}
              {selectedEmployee && ` · ${selectedEmployee.name}`} · {date}
            </p>
            <div className="mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
              {loadingSlots && <p className="col-span-full text-sm text-ivory-soft">Cargando horarios…</p>}
              {!loadingSlots && slots.length === 0 && (
                <p className="col-span-full text-sm text-ivory-soft">
                  No hay horarios disponibles ese día. Elegí otra fecha.
                </p>
              )}
              {slots.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    setTime(t);
                    setStep("contact");
                  }}
                  className="rounded-xl border border-gold/15 bg-noir-soft py-3 text-sm font-medium text-ivory transition-colors hover:border-gold hover:text-gold"
                >
                  {t}
                </button>
              ))}
            </div>
            <BackButton onClick={() => setStep("date")} />
          </div>
        )}

        {step === "contact" && (
          <form onSubmit={handleSubmit} className="mt-8 animate-rise-in space-y-4">
            <h1 className="font-display text-2xl font-semibold text-ivory">Tus datos</h1>
            <p className="text-sm text-ivory-soft">
              {selectedService?.name} · {date} · {time}
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre" value={firstName} onChange={setFirstName} required />
              <Field label="Apellido" value={lastName} onChange={setLastName} required />
            </div>
            <Field label="Teléfono" value={phone} onChange={setPhone} required type="tel" />
            <Field label="Email (opcional)" value={email} onChange={setEmail} type="email" />

            <label className="flex items-start gap-3 rounded-xl border border-gold/20 bg-noir-soft p-4 text-sm">
              <input
                type="checkbox"
                checked={joinLoyaltyCard}
                onChange={(e) => setJoinLoyaltyCard(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-gold"
              />
              <span className="text-ivory-soft">
                <span className="font-medium text-ivory">Sumarme al club MaurisBarber</span> — cada 6
                cortes, el 6to es gratis.
              </span>
            </label>

            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" variant="gold" size="lg" className="w-full" disabled={submitting}>
              {submitting ? "Confirmando…" : "Confirmar reserva"}
            </Button>
            <BackButton onClick={() => setStep("time")} />
          </form>
        )}

        {step === "done" && (
          <div className="mt-8 animate-rise-in text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 text-3xl text-gold">
              ✓
            </div>
            <h1 className="font-display text-2xl font-semibold text-ivory">¡Reserva confirmada!</h1>
            <p className="mt-2 text-ivory-soft">
              Te esperamos el {date} a las {time} para tu {selectedService?.name}.
            </p>
            {joinLoyaltyCard && (
              <p className="mt-2 text-sm text-gold">Ya quedaste sumado al club MaurisBarber ✓</p>
            )}
            <Button variant="goldOutline" size="md" className="mt-8" onClick={() => router.push("/")}>
              Volver al inicio
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ step, hasBarberoStep }: { step: Step; hasBarberoStep: boolean }) {
  const steps: Step[] = hasBarberoStep
    ? ["service", "barbero", "date", "time", "contact"]
    : ["service", "date", "time", "contact"];
  const currentIndex = steps.indexOf(step);
  if (step === "done") return null;
  return (
    <div className="flex gap-2">
      {steps.map((s, i) => (
        <div
          key={s}
          className={`h-1.5 flex-1 rounded-full transition-colors ${
            i <= currentIndex ? "bg-gold" : "bg-ivory/10"
          }`}
        />
      ))}
    </div>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="mt-6 text-sm font-medium text-ivory-soft hover:text-ivory">
      ← Atrás
    </button>
  );
}

function Field({
  label,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium text-ivory-soft">
        {label}
        {required && <span className="text-gold"> *</span>}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-gold/20 bg-noir-soft px-4 py-3 text-ivory outline-none transition-colors focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-noir"
      />
    </label>
  );
}
