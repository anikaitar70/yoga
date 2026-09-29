import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import {
  DEFAULT_YOGA_SCROLL_FIGURES_CONFIG,
  EMPTY_SCROLL_FIGURES_CONFIG,
  parseRiverSpeedSettings,
  parseScrollFiguresConfig,
} from "@/lib/animation-scene-types";
import type { AnimationScene, PageType, Prisma } from "@prisma/client";

function serializeScene(scene: AnimationScene) {
  if (scene.pageTypes.includes("ABOUT")) {
    return { ...scene, kind: "river" as const, speed: parseRiverSpeedSettings(scene.draftConfig) };
  }
  return { ...scene, kind: "scrollFigures" as const, config: parseScrollFiguresConfig(scene.draftConfig) };
}

const SCROLL_FIGURES_PAGES: Array<{
  pageType: PageType;
  name: string;
  description: string;
  isEnabled: boolean;
  draftConfig: Prisma.InputJsonValue;
}> = [
  {
    pageType: "YOGA",
    name: "Yoga page scroll figures",
    description: "Decorative scroll-morphing pose sequence on the Yoga page.",
    isEnabled: true,
    draftConfig: DEFAULT_YOGA_SCROLL_FIGURES_CONFIG,
  },
  {
    pageType: "HEALING",
    name: "Healing page scroll figures",
    description: "Decorative scroll-morphing image sequence on the Healing page.",
    isEnabled: false,
    draftConfig: EMPTY_SCROLL_FIGURES_CONFIG,
  },
  {
    pageType: "JUST_ART_LIFE",
    name: "Just Art Affaire page scroll figures",
    description: "Decorative scroll-morphing image sequence on the Just Art Affaire page.",
    isEnabled: false,
    draftConfig: EMPTY_SCROLL_FIGURES_CONFIG,
  },
];

/**
 * Animation-scene listing for the admin tab. Auto-creates each known scene on
 * first request:
 * - the About page river (defaulting isEnabled: true, matching the behavior it
 *   already had before this toggle existed)
 * - one scroll-figures scene per program page. Yoga defaults isEnabled: true
 *   with the built-in 20-pose set (matching the look already live before this
 *   became a per-page toggle); the others start disabled with no images, since
 *   there's no default artwork for them - an admin uploads and enables per page.
 */
export async function GET() {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  let river = await prisma.animationScene.findFirst({
    where: { pageTypes: { has: "ABOUT" }, isArchived: false },
  });
  if (!river) {
    river = await prisma.animationScene.create({
      data: {
        name: "About page river",
        description: "Decorative animated river border on the About page.",
        pageTypes: ["ABOUT"],
        isEnabled: true,
        draftConfig: {},
      },
    });
  }

  const scrollFiguresScenes: AnimationScene[] = [];
  for (const page of SCROLL_FIGURES_PAGES) {
    let scene = await prisma.animationScene.findFirst({
      where: { pageTypes: { has: page.pageType }, isArchived: false },
    });
    if (!scene) {
      scene = await prisma.animationScene.create({
        data: {
          name: page.name,
          description: page.description,
          pageTypes: [page.pageType],
          isEnabled: page.isEnabled,
          draftConfig: page.draftConfig,
        },
      });
    }
    scrollFiguresScenes.push(scene);
  }

  return NextResponse.json({
    scenes: [serializeScene(river), ...scrollFiguresScenes.map(serializeScene)],
  });
}
