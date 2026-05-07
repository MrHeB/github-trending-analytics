"use client";

import { Badge } from "@/components/ui/badge";
import type { ReportDate, TrendingCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

interface HistorySidebarProps {
  dates: ReportDate[];
  selectedDate: string | null;
  selectedCategory: TrendingCategory | null;
  onSelect: (date: string, category: TrendingCategory) => void;
}

function groupByMonth(dates: ReportDate[]): Map<string, ReportDate[]> {
  const map = new Map<string, ReportDate[]>();
  for (const d of dates) {
    const date = new Date(d.date);
    const key = `${date.getFullYear()}年${date.getMonth() + 1}月`;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(d);
  }
  return map;
}

export function HistorySidebar({
  dates,
  selectedDate,
  selectedCategory,
  onSelect,
}: HistorySidebarProps) {
  const grouped = groupByMonth(dates);

  return (
    <aside className="w-64 shrink-0 border-r bg-muted/30 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">历史记录</h2>
        {dates.length === 0 ? (
          <p className="text-xs text-muted-foreground">暂无记录</p>
        ) : (
          <div className="space-y-4">
            {Array.from(grouped.entries()).map(([month, items]) => (
              <div key={month}>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">{month}</p>
                <div className="space-y-1">
                  {items.map((item, idx) => {
                    const dateStr = new Date(item.date).toLocaleDateString("zh-CN", {
                      month: "numeric",
                      day: "numeric",
                    });
                    const isActive =
                      selectedDate === item.date && selectedCategory === item.category;

                    return (
                      <button
                        key={`${item.date}-${item.category}-${idx}`}
                        onClick={() => onSelect(item.date, item.category as TrendingCategory)}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-sm flex items-center justify-between transition-colors ${
                          isActive
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <span>{dateStr}</span>
                        <Badge
                          variant={isActive ? "secondary" : "outline"}
                          className="text-[10px] px-1.5 py-0"
                        >
                          {CATEGORY_LABELS[item.category as TrendingCategory] ?? item.category}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
