import { eyebrowClassName } from "@/lib/constants";
import { cn } from "@/lib/utils";

type EyebrowProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function Eyebrow({ children, className, style }: EyebrowProps) {
  return (
    <p className={cn(eyebrowClassName, className)} style={style}>
      {children}
    </p>
  );
}
