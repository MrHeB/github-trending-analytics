"use client";

import type { StarSnapshot } from "@/types";

export function StarTrendChart({ snapshots }: { snapshots: StarSnapshot[] }) {
  if (snapshots.length < 2) {
    return (
      <div className="text-sm text-muted-foreground py-4 text-center">
        暂无足够的历史数据生成趋势图
      </div>
    );
  }

  const maxStars = Math.max(...snapshots.map((s) => s.stars));
  const minStars = Math.min(...snapshots.map((s) => s.stars));
  const range = maxStars - minStars || 1;
  const chartWidth = 500;
  const chartHeight = 150;
  const padding = 20;

  const points = snapshots.map((s, i) => {
    const x = padding + (i / (snapshots.length - 1)) * (chartWidth - padding * 2);
    const y = chartHeight - padding - ((s.stars - minStars) / range) * (chartHeight - padding * 2);
    return { x, y, ...s };
  });

  const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full min-w-[400px] h-[150px]">
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.2" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaD} fill="url(#areaGrad)" />
        <path d={pathD} fill="none" stroke="hsl(var(--primary))" strokeWidth="2" />
        {points.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r="3" fill="hsl(var(--primary))" />
            <text
              x={p.x}
              y={chartHeight - 4}
              textAnchor="middle"
              className="text-[10px] fill-muted-foreground"
            >
              {new Date(p.snapshotDate).toLocaleDateString("zh-CN", { month: "short", day: "numeric" })}
            </text>
            <text x={p.x} y={p.y - 8} textAnchor="middle" className="text-[10px] fill-foreground">
              {p.stars.toLocaleString()}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
