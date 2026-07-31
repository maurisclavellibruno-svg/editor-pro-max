import { Section } from "@/components/ui/Section";
import { prisma } from "@/lib/prisma";

// Placeholder testimonials centered on the consultation, not just the cut —
// se muestran de relleno hasta que haya suficientes reseñas reales aprobadas.
const placeholders = [
  {
    name: "Federico G.",
    quote: "Nunca nadie me había explicado qué corte realmente me favorecía.",
    rating: null as number | null,
  },
  {
    name: "Rodrigo M.",
    quote: "Entendí qué estilos funcionan con mi rostro y ahora sé qué pedir.",
    rating: null as number | null,
  },
  {
    name: "Bruno L.",
    quote: "La asesoría hizo toda la diferencia. Ya es mi barbero de cabecera.",
    rating: null as number | null,
  },
];

export async function Testimonials() {
  const approved = await prisma.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
    take: 6,
  });

  const real = approved.map((r) => ({ name: r.name, quote: r.text, rating: r.rating }));
  // Real reviews first; only pad with placeholders while there aren't enough yet.
  const testimonials = real.length >= 3 ? real : [...real, ...placeholders].slice(0, 3);

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
            key={t.name + t.quote}
            className="rounded-2xl border border-line bg-white p-6 shadow-card"
          >
            {t.rating && (
              <p className="mb-2 text-accent" aria-label={`${t.rating} de 5 estrellas`}>
                {"★".repeat(t.rating)}
                <span className="text-line">{"★".repeat(5 - t.rating)}</span>
              </p>
            )}
            <p className="text-ink-soft">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-4 text-sm font-medium text-ink-muted">— {t.name}</footer>
          </blockquote>
        ))}
      </div>
    </Section>
  );
}
