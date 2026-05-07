"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function FetchTrendingButton() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null);

  const handleFetch = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cron", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMessage({ text: "拉取分析完成，正在刷新...", ok: true });
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
    <div className="flex items-center gap-3">
      <Button onClick={handleFetch} disabled={loading} variant="outline" size="sm">
        {loading ? "正在拉取分析中..." : "手动拉取"}
      </Button>
      {message && (
        <span className={`text-sm ${message.ok ? "text-green-600" : "text-red-500"}`}>
          {message.text}
        </span>
      )}
    </div>
  );
}
