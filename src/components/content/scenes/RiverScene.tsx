"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { DEFAULT_RIVER_SCENE_CONFIG, type RiverSceneConfig } from "@/lib/animation-scene-types";

// Measured directly from the supplied artwork (public/river/river-segment-*.png):
// all three are 250x1000 (1:4 aspect ratio), and each one individually tiles
// seamlessly on its own vertical axis - the right-edge wave x-position at y=0
// matches y=1000 to within 1px for every segment, confirmed by pixel analysis.
const NATIVE_WIDTH = 250;
const NATIVE_HEIGHT = 1000;
// Segment 3 ("back" layer) is shifted 56px further right than segments 1/2 in the
// reference composite the artwork was designed around - confirmed by comparing
// color-transition x-positions in the composite against each segment's own edge
// curve at matching rows (consistent to within 1px across 10+ sampled rows).
const BACK_LAYER_OFFSET = 56;

const MOBILE_BREAKPOINT = 768;
// Below this, the river narrows/fades toward a compact treatment rather than
// disappearing outright, so it never overlaps the (narrower) content column.
function computeLayout(config: RiverSceneConfig, viewportWidth: number) {
  if (viewportWidth < MOBILE_BREAKPOINT) {
    return { visible: false, widthPx: 0, opacity: 0 };
  }
  if (viewportWidth < config.placement.desktopMinWidthPx) {
    return { visible: true, widthPx: Math.round(config.widthPx * 0.6), opacity: config.opacity * 0.75 };
  }
  return { visible: true, widthPx: config.widthPx, opacity: config.opacity };
}

function useRiverLayout(config: RiverSceneConfig) {
  const [layout, setLayout] = useState(() =>
    computeLayout(config, typeof window === "undefined" ? 1440 : window.innerWidth),
  );

  useEffect(() => {
    const update = () => setLayout(computeLayout(config, window.innerWidth));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [config]);

  return layout;
}

type Side = "left" | "right";

function layerStyle(url: string, widthPx: number, tileHeight: number, offsetX = 0): CSSProperties {
  return {
    position: "absolute",
    inset: 0,
    backgroundImage: `url(${url})`,
    backgroundRepeat: "repeat-y",
    backgroundSize: `${widthPx}px ${tileHeight}px`,
    transform: offsetX ? `translateX(${offsetX}px)` : undefined,
  };
}

function RiverColumn({
  side,
  widthPx,
  opacity,
  tileHeight,
  backOffset,
  backRef,
  middleRef,
  frontRef,
}: {
  side: Side;
  widthPx: number;
  opacity: number;
  tileHeight: number;
  backOffset: number;
  backRef: React.RefObject<HTMLDivElement | null>;
  middleRef: React.RefObject<HTMLDivElement | null>;
  frontRef: React.RefObject<HTMLDivElement | null>;
}) {
  const sideStyle: CSSProperties = side === "left" ? { left: 0 } : { right: 0 };
  return (
    <div
      className="absolute top-0 h-full overflow-hidden"
      style={{
        ...sideStyle,
        width: widthPx,
        opacity,
        transform: side === "right" ? "scaleX(-1)" : undefined,
      }}
    >
      {/* Paint order back-to-front: seg3 (shifted right, largest reach) painted first,
          seg2 in the middle, seg1 last/topmost (smallest reach, nearest the page edge). */}
      <div ref={backRef} style={layerStyle("/river/river-segment-3.png", widthPx, tileHeight, backOffset)} />
      <div ref={middleRef} style={layerStyle("/river/river-segment-2.png", widthPx, tileHeight)} />
      <div ref={frontRef} style={layerStyle("/river/river-segment-1.png", widthPx, tileHeight)} />
    </div>
  );
}

/**
 * Decorative, ambient river border for the About page - built from the supplied
 * three-segment artwork (public/river/river-segment-1/2/3.png), layered per the
 * reference composite and tiled infinitely via CSS background-repeat. Client-only
 * (see RiverSceneLoader), aria-hidden, pointer-events-none, never affects layout.
 *
 * No Sanskrit text yet (separate follow-up layer). Admin control is a future
 * enable/disable toggle on AnimationScene.isEnabled - everything else here is
 * developer-controlled for now.
 */
export function RiverScene({ config = DEFAULT_RIVER_SCENE_CONFIG }: { config?: RiverSceneConfig }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const leftBackRef = useRef<HTMLDivElement>(null);
  const leftMiddleRef = useRef<HTMLDivElement>(null);
  const leftFrontRef = useRef<HTMLDivElement>(null);
  const rightBackRef = useRef<HTMLDivElement>(null);
  const rightMiddleRef = useRef<HTMLDivElement>(null);
  const rightFrontRef = useRef<HTMLDivElement>(null);

  const { visible, widthPx, opacity } = useRiverLayout(config);
  const scale = widthPx / NATIVE_WIDTH;
  const tileHeight = NATIVE_HEIGHT * scale;
  const backOffset = BACK_LAYER_OFFSET * scale;

  useGSAP(
    () => {
      if (!visible) return;

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const direction = config.direction === "upstream" ? -1 : 1;
        const shift = direction * tileHeight;
        const baseDuration = tileHeight / config.speedAmbient;

        // Depth illusion: the three layers never move at the same speed, even at
        // rest. Front (seg1, nearest the page edge, smallest reach) is fastest,
        // back (seg3, receded, largest reach) is slowest - like real water, where
        // the visible "surface" appears to move faster than what's behind it.
        const LAYER_SPEED_RATIO = { back: 0.78, middle: 1, front: 1.25 } as const;
        // Right river runs at a different base pace than the left one (not a fixed
        // offset) so the two never fall into lockstep, however long the page is
        // left open - plus a mid-cycle start for an immediate visible difference.
        const COLUMN_SPEED_RATIO = { left: 1, right: 0.87 } as const;

        function makeLayerTween(el: HTMLDivElement | null, ratio: number) {
          if (!el) return null;
          return gsap.to(el, {
            backgroundPositionY: `+=${shift}`,
            duration: baseDuration / ratio,
            ease: "none",
            repeat: -1,
          });
        }

        const tweens = [
          makeLayerTween(leftBackRef.current, COLUMN_SPEED_RATIO.left * LAYER_SPEED_RATIO.back),
          makeLayerTween(leftMiddleRef.current, COLUMN_SPEED_RATIO.left * LAYER_SPEED_RATIO.middle),
          makeLayerTween(leftFrontRef.current, COLUMN_SPEED_RATIO.left * LAYER_SPEED_RATIO.front),
        ].filter((t): t is gsap.core.Tween => Boolean(t));

        const rightTweens = [
          makeLayerTween(rightBackRef.current, COLUMN_SPEED_RATIO.right * LAYER_SPEED_RATIO.back),
          makeLayerTween(rightMiddleRef.current, COLUMN_SPEED_RATIO.right * LAYER_SPEED_RATIO.middle),
          makeLayerTween(rightFrontRef.current, COLUMN_SPEED_RATIO.right * LAYER_SPEED_RATIO.front),
        ].filter((t): t is gsap.core.Tween => Boolean(t));
        rightTweens.forEach((t) => t.progress(0.4));

        const allTweens = [...tweens, ...rightTweens];

        // Ambient + scroll-velocity blend: velocity is read directly from
        // window.scrollY every animation frame (not via ScrollTrigger's
        // trigger/start/end range) so this is purely time- and scroll-position
        // based - never dependent on total page height or viewport height.
        // The multiplier is relative to each layer's OWN baseline speed above,
        // so the front/middle/back (and left/right) speed differences persist
        // at every moment, at rest or mid-scroll.
        let lastScrollY = window.scrollY;
        let lastTime = performance.now();
        const current = { multiplier: 1 };

        const tick = () => {
          const now = performance.now();
          const dt = Math.min(0.1, Math.max(0, (now - lastTime) / 1000));
          lastTime = now;
          if (dt === 0) return;

          const scrollY = window.scrollY;
          const velocity = Math.abs(scrollY - lastScrollY) / dt;
          lastScrollY = scrollY;

          // Deliberately gentle: "slightly faster" while scrolling, not a blur.
          // At rest (velocity 0) this settles back to 1 = each layer's own
          // slow ambient pace.
          const boosted = 1 + (velocity / 1000) * config.scrollMultiplier;
          const target = gsap.utils.clamp(1, config.speedMax, boosted);
          current.multiplier += (target - current.multiplier) * 0.06;

          allTweens.forEach((t) => t.timeScale(current.multiplier));
        };
        gsap.ticker.add(tick);

        return () => {
          gsap.ticker.remove(tick);
        };
      });

      // "(prefers-reduced-motion: reduce)" intentionally has no handler here -
      // the artwork still renders (registered above via CSS), it just never animates.

      return () => mm.revert();
    },
    { scope: containerRef, dependencies: [visible, widthPx, tileHeight, config] },
  );

  return (
    <div ref={containerRef} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      {visible ? (
        <>
          <RiverColumn
            side="left"
            widthPx={widthPx}
            opacity={opacity}
            tileHeight={tileHeight}
            backOffset={backOffset}
            backRef={leftBackRef}
            middleRef={leftMiddleRef}
            frontRef={leftFrontRef}
          />
          <RiverColumn
            side="right"
            widthPx={widthPx}
            opacity={opacity}
            tileHeight={tileHeight}
            backOffset={backOffset}
            backRef={rightBackRef}
            middleRef={rightMiddleRef}
            frontRef={rightFrontRef}
          />
        </>
      ) : null}
    </div>
  );
}
