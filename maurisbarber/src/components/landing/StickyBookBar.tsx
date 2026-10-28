"use client";

import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/Button";

interface StickyBookBarProps {
  name: string;
}

// Keeps the primary action reachable no matter how far down the page
// someone has scrolled — appears once they've scrolled past the hero.
export function StickyBookBar({ name }: StickyBookBarProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > window.innerHeight * 0.65);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={`fixed inset-x-0 top-0 z-40 border-b border-gold/15 bg-noir/90 backdrop-blur transition-transform duration-300 ease-out ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
        <span className="font-display text-sm font-semibold tracking-tight text-ivory">{name}</span>
        <div className="flex items-center gap-4">
          <a href="#faq" className="hidden text-sm font-medium text-ivory-soft hover:text-ivory sm:inline">
            ¿Dudas?
          </a>
          <ButtonLink href="/reservar" variant="gold" size="sm">
            Reservá tu turno
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
