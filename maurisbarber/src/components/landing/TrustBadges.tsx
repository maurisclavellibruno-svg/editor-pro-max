const badges = [
  "+200 clientes asesorados",
  "Asesoría basada en visagismo",
  "Atención personalizada",
  "Recomendaciones adaptadas a cada rostro",
];

export function TrustBadges() {
  return (
    <div className="border-y border-line bg-surface-alt py-6">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3 px-6 text-center">
        {badges.map((badge) => (
          <span key={badge} className="text-sm font-medium text-ink-soft">
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
