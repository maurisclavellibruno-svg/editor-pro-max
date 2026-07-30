import { Section } from "@/components/ui/Section";

// Placeholder testimonials centered on the consultation, not just the cut —
// reemplazar por reseñas reales de clientes cuando estén disponibles.
const testimonials = [
  {
    name: "Federico G.",
    quote: "Nunca nadie me había explicado qué corte realmente me favorecía.",
  },
  {
    name: "Rodrigo M.",
    quote: "Entendí qué estilos funcionan con mi rostro y ahora sé qué pedir.",
  },
  {
    name: "Bruno L.",
    quote: "La asesoría hizo toda la diferencia. Ya es mi barbero de cabecera.",
  },
];

export function Testimonials() {
  return (
    <Section
      id="testimonios"
      eyebrow="Testimonios"
      title="Lo que dicen nuestros clientes"
      className="bg-surface-alt"
    >
      <div className="grid gap-4 sm:grid-cols-3">
        {testimonials.map((t) => (
          <blockquote
            key={t.name}
            className="rounded-2xl border border-line bg-white p-6 shadow-card"
          >
            <p className="text-ink-soft">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-4 text-sm font-medium text-ink-muted">— {t.name}</footer>
          </blockquote>
        ))}
      </div>
    </Section>
  );
}
