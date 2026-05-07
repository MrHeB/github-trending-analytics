import cron from "node-cron";
import { runDailyTask } from "./cron";

let schedulerStarted = false;

export function startScheduler(): void {
  if (schedulerStarted) return;
  schedulerStarted = true;

  // 每天 8:00 执行
  cron.schedule("0 8 * * *", () => {
    runDailyTask().catch((err) => {
      console.error("[Cron] 任务执行失败:", err);
    });
  });

  console.log("[Scheduler] 定时任务已启动：每天 08:00 执行");
}
