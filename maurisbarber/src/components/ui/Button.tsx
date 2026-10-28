import { ButtonHTMLAttributes, forwardRef } from "react";
import Link from "next/link";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-all duration-200 ease-out hover:scale-[1.02] disabled:opacity-50 disabled:pointer-events-none disabled:hover:scale-100 active:scale-[0.98]";

const variants = {
  primary: "bg-ink text-white hover:bg-black shadow-card",
  accent: "bg-accent text-white hover:bg-accent-hover shadow-card",
  outline: "border border-line bg-white text-ink hover:bg-surface-alt",
  ghost: "text-ink hover:bg-surface-alt",
  // Public site only (landing + booking) — the premium black-and-gold variants.
  gold: "bg-gold text-noir hover:bg-gold-light shadow-gold",
  goldOutline: "border border-gold/40 text-gold hover:border-gold hover:bg-gold/10",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-12 px-6 text-base",
  lg: "h-14 px-8 text-lg",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  ),
);
Button.displayName = "Button";

interface ButtonLinkProps {
  href: string;
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  className?: string;
  children: React.ReactNode;
}

export function ButtonLink({ href, variant = "primary", size = "md", className = "", children }: ButtonLinkProps) {
  return (
    <Link href={href} className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </Link>
  );
}
