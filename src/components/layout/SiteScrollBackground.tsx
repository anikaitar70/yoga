"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  DEFAULT_SITE_BACKGROUND,
  SITE_BACKGROUND_VARIANTS,
  type SiteBackgroundVariant,
} from "@/lib/site-background";
import { cn } from "@/lib/utils";

type SiteScrollBackgroundProps = {
  variant?: SiteBackgroundVariant;
};

function AuroraLayers({ progress }: { progress: MotionValue<number> }) {
  const yPrimary = useTransform(progress, [0, 1], ["0%", "-18%"]);
  const yAccent = useTransform(progress, [0, 1], ["0%", "-28%"]);
  const yEarth = useTransform(progress, [0, 1], ["0%", "-10%"]);
  const opacity = useTransform(progress, [0, 0.5, 1], [1, 0.92, 0.85]);

  return (
    <motion.div className="absolute inset-0" style={{ opacity }}>
      <motion.div
        className="absolute -left-[12%] top-[8%] h-[min(52vw,520px)] w-[min(52vw,520px)] rounded-full bg-primary/18 blur-3xl"
        style={{ y: yPrimary }}
      />
      <motion.div
        className="absolute right-[-8%] top-[22%] h-[min(44vw,440px)] w-[min(44vw,440px)] rounded-full bg-accent/16 blur-3xl"
        style={{ y: yAccent }}
      />
      <motion.div
        className="absolute bottom-[6%] left-[28%] h-[min(38vw,380px)] w-[min(38vw,380px)] rounded-full bg-[color-mix(in_srgb,var(--earth)_22%,transparent)] blur-3xl"
        style={{ y: yEarth }}
      />
      <div className="site-bg-grain absolute inset-0 opacity-[0.35]" />
    </motion.div>
  );
}

function MandalaLayers({ progress }: { progress: MotionValue<number> }) {
  const rotate = useTransform(progress, [0, 1], [0, 28]);
  const rotateReverse = useTransform(rotate, (value) => -value * 0.6);
  const scale = useTransform(progress, [0, 1], [1, 1.08]);
  const drift = useTransform(progress, [0, 1], [0, -80]);

  return (
    <motion.div className="absolute inset-0" style={{ y: drift }}>
      <motion.svg
        viewBox="0 0 400 400"
        className="absolute -right-24 top-16 h-[min(70vw,520px)] w-[min(70vw,520px)] text-accent/14"
        style={{ rotate, scale }}
        fill="none"
        aria-hidden
      >
        <circle cx="200" cy="200" r="170" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="200" cy="200" r="120" stroke="currentColor" strokeWidth="0.6" />
        <circle cx="200" cy="200" r="72" stroke="currentColor" strokeWidth="0.6" />
        <path d="M30 200h340M200 30v340" stroke="currentColor" strokeWidth="0.5" />
        <path d="M70 70l260 260M330 70L70 330" stroke="currentColor" strokeWidth="0.35" />
      </motion.svg>
      <motion.svg
        viewBox="0 0 400 400"
        className="absolute -left-28 bottom-8 h-[min(55vw,420px)] w-[min(55vw,420px)] text-primary/12"
        style={{ rotate: rotateReverse }}
        fill="none"
        aria-hidden
      >
        <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="95" stroke="currentColor" strokeWidth="0.5" />
      </motion.svg>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-background/80 to-transparent" />
    </motion.div>
  );
}

function HorizonLayers({ progress }: { progress: MotionValue<number> }) {
  const bandY = useTransform(progress, [0, 1], ["0%", "-22%"]);
  const washY = useTransform(progress, [0, 1], ["0%", "-12%"]);
  const bottomY = useTransform(progress, [0, 1], ["0%", "-8%"]);
  const fade = useTransform(progress, [0, 1], [1, 0.88]);

  return (
    <motion.div className="absolute inset-0" style={{ opacity: fade }}>
      <motion.div
        className="absolute inset-x-0 top-0 h-[55%] bg-gradient-to-b from-primary-soft/45 via-accent-soft/25 to-transparent"
        style={{ y: washY }}
      />
      <motion.div
        className="absolute inset-x-[-10%] top-[38%] h-56 rounded-[100%] bg-gradient-to-r from-transparent via-primary/10 to-transparent blur-2xl"
        style={{ y: bandY }}
      />
      <motion.div
        className="absolute inset-x-0 bottom-0 h-[42%] bg-gradient-to-t from-surface-warm/55 via-background/20 to-transparent"
        style={{ y: bottomY }}
      />
      <div className="site-bg-grain absolute inset-0 opacity-25" />
    </motion.div>
  );
}

function RippleLayers({ progress }: { progress: MotionValue<number> }) {
  const waveShift = useTransform(progress, [0, 1], [0, -48]);
  const waveShiftSlow = useTransform(waveShift, (value) => value * 0.65);
  const dotShift = useTransform(progress, [0, 1], [0, 64]);

  return (
    <div className="absolute inset-0">
      <motion.div
        className="site-bg-dots absolute inset-0 opacity-[0.22]"
        style={{ y: dotShift }}
        aria-hidden
      />
      <motion.svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-[18%] h-40 w-full text-accent/10"
        style={{ y: waveShift }}
        aria-hidden
      >
        <path
          d="M0 110 C240 40 480 180 720 110 S1200 40 1440 110"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
        />
        <path
          d="M0 140 C280 80 520 200 760 130 S1180 70 1440 150"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.7"
          opacity="0.7"
        />
      </motion.svg>
      <motion.svg
        viewBox="0 0 1440 220"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-[12%] h-36 w-full text-primary/10"
        style={{ y: waveShiftSlow }}
        aria-hidden
      >
        <path
          d="M0 120 C320 180 640 60 960 120 S1280 200 1440 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.8"
        />
      </motion.svg>
    </div>
  );
}

function StaticFallback({ variant }: { variant: SiteBackgroundVariant }) {
  if (variant === "mandala") {
    return (
      <div className="absolute inset-0 overflow-hidden" aria-hidden>
        <svg
          viewBox="0 0 400 400"
          className="absolute -right-20 top-20 h-80 w-80 text-accent/12"
          fill="none"
        >
          <circle cx="200" cy="200" r="150" stroke="currentColor" strokeWidth="0.6" />
          <circle cx="200" cy="200" r="100" stroke="currentColor" strokeWidth="0.6" />
        </svg>
      </div>
    );
  }

  if (variant === "horizon") {
    return (
      <div
        className="absolute inset-0 bg-gradient-to-b from-primary-soft/35 via-background to-surface-warm/40"
        aria-hidden
      />
    );
  }

  if (variant === "ripple") {
    return <div className="site-bg-dots absolute inset-0 opacity-20" aria-hidden />;
  }

  return (
    <div className="absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute -left-16 top-16 h-80 w-80 rounded-full bg-primary/15 blur-3xl" />
      <div className="absolute right-0 top-1/3 h-72 w-72 rounded-full bg-accent/12 blur-3xl" />
    </div>
  );
}

function AnimatedVariant({
  variant,
  progress,
}: {
  variant: SiteBackgroundVariant;
  progress: MotionValue<number>;
}) {
  switch (variant) {
    case "mandala":
      return <MandalaLayers progress={progress} />;
    case "horizon":
      return <HorizonLayers progress={progress} />;
    case "ripple":
      return <RippleLayers progress={progress} />;
    case "aurora":
    default:
      return <AuroraLayers progress={progress} />;
  }
}

export function SiteScrollBackground({ variant = DEFAULT_SITE_BACKGROUND }: SiteScrollBackgroundProps) {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const meta = SITE_BACKGROUND_VARIANTS[variant];

  return (
    <div
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      aria-hidden
      data-site-background={variant}
      title={meta.label}
    >
      <div className="absolute inset-0 bg-background" />
      {reducedMotion ? (
        <StaticFallback variant={variant} />
      ) : (
        <AnimatedVariant variant={variant} progress={scrollYProgress} />
      )}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background/55",
        )}
      />
    </div>
  );
}
