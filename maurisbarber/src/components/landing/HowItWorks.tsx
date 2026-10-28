import { Reveal } from "@/components/ui/Reveal";

const steps = [
  {
    title: "Agendás tu asesoría",
    description: "Reservás online en menos de un minuto, sin vueltas.",
  },
  {
    title: "Analizamos tu rostro y tu estilo",
    description:
      "Facciones, forma de cara, estilo de vida y lo que querés transmitir: todo entra en la recomendación.",
  },
  {
    title: "Recibís el corte diseñado para vos",
    description: "No un corte al azar — el que realmente te favorece a vos.",
  },
];

// Deliberately not using <Section>'s eyebrow tag or numbered cards — this
// reads as an editorial statement instead of a templated "3-step feature
// grid", per Mauris's note that the explainer section felt too generic.
export function HowItWorks() {
  return (
    <section className="w-full bg-noir text-ivory">
      <div className="mx-auto max-w-4xl px-6 py-20 sm:py-28">
        <Reveal>
          <h2 className="font-display max-w-2xl text-3xl font-semibold leading-tight tracking-tight text-ivory sm:text-4xl">
            Esto no es un corte de pelo cualquiera.
          </h2>
          <p className="mt-4 max-w-xl text-lg text-ivory-soft">
            Es una asesoría personalizada basada en visagismo que termina en el corte ideal para tu
            rostro.
          </p>
        </Reveal>

        <Reveal delay={120} className="mt-14 divide-y divide-gold/10 border-t border-gold/10">
          {steps.map((step) => (
            <div key={step.title} className="flex flex-col gap-2 py-6 sm:flex-row sm:items-baseline sm:gap-10">
              <h3 className="font-display shrink-0 text-xl font-semibold text-gold sm:w-80">{step.title}</h3>
              <p className="text-ivory-soft">{step.description}</p>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
