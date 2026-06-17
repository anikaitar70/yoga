"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export type MotionVariant = "fade" | "rise" | "slide-left" | "slide-right" | "scale" | "none";

type MotionRevealProps = {
  children: ReactNode;
  variant?: MotionVariant;
  delay?: number;
  duration?: number;
  className?: string;
  as?: "div" | "section" | "article" | "li";
  id?: string;
};

const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

function hiddenState(variant: MotionVariant) {
  if (variant === "none") return {};
  if (variant === "fade") return { opacity: 0 };
  if (variant === "scale") return { opacity: 0, scale: 0.97 };
  if (variant === "slide-left") return { opacity: 0, x: -28 };
  if (variant === "slide-right") return { opacity: 0, x: 28 };
  return { opacity: 0, y: 28 };
}

function visibleState() {
  return { opacity: 1, x: 0, y: 0, scale: 1 };
}

export function MotionReveal({
  children,
  variant = "rise",
  delay = 0,
  duration = 0.9,
  className,
  as = "div",
  id,
}: MotionRevealProps) {
  const reduced = useReducedMotion();

  if (variant === "none" || reduced) {
    const Plain = as;
    return (
      <Plain id={id} className={className}>
        {children}
      </Plain>
    );
  }

  const variants: Variants = {
    hidden: hiddenState(variant),
    visible: {
      ...visibleState(),
      transition: { duration, delay: delay / 1000, ease: EASE },
    },
  };

  return (
    <motion.div
      id={id}
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15, margin: "0px 0px -8% 0px" }}
      variants={variants}
    >
      {children}
    </motion.div>
  );
}

type MotionStaggerProps = {
  children: ReactNode[];
  variant?: MotionVariant;
  stagger?: number;
  className?: string;
  itemClassName?: string;
};

export function MotionStagger({
  children,
  variant = "rise",
  stagger = 0.1,
  className,
  itemClassName,
}: MotionStaggerProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.1 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger } },
      }}
    >
      {children.map((child, index) => (
        <motion.div
          key={index}
          className={itemClassName}
          variants={{
            hidden: hiddenState(variant),
            visible: { ...visibleState(), transition: { duration: 0.85, ease: EASE } },
          }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
}
