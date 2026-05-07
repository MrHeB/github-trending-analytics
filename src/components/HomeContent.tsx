"use client";

import { useState, useEffect } from "react";
import { FetchTrendingButton } from "@/components/FetchTrendingButton";
import { HistorySidebar } from "@/components/HistorySidebar";
import { ReportViewer } from "@/components/ReportViewer";
import { PasswordDialog } from "@/components/PasswordDialog";
import { Button } from "@/components/ui/button";
import type { DailyReport, ReportDate, TrendingCategory } from "@/types";

interface HomeContentProps {
  dates: ReportDate[];
  defaultReport: DailyReport | null;
}

export function HomeContent({ dates, defaultReport }: HomeContentProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(
    defaultReport?.date ?? null
  );
  const [selectedCategory, setSelectedCategory] = useState<TrendingCategory | null>(
    (defaultReport?.category as TrendingCategory) ?? null
  );
  const [report, setReport] = useState<DailyReport | null>(defaultReport);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSelect = async (date: string, category: TrendingCategory) => {
    setSelectedDate(date);
    setSelectedCategory(category);
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?date=${date}&category=${category}`);
      const data = await res.json();
      setReport(data.length > 0 ? data[0] : null);
    } catch {
      setReport(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  useEffect(() => {
    if (defaultReport) {
      setSelectedDate(defaultReport.date);
      setSelectedCategory(defaultReport.category as TrendingCategory);
      setReport(defaultReport);
    }
  }, [defaultReport]);

  return (
    <div className="flex flex-1 min-h-0">
      <HistorySidebar
        dates={dates}
        selectedDate={selectedDate}
        selectedCategory={selectedCategory}
        onSelect={handleSelect}
      />
      <div className="flex-1 flex flex-col min-h-0">
        <div className="shrink-0 px-6 py-2 flex items-center justify-end gap-2 border-b">
          <Button variant="ghost" size="xs" onClick={() => setShowPassword(true)}>
            修改密码
          </Button>
          <Button variant="ghost" size="xs" onClick={handleLogout}>
            退出登录
          </Button>
        </div>
        <main className="flex-1 overflow-y-auto px-6 py-8">
          {loading ? (
            <div className="text-center py-20 text-muted-foreground">加载中...</div>
          ) : (
            <ReportViewer report={report} />
          )}
        </main>
      </div>
      {showPassword && <PasswordDialog onClose={() => setShowPassword(false)} />}
    </div>
  );
}
