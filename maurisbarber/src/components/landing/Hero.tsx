import { ButtonLink } from "@/components/ui/Button";

interface HeroProps {
  name: string;
  instagramHandle: string;
}

export function Hero({ name, instagramHandle }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-surface-dark px-6 pb-20 pt-28 text-white sm:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(22,163,74,0.18),transparent_60%)]" />
      <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
        <span className="animate-fade-in rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/70">
          @{instagramHandle}
        </span>
        <h1 className="mt-6 animate-rise-in text-4xl font-semibold tracking-tight sm:text-6xl">
          {name}
        </h1>
        <p className="mt-5 max-w-xl animate-rise-in text-lg text-white/60 sm:text-xl">
          Cortes, barba y color con estilo premium. Reservá tu turno online en menos de un minuto.
        </p>
        <div className="mt-10 animate-rise-in">
          <ButtonLink href="/reservar" variant="accent" size="lg" className="shadow-floating">
            Reservar turno
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
