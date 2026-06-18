import { promises as fs } from "fs";
import os from "os";
import path from "path";
import { statfs } from "fs/promises";
import { getUploadRootDir } from "@/lib/env";
import { formatBytes } from "@/lib/format-bytes";
import { prisma } from "@/lib/prisma";

export type BackupFileStatus = {
  configured: boolean;
  lastSuccessfulBackup: string | null;
  backupSize: string | null;
  backupSizeBytes: number | null;
};

export type DiagnosticsSnapshot = {
  collectedAt: string;
  systemHealth: {
    cpuUsagePercent: number | null;
    ramUsedBytes: number;
    ramFreeBytes: number;
    ramTotalBytes: number;
    ramUsed: string;
    ramFree: string;
    ramTotal: string;
    uptimeSeconds: number;
    uptime: string;
  };
  storage: {
    diskTotalBytes: number | null;
    diskUsedBytes: number | null;
    diskFreeBytes: number | null;
    diskTotal: string;
    diskUsed: string;
    diskFree: string;
    uploadsFolderBytes: number;
    uploadsFolder: string;
    databaseBytes: number | null;
    database: string;
    dockerImagesBytes: number | null;
    dockerImages: string;
    dockerVolumesBytes: number | null;
    dockerVolumes: string;
    logsBytes: number | null;
    logs: string;
  };
  database: {
    sizeBytes: number | null;
    size: string;
    blogPosts: number;
    events: number;
    pageSections: number;
    galleryImages: number;
    uploadedFiles: number;
  };
  services: {
    application: "healthy" | "unhealthy";
    database: "connected" | "failed";
    uploads: "writable" | "not_writable";
  };
  backups: {
    database: BackupFileStatus;
    uploads: BackupFileStatus;
  };
};

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

async function readCpuUsagePercent(): Promise<number | null> {
  try {
    const parse = async () => {
      const raw = await fs.readFile("/proc/stat", "utf8");
      const line = raw.split("\n")[0] ?? "";
      const parts = line.split(/\s+/).slice(1).map(Number);
      const idle = parts[3] + (parts[4] ?? 0);
      const total = parts.reduce((sum, value) => sum + value, 0);
      return { idle, total };
    };

    const first = await parse();
    await new Promise((resolve) => setTimeout(resolve, 100));
    const second = await parse();
    const idleDelta = second.idle - first.idle;
    const totalDelta = second.total - first.total;
    if (totalDelta <= 0) {
      return null;
    }
    return Math.round((1 - idleDelta / totalDelta) * 100);
  } catch {
    return null;
  }
}

async function getFilesystemStats(targetPath: string) {
  try {
    const stats = await statfs(targetPath);
    const total = Number(stats.bsize) * stats.blocks;
    const free = Number(stats.bsize) * stats.bfree;
    const used = total - free;
    return { total, used, free };
  } catch {
    return null;
  }
}

async function getDirectorySizeBytes(targetPath: string): Promise<number> {
  let total = 0;

  async function walk(currentPath: string) {
    let entries;
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
        continue;
      }
      if (entry.isFile()) {
        try {
          const stat = await fs.stat(entryPath);
          total += stat.size;
        } catch {
          // Skip unreadable files.
        }
      }
    }
  }

  await walk(targetPath);
  return total;
}

async function countFilesInDirectory(targetPath: string): Promise<number> {
  let count = 0;

  async function walk(currentPath: string) {
    let entries;
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const entryPath = path.join(currentPath, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
      } else if (entry.isFile()) {
        count += 1;
      }
    }
  }

  await walk(targetPath);
  return count;
}

async function checkUploadsWritable(uploadRoot: string): Promise<boolean> {
  const probePath = path.join(uploadRoot, `.write-probe-${process.pid}`);
  try {
    await fs.mkdir(uploadRoot, { recursive: true });
    await fs.writeFile(probePath, "ok", "utf8");
    await fs.unlink(probePath);
    return true;
  } catch {
    try {
      await fs.unlink(probePath);
    } catch {
      // Ignore cleanup errors.
    }
    return false;
  }
}

async function getLatestBackupStatus(backupDir: string): Promise<BackupFileStatus> {
  try {
    const entries = await fs.readdir(backupDir, { withFileTypes: true });
    const files = await Promise.all(
      entries
        .filter((entry) => entry.isFile())
        .map(async (entry) => {
          const filePath = path.join(backupDir, entry.name);
          const stat = await fs.stat(filePath);
          return { filePath, mtime: stat.mtime, size: stat.size };
        }),
    );

    if (files.length === 0) {
      return {
        configured: true,
        lastSuccessfulBackup: null,
        backupSize: null,
        backupSizeBytes: null,
      };
    }

    const latest = files.sort((a, b) => b.mtime.getTime() - a.mtime.getTime())[0];
    return {
      configured: true,
      lastSuccessfulBackup: latest.mtime.toISOString(),
      backupSize: formatBytes(latest.size),
      backupSizeBytes: latest.size,
    };
  } catch {
    return {
      configured: false,
      lastSuccessfulBackup: null,
      backupSize: null,
      backupSizeBytes: null,
    };
  }
}

const UNAVAILABLE_DOCKER_STORAGE = "Not available from application container";

export async function collectDiagnostics(): Promise<DiagnosticsSnapshot> {
  const uploadRoot = getUploadRootDir();
  const ramTotalBytes = os.totalmem();
  const ramFreeBytes = os.freemem();
  const ramUsedBytes = ramTotalBytes - ramFreeBytes;
  const uptimeSeconds = os.uptime();

  const [cpuUsagePercent, diskStats, uploadsFolderBytes, uploadedFiles, databaseConnected] =
    await Promise.all([
      readCpuUsagePercent(),
      getFilesystemStats("/"),
      getDirectorySizeBytes(uploadRoot),
      countFilesInDirectory(uploadRoot),
      prisma
        .$queryRaw<{ ok: number }[]>`SELECT 1 as ok`
        .then(() => true)
        .catch(() => false),
    ]);

  let databaseBytes: number | null = null;
  let blogPosts = 0;
  let events = 0;
  let pageSections = 0;
  let galleryImages = 0;

  if (databaseConnected) {
    try {
      const [sizeRow, counts] = await Promise.all([
        prisma.$queryRaw<{ size: bigint }[]>`SELECT pg_database_size(current_database()) AS size`,
        Promise.all([
          prisma.blogPost.count(),
          prisma.event.count(),
          prisma.pageSection.count(),
          prisma.galleryImage.count(),
        ]),
      ]);
      databaseBytes = Number(sizeRow[0]?.size ?? 0);
      [blogPosts, events, pageSections, galleryImages] = counts;
    } catch {
      databaseBytes = null;
    }
  }

  const uploadsWritable = await checkUploadsWritable(uploadRoot);
  const dbBackupDir = process.env.DB_BACKUP_DIR?.trim() || "/app/backups/db";
  const uploadsBackupDir = process.env.UPLOADS_BACKUP_DIR?.trim() || "/app/backups/uploads";
  const logsDir = process.env.LOGS_DIR?.trim() || "/var/log/nginx";

  const [databaseBackup, uploadsBackup, logsBytes] = await Promise.all([
    getLatestBackupStatus(dbBackupDir),
    getLatestBackupStatus(uploadsBackupDir),
    getDirectorySizeBytes(logsDir).catch(() => null),
  ]);

  return {
    collectedAt: new Date().toISOString(),
    systemHealth: {
      cpuUsagePercent,
      ramUsedBytes,
      ramFreeBytes,
      ramTotalBytes,
      ramUsed: formatBytes(ramUsedBytes),
      ramFree: formatBytes(ramFreeBytes),
      ramTotal: formatBytes(ramTotalBytes),
      uptimeSeconds,
      uptime: formatUptime(uptimeSeconds),
    },
    storage: {
      diskTotalBytes: diskStats?.total ?? null,
      diskUsedBytes: diskStats?.used ?? null,
      diskFreeBytes: diskStats?.free ?? null,
      diskTotal: formatBytes(diskStats?.total),
      diskUsed: formatBytes(diskStats?.used),
      diskFree: formatBytes(diskStats?.free),
      uploadsFolderBytes,
      uploadsFolder: formatBytes(uploadsFolderBytes),
      databaseBytes,
      database: formatBytes(databaseBytes),
      dockerImagesBytes: null,
      dockerImages: UNAVAILABLE_DOCKER_STORAGE,
      dockerVolumesBytes: null,
      dockerVolumes: UNAVAILABLE_DOCKER_STORAGE,
      logsBytes,
      logs: logsBytes == null ? "Not available" : formatBytes(logsBytes),
    },
    database: {
      sizeBytes: databaseBytes,
      size: formatBytes(databaseBytes),
      blogPosts,
      events,
      pageSections,
      galleryImages,
      uploadedFiles,
    },
    services: {
      application: "healthy",
      database: databaseConnected ? "connected" : "failed",
      uploads: uploadsWritable ? "writable" : "not_writable",
    },
    backups: {
      database: databaseBackup,
      uploads: uploadsBackup,
    },
  };
}
