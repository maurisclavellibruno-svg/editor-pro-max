import Image from "next/image";

interface HeroProps {
  name: string;
  nextSlotLabel: string | null;
}

// Critical content (headline, photo, CTA) renders fully visible — no
// entrance animation to wait out. A Meta Ads click needs to land on
// something real in the first paint, not a blank screen settling in.
export function Hero({ name, nextSlotLabel }: HeroProps) {
  return (
    <section className="grain relative overflow-hidden bg-noir px-6 pb-10 pt-8 text-ivory sm:pb-16 sm:pt-14">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(198,161,91,0.16),transparent_60%)]" />
      <div className="relative mx-auto grid max-w-5xl items-center gap-8 sm:grid-cols-[1.1fr_0.9fr] sm:gap-10">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            No elijas un corte al azar.
            <br />
            Elegí el que te favorece.
          </h1>
          <p className="mt-4 max-w-xl text-base text-ivory-soft sm:text-lg">
            Analizamos tu rostro y tu estilo para recomendarte el corte que mejor funciona para vos.
          </p>

          <div className="relative mx-auto mt-6 w-full max-w-xs animate-fade-in sm:hidden">
            <HeroPhoto name={name} />
          </div>

          <p className="mt-6 text-sm text-ivory-soft">
            +200 clientes asesorados
            {nextSlotLabel && <> · Próximo turno: {nextSlotLabel}</>}
          </p>

          <a
            href="#servicios"
            className="mt-5 inline-flex h-14 w-full items-center justify-center rounded-full bg-gold px-8 text-lg font-medium text-noir shadow-gold transition-transform hover:scale-[1.02] active:scale-[0.98] sm:w-auto"
          >
            Ver servicios
          </a>
          <p className="mt-2 text-xs text-ivory-soft/70">Reservás en 1 minuto · Sin crear cuenta</p>
        </div>

        <div className="relative mx-auto hidden w-full max-w-xs sm:block">
          <HeroPhoto name={name} />
        </div>
      </div>
    </section>
  );
}

function HeroPhoto({ name }: { name: string }) {
  return (
    <>
      <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gold/15 blur-3xl" />
      <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-gold/20 shadow-gold">
        <Image
          src="/assets/mauris.jpg"
          alt={`${name} — barbero`}
          fill
          sizes="(min-width: 640px) 400px, 85vw"
          quality={90}
          className="object-cover"
          priority
        />
      </div>
    </>
  );
}
