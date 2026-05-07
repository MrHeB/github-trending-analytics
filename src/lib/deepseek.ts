import OpenAI from "openai";

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
  starsGrowth: number;
  topics: string[];
  readme?: string;
}

export async function analyzeProject(info: ProjectInfo): Promise<string> {
  const prompt = `你是一名资深的技术分析师，请对以下 GitHub 项目进行深入分析，生成一份结构化的 Markdown 文档。

## 项目基本信息
- 项目名称：${info.fullName}
- 描述：${info.description || "暂无描述"}
- 主要语言：${info.language || "未知"}
- 当前 Star 数：${info.stars.toLocaleString()}
- 昨日 Star 增长：+${info.starsGrowth.toLocaleString()}
- 标签：${info.topics.join(", ") || "无"}

${info.readme ? `## README 内容摘要\n${info.readme.slice(0, 3000)}` : ""}

请按照以下格式输出 Markdown 文档：

# ${info.fullName}

## 项目概览
简要描述项目的用途和核心价值（2-3句话）。

## 技术亮点
- 列出 3-5 个核心技术亮点或创新点

## 适用场景
- 列出 3-4 个典型的使用场景

## Star 增长分析
- 当前 Star 数：${info.stars.toLocaleString()}
- 昨日增长：+${info.starsGrowth.toLocaleString()}
- 简要分析为什么这个项目近期受欢迎

## 上手建议
给想要使用或贡献该项目的开发者 2-3 条建议。

## 原始地址
[${info.fullName}](${`https://github.com/${info.fullName}`})

---
> 本分析由 AI 自动生成，仅供参考`;

  const completion = await getClient().chat.completions.create({
    model: "glm-4.7-flash",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 2000,
    temperature: 0.7,
  });

  return completion.choices[0]?.message?.content ?? "分析生成失败";
}
