import Link from "next/link";
import { Section } from "@/components/ui/Section";
import { BeforeAfterSlider } from "@/components/landing/BeforeAfterSlider";

// Add more pairs here as new client photos come in — drop them in
// public/assets/results/ and push a new entry.
const results = [
  {
    before: "/assets/results/cliente-1-antes.jpg",
    after: "/assets/results/cliente-1-despues.jpg",
    alt: "Resultado de asesoría de estilo",
  },
  {
    before: "/assets/results/cliente-2-antes.jpg",
    after: "/assets/results/cliente-2-despues.jpg",
    alt: "Resultado de asesoría de estilo",
  },
  {
    before: "/assets/results/cliente-3-antes.jpg",
    after: "/assets/results/cliente-3-despues.jpg",
    alt: "Resultado de asesoría de estilo",
  },
];

export function ResultsGallery({ reservarHref }: { reservarHref: string }) {
  return (
    <Section
      eyebrow="Resultados"
      title="Cambios reales, de nuestras asesorías"
      subtitle="Deslizá para ver la diferencia entre el antes y el después."
      className="bg-noir-soft"
    >
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {results.map((result, i) => (
          <BeforeAfterSlider
            key={i}
            beforeSrc={result.before}
            afterSrc={result.after}
            alt={result.alt}
          />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href={reservarHref}
          className="inline-flex h-12 items-center justify-center rounded-full bg-gold px-8 text-sm font-medium text-noir transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Quiero mi asesoría
        </Link>
      </div>
    </Section>
  );
}
