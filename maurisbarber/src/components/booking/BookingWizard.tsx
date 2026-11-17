"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { DatePicker } from "@/components/booking/DatePicker";
import { createBooking } from "@/actions/booking";
import { getEffectivePrice, type PriceableService } from "@/lib/pricing";
import { whatsappHref, normalizeUyPhone } from "@/lib/whatsapp";
import { trackMetaEvent } from "@/lib/metaPixel";

export interface WizardService extends PriceableService {
  id: string;
  slug: string | null;
  name: string;
  description: string;
  duration: number;
  color: string;
  badge: string | null;
}

interface Employee {
  id: string;
  name: string;
}

type Step = "service" | "upsell" | "barbero" | "date" | "time" | "contact" | "done";

const WEEKDAYS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

function formatSpanishDate(dateStr: string): string {
  const [year, month, day] = dateStr.split("-").map(Number);
  const date = new Date(year, month - 1, day);
  const weekday = WEEKDAYS[date.getDay()];
  return `${weekday.charAt(0).toUpperCase()}${weekday.slice(1)} ${day} de ${MONTHS[month - 1]}`;
}

export function BookingWizard({
  services,
  employees,
  address,
  whatsappNumber,
  initialServiceSlug,
  utm,
}: {
  services: WizardService[];
  employees: Employee[];
  address: string;
  whatsappNumber: string;
  initialServiceSlug?: string;
  utm?: { source?: string; campaign?: string; content?: string };
}) {
  const router = useRouter();
  const initialService = initialServiceSlug ? services.find((s) => s.slug === initialServiceSlug) : null;

  const [step, setStep] = useState<Step>(() => {
    if (!initialService) return "service";
    // Same upsell rule as picking "Corte" from the in-wizard list — most
    // traffic lands here via a deep link from the home page's own
    // "Reservar" button, not by picking from the list, so this has to be
    // checked here too or the upsell would almost never actually show.
    if (initialService.name.trim().toLowerCase() === "corte") return "upsell";
    return employees.length > 1 ? "barbero" : "date";
  });
  const [serviceId, setServiceId] = useState<string | null>(initialService?.id ?? null);
  const [employeeId, setEmployeeId] = useState<string>("");
  const [date, setDate] = useState<string | null>(null);
  const [time, setTime] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [disabledDates, setDisabledDates] = useState<Set<string>>(new Set());
  const [loadingDisabledDates, setLoadingDisabledDates] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [joinLoyaltyCard, setJoinLoyaltyCard] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === serviceId) ?? null;
  const selectedEmployee = employees.find((e) => e.id === employeeId) ?? null;
  const effectivePrice = selectedService
    ? getEffectivePrice(selectedService, date ? new Date(`${date}T12:00:00-03:00`) : new Date())
    : null;

  // The /reservar page view itself — fires once on mount.
  useEffect(() => {
    trackMetaEvent("ViewContent");
    if (initialService) trackMetaEvent("InitiateCheckout", { content_name: initialService.name });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Pre-fetch which of the next 21 days have zero free slots, so closed/full
  // days show grayed out instead of the customer finding out after tapping.
  useEffect(() => {
    if (!serviceId || step !== "date") return;
    setLoadingDisabledDates(true);
    const today = new Date();
    const from = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const employeeParam = employeeId ? `&employeeId=${employeeId}` : "";
    fetch(`/api/disponibilidad/dias?serviceId=${serviceId}&from=${from}&days=21${employeeParam}`)
      .then((res) => res.json())
      .then((data) => setDisabledDates(new Set<string>(data.unavailable ?? [])))
      .finally(() => setLoadingDisabledDates(false));
  }, [serviceId, employeeId, step]);

  function selectService(service: WizardService) {
    setServiceId(service.id);
    trackMetaEvent("InitiateCheckout", { content_name: service.name });
    if (service.name.trim().toLowerCase() === "corte") {
      setStep("upsell");
      return;
    }
    setStep(employees.length > 1 ? "barbero" : "date");
  }

  function acceptUpsell() {
    const advisory = services.find((s) => s.slug === "asesoria-corte");
    if (advisory) {
      setServiceId(advisory.id);
      trackMetaEvent("InitiateCheckout", { content_name: advisory.name });
    }
    setStep(employees.length > 1 ? "barbero" : "date");
  }

  function declineUpsell() {
    setStep(employees.length > 1 ? "barbero" : "date");
  }

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
    if (utm?.source) formData.set("utmSource", utm.source);
    if (utm?.campaign) formData.set("utmCampaign", utm.campaign);
    if (utm?.content) formData.set("utmContent", utm.content);

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
    if (selectedService && effectivePrice) {
      trackMetaEvent("Schedule", { value: effectivePrice.price, currency: "UYU" });
    }
    setStep("done");
  }

  const isAdvisory = selectedService?.slug?.startsWith("asesoria") ?? false;
  const depositMessage =
    date && time
      ? `Hola, reservé una asesoría para el ${formatSpanishDate(date)} a las ${time}. Te mando el comprobante de la seña.`
      : "";

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
            {services.map((service) => {
              const price = getEffectivePrice(service);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => selectService(service)}
                  className="flex w-full items-center justify-between rounded-2xl border border-gold/15 bg-noir-soft p-5 text-left transition-colors hover:border-gold/40"
                >
                  <div>
                    <p className="font-medium text-ivory">
                      {service.name}
                      {service.badge && (
                        <span className="ml-2 rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-gold">
                          {service.badge}
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-ivory-soft">{service.duration} min</p>
                  </div>
                  <div className="shrink-0 text-right">
                    {price.originalPrice && (
                      <p className="text-xs text-ivory-soft/60 line-through">${price.originalPrice}</p>
                    )}
                    <p className="font-semibold text-gold">${price.price}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {step === "upsell" && selectedService && (
          <div className="mt-8 animate-rise-in space-y-4">
            <h1 className="font-display text-2xl font-semibold text-ivory">
              ¿Querés saber qué corte te queda mejor?
            </h1>
            {(() => {
              const advisory = services.find((s) => s.slug === "asesoria-corte");
              const diff = advisory ? getEffectivePrice(advisory).price - getEffectivePrice(selectedService).price : null;
              return (
                <p className="text-ivory-soft">
                  Pasate a <span className="font-medium text-ivory">Asesoría + corte</span>
                  {diff !== null && ` por $${diff} más`}. Analizo tu cara y tu estilo antes de cortar, y te llevás un
                  PDF con tu corte y cómo mantenerlo.
                </p>
              );
            })()}
            <div className="space-y-3">
              <Button type="button" variant="gold" size="lg" className="w-full" onClick={acceptUpsell}>
                Sí, quiero la asesoría
              </Button>
              <Button type="button" variant="goldOutline" size="lg" className="w-full" onClick={declineUpsell}>
                No, solo el corte
              </Button>
            </div>
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
                disabledDates={disabledDates}
                loadingDisabled={loadingDisabledDates}
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
              {selectedEmployee && ` · ${selectedEmployee.name}`} · {date && formatSpanishDate(date)}
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

        {step === "contact" && selectedService && effectivePrice && (
          <form onSubmit={handleSubmit} className="mt-8 animate-rise-in space-y-4">
            <h1 className="font-display text-2xl font-semibold text-ivory">Tus datos</h1>

            <div className="rounded-xl border border-gold/20 bg-noir-soft p-4 text-sm">
              <p className="font-medium text-ivory">{selectedService.name}</p>
              <dl className="mt-2 space-y-1 text-ivory-soft">
                <div className="flex justify-between">
                  <dt>Día</dt>
                  <dd className="text-ivory">{date && formatSpanishDate(date)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Hora</dt>
                  <dd className="text-ivory">{time}</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Duración</dt>
                  <dd className="text-ivory">{selectedService.duration} min</dd>
                </div>
                <div className="flex justify-between">
                  <dt>Precio</dt>
                  <dd className="text-gold">
                    {effectivePrice.originalPrice && (
                      <span className="mr-1.5 text-ivory-soft/60 line-through">${effectivePrice.originalPrice}</span>
                    )}
                    ${effectivePrice.price}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Dirección</dt>
                  <dd className="text-right text-ivory">{address}</dd>
                </div>
              </dl>
            </div>

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
            <p className="text-center text-xs text-ivory-soft/70">Reservás en 1 minuto · Sin crear cuenta</p>
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
              Te esperamos {date && formatSpanishDate(date).toLowerCase()} a las {time} para tu{" "}
              {selectedService?.name}.
            </p>
            {joinLoyaltyCard && (
              <p className="mt-2 text-sm text-gold">Ya quedaste sumado al club MaurisBarber ✓</p>
            )}

            {isAdvisory && (
              <div className="mt-6 rounded-2xl border border-gold/20 bg-noir-soft p-5 text-left text-sm">
                <p className="font-medium text-ivory">Para confirmar tu asesoría, transferí una seña de $500:</p>
                <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-noir px-4 py-3">
                  <div className="text-ivory-soft">
                    <p>Prex · BRUNO MAURIS</p>
                    <p>Cuenta 1823052</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigator.clipboard?.writeText("1823052")}
                    className="shrink-0 rounded-full border border-gold/40 px-3 py-1.5 text-xs font-medium text-gold hover:border-gold"
                  >
                    Copiar
                  </button>
                </div>
                <p className="mt-3 text-ivory-soft">
                  La seña se descuenta del total. Cuando transfieras, mandanos el comprobante por WhatsApp.
                </p>
                <a
                  href={whatsappHref(normalizeUyPhone(whatsappNumber), depositMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackMetaEvent("Contact")}
                  className="mt-4 flex w-full items-center justify-center rounded-full bg-[#25D366] px-4 py-3 text-sm font-medium text-white hover:opacity-90"
                >
                  Enviar comprobante por WhatsApp
                </a>
              </div>
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
  const currentIndex = steps.indexOf(step === "upsell" ? "service" : step);
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
