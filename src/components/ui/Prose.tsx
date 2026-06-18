import { proseClassName } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { CSSProperties } from "react";

type ProseProps = {
  children: React.ReactNode;
  className?: string;
  style?: CSSProperties;
};

export function Prose({ children, className, style }: ProseProps) {
  return (
    <div style={style} className={cn("space-y-6", proseClassName, className)}>{children}</div>
  );
}
