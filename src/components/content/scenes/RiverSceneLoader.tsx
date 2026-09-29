"use client";

import dynamic from "next/dynamic";
import type { RiverSceneConfig } from "@/lib/animation-scene-types";

// GSAP must never run during SSR. ssr:false keeps the whole module (and its ~40KB
// of GSAP/ScrollTrigger) out of the server render and out of every other route's
// bundle - it only loads for visitors who actually reach a page that mounts this.
const RiverScene = dynamic(() => import("./RiverScene").then((mod) => mod.RiverScene), {
  ssr: false,
});

export function RiverSceneLoader({ config }: { config?: RiverSceneConfig }) {
  return <RiverScene config={config} />;
}
