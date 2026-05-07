import { prisma } from "@/lib/db";
import { ProjectCard } from "@/components/ProjectCard";

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
      <header className="border-b">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold">GitHub Trending Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            每日热门项目趋势分析 · AI 深度解读
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {reports.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg text-muted-foreground">暂无数据</p>
            <p className="text-sm text-muted-foreground mt-2">
              系统将在每天早上 8:00 自动抓取并分析 GitHub 趋势项目
            </p>
          </div>
        ) : (
          <div className="space-y-12">
            {reports.map((report) => (
              <section key={report.id}>
                <h2 className="text-xl font-semibold mb-4">
                  {new Date(report.date).toLocaleDateString("zh-CN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                  {report.projects.map((project) => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
