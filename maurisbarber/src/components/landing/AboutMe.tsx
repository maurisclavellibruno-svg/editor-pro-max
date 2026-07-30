import Image from "next/image";
import { Section } from "@/components/ui/Section";
import { ButtonLink } from "@/components/ui/Button";

// Swap for the real photo: drop it in public/assets/ and set
// hasPhoto = true with the right src below.
const hasPhoto = false;
const photoSrc = "/assets/mauris.jpg";

export function AboutMe() {
  return (
    <Section eyebrow="¿Quién te va a asesorar?" title="Conocé a Mauris">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
        <div className="shrink-0">
          {hasPhoto ? (
            <Image
              src={photoSrc}
              alt="Mauris"
              width={160}
              height={160}
              className="h-40 w-40 rounded-full border border-line object-cover shadow-card"
            />
          ) : (
            <div className="flex h-40 w-40 items-center justify-center rounded-full border border-line bg-surface-alt shadow-card">
              <svg viewBox="0 0 24 24" className="h-16 w-16 fill-ink-muted">
                <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 2.24-8 5v2h16v-2c0-2.76-3.58-5-8-5Z" />
              </svg>
            </div>
          )}
        </div>
        <div>
          <p className="text-ink-soft">
            Mi trabajo no termina en la tijera. Antes de cortar, analizo la forma de tu rostro, tus
            facciones y tu estilo de vida para encontrar el corte que realmente potencia tus rasgos
            y se adapta a tu personalidad. La asesoría es el paso que hace la diferencia entre un
            corte cualquiera y el corte que te queda bien a vos.
          </p>
          <div className="mt-6">
            <ButtonLink href="/reservar" variant="outline" size="md">
              Reservar mi asesoría
            </ButtonLink>
          </div>
        </div>
      </div>
    </Section>
  );
}
