import { cache } from "react";
import type { PageType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  DEFAULT_RIVER_SPEED_SETTINGS,
  DEFAULT_YOGA_SCROLL_FIGURES_CONFIG,
  EMPTY_SCROLL_FIGURES_CONFIG,
  parseRiverSpeedSettings,
  parseScrollFiguresConfig,
  type RiverSceneSpeedSettings,
  type ScrollFiguresSceneConfig,
} from "@/lib/animation-scene-types";

/** Pages this scene ever ran on before other pages got the same feature - the
 * only one that should still show decorative art if no admin row exists yet. */
const DEFAULT_ENABLED_SCROLL_FIGURES_PAGES: PageType[] = ["YOGA"];

export type RiverSceneData = {
  isEnabled: boolean;
  speed: RiverSceneSpeedSettings;
};

async function readRiverScene(pageType: PageType): Promise<RiverSceneData> {
  const scene = await prisma.animationScene.findFirst({
    where: { pageTypes: { has: pageType }, isArchived: false },
    select: { isEnabled: true, draftConfig: true },
  });
  // No scene yet = keep the river visible (matches the live look before the toggle existed).
  // The /api/cms/animation-scenes GET auto-creates the row with isEnabled:true for the same reason.
  if (!scene) return { isEnabled: true, speed: DEFAULT_RIVER_SPEED_SETTINGS };
  return { isEnabled: scene.isEnabled, speed: parseRiverSpeedSettings(scene.draftConfig) };
}

/** Whether the river animation is enabled for the given page, and its admin-tuned speed settings. */
export const fetchRiverScene = cache(async (pageType: PageType): Promise<RiverSceneData> => {
  return readRiverScene(pageType);
});

export type ScrollFiguresSceneData = {
  isEnabled: boolean;
  config: ScrollFiguresSceneConfig;
};

async function readScrollFiguresScene(pageType: PageType): Promise<ScrollFiguresSceneData> {
  const scene = await prisma.animationScene.findFirst({
    where: { pageTypes: { has: pageType }, isArchived: false },
    select: { isEnabled: true, draftConfig: true },
  });
  if (!scene) {
    // No admin row yet: Yoga already had this feature live with its built-in
    // pose set before this became a per-page toggle, so it stays visible until
    // an admin touches it (matching the river's same convention above). Any
    // other page has no default artwork, so it starts off until configured.
    return DEFAULT_ENABLED_SCROLL_FIGURES_PAGES.includes(pageType)
      ? { isEnabled: true, config: DEFAULT_YOGA_SCROLL_FIGURES_CONFIG }
      : { isEnabled: false, config: EMPTY_SCROLL_FIGURES_CONFIG };
  }
  return { isEnabled: scene.isEnabled, config: parseScrollFiguresConfig(scene.draftConfig) };
}

/** Whether a page's scroll figures are enabled, and their admin-managed image list/placement/appearance. */
export const fetchScrollFiguresScene = cache(async (pageType: PageType): Promise<ScrollFiguresSceneData> => {
  return readScrollFiguresScene(pageType);
});
