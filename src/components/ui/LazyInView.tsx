"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type LazyInViewProps = {
  children: ReactNode;
  className?: string;
  placeholderClassName?: string;
  rootMargin?: string;
};

/** Mount children only when near the viewport — defers image network requests. */
export function LazyInView({
  children,
  className,
  placeholderClassName,
  rootMargin = "300px",
}: LazyInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || visible) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin, visible]);

  return (
    <div ref={ref} className={className}>
      {visible ? (
        children
      ) : (
        <div className={cn("skeleton-shimmer h-full min-h-[120px] w-full", placeholderClassName)} aria-hidden />
      )}
    </div>
  );
}
