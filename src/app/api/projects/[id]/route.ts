import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const project = await prisma.project.findUnique({
    where: { id: Number(id) },
  });

  if (!project) {
    return NextResponse.json({ error: "项目不存在" }, { status: 404 });
  }

  const snapshots = await prisma.starSnapshot.findMany({
    where: { fullName: project.fullName },
    orderBy: { snapshotDate: "asc" },
  });

  return NextResponse.json({ ...project, snapshots });
}
