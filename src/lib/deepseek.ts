import OpenAI from "openai";
import type { TrendingCategory } from "@/types";
import { CATEGORY_LABELS } from "@/types";

function getClient() {
  return new OpenAI({
    apiKey: process.env.GLM_API_KEY || "dummy",
    baseURL: "https://open.bigmodel.cn/api/paas/v4",
  });
}

interface ProjectInfo {
  name: string;
  owner: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  openIssues: number;
  starsGrowth: number;
  topics: string[];
  category: TrendingCategory;
  readme?: string;
}

const SPLIT_MARKER = "<!-- WECHAT_MD_SPLIT -->";

export async function analyzeProject(
  info: ProjectInfo
): Promise<{ analysisMd: string; wechatMd: string | null }> {
  const categoryLabel = CATEGORY_LABELS[info.category];

  const prompt = `你是一名资深的技术分析师，请对以下 GitHub 项目进行深入分析，生成一份结构化的 Markdown 文档。

## 项目基本信息
- 项目名称：${info.fullName}
- 描述：${info.description || "暂无描述"}
- 主要语言：${info.language || "未知"}
- 当前 Star 数：${info.stars.toLocaleString()}
- Fork 数：${info.forks.toLocaleString()}
- Open Issues：${info.openIssues.toLocaleString()}
- 昨日 Star 增长：+${info.starsGrowth.toLocaleString()}
- 标签：${info.topics.join(", ") || "无"}
- 榜单类型：${categoryLabel}

${info.readme ? `## README 内容摘要\n${info.readme.slice(0, 3000)}` : ""}

请按照以下格式输出 Markdown 文档：

# ${info.fullName}

## 项目概览
简要描述项目的用途和核心价值（2-3句话），说明项目的成熟度和社区规模。

## 技术亮点
- 列出 3-5 个核心技术亮点或创新点
- 结合 README 内容分析架构设计和设计模式

## 适用场景
- 列出 3-4 个典型的使用场景

## 社区活跃度分析
- Star 数：${info.stars.toLocaleString()}（昨日增长 +${info.starsGrowth.toLocaleString()}）
- Fork 数：${info.forks.toLocaleString()}
- Open Issues：${info.openIssues.toLocaleString()}
- 分析社区的活跃程度和项目维护状态

## 竞品对比
简要提及 1-2 个同类项目，并说明本项目的差异化优势。

## 上手建议
给想要使用或贡献该项目的开发者 2-3 条建议。

## 综合评分
用一行给出评分，格式如：创新性 8/10 | 成熟度 7/10 | 社区活跃度 8/10

## 原始地址
[${info.fullName}](${`https://github.com/${info.fullName}`})

---
> 本分析由 AI 自动生成，仅供参考

---

在完成以上分析后，请输出以下分隔符：
${SPLIT_MARKER}

然后输出一份适合微信公众号发布的 Markdown 文章，要求：
- 使用一个吸引人的标题（带 emoji）
- 500-800 字，口语化风格，像在和朋友聊天一样
- 适当使用 emoji 增加可读性
- 内容包含：项目介绍、为什么值得关注、适合谁用、如何开始使用
- 末尾附上 GitHub 链接
- 不使用 HTML 标签，只使用标准 Markdown`;

  const completion = await getClient().chat.completions.create({
    model: "glm-4.7-flash",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 4000,
    temperature: 0.7,
  });

  const content = completion.choices[0]?.message?.content ?? "分析生成失败";

  const parts = content.split(SPLIT_MARKER);
  const analysisMd = parts[0].trim();
  const wechatMd = parts.length > 1 ? parts[1].trim() : null;

  return { analysisMd, wechatMd };
}
