import { prisma } from "./db";
import type { TrendingCategory } from "@/types";

interface TrendingRepo {
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
  url: string;
}

interface GitHubSearchItem {
  full_name: string;
  name: string;
  owner: { login: string };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
  topics: string[];
}

async function fetchGitHub<T>(path: string): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`https://api.github.com${path}`, { headers });
  if (!res.ok) throw new Error(`GitHub API error: ${res.status} ${res.statusText}`);
  return res.json();
}

function buildSearchQuery(category: TrendingCategory): { q: string; sort: string; order: string } {
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(now);
  lastWeek.setDate(lastWeek.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  switch (category) {
    case "stars":
      return {
        q: `stars:>50+pushed:>${yesterday.toISOString().split("T")[0]}`,
        sort: "stars",
        order: "desc",
      };
    case "forks":
      return {
        q: `forks:>10+pushed:>${lastWeek.toISOString().split("T")[0]}`,
        sort: "forks",
        order: "desc",
      };
    case "recent":
      return {
        q: `stars:>100+created:>${thirtyDaysAgo.toISOString().split("T")[0]}`,
        sort: "stars",
        order: "desc",
      };
    case "trending":
      return {
        q: `stars:>50+pushed:>${yesterday.toISOString().split("T")[0]}`,
        sort: "stars",
        order: "desc",
      };
    case "interactive":
      return {
        q: `stars:>50+pushed:>${lastWeek.toISOString().split("T")[0]}`,
        sort: "help-wanted-issues",
        order: "desc",
      };
  }
}

async function fetchTrendingFromSearch(category: TrendingCategory): Promise<TrendingRepo[]> {
  const { q, sort, order } = buildSearchQuery(category);

  const data = await fetchGitHub<{ items: GitHubSearchItem[] }>(
    `/search/repositories?q=${q}&sort=${sort}&order=${order}&per_page=30`
  );

  return data.items.map((item) => ({
    name: item.name,
    owner: item.owner.login,
    fullName: item.full_name,
    description: item.description ?? "",
    language: item.language ?? "",
    stars: item.stargazers_count,
    forks: item.forks_count,
    openIssues: item.open_issues_count,
    starsGrowth: 0,
    topics: item.topics ?? [],
    url: item.html_url,
  }));
}

async function calculateStarGrowth(repos: TrendingRepo[]): Promise<TrendingRepo[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  return Promise.all(
    repos.map(async (repo) => {
      const snapshot = await prisma.starSnapshot.findUnique({
        where: { fullName_snapshotDate: { fullName: repo.fullName, snapshotDate: yesterday } },
      });
      repo.starsGrowth = snapshot ? repo.stars - snapshot.stars : Math.floor(repo.stars * 0.05);
      return repo;
    })
  );
}

export async function fetchTopTrendingRepos(category: TrendingCategory = "stars"): Promise<TrendingRepo[]> {
  let repos = await fetchTrendingFromSearch(category);

  if (category === "stars") {
    repos = await calculateStarGrowth(repos);
    repos.sort((a, b) => b.starsGrowth - a.starsGrowth);
  }

  const top5 = repos.slice(0, 5);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await Promise.all(
    top5.map((repo) =>
      prisma.starSnapshot.upsert({
        where: { fullName_snapshotDate: { fullName: repo.fullName, snapshotDate: today } },
        update: { stars: repo.stars },
        create: { fullName: repo.fullName, stars: repo.stars, snapshotDate: today },
      })
    )
  );

  return top5;
}

export async function getRepoReadme(owner: string, name: string): Promise<string> {
  try {
    const data = await fetchGitHub<{ content: string; encoding: string }>(
      `/repos/${owner}/${name}/readme`
    );
    return Buffer.from(data.content, "base64").toString("utf-8");
  } catch {
    return "";
  }
}
