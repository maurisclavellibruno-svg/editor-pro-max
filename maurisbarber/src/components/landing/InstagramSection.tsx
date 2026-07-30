import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

export function InstagramSection({ instagramHandle }: { instagramHandle: string }) {
  return (
    <Section
      eyebrow="Instagram"
      title="Seguinos de cerca"
      subtitle="Mirá nuestros últimos trabajos y novedades."
      className="bg-surface-alt text-center"
    >
      <ButtonLink
        href={`https://instagram.com/${instagramHandle}`}
        variant="outline"
        size="lg"
      >
        @{instagramHandle}
      </ButtonLink>
    </Section>
  );
}
