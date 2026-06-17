"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type RevealAnimation = "fade" | "rise" | "slide-left" | "slide-right" | "scale" | "none";

type ScrollRevealProps = {
  children: ReactNode;
  animation?: RevealAnimation;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
  once?: boolean;
  id?: string;
};

const animationClasses: Record<RevealAnimation, string> = {
  none: "",
  fade: "reveal-fade",
  rise: "reveal-rise",
  "slide-left": "reveal-slide-left",
  "slide-right": "reveal-slide-right",
  scale: "reveal-scale",
};

export function ScrollReveal({
  children,
  animation = "rise",
  delay = 0,
  duration,
  className,
  as: Tag = "div",
  once = true,
  id,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(animation === "none");

  useEffect(() => {
    if (animation === "none") return;

    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setVisible(false);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [animation, once]);

  return (
    <Tag
      // @ts-expect-error ref polymorphism across semantic elements
      ref={ref}
      id={id}
      className={cn(
        "reveal",
        animationClasses[animation],
        visible && "reveal-visible",
        className,
      )}
      style={{
        transitionDelay: delay ? `${delay}ms` : undefined,
        transitionDuration: duration ? `${duration}ms` : undefined,
      }}
    >
      {children}
    </Tag>
  );
}

type StaggerRevealProps = {
  children: ReactNode[];
  animation?: RevealAnimation;
  staggerMs?: number;
  className?: string;
  itemClassName?: string;
};

/** Staggered scroll reveal for lists of cards or grid items. */
export function StaggerReveal({
  children,
  animation = "rise",
  staggerMs = 80,
  className,
  itemClassName,
}: StaggerRevealProps) {
  return (
    <>
      {children.map((child, index) => (
        <ScrollReveal
          key={index}
          animation={animation}
          delay={index * staggerMs}
          className={cn(className, itemClassName)}
        >
          {child}
        </ScrollReveal>
      ))}
    </>
  );
}
