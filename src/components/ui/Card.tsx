import { cardSurface } from "@/lib/constants";
import { cn } from "@/lib/utils";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  as?: "article" | "li" | "div";
};

export function Card({ children, className, as: Tag = "article" }: CardProps) {
  return <Tag className={cn(cardSurface, className)}>{children}</Tag>;
}
