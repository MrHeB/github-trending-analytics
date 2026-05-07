import { prisma } from "@/lib/db";
import { FetchTrendingButton } from "@/components/FetchTrendingButton";
import { HomeContent } from "@/components/HomeContent";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [dates, latestReport] = await Promise.all([
    prisma.dailyReport.findMany({
      select: { date: true, category: true },
      orderBy: { date: "desc" },
    }),
    prisma.dailyReport.findFirst({
      where: { category: "stars" },
      orderBy: { date: "desc" },
      include: {
        projects: { orderBy: { rank: "asc" } },
      },
    }),
  ]);

  const serializedDates = dates.map((d) => ({
    date: d.date.toISOString(),
    category: d.category,
  }));

  const serializedReport = latestReport
    ? {
        ...latestReport,
        date: latestReport.date.toISOString(),
        projects: latestReport.projects.map((p) => ({
          ...p,
          topics: p.topics ?? [],
        })),
      }
    : null;

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b shrink-0">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">GitHub Trending Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              每日热门项目趋势分析 · AI 深度解读
            </p>
          </div>
          <FetchTrendingButton />
        </div>
      </header>

      <HomeContent dates={serializedDates} defaultReport={serializedReport} />
    </div>
  );
}
