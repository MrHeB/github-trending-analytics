import { prisma } from "@/lib/db";
import { FetchTrendingButton } from "@/components/FetchTrendingButton";
import { ProjectList } from "@/components/ProjectList";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const reports = await prisma.dailyReport.findMany({
    orderBy: { date: "desc" },
    take: 30,
    include: {
      projects: {
        orderBy: { rank: "asc" },
      },
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur-sm z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">GitHub Trending Analytics</h1>
            <p className="text-sm text-muted-foreground mt-1">
              每日热门项目趋势分析 · AI 深度解读
            </p>
          </div>
          <FetchTrendingButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {reports.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">暂无数据</p>
            <p className="text-sm text-muted-foreground mt-2">
              系统将在每天早上 8:00 自动抓取并分析 GitHub 趋势项目
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {reports.map((report) => (
              <section key={report.id}>
                <h2 className="text-xl font-semibold mb-6 pb-2 border-b">
                  {new Date(report.date).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <ProjectList projects={report.projects} />
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
