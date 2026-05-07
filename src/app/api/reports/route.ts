import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const reports = await prisma.dailyReport.findMany({
    orderBy: { date: "desc" },
    include: {
      projects: {
        orderBy: { rank: "asc" },
        select: {
          id: true,
          fullName: true,
          description: true,
          language: true,
          stars: true,
          starsGrowth: true,
          rank: true,
          githubUrl: true,
        },
      },
    },
  });

  return NextResponse.json(reports);
}
