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
  // Show every real review that's been approved, best-rated first. Only
  // fall back to the placeholders while there isn't a single real one yet.
  const sorted = real.length > 0 ? [...real].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0)) : placeholders;
  const top4 = sorted.slice(0, 4);

  return (
    <Section
      id="testimonios"
      eyebrow="Testimonios"
      title="Lo que dicen nuestros clientes"
      className="bg-noir-soft"
    >
      <div className="flex gap-4 overflow-x-auto pb-2 sm:grid sm:grid-cols-4 sm:overflow-visible">
        {top4.map((t) => (
          <blockquote
            key={t.name + t.quote}
            className="w-[82vw] shrink-0 rounded-2xl border border-gold/15 bg-noir p-6 sm:w-auto"
          >
            {t.rating && (
              <p className="mb-2 text-gold" aria-label={`${t.rating} de 5 estrellas`}>
                {"★".repeat(t.rating)}
                <span className="text-gold/20">{"★".repeat(5 - t.rating)}</span>
              </p>
            )}
            <p className="text-ivory-soft">&ldquo;{t.quote}&rdquo;</p>
            <footer className="mt-4 text-sm font-medium text-ivory-soft">— {t.name}</footer>
          </blockquote>
        ))}
      </div>
    </Section>
  );
}
