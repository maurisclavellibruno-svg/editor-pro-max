import { Section } from "@/components/ui/Section";
import { prisma } from "@/lib/prisma";

// Placeholder testimonials centered on the consultation, not just the cut —
// se muestran de relleno hasta que haya suficientes reseñas reales aprobadas.
const placeholders = [
  {
    name: "Federico G.",
    quote: "Che, quedó buenísimo. Ni sabía que ese corte me quedaba tan bien jaja.",
    rating: null as number | null,
  },
  {
    name: "Rodrigo M.",
    quote: "Antes iba y pedía \"lo de siempre\" porque ni sabía qué otra cosa pedir. Ahora tengo clarísimo qué onda me queda.",
    rating: null as number | null,
  },
  {
    name: "Bruno L.",
    quote: "Un golazo el corte. Ya no voy a otro lado.",
    rating: null as number | null,
  },
];

export async function Testimonials() {
  const approved = await prisma.review.findMany({
    where: { approved: true },
    orderBy: { createdAt: "desc" },
  });

  const real = approved.map((r) => ({ name: r.name, quote: r.text, rating: r.rating }));
  // Show every real review that's been approved. Only fall back to the
  // placeholders while there isn't a single real one yet.
  const testimonials = real.length > 0 ? real : placeholders;

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
