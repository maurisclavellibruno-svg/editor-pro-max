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
    <section className="relative overflow-hidden bg-surface-dark px-6 pb-20 pt-28 text-white sm:pb-28 sm:pt-36">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(22,163,74,0.18),transparent_60%)]" />
      <div className="relative mx-auto grid max-w-5xl items-center gap-12 sm:grid-cols-[1.1fr_0.9fr] sm:gap-10">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <span className="animate-fade-in rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/70">
            {name} · @{instagramHandle}
          </span>
          <h1 className="mt-6 animate-rise-in text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
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

        <div className="relative mx-auto w-full max-w-xs animate-rise-in sm:max-w-none">
          <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-accent/20 blur-3xl" />
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 shadow-floating">
            <Image
              src="/assets/mauris.jpg"
              alt={`${name} — barbero`}
              fill
              sizes="(min-width: 640px) 360px, 280px"
              className="object-cover"
              priority
            />
          </div>
          <div className="absolute -bottom-4 left-1/2 w-max -translate-x-1/2 rounded-full border border-white/10 bg-surface-dark/90 px-4 py-2 text-xs font-medium text-white/80 shadow-floating backdrop-blur sm:left-4 sm:translate-x-0">
            Asesoría personalizada · Montevideo
          </div>
        </div>
      </div>
    </section>
  );
}
