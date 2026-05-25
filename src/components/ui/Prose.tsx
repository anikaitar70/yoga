import { proseClassName } from "@/lib/constants";
import { cn } from "@/lib/utils";

type ProseProps = {
  children: React.ReactNode;
  className?: string;
};

export function Prose({ children, className }: ProseProps) {
  return (
    <div className={cn("space-y-6", proseClassName, className)}>{children}</div>
  );
}
