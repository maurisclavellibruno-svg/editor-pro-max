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

export function ResultsGallery() {
  return (
    <Section
      eyebrow="Resultados"
      title="Cambios reales, de nuestras asesorías"
      subtitle="Deslizá para ver la diferencia entre el antes y el después."
      className="bg-surface-alt"
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
    </Section>
  );
}
