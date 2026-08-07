"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";

const faqs = [
  {
    q: "¿En qué consiste la asesoría?",
    a: "Antes de cortar, analizamos la forma de tu rostro, tus facciones, tu estilo de vida y lo que querés transmitir, para recomendarte el corte que realmente te favorece — no uno al azar.",
  },
  {
    q: "¿Cómo reservo mi asesoría?",
    a: "Tocá el botón \"Reservar turno\", elegí el servicio, el día y el horario que prefieras, dejá tus datos de contacto y listo.",
  },
  {
    q: "¿Necesito pagar por adelantado?",
    a: "No, el pago se realiza en el local al finalizar el servicio. Por ahora aceptamos efectivo y transferencia.",
  },
  {
    q: "¿Puedo cancelar o reprogramar mi turno?",
    a: "Sí, escribinos por WhatsApp con la mayor anticipación posible para reprogramar o cancelar tu turno.",
  },
  {
    q: "¿Qué pasa si llego tarde?",
    a: "Intentamos ser flexibles, pero para respetar a todos los clientes te pedimos llegar a horario. Si vas a demorarte, avisanos por WhatsApp.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" eyebrow="Preguntas frecuentes" title="¿Tenés dudas?">
      <div className="mx-auto max-w-2xl divide-y divide-line rounded-2xl border border-line bg-white shadow-card">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-medium text-ink">{item.q}</span>
                <span
                  className={`shrink-0 text-ink-muted transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
              <div
                className={`grid overflow-hidden px-6 text-ink-muted transition-all duration-300 ${
                  isOpen ? "grid-rows-[1fr] pb-5 opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
                style={{ display: "grid" }}
              >
                <div className="min-h-0">
                  <p>{item.a}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
