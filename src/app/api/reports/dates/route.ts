import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const reports = await prisma.dailyReport.findMany({
    select: { date: true, category: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(reports);
}
