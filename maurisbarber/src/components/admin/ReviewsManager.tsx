"use client";

import { useState } from "react";
import { approveReview, deleteReview } from "@/actions/reviews";

interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  approved: boolean;
  createdAt: string;
}

export function ReviewsManager({ reviews }: { reviews: Review[] }) {
  const [list, setList] = useState(reviews);
  const pending = list.filter((r) => !r.approved);
  const approved = list.filter((r) => r.approved);

  async function handleApprove(id: string) {
    await approveReview(id);
    setList(list.map((r) => (r.id === id ? { ...r, approved: true } : r)));
  }

  async function handleDelete(id: string) {
    if (!confirm("¿Eliminar esta reseña? No se puede deshacer.")) return;
    await deleteReview(id);
    setList(list.filter((r) => r.id !== id));
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-ink">Reseñas</h1>

      <section className="mb-10">
        <h2 className="mb-3 text-lg font-semibold text-ink">
          Pendientes de aprobar {pending.length > 0 && `(${pending.length})`}
        </h2>
        {pending.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white p-6 text-ink-muted shadow-card">
            No hay reseñas nuevas por revisar.
          </p>
        ) : (
          <div className="space-y-3">
            {pending.map((r) => (
              <ReviewCard key={r.id} review={r} onApprove={() => handleApprove(r.id)} onDelete={() => handleDelete(r.id)} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-ink">Publicadas ({approved.length})</h2>
        {approved.length === 0 ? (
          <p className="rounded-2xl border border-line bg-white p-6 text-ink-muted shadow-card">
            Todavía no publicaste ninguna reseña.
          </p>
        ) : (
          <div className="space-y-3">
            {approved.map((r) => (
              <ReviewCard key={r.id} review={r} onDelete={() => handleDelete(r.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ReviewCard({
  review,
  onApprove,
  onDelete,
}: {
  review: Review;
  onApprove?: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-accent" aria-label={`${review.rating} de 5 estrellas`}>
            {"★".repeat(review.rating)}
            <span className="text-line">{"★".repeat(5 - review.rating)}</span>
          </p>
          <p className="mt-1 font-medium text-ink">{review.name}</p>
        </div>
        <p className="shrink-0 text-xs text-ink-muted">
          {new Date(review.createdAt).toLocaleDateString("es-UY")}
        </p>
      </div>
      <p className="mt-3 text-ink-soft">{review.text}</p>
      <div className="mt-4 flex gap-3 text-sm font-medium">
        {onApprove && (
          <button type="button" onClick={onApprove} className="text-accent-hover">
            Aprobar y publicar
          </button>
        )}
        <button type="button" onClick={onDelete} className="text-red-600">
          Eliminar
        </button>
      </div>
    </div>
  );
}
