"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { TrendingCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [TrendingCategory, string][];

export function FetchTrendingButton() {
  const [category, setCategory] = useState<TrendingCategory>("stars");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cron", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: `${CATEGORY_LABELS[category]}拉取完成，正在刷新...`, ok: true });
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setMessage({ text: data.message || "拉取失败", ok: false });
      }
    } catch {
      setMessage({ text: "网络错误，请重试", ok: false });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={category} onValueChange={(v) => setCategory(v as TrendingCategory)}>
        <SelectTrigger size="sm" className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Button onClick={handleFetch} disabled={loading} variant="outline" size="sm">
        {loading ? "拉取中..." : "手动拉取"}
      </Button>
      {message && (
        <span className={`text-xs ${message.ok ? "text-green-600" : "text-red-500"}`}>
          {message.text}
        </span>
      )}
    </div>
  );
}
