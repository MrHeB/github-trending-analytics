import { NextResponse } from "next/server";
import { runDailyTask } from "@/lib/cron";

export async function POST() {
  try {
    await runDailyTask();
    return NextResponse.json({ success: true, message: "任务执行完成" });
  } catch (err) {
    console.error("手动触发任务失败:", err);
    return NextResponse.json({ success: false, message: "任务执行失败" }, { status: 500 });
  }
}
