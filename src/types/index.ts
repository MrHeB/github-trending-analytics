export interface Project {
  id: number;
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  starsGrowth: number;
  rank: number;
  githubUrl: string;
  topics: string[];
  analysisMd: string | null;
}

export interface DailyReport {
  id: number;
  date: string;
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
