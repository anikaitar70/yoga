-- CreateTable
CREATE TABLE "AnimationScene" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "pageTypes" "PageType"[] DEFAULT ARRAY[]::"PageType"[],
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "isArchived" BOOLEAN NOT NULL DEFAULT false,
    "draftConfig" JSONB NOT NULL DEFAULT '{}',
    "publishedConfig" JSONB,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AnimationScene_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AnimationScene_isEnabled_isArchived_idx" ON "AnimationScene"("isEnabled", "isArchived");
