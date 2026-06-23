import { ADMIN_SESSION_MAX_AGE_SEC } from "@/lib/admin-auth-shared";
import { getAdminDisplayName } from "@/lib/admin-allowed-emails";
import type { AdminSessionRecord } from "@/lib/admin-session-types";
import { prisma } from "@/lib/prisma";

export type { AdminSessionRecord } from "@/lib/admin-session-types";

function activeSessionCutoff(): Date {
  return new Date(Date.now() - ADMIN_SESSION_MAX_AGE_SEC * 1000);
}

function toRecord(
  row: {
    id: string;
    email: string;
    ipAddress: string;
    userAgent: string | null;
    loginAt: Date;
    lastSeenAt: Date;
  },
  isCurrent = false,
): AdminSessionRecord {
  return {
    id: row.id,
    email: row.email,
    displayName: getAdminDisplayName(row.email),
    ipAddress: row.ipAddress,
    userAgent: row.userAgent,
    loginAt: row.loginAt.toISOString(),
    lastSeenAt: row.lastSeenAt.toISOString(),
    isCurrent,
  };
}

export async function createAdminSessionRecord(input: {
  email: string;
  ipAddress: string;
  userAgent?: string | null;
}): Promise<AdminSessionRecord> {
  const row = await prisma.adminSession.create({
    data: {
      email: input.email.trim().toLowerCase(),
      ipAddress: input.ipAddress,
      userAgent: input.userAgent ?? null,
    },
  });

  return toRecord(row, true);
}

export async function touchAdminSessionRecord(sessionId: string): Promise<void> {
  await prisma.adminSession.updateMany({
    where: {
      id: sessionId,
      revokedAt: null,
      lastSeenAt: { gte: activeSessionCutoff() },
    },
    data: { lastSeenAt: new Date() },
  });
}

export async function revokeAdminSessionRecord(sessionId: string): Promise<void> {
  await prisma.adminSession.updateMany({
    where: { id: sessionId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getAdminSessionRecord(sessionId: string): Promise<AdminSessionRecord | null> {
  const row = await prisma.adminSession.findFirst({
    where: {
      id: sessionId,
      revokedAt: null,
      lastSeenAt: { gte: activeSessionCutoff() },
    },
  });

  return row ? toRecord(row) : null;
}

export async function listActiveAdminSessions(
  currentSessionId?: string,
): Promise<AdminSessionRecord[]> {
  const cutoff = activeSessionCutoff();
  const rows = await prisma.adminSession.findMany({
    where: {
      revokedAt: null,
      lastSeenAt: { gte: cutoff },
    },
    orderBy: [{ loginAt: "desc" }],
  });

  return rows.map((row) => toRecord(row, row.id === currentSessionId));
}

export async function listRecentPeerLogins(
  currentSessionId: string,
  since: Date,
): Promise<AdminSessionRecord[]> {
  const current = await prisma.adminSession.findUnique({
    where: { id: currentSessionId },
    select: { email: true },
  });
  if (!current) return [];

  const rows = await prisma.adminSession.findMany({
    where: {
      id: { not: currentSessionId },
      email: { not: current.email },
      revokedAt: null,
      loginAt: { gte: since },
      lastSeenAt: { gte: activeSessionCutoff() },
    },
    orderBy: [{ loginAt: "desc" }],
  });

  return rows.map((row) => toRecord(row));
}
