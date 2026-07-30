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
          <div key={step.number} className="rounded-2xl border border-line bg-white p-6 shadow-card">
            <span className="text-sm font-semibold text-accent">{step.number}</span>
            <h3 className="mt-3 text-lg font-semibold text-ink">{step.title}</h3>
            <p className="mt-2 text-sm text-ink-muted">{step.description}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}
