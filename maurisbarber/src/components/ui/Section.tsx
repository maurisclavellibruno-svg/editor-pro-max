import { Reveal } from "@/components/ui/Reveal";

interface SectionProps {
  id?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
  children: React.ReactNode;
}

export function Section({ id, eyebrow, title, subtitle, className = "", children }: SectionProps) {
  return (
    <section id={id} className={`relative w-full bg-noir text-ivory ${className}`}>
      <div className="mx-auto max-w-5xl px-6 py-20 sm:py-28">
        <Reveal className="mb-12 text-center">
          {eyebrow && (
            <p className="mb-3 flex items-center justify-center gap-3 font-display text-base italic text-gold">
              <span className="h-px w-6 bg-gold/40" aria-hidden />
              {eyebrow}
            </p>
          )}
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ivory sm:text-4xl">{title}</h2>
          {subtitle && <p className="mx-auto mt-4 max-w-2xl text-lg text-ivory-soft">{subtitle}</p>}
        </Reveal>
        <Reveal delay={120}>{children}</Reveal>
      </div>
    </section>
  );
}
