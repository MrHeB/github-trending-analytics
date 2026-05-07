import { fetchTopTrendingRepos, getRepoReadme } from "./github";
import { analyzeProject } from "./deepseek";
import { prisma } from "./db";

export async function runDailyTask(): Promise<void> {
  console.log("[Cron] 开始执行每日 GitHub 趋势分析任务...");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const existing = await prisma.dailyReport.findUnique({ where: { date: today } });
  if (existing) {
    console.log("[Cron] 今日报告已存在，跳过");
    return;
  }

  const repos = await fetchTopTrendingRepos();
  console.log(`[Cron] 获取到 ${repos.length} 个热门项目`);

  const report = await prisma.dailyReport.create({
    data: { date: today },
  });

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i];
    console.log(`[Cron] 正在分析 ${repo.fullName} (${i + 1}/${repos.length})...`);

    let readme: string | undefined;
    try {
      readme = await getRepoReadme(repo.owner, repo.name);
    } catch {
      console.log(`[Cron] 获取 README 失败: ${repo.fullName}`);
    }

    let analysisMd = "";
    try {
      analysisMd = await analyzeProject({
        name: repo.name,
        owner: repo.owner,
        fullName: repo.fullName,
        description: repo.description,
        language: repo.language,
        stars: repo.stars,
        starsGrowth: repo.starsGrowth,
        topics: repo.topics,
        readme,
      });
    } catch (err) {
      console.error(`[Cron] 分析失败 ${repo.fullName}:`, err);
      analysisMd = `# ${repo.fullName}\n\n> AI 分析暂时不可用\n\n## 原始地址\n[${repo.fullName}](${repo.url})`;
    }

    await prisma.project.create({
      data: {
        name: repo.name,
        owner: repo.owner,
        fullName: repo.fullName,
        githubUrl: repo.url,
        description: repo.description,
        language: repo.language,
        stars: repo.stars,
        starsGrowth: repo.starsGrowth,
        rank: i + 1,
        topics: repo.topics,
        analysisMd,
        reportDate: report.date,
      },
    });

    if (i < repos.length - 1) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }

  console.log(`[Cron] 每日报告生成完成，共 ${repos.length} 个项目`);
}
