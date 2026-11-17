const steps = [
  "Agendás tu asesoría — reservás online en menos de un minuto.",
  "Analizamos tu rostro y tu estilo — facciones, forma de cara y lo que querés transmitir.",
  "Recibís el corte diseñado para vos — no uno al azar.",
];

// Compact, one line per step — the detailed version lives in the FAQ now.
export function HowItWorks() {
  return (
    <section className="w-full bg-noir text-ivory">
      <div className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <div className="space-y-3">
          {steps.map((step, i) => (
            <p key={step} className="flex items-baseline gap-3 text-sm text-ivory-soft sm:text-base">
              <span className="font-display shrink-0 text-gold">{i + 1}.</span>
              {step}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}
