import { prisma } from "@/lib/prisma";
import { normalizeAnalyticsPath } from "@/lib/analytics-shared";

export { normalizeAnalyticsPath } from "@/lib/analytics-shared";

export async function recordPageView(path: string, visitorId: string): Promise<void> {
  if (!visitorId.trim()) {
    return;
  }

  await prisma.pageView.create({
    data: {
      path: normalizeAnalyticsPath(path),
      visitorId,
    },
  });
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysAgo(days: number): Date {
  const date = startOfDay(new Date());
  date.setDate(date.getDate() - days);
  return date;
}

export type AnalyticsSnapshot = {
  visitors: {
    total: number;
    today: number;
    thisWeek: number;
  };
  pageViews: {
    total: number;
    today: number;
    thisWeek: number;
  };
  topPages: Array<{ path: string; views: number }>;
};

export async function collectAnalytics(): Promise<AnalyticsSnapshot> {
  const weekStart = daysAgo(7);
  const todayStart = startOfDay(new Date());

  const [totalVisitors, visitorsToday, visitorsThisWeek, totalViews, viewsToday, viewsThisWeek, topPages] =
    await Promise.all([
      prisma.pageView.findMany({ distinct: ["visitorId"], select: { visitorId: true } }).then((rows) => rows.length),
      prisma.pageView
        .findMany({
          where: { viewedAt: { gte: todayStart } },
          distinct: ["visitorId"],
          select: { visitorId: true },
        })
        .then((rows) => rows.length),
      prisma.pageView
        .findMany({
          where: { viewedAt: { gte: weekStart } },
          distinct: ["visitorId"],
          select: { visitorId: true },
        })
        .then((rows) => rows.length),
      prisma.pageView.count(),
      prisma.pageView.count({ where: { viewedAt: { gte: todayStart } } }),
      prisma.pageView.count({ where: { viewedAt: { gte: weekStart } } }),
      prisma.pageView.groupBy({
        by: ["path"],
        _count: { path: true },
        orderBy: { _count: { path: "desc" } },
        take: 10,
      }),
    ]);

  return {
    visitors: {
      total: totalVisitors,
      today: visitorsToday,
      thisWeek: visitorsThisWeek,
    },
    pageViews: {
      total: totalViews,
      today: viewsToday,
      thisWeek: viewsThisWeek,
    },
    topPages: topPages.map((row) => ({
      path: row.path,
      views: row._count.path,
    })),
  };
}
