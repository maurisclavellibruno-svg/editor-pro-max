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
    <section id={id} className={`mx-auto max-w-5xl px-6 py-20 sm:py-28 ${className}`}>
      <div className="mb-12 text-center animate-rise-in">
        {eyebrow && (
          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">{eyebrow}</p>
        )}
        <h2 className="text-3xl font-semibold tracking-tight text-ink sm:text-4xl">{title}</h2>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-lg text-ink-muted">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}
