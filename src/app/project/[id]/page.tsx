import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export const dynamic = "force-dynamic";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { StarTrendChart } from "@/components/StarTrendChart";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id: Number(id) },
  });

  if (!project) notFound();

  const snapshots = await prisma.starSnapshot.findMany({
    where: { fullName: project.fullName },
    orderBy: { snapshotDate: "asc" },
  });

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            &larr; 返回首页
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">{project.fullName}</h1>
            {project.description && (
              <p className="text-muted-foreground mt-1">{project.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            {project.language && <Badge variant="secondary">{project.language}</Badge>}
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              +{project.starsGrowth} stars/day
            </Badge>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold">Star 增长趋势</h2>
            <p className="text-sm text-muted-foreground">
              当前 {project.stars.toLocaleString()} stars
            </p>
          </CardHeader>
          <CardContent>
            <StarTrendChart snapshots={snapshots} />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            {project.analysisMd ? (
              <MarkdownViewer content={project.analysisMd} />
            ) : (
              <p className="text-muted-foreground">暂无分析内容</p>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            在 GitHub 上查看 →
          </a>
        </div>
      </main>
    </div>
  );
}
