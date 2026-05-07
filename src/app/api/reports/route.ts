import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date");
  const category = searchParams.get("category");

  if (date && category) {
    const report = await prisma.dailyReport.findUnique({
      where: { date_category: { date: new Date(date), category } },
      include: { projects: { orderBy: { rank: "asc" } } },
    });
    return NextResponse.json(report ? [report] : []);
  }

  const reports = await prisma.dailyReport.findMany({
    orderBy: { date: "desc" },
    take: 50,
    include: {
      projects: {
        orderBy: { rank: "asc" },
      },
    },
  });

  return NextResponse.json(reports);
}
