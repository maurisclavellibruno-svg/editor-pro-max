import { Marquee } from "@/components/landing/Marquee";

const badges = [
  "+200 clientes asesorados",
  "Asesoría basada en visagismo",
  "Atención personalizada",
  "Recomendaciones adaptadas a cada rostro",
];

export function TrustBadges() {
  return (
    <div className="border-y border-line bg-surface-alt text-ink-soft">
      <Marquee items={badges} />
    </div>
  );
}
