import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminSession } from "@/lib/require-admin-session";
import { animationScenePatchSchema, formatZodErrors } from "@/lib/validators";
import { revalidateAnimationScenes } from "@/lib/revalidate-animation-scenes";
import { parseRiverSpeedSettings, parseScrollFiguresConfig } from "@/lib/animation-scene-types";
import type { AnimationScene, Prisma } from "@prisma/client";

type RouteParams = { params: Promise<{ id: string }> };

function serializeScene(scene: AnimationScene) {
  if (scene.pageTypes.includes("ABOUT")) {
    return { ...scene, kind: "river" as const, speed: parseRiverSpeedSettings(scene.draftConfig) };
  }
  return { ...scene, kind: "scrollFigures" as const, config: parseScrollFiguresConfig(scene.draftConfig) };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const unauthorized = await requireAdminSession();
  if (unauthorized) return unauthorized;

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const validation = animationScenePatchSchema.safeParse(body);
  if (!validation.success) {
    return NextResponse.json({ error: formatZodErrors(validation.error).join("; ") }, { status: 400 });
  }

  const existing = await prisma.animationScene.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Animation scene not found." }, { status: 404 });
  }

  const data: Prisma.AnimationSceneUpdateInput = {};
  if (validation.data.isEnabled !== undefined) {
    data.isEnabled = validation.data.isEnabled;
  }
  if (validation.data.speed !== undefined) {
    const merged = parseRiverSpeedSettings({
      ...parseRiverSpeedSettings(existing.draftConfig),
      ...validation.data.speed,
    });
    data.draftConfig = merged;
  }
  if (validation.data.scrollFigures !== undefined) {
    const merged = parseScrollFiguresConfig({
      ...parseScrollFiguresConfig(existing.draftConfig),
      ...validation.data.scrollFigures,
    });
    data.draftConfig = merged;
  }

  const scene = await prisma.animationScene.update({
    where: { id },
    data,
  });

  revalidateAnimationScenes(scene.pageTypes);

  return NextResponse.json({ scene: serializeScene(scene) });
}
