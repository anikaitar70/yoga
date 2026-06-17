import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

/** Models added after initial deploy — used to detect a hot-reloaded stale client. */
const REQUIRED_DELEGATES = ["pageSection", "galleryCollection", "galleryCollage"] as const;

function createPrismaClient() {
  return new PrismaClient();
}

function isPrismaClientStale(client: PrismaClient): boolean {
  const extended = client as PrismaClient & Record<string, unknown>;
  return REQUIRED_DELEGATES.some((key) => typeof extended[key] === "undefined");
}

export function getPrisma(): PrismaClient {
  const cached = globalForPrisma.prisma;

  if (cached && !isPrismaClientStale(cached)) {
    return cached;
  }

  if (cached) {
    void cached.$disconnect().catch(() => undefined);
    globalForPrisma.prisma = undefined;
  }

  const client = createPrismaClient();

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

/**
 * Lazy Prisma accessor — avoids a stale singleton when the dev server hot-reloads
 * after schema changes. Requires `serverExternalPackages` in next.config.ts.
 */
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = Reflect.get(client as object, prop, client);
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});

export function hasPrismaDelegate(name: (typeof REQUIRED_DELEGATES)[number]): boolean {
  const client = getPrisma() as PrismaClient & Record<string, unknown>;
  const delegate = client[name];
  return typeof delegate === "object" && delegate !== null && "findMany" in delegate;
}
