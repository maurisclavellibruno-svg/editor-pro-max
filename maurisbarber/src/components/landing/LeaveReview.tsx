import { Section } from "@/components/ui/Section";
import { ReviewForm } from "@/components/landing/ReviewForm";

export function LeaveReview() {
  return (
    <Section
      id="dejar-resena"
      eyebrow="¿Ya viviste la asesoría?"
      title="Contanos cómo te fue"
      subtitle="Tu reseña se revisa antes de publicarse."
    >
      <ReviewForm />
    </Section>
  );
}
