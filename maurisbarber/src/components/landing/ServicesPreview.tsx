import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  color: string;
}

export function ServicesPreview({ services }: { services: Service[] }) {
  return (
    <Section
      id="servicios"
      eyebrow="Servicios"
      title="Cada asesoría termina en uno de estos"
      subtitle="El punto de partida es siempre el mismo: entender tu rostro y tu estilo antes de tocar la tijera."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <div
            key={service.id}
            className="group rounded-2xl border border-line bg-white p-6 shadow-card transition-transform duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className="mb-3 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: service.color }}
                />
                <h3 className="text-lg font-semibold text-ink">{service.name}</h3>
                <p className="mt-1 text-sm text-ink-muted">{service.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-lg font-semibold text-ink">${service.price}</p>
                <p className="text-xs text-ink-muted">{service.duration} min</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <ButtonLink href="/reservar" variant="accent" size="lg">
          Reservar mi asesoría
        </ButtonLink>
      </div>
    </Section>
  );
}
