import Image from "next/image";
import Link from "next/link";

// Always-visible top bar (not scroll-triggered) — logo left, one action
// right. The action only shows on desktop: on mobile, MobileActionBar's
// fixed bottom bar already says "Reservar" and is visible the whole time
// too, so showing it here as well just repeats the same word twice on
// screen at once.
export function SiteHeader({ name }: { name: string }) {
  return (
    <div className="sticky top-0 z-40 border-b border-gold/15 bg-noir/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/icons/icon-192.png" alt="" width={28} height={28} className="rounded-md" />
          <span className="font-display text-sm font-semibold tracking-tight text-ivory">{name}</span>
        </Link>
        <a
          href="#servicios"
          className="hidden rounded-full bg-gold px-4 py-2 text-sm font-medium text-noir transition-transform hover:scale-[1.02] active:scale-[0.98] sm:inline-flex"
        >
          Reservar
        </a>
      </div>
    </div>
  );
}
