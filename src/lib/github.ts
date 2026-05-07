import { prisma } from "./db";

interface TrendingRepo {
  name: string;
  owner: string;
  fullName: string;
  description: string;
  language: string;
  stars: number;
  starsGrowth: number;
  topics: string[];
  url: string;
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

async function fetchTrendingFromSearch(): Promise<TrendingRepo[]> {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const dateStr = yesterday.toISOString().split("T")[0];

  const data = await fetchGitHub<{
    items: Array<{
      full_name: string;
      name: string;
      owner: { login: string };
      description: string | null;
      language: string | null;
      stargazers_count: number;
      html_url: string;
      topics: string[];
    }>;
  }>(
    `/search/repositories?q=stars:>50+pushed:>${dateStr}&sort=stars&order=desc&per_page=30`
  );

  const repos: TrendingRepo[] = data.items.map((item) => ({
    name: item.name,
    owner: item.owner.login,
    fullName: item.full_name,
    description: item.description ?? "",
    language: item.language ?? "",
    stars: item.stargazers_count,
    starsGrowth: 0,
    topics: item.topics ?? [],
    url: item.html_url,
  }));

  return repos;
}

async function calculateStarGrowth(repos: TrendingRepo[]): Promise<TrendingRepo[]> {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  const enriched = await Promise.all(
    repos.map(async (repo) => {
      const snapshot = await prisma.starSnapshot.findUnique({
        where: { fullName_snapshotDate: { fullName: repo.fullName, snapshotDate: yesterday } },
      });

      if (snapshot) {
        repo.starsGrowth = repo.stars - snapshot.stars;
      } else {
        repo.starsGrowth = Math.floor(repo.stars * 0.05);
      }

      return repo;
    })
  );

  return enriched;
}

export async function fetchTopTrendingRepos(): Promise<TrendingRepo[]> {
  const repos = await fetchTrendingFromSearch();
  const withGrowth = await calculateStarGrowth(repos);

  withGrowth.sort((a, b) => b.starsGrowth - a.starsGrowth);

  const top10 = withGrowth.slice(0, 10);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  await Promise.all(
    top10.map((repo) =>
      prisma.starSnapshot.upsert({
        where: { fullName_snapshotDate: { fullName: repo.fullName, snapshotDate: today } },
        update: { stars: repo.stars },
        create: { fullName: repo.fullName, stars: repo.stars, snapshotDate: today },
      })
    )
  );

  return top10;
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
