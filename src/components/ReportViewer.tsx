"use client";

import { useState, useEffect } from "react";
import { ProjectList } from "@/components/ProjectList";
import { Badge } from "@/components/ui/badge";
import type { DailyReport, TrendingCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

interface ReportViewerProps {
  report: DailyReport | null;
}

export function ReportViewer({ report: initialReport }: ReportViewerProps) {
  const [report, setReport] = useState<DailyReport | null>(initialReport);

  useEffect(() => {
    setReport(initialReport);
  }, [initialReport]);

  if (!report) {
    return (
      <div className="text-center py-20">
        <p className="text-lg text-muted-foreground">暂无数据</p>
        <p className="text-sm text-muted-foreground mt-2">
          系统将在每天早上 8:00 自动抓取并分析 GitHub 趋势项目
        </p>
      </div>
    );
  }

  const category = report.category as TrendingCategory;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6 pb-2 border-b">
        <h2 className="text-xl font-semibold">
          {new Date(report.date).toLocaleDateString("zh-CN", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </h2>
        <Badge variant="secondary">{CATEGORY_LABELS[category] ?? category}</Badge>
      </div>
      <ProjectList projects={report.projects} />
    </div>
  );
}
