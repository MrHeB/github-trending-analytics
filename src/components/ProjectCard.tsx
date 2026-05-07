import Link from "next/link";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Project } from "@/types";

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/project/${project.id}`}>
      <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold text-primary">#{project.rank}</span>
            <div className="flex items-center gap-2">
              {project.language && (
                <Badge variant="secondary">{project.language}</Badge>
              )}
              <span className="text-sm text-muted-foreground">
                ⭐ {formatStars(project.stars)}
              </span>
            </div>
          </div>
          <h3 className="text-lg font-semibold mt-1 truncate">{project.fullName}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {project.description || "暂无描述"}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-green-600 border-green-200 bg-green-50">
              +{formatStars(project.starsGrowth)} stars
            </Badge>
            {project.topics?.slice(0, 3).map((topic) => (
              <Badge key={topic} variant="outline" className="text-xs">
                {topic}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
