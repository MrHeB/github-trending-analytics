import { NextResponse } from "next/server";
import { runDailyTask } from "@/lib/cron";
import type { TrendingCategory } from "@/types";

const VALID_CATEGORIES: TrendingCategory[] = ["stars", "forks", "recent", "trending", "interactive"];

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const category: TrendingCategory = VALID_CATEGORIES.includes(body.category) ? body.category : "stars";
    await runDailyTask(category);
    return NextResponse.json({ success: true, message: `${category} 任务执行完成` });
  } catch (err) {
    console.error("手动触发任务失败:", err);
    return NextResponse.json({ success: false, message: "任务执行失败" }, { status: 500 });
  }
}
