interface MarqueeProps {
  items: string[];
  className?: string;
}

// Full-bleed, infinitely-scrolling strip. The track is the item list
// rendered twice back to back; animating it exactly -50% loops seamlessly.
export function Marquee({ items, className = "" }: MarqueeProps) {
  return (
    <div className={`overflow-hidden ${className}`}>
      <div className="marquee-track flex w-max items-center gap-10 py-6">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="flex items-center gap-10 whitespace-nowrap text-sm font-medium">
            {item}
            <span aria-hidden className="text-gold">
              ✦
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
