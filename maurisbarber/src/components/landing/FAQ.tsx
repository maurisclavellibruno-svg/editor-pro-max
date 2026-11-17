"use client";

import { useState } from "react";
import { Section } from "@/components/ui/Section";

const faqs = [
  {
    q: "¿Qué es la asesoría?",
    a: "Antes de cortar analizo tu cara, tu pelo y tu estilo de vida, y elijo el corte que mejor te queda. Te lo hago en el momento y te llevás un PDF con todo.",
  },
  {
    q: "¿Tengo que pagar antes?",
    a: "Para el corte, no: pagás en el local. Para la asesoría pedimos una seña de $500 por Prex, que se descuenta del total.",
  },
  {
    q: "¿Cómo pago?",
    a: "Efectivo o transferencia.",
  },
  {
    q: "¿Dónde quedan?",
    a: "Av. Gonzalo Ramírez 1686, Apto. 002, Montevideo. Tocá timbre y te abro.",
  },
  {
    q: "¿Puedo cambiar o cancelar el turno?",
    a: "Sí, avisanos por WhatsApp con la mayor anticipación posible.",
  },
  {
    q: "¿Hacen gift cards?",
    a: "Sí, de asesoría + corte o de corte. Te la mandamos por WhatsApp, lista para regalar.",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <Section id="faq" eyebrow="Preguntas frecuentes" title="¿Tenés dudas?">
      <div className="mx-auto max-w-2xl divide-y divide-gold/15 rounded-2xl border border-gold/15 bg-noir-soft">
        {faqs.map((item, index) => {
          const isOpen = openIndex === index;
          return (
            <div key={item.q}>
              <button
                type="button"
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-medium text-ivory">{item.q}</span>
                <span
                  className={`shrink-0 text-gold transition-transform duration-300 ${isOpen ? "rotate-45" : ""}`}
                >
                  +
                </span>
              </button>
              <div
                className={`grid overflow-hidden px-6 text-ivory-soft transition-all duration-300 ${
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
