import type { ElementType, ReactNode } from "react";
import {
  SCROLL_RAIL_GRID_CLASS,
  SCROLL_RAIL_HINT,
  SCROLL_RAIL_ITEM_CLASS,
  shouldUseScrollRail,
  type ScrollRailVariant,
} from "@/lib/scroll-rail-config";
import { cn } from "@/lib/utils";

type HorizontalScrollRailProps = {
  variant: ScrollRailVariant;
  itemCount: number;
  children: ReactNode;
  className?: string;
  listClassName?: string;
  as?: "ul" | "div";
  "aria-label"?: string;
};

type HorizontalScrollItemProps = {
  variant: ScrollRailVariant;
  children: ReactNode;
  className?: string;
  as?: "li" | "div" | "figure";
};

export function HorizontalScrollItem({
  variant,
  children,
  className,
  as: Tag = "li",
}: HorizontalScrollItemProps) {
  return <Tag className={cn(SCROLL_RAIL_ITEM_CLASS[variant], className)}>{children}</Tag>;
}

export function HorizontalScrollRail({
  variant,
  itemCount,
  children,
  className,
  listClassName,
  as = "ul",
  "aria-label": ariaLabel,
}: HorizontalScrollRailProps) {
  const useRail = shouldUseScrollRail(variant, itemCount);
  const ListTag: ElementType = as;

  if (!useRail) {
    return (
      <ListTag className={cn(SCROLL_RAIL_GRID_CLASS[variant], className, listClassName)}>
        {children}
      </ListTag>
    );
  }

  const hint = SCROLL_RAIL_HINT[variant];

  return (
    <div className={cn("relative", className)}>
      {/* Outer wrapper stays overflow-visible so card shadows and hover lifts are not clipped. */}
      <div className="-my-6 py-6">
        <div
          className={cn(
            "scroll-rail -mx-4 overflow-x-auto overscroll-x-contain px-4 sm:-mx-6 sm:px-6",
            "scroll-smooth snap-x snap-mandatory",
          )}
          tabIndex={0}
          role="region"
          aria-label={ariaLabel ?? hint}
        >
          <ListTag className={cn("flex w-max min-w-full gap-6 py-2", listClassName)}>{children}</ListTag>
        </div>
      </div>

      <p className="mt-2 text-center text-xs tracking-wide text-muted" aria-hidden>
        {hint}
      </p>
    </div>
  );
}
