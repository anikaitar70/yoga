import { cn } from "@/lib/utils";
import { sectionSpacing } from "@/lib/constants";

type SectionVariant = "default" | "muted" | "card";
type SectionSpacing = keyof typeof sectionSpacing;

const variantClasses: Record<SectionVariant, string> = {
  default: "",
  muted: "bg-accent-soft/30",
  card: "bg-card",
};

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  variant?: SectionVariant;
  spacing?: SectionSpacing;
  border?: "none" | "bottom";
  as?: "section" | "header" | "article";
  id?: string;
  "aria-labelledby"?: string;
};

export function Section({
  children,
  className,
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
      className={cn(
        sectionSpacing[spacing],
        border === "bottom" && "border-b border-border",
        variantClasses[variant],
        className,
      )}
    >
      {children}
    </Tag>
  );
}
