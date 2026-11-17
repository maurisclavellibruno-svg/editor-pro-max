import Image from "next/image";
import Link from "next/link";

// Always-visible top bar (not scroll-triggered) — logo left, one action
// right. The single job of this page is "get them to the services and
// reserve", so there's exactly one button here.
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
          className="rounded-full bg-gold px-4 py-2 text-sm font-medium text-noir transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Reservar
        </a>
      </div>
    </div>
  );
}
