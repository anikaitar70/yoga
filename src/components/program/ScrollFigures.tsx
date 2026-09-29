"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { SCROLL_FIGURES_OFFSET_RANGE, type ScrollFigureImage } from "@/lib/animation-scene-types";

const HEADER_SAFETY_MARGIN_PX = 16;
const MIN_FIGURE_HEIGHT_PX = 96;

// How often the (comparatively expensive) DOM composition sampling runs, in ms.
// The pose crossfade and header/footer clamp still update every scroll frame -
// only the "what's behind us right now" probe is throttled, since it only
// affects opacity, not position, and doesn't need per-frame precision.
const COMPOSITION_SAMPLE_INTERVAL_MS = 180;
// Local, temporary opacity boost applied only where something solid is
// actually detected behind the figure - capped well short of a global bump.
const OPACITY_BOOST_GAIN = 1.6;
const OPACITY_BOOST_CAP = 1.8;

// Mirrors the Tailwind size classes below (h-[Xvh] max-h-[Ypx] per breakpoint) so
// the header-overlap check can compute the *intended* design height without
// reading back a DOM value we may have already overridden on a previous resize.
function designFigureHeightPx(viewportWidth: number, viewportHeight: number): number {
  if (viewportWidth >= 1024) return Math.min(viewportHeight * 0.36, 400);
  if (viewportWidth >= 640) return Math.min(viewportHeight * 0.3, 320);
  return Math.min(viewportHeight * 0.24, 240);
}

function bottomInsetPercent(viewportWidth: number): number {
  return viewportWidth >= 640 ? 0.08 : 0.06;
}

/** Even spacing across the whole page's scroll range: image i is "current" at
 * progress i/(count-1), with a short full-opacity hold around its center and a
 * crossfade ramp into each neighbor so two poses are always overlapping
 * mid-transition (never a shared empty frame). */
function opacityKeyframes(index: number, count: number): { input: number[]; output: number[] } {
  const step = 1 / (count - 1);
  const hold = step * 0.18;
  const ramp = step * 0.82;
  const center = index * step;

  if (index === 0) {
    return { input: [0, center + hold, Math.min(1, center + hold + ramp)], output: [1, 1, 0] };
  }
  if (index === count - 1) {
    return { input: [Math.max(0, center - hold - ramp), center - hold, 1], output: [0, 1, 1] };
  }
  return {
    input: [
      Math.max(0, center - hold - ramp),
      center - hold,
      center + hold,
      Math.min(1, center + hold + ramp),
    ],
    output: [0, 1, 1, 0],
  };
}

/** Renders one pose, plain (original artwork colours) or tinted via a CSS mask -
 * the mask uses the artwork's own alpha channel as the shape, so a tint paints a
 * flat colour through that shape rather than altering the actual pixels. */
function PoseLayer({
  src,
  index,
  count,
  progress,
  tintColor,
}: {
  src: string;
  index: number;
  count: number;
  progress: MotionValue<number>;
  tintColor: string | null;
}) {
  const { input, output } = opacityKeyframes(index, count);
  const opacity = useTransform(progress, input, output);
  const scale = useTransform(opacity, [0, 1], [0.97, 1]);
  const y = useTransform(opacity, [0, 1], [10, 0]);

  if (tintColor) {
    return (
      <motion.div
        style={{
          opacity,
          scale,
          y,
          backgroundColor: tintColor,
          WebkitMaskImage: `url(${src})`,
          maskImage: `url(${src})`,
          WebkitMaskSize: "contain",
          maskSize: "contain",
          WebkitMaskRepeat: "no-repeat",
          maskRepeat: "no-repeat",
          WebkitMaskPosition: "bottom center",
          maskPosition: "bottom center",
        }}
        className="absolute inset-0 h-full w-full"
      />
    );
  }

  return (
    <motion.img
      src={src}
      alt=""
      draggable={false}
      decoding="async"
      style={{ opacity, scale, y }}
      className="absolute inset-0 h-full w-full object-contain object-bottom"
    />
  );
}

const FIGURE_SIZE_CLASSES =
  "h-[24vh] max-h-[240px] w-[30vh] max-w-[300px] sm:h-[30vh] sm:max-h-[320px] sm:w-[38vh] sm:max-w-[380px] lg:h-[36vh] lg:max-h-[400px] lg:w-[46vh] lg:max-w-[480px]";

/** Reads the actual painted alpha at a viewport point: real backgroundColor alpha
 * for ordinary elements, or 1 for anything raster (img/video/canvas/svg), since a
 * photo has no useful "backgroundColor" but is just as visually blocking. Elements
 * with pointer-events:none (our own layer, decorative glows) are transparent to
 * this by construction - elementFromPoint skips them, same as it does for clicks. */
function backgroundAlphaAt(x: number, y: number): number {
  if (typeof document === "undefined") return 0;
  let node = document.elementFromPoint(x, y);
  for (let i = 0; i < 5 && node; i += 1, node = node.parentElement) {
    const tag = node.tagName;
    if (tag === "IMG" || tag === "VIDEO" || tag === "CANVAS" || tag === "svg" || tag === "PICTURE") {
      return 1;
    }
    const bg = window.getComputedStyle(node).backgroundColor;
    const match = bg.match(/rgba?\(([^)]+)\)/);
    if (match) {
      const parts = match[1].split(",").map((part) => parseFloat(part));
      const alpha = parts.length === 4 ? parts[3] : 1;
      if (alpha > 0.05) return alpha;
    }
  }
  return 0;
}

/**
 * Decorative, viewport-anchored layer for a program page: the admin-managed pose
 * images crossfade into one another as the user scrolls the whole page. Position:
 * fixed (never affects layout/scroll), negative z-index (paints behind all real
 * content and behind the header's z-50), pointer-events: none throughout.
 *
 * Horizontal placement is exactly the admin's chosen position (see
 * ScrollFiguresSceneCard) - fixed, it never moves on its own while scrolling.
 * Opacity is also admin-controlled (with an optional colour tint), and the only
 * thing that reacts live to what's behind it: if something solid is currently
 * detected right behind the figure (a card, a photo), a small, local,
 * spring-smoothed opacity boost keeps it perceptible rather than disappearing -
 * capped well short of a distracting increase - and it fades back to the base the
 * moment nothing's behind it.
 *
 * Height is live-clamped against the real <header> so it can never grow into it,
 * and the whole layer fades out as the <footer> scrolls into view (a fixed layer
 * would otherwise stay pinned on top of it).
 */
export function ScrollFigures({
  images,
  horizontalOffsetPercent,
  opacity: baseOpacity,
  tintColor,
}: {
  images: ScrollFigureImage[];
  horizontalOffsetPercent: number;
  opacity: number;
  tintColor: string | null;
}) {
  const reducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const boxRef = useRef<HTMLElement | null>(null);
  const setBoxRef = (node: HTMLDivElement | HTMLImageElement | null) => {
    boxRef.current = node;
  };

  const adminT =
    (horizontalOffsetPercent - SCROLL_FIGURES_OFFSET_RANGE.min) /
    (SCROLL_FIGURES_OFFSET_RANGE.max - SCROLL_FIGURES_OFFSET_RANGE.min);

  const footerFade = useMotionValue(1);
  const cardAlpha = useMotionValue(0);
  const smoothCardAlpha = useSpring(cardAlpha, { stiffness: 60, damping: 20 });

  const layerOpacity = useTransform([footerFade, smoothCardAlpha], (latest) => {
    const [fade, alpha] = latest as [number, number];
    return baseOpacity * fade * Math.min(OPACITY_BOOST_CAP, 1 + OPACITY_BOOST_GAIN * alpha);
  });
  const left = `${adminT * 100}%`;
  const boxX = `${-adminT * 100}%`;

  const [safeHeightPx, setSafeHeightPx] = useState<number | null>(null);

  useEffect(() => {
    const header = document.querySelector("header");
    const footer = document.querySelector("footer");

    let rafId = 0;
    let lastCompositionSample = 0;

    function recompute(timestamp: number) {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const design = designFigureHeightPx(vw, vh);
      const bottomInsetPx = vh * bottomInsetPercent(vw);
      const available = vh - headerHeight - bottomInsetPx - HEADER_SAFETY_MARGIN_PX;
      const next = Math.max(MIN_FIGURE_HEIGHT_PX, Math.min(design, available));
      setSafeHeightPx(next < design ? next : null);

      if (footer) {
        const footerTop = footer.getBoundingClientRect().top;
        const fadeDistance = Math.max(design, 1);
        const overlap = vh - footerTop;
        const fraction = Math.min(1, Math.max(0, overlap / fadeDistance));
        footerFade.set(1 - fraction);
      }

      if (timestamp - lastCompositionSample > COMPOSITION_SAMPLE_INTERVAL_MS) {
        lastCompositionSample = timestamp;
        const rect = boxRef.current?.getBoundingClientRect();
        if (rect) {
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height * 0.6;
          cardAlpha.set(backgroundAlphaAt(centerX, centerY));
        }
      }
    }

    function onScrollOrResize() {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(recompute);
    }

    recompute(typeof performance !== "undefined" ? performance.now() : 0);
    window.addEventListener("scroll", onScrollOrResize, { passive: true });
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", onScrollOrResize);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [footerFade, cardAlpha]);

  if (images.length === 0) return null;

  const sizeStyle = safeHeightPx ? { height: safeHeightPx, maxHeight: safeHeightPx } : undefined;

  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none fixed inset-x-0 bottom-[6%] -z-[5] sm:bottom-[8%]"
      style={{ opacity: layerOpacity }}
    >
      {reducedMotion || images.length === 1 ? (
        tintColor ? (
          <motion.div
            ref={setBoxRef}
            style={{
              left,
              x: boxX,
              backgroundColor: tintColor,
              WebkitMaskImage: `url(${images[Math.floor(images.length / 2)].url})`,
              maskImage: `url(${images[Math.floor(images.length / 2)].url})`,
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskPosition: "bottom center",
              maskPosition: "bottom center",
              ...sizeStyle,
            }}
            className={`absolute bottom-0 ${FIGURE_SIZE_CLASSES}`}
          />
        ) : (
          <motion.img
            ref={setBoxRef}
            src={images[Math.floor(images.length / 2)].url}
            alt=""
            draggable={false}
            className={`absolute bottom-0 ${FIGURE_SIZE_CLASSES}`}
            style={{ objectFit: "contain", objectPosition: "bottom", left, x: boxX, ...sizeStyle }}
          />
        )
      ) : (
        <motion.div
          ref={setBoxRef}
          className={`absolute bottom-0 ${FIGURE_SIZE_CLASSES}`}
          style={{ left, x: boxX, ...sizeStyle }}
        >
          {images.map((image, index) => (
            <PoseLayer
              key={image.id}
              src={image.url}
              index={index}
              count={images.length}
              progress={scrollYProgress}
              tintColor={tintColor}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
}
