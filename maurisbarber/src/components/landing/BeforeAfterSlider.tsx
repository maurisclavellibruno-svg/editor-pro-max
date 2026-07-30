"use client";

import { useState } from "react";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  alt: string;
  beforeLabel?: string;
  afterLabel?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  alt,
  beforeLabel = "Antes",
  afterLabel = "Después",
}: BeforeAfterSliderProps) {
  const [position, setPosition] = useState(50);

  return (
    <div className="relative aspect-[4/5] w-full select-none overflow-hidden rounded-2xl border border-line shadow-card">
      {/* Base layer: fully visible "after" photo. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterSrc}
        alt={`${alt} — después`}
        className="absolute inset-0 h-full w-full object-cover"
        draggable={false}
      />
      {/* Top layer: "before" photo, clipped to the left portion up to the
          handle position, so the left side of the image always shows
          "before" and the right side always shows "after" — matching the
          fixed Antes/Después labels regardless of slider position. */}
      <div className="absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeSrc}
          alt={`${alt} — antes`}
          className="h-full w-full object-cover"
          draggable={false}
        />
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 bg-white/90 shadow-[0_0_12px_rgba(0,0,0,0.25)]"
        style={{ left: `${position}%` }}
      />
      <div
        className="pointer-events-none absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white shadow-floating"
        style={{ left: `${position}%` }}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-ink">
          <path d="M8 5 2 12l6 7V5Zm8 0v14l6-7-6-7Z" />
        </svg>
      </div>

      <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
        {beforeLabel}
      </span>
      <span className="pointer-events-none absolute right-3 top-3 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
        {afterLabel}
      </span>

      <input
        type="range"
        min={0}
        max={100}
        value={position}
        onChange={(e) => setPosition(Number(e.target.value))}
        aria-label={`Deslizar para comparar antes y después: ${alt}`}
        className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
      />
    </div>
  );
}
