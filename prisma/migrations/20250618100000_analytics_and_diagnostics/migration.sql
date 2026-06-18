-- CreateEnum
CREATE TYPE "DiagnosticCategory" AS ENUM ('UPLOAD_FAILURE', 'LOGIN_FAILURE', 'CMS_SAVE_FAILURE', 'IMAGE_PROCESSING_FAILURE');

-- CreateTable
CREATE TABLE "PageView" (
    "id" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "visitorId" TEXT NOT NULL,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppDiagnosticEvent" (
    "id" TEXT NOT NULL,
    "category" "DiagnosticCategory" NOT NULL,
    "message" TEXT NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppDiagnosticEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageView_viewedAt_idx" ON "PageView"("viewedAt");

-- CreateIndex
CREATE INDEX "PageView_path_viewedAt_idx" ON "PageView"("path", "viewedAt");

-- CreateIndex
CREATE INDEX "PageView_visitorId_viewedAt_idx" ON "PageView"("visitorId", "viewedAt");

-- CreateIndex
CREATE INDEX "AppDiagnosticEvent_category_createdAt_idx" ON "AppDiagnosticEvent"("category", "createdAt");
