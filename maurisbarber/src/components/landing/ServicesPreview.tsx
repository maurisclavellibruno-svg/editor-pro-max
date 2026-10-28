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
      title="Elegí qué necesitás"
      subtitle="El punto de partida es siempre el mismo: entender tu rostro y tu estilo antes de tocar la tijera."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {services.map((service) => (
          <div
            key={service.id}
            className="group rounded-2xl border border-gold/15 bg-noir-soft p-6 transition-colors duration-300 hover:border-gold/40"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <span
                  className="mb-3 inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: service.color }}
                />
                <h3 className="font-display text-lg font-semibold text-ivory">{service.name}</h3>
                <p className="mt-1 text-sm text-ivory-soft">{service.description}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="font-display text-lg font-semibold text-gold">${service.price}</p>
                <p className="text-xs text-ivory-soft">{service.duration} min</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-10 text-center">
        <ButtonLink href="/reservar" variant="gold" size="lg">
          Reservar turno
        </ButtonLink>
      </div>
    </Section>
  );
}
