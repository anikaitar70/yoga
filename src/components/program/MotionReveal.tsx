"use client";

import { motion, useAnimation, useInView, useReducedMotion, type Variants } from "framer-motion";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
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
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  // whileInView can fail to fire (sticky children, negative rootMargin, many observers) →
  // sections stay at opacity:0 permanently (user reports: visible 1s SSR → blank after hydration, random).
  const isInView = useInView(ref, { once: true, amount: 0.1, margin: "0px 0px -10% 0px" });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  // Safety net: observer may never fire — force visible after short timeout so no section stays blank forever.
  useEffect(() => {
    if (!mounted || variant === "none" || reduced) return;
    const t = setTimeout(() => controls.start("visible"), 700);
    return () => clearTimeout(t);
  }, [mounted, variant, reduced, controls]);

  if (!mounted || variant === "none" || reduced) {
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
      ref={ref}
      id={id}
      className={cn(className)}
      initial="hidden"
      animate={controls}
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
  style?: CSSProperties;
};

export function MotionStagger({
  children,
  variant = "rise",
  stagger = 0.1,
  className,
  itemClassName,
  style,
}: MotionStaggerProps) {
  const [mounted, setMounted] = useState(false);
  const reduced = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const isInView = useInView(ref, { once: true, amount: 0.1 });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isInView) controls.start("visible");
  }, [isInView, controls]);

  useEffect(() => {
    if (!mounted || reduced) return;
    const t = setTimeout(() => controls.start("visible"), 700);
    return () => clearTimeout(t);
  }, [mounted, reduced, controls]);

  if (!mounted || reduced) {
    return <div className={className} style={style}>{children}</div>;
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      style={style}
      initial="hidden"
      animate={controls}
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
