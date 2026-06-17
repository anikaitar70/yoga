import { Eyebrow } from "@/components/ui/Eyebrow";
import { sectionTitleClassName } from "@/lib/constants";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  className?: string;
  titleId?: string;
  size?: "default" | "large";
};

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "left",
  className,
  titleId,
  size = "default",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "max-w-2xl",
        align === "center" && "mx-auto text-center",
        className,
      )}
    >
      {eyebrow ? <Eyebrow className="mb-3">{eyebrow}</Eyebrow> : null}
      <h2
        id={titleId}
        className={cn(
          sectionTitleClassName,
          size === "large" && "sm:text-5xl lg:text-[3.5rem]",
        )}
      >
        {title}
      </h2>
      {subtitle ? (
        <p className="mt-4 text-base leading-[var(--leading-calm)] text-muted sm:text-lg">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}
