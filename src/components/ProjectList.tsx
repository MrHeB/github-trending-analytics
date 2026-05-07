"use client";

import { useState } from "react";
import Link from "next/link";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import type { Project } from "@/types";

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function ProjectItem({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <article className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full text-left px-5 py-4 flex items-center gap-3 hover:bg-muted/50 transition-colors cursor-pointer"
      >
        {expanded ? (
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
        )}
        <span className="text-xl font-bold text-primary w-8 shrink-0">
          #{project.rank}
        </span>
        <span className="font-semibold truncate">{project.fullName}</span>
        {project.language && (
          <Badge variant="secondary" className="shrink-0">
            {project.language}
          </Badge>
        )}
        <span className="text-sm text-muted-foreground shrink-0">
          ⭐ {formatStars(project.stars)}
        </span>
        <Badge
          variant="outline"
          className="text-green-600 border-green-200 bg-green-50 shrink-0"
        >
          +{formatStars(project.starsGrowth)}
        </Badge>
        {project.topics?.slice(0, 2).map((topic) => (
          <Badge key={topic} variant="outline" className="text-xs shrink-0 hidden sm:inline-flex">
            {topic}
          </Badge>
        ))}
      </button>

      {expanded && (
        <div className="px-5 pb-5">
          {project.description && (
            <p className="text-sm text-muted-foreground mb-3">
              {project.description}
            </p>
          )}
          <Link
            href={project.githubUrl}
            target="_blank"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4"
          >
            <ExternalLink className="size-3" />
            查看 GitHub 仓库
          </Link>
          <Separator className="my-4" />
          {project.analysisMd ? (
            <MarkdownViewer content={project.analysisMd} />
          ) : (
            <p className="text-sm text-muted-foreground">暂无分析</p>
          )}
        </div>
      )}
    </article>
  );
}

export function ProjectList({ projects }: { projects: Project[] }) {
  return (
    <div className="space-y-3">
      {projects.map((project) => (
        <ProjectItem key={project.id} project={project} />
      ))}
    </div>
  );
}
