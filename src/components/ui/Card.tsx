import { cardSurface, cardSurfaceElevated } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "elevated" | "flat";

const variantClasses: Record<CardVariant, string> = {
  default: cardSurface,
  elevated: cardSurfaceElevated,
  flat: "rounded-lg border border-border/60 bg-card",
};

type CardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  as?: "article" | "li" | "div";
};

export function Card({ children, className, variant = "default", as: Tag = "article" }: CardProps) {
  return <Tag className={cn(variantClasses[variant], className)}>{children}</Tag>;
}
