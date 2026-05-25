import { eyebrowClassName } from "@/lib/constants";
import { cn } from "@/lib/utils";

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
};

export function Eyebrow({ children, className }: EyebrowProps) {
  return <p className={cn(eyebrowClassName, className)}>{children}</p>;
}
