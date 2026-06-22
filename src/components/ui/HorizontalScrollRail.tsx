"use client";

import { useCallback, useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import {
  SCROLL_RAIL_GRID_CLASS,
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

function ScrollArrow({
  direction,
  onClick,
  label,
}: {
  direction: "prev" | "next";
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={cn(
        "absolute top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-background/95 text-lg font-medium text-foreground shadow-md backdrop-blur transition hover:bg-background hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 sm:h-12 sm:w-12",
        direction === "prev" ? "left-1 sm:left-2" : "right-1 sm:right-2",
      )}
    >
      {direction === "prev" ? "←" : "→"}
    </button>
  );
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollButtons = useCallback(() => {
    const node = scrollRef.current;
    if (!node) return;
    const { scrollLeft, scrollWidth, clientWidth } = node;
    setCanScrollPrev(scrollLeft > 4);
    setCanScrollNext(scrollLeft + clientWidth < scrollWidth - 4);
  }, []);

  useEffect(() => {
    if (!useRail) return;
    const node = scrollRef.current;
    if (!node) return;

    updateScrollButtons();
    node.addEventListener("scroll", updateScrollButtons, { passive: true });
    const observer = new ResizeObserver(updateScrollButtons);
    observer.observe(node);

    return () => {
      node.removeEventListener("scroll", updateScrollButtons);
      observer.disconnect();
    };
  }, [updateScrollButtons, useRail, itemCount]);

  const scrollByPage = useCallback((direction: -1 | 1) => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollBy({ left: direction * node.clientWidth * 0.85, behavior: "smooth" });
  }, []);

  if (!useRail) {
    return (
      <ListTag className={cn(SCROLL_RAIL_GRID_CLASS[variant], className, listClassName)}>
        {children}
      </ListTag>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <div className="-my-6 py-6">
        {canScrollPrev ? (
          <ScrollArrow direction="prev" onClick={() => scrollByPage(-1)} label="Previous" />
        ) : null}
        {canScrollNext ? (
          <ScrollArrow direction="next" onClick={() => scrollByPage(1)} label="Next" />
        ) : null}
        <div
          ref={scrollRef}
          className={cn(
            "scroll-rail -mx-4 overflow-x-auto overscroll-x-contain px-4 sm:-mx-6 sm:px-6",
            "scroll-smooth snap-x snap-mandatory",
          )}
          tabIndex={0}
          role="region"
          aria-label={ariaLabel ?? "Scrollable content"}
        >
          <ListTag className={cn("flex w-max min-w-full gap-6 py-2", listClassName)}>
            {children}
          </ListTag>
        </div>
      </div>
    </div>
  );
}
