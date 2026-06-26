import { cn } from "@/lib/utils";
import { sectionSpacing } from "@/lib/constants";

type SectionVariant = "default" | "muted" | "card" | "warm" | "immersive";
type SectionSpacing = keyof typeof sectionSpacing;

const variantClasses: Record<SectionVariant, string> = {
  default: "",
  muted: "bg-accent-soft/25",
  warm: "bg-primary-soft/30",
  card: "bg-card",
  immersive: "bg-gradient-to-b from-background via-surface-warm/40 to-background",
};

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  variant?: SectionVariant;
  spacing?: SectionSpacing;
  border?: "none" | "bottom" | "subtle";
  as?: "section" | "header" | "article";
  id?: string;
  "aria-labelledby"?: string;
};

export function Section({
  children,
  className,
  style,
  variant = "default",
  spacing = "default",
  border = "bottom",
  as: Tag = "section",
  id,
  "aria-labelledby": ariaLabelledby,
}: SectionProps) {
  return (
    <Tag
      id={id}
      aria-labelledby={ariaLabelledby}
      style={style}
      className={cn(
        sectionSpacing[spacing],
        border === "bottom" && "border-b border-border/70",
        border === "subtle" && "border-b border-border/40",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
