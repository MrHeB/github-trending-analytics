"use client";

import { useState } from "react";
import Link from "next/link";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, ExternalLink, Copy, Check } from "lucide-react";
import type { Project } from "@/types";

function formatStars(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return n.toString();
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Button variant="ghost" size="xs" onClick={handleCopy}>
      {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
      {copied ? "已复制" : "复制"}
    </Button>
  );
}

function ProjectItem({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);
  const [wechatExpanded, setWechatExpanded] = useState(false);

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
        <span className="text-sm text-muted-foreground shrink-0">
          🍴 {formatStars(project.forks)}
        </span>
        <Badge
          variant="outline"
          className="text-green-600 border-green-200 bg-green-50 shrink-0"
        >
          +{formatStars(project.starsGrowth)}
        </Badge>
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

          {project.wechatMd && (
            <>
              <Separator className="my-4" />
              <div>
                <button
                  onClick={() => setWechatExpanded(!wechatExpanded)}
                  className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {wechatExpanded ? (
                    <ChevronDown className="size-4" />
                  ) : (
                    <ChevronRight className="size-4" />
                  )}
                  公众号文章
                  <CopyButton text={project.wechatMd} />
                </button>
                {wechatExpanded && (
                  <div className="mt-3 p-4 bg-muted/50 rounded-lg">
                    <MarkdownViewer content={project.wechatMd} />
                  </div>
                )}
              </div>
            </>
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
