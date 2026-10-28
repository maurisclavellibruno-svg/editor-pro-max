import { Marquee } from "@/components/landing/Marquee";

const badges = [
  "+200 clientes asesorados",
  "Asesoría basada en visagismo",
  "Atención personalizada",
  "Recomendaciones adaptadas a cada rostro",
];

export function TrustBadges() {
  return (
    <div className="border-y border-gold/15 bg-noir-soft text-ivory-soft">
      <Marquee items={badges} />
    </div>
  );
}
