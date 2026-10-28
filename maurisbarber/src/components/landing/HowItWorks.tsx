import { Section } from "@/components/ui/Section";

const steps = [
  {
    number: "01",
    title: "Agendás tu asesoría",
    description: "Reservás online en menos de un minuto, sin vueltas.",
  },
  {
    number: "02",
    title: "Analizamos tu rostro y tu estilo",
    description:
      "Facciones, forma de cara, estilo de vida y lo que querés transmitir: todo entra en la recomendación.",
  },
  {
    number: "03",
    title: "Recibís el corte diseñado para vos",
    description: "No un corte al azar — el que realmente te favorece a vos.",
  },
];

export function HowItWorks() {
  return (
    <Section
      eyebrow="Cómo funciona"
      title="Esto no es un corte de pelo cualquiera"
      subtitle="Es una asesoría personalizada basada en visagismo que termina en el corte ideal para tu rostro."
    >
      <div className="grid gap-6 sm:grid-cols-3">
        {steps.map((step) => (
          <div
            key={step.number}
            className="relative overflow-hidden rounded-2xl border border-gold/15 bg-noir-soft p-6 transition-colors hover:border-gold/35"
          >
            <span className="font-display absolute -right-2 -top-4 text-6xl font-bold text-gold/10">
              {step.number}
            </span>
            <h3 className="relative font-display text-lg font-semibold text-ivory">{step.title}</h3>
            <p className="relative mt-2 text-sm text-ivory-soft">{step.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
