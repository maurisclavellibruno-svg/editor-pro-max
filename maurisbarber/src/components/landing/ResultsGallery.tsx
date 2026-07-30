import { Section } from "@/components/ui/Section";
import { BeforeAfterSlider } from "@/components/landing/BeforeAfterSlider";

// Swap these paths for real client photos (drop the files in
// public/assets/results/ and update the entries below — before/after pairs
// keep the placeholder graphic until then).
const results = [
  {
    before: "/assets/results/placeholder-before.svg",
    after: "/assets/results/placeholder-after.svg",
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
