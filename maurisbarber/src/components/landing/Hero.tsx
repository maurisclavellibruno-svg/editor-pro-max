import { ButtonLink } from "@/components/ui/Button";
import { whatsappHref } from "@/lib/whatsapp";

interface HeroProps {
  name: string;
  instagramHandle: string;
  whatsappNumber: string;
}

export function Hero({ name, instagramHandle, whatsappNumber }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-surface-dark px-6 pb-20 pt-28 text-white sm:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(22,163,74,0.18),transparent_60%)]" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="animate-fade-in rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/70">
          {name} · @{instagramHandle}
        </span>
        <h1 className="mt-6 animate-rise-in text-4xl font-semibold tracking-tight sm:text-6xl">
          No elijas un corte al azar.
          <br />
          Elegí el que realmente te favorece.
        </h1>
        <p className="mt-5 max-w-xl animate-rise-in text-lg text-white/60 sm:text-xl">
          Analizamos la forma de tu rostro, tus facciones, tu estilo de vida y lo que buscás
          transmitir para recomendarte el corte que mejor funciona para vos.
        </p>
        <div className="mt-10 flex animate-rise-in flex-col items-center gap-3 sm:flex-row">
          <ButtonLink href="/reservar" variant="accent" size="lg" className="shadow-floating">
            Reservar mi asesoría
          </ButtonLink>
          <a
            href={whatsappHref(whatsappNumber, "Hola, quiero saber más sobre la asesoría.")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-white/70 underline-offset-4 hover:text-white hover:underline"
          >
            o escribinos por WhatsApp →
          </a>
        </div>
      </div>
    </section>
  );
}
