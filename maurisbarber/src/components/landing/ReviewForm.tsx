"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { submitReview } from "@/actions/reviews";

export function ReviewForm() {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const formData = new FormData();
    formData.set("name", name);
    formData.set("rating", String(rating));
    formData.set("text", text);

    const result = await submitReview(formData);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error ?? "No pudimos guardar tu reseña. Probá de nuevo.");
      return;
    }
    setDone(true);
  }

  if (done) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-gold/15 bg-noir p-8 text-center">
        <p className="font-display text-lg font-semibold text-ivory">¡Gracias por tu reseña!</p>
        <p className="mt-2 text-ivory-soft">
          La vamos a revisar y publicar en la web en breve.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-4 rounded-2xl border border-gold/15 bg-noir p-8">
      <div>
        <span className="mb-2 block text-sm font-medium text-ivory-soft">Tu calificación</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              aria-label={`${n} estrella${n > 1 ? "s" : ""}`}
              onClick={() => setRating(n)}
              onMouseEnter={() => setHoverRating(n)}
              onMouseLeave={() => setHoverRating(0)}
              className="text-3xl leading-none transition-transform hover:scale-110"
            >
              <span className={n <= (hoverRating || rating) ? "text-gold" : "text-gold/20"}>★</span>
            </button>
          ))}
        </div>
      </div>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ivory-soft">Tu nombre</span>
        <input
          type="text"
          required
          maxLength={80}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full rounded-xl border border-gold/20 bg-noir-soft px-4 py-3 text-ivory outline-none transition-colors focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-noir"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1.5 block font-medium text-ivory-soft">Tu reseña</span>
        <textarea
          required
          minLength={10}
          maxLength={600}
          rows={4}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Contanos cómo fue tu asesoría..."
          className="w-full resize-none rounded-xl border border-gold/20 bg-noir-soft px-4 py-3 text-ivory outline-none transition-colors focus:border-gold focus-visible:ring-2 focus-visible:ring-gold/50 focus-visible:ring-offset-2 focus-visible:ring-offset-noir"
        />
      </label>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <Button type="submit" variant="gold" size="md" className="w-full" disabled={submitting}>
        {submitting ? "Enviando..." : "Publicar reseña"}
      </Button>
    </form>
  );
}
