import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "warm";

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-accent bg-accent text-white hover:bg-foreground hover:border-foreground shadow-sm",
  warm:
    "border border-primary bg-primary text-white hover:bg-primary-muted hover:border-primary-muted shadow-sm",
  secondary:
    "border border-border bg-card text-foreground hover:border-primary/40 hover:text-primary-muted",
  ghost: "border border-transparent text-foreground hover:bg-surface-warm/60",
};

type ButtonProps = {
  children: React.ReactNode;
  className?: string;
  variant?: ButtonVariant;
  href?: string;
  type?: "button" | "submit";
  onClick?: () => void;
  ariaLabel?: string;
  disabled?: boolean;
};

export function Button({
  children,
  className,
  variant = "primary",
  href,
  type = "button",
  onClick,
  ariaLabel,
  disabled,
}: ButtonProps) {
  const classes = cn(
    "site-button inline-flex items-center justify-center rounded-md px-6 py-3 tracking-wide transition-all duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50",
    variants[variant],
    className,
  );

  if (href) {
    return (
      <Link href={href} className={classes} aria-label={ariaLabel}>
        {children}
      </Link>
    );
  }

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      aria-label={ariaLabel}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
