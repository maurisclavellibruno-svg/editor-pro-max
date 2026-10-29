import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { whatsappHref } from "@/lib/whatsapp";

interface HeroProps {
  name: string;
  instagramHandle: string;
  whatsappNumber: string;
}

export function Hero({ name, instagramHandle, whatsappNumber }: HeroProps) {
  return (
    <section className="grain relative overflow-hidden bg-noir px-6 pb-20 pt-28 text-ivory sm:pb-28 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(198,161,91,0.16),transparent_60%)]" />
      <div className="relative mx-auto grid max-w-5xl items-center gap-12 sm:grid-cols-[1.1fr_0.9fr] sm:gap-10">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <span className="animate-fade-in rounded-full border border-gold/25 bg-gold/5 px-4 py-1.5 text-sm text-gold">
            {name} · @{instagramHandle}
          </span>
          <h1 className="mt-6 font-display text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block animate-rise-in [animation-delay:60ms]">No elijas un corte</span>
            <span className="block animate-rise-in [animation-delay:160ms]">al azar.</span>
            <span className="block animate-rise-in [animation-delay:260ms]">Elegí el que te favorece.</span>
          </h1>
          <svg viewBox="0 0 260 14" className="mt-3 h-3.5 w-48 text-gold sm:w-64" fill="none" aria-hidden="true">
            <path
              className="draw-line-path"
              d="M2 10 C 50 2, 110 12, 150 5 S 230 1, 258 7"
              pathLength={1}
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
          <p className="mt-6 max-w-xl animate-rise-in text-lg text-ivory-soft [animation-delay:380ms] sm:text-xl">
            Analizamos la forma de tu rostro, tus facciones, tu estilo de vida y lo que buscás
            transmitir para recomendarte el corte que mejor funciona para vos.
          </p>
          <div className="relative mt-10 flex animate-rise-in flex-col items-center gap-3 [animation-delay:480ms] sm:flex-row">
            <div className="relative">
              <span className="absolute -inset-2 animate-pulse-ring rounded-full bg-gold/30 blur-md" />
              <ButtonLink href="/reservar" variant="gold" size="lg" className="relative">
                Reservá tu turno
              </ButtonLink>
            </div>
            <a
              href={whatsappHref(whatsappNumber, "Hola, quiero saber más sobre la asesoría.")}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-ivory-soft underline-offset-4 hover:text-ivory hover:underline"
            >
              o escribinos por WhatsApp
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-xs animate-rise-in [animation-delay:200ms] sm:max-w-none">
          <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gold/15 blur-3xl" />
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-gold/20 shadow-gold">
            <Image
              src="/assets/mauris.jpg"
              alt={`${name} — barbero`}
              fill
              sizes="(min-width: 640px) 360px, 280px"
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-4 left-1/2 w-max -translate-x-1/2 rounded-full border border-gold/20 bg-noir/90 px-4 py-2 text-xs font-medium text-gold backdrop-blur sm:left-4 sm:translate-x-0">
            Asesoría personalizada · Montevideo
          </div>
        </div>
      </div>
    </section>
  );
}
