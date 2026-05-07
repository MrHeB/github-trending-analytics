export type TrendingCategory = "stars" | "forks" | "recent" | "trending" | "interactive";

export const CATEGORY_LABELS: Record<TrendingCategory, string> = {
  stars: "Star 增长榜",
  forks: "Fork 排行榜",
  recent: "新秀热门榜",
  trending: "活跃趋势榜",
  interactive: "社区互动榜",
};

export interface Project {
  id: number;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  starsGrowth: number;
  rank: number;
  githubUrl: string;
  topics: string[];
  analysisMd: string | null;
  wechatMd: string | null;
}

export interface DailyReport {
  id: number;
  date: string;
  category: string;
  projects: Project[];
}

export interface ProjectDetail extends Project {
  snapshots: StarSnapshot[];
}

export interface StarSnapshot {
  id: number;
  fullName: string;
  stars: number;
  snapshotDate: string | Date;
}

export interface ReportDate {
  date: string;
  category: string;
}
