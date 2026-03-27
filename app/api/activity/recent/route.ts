import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import dayjs from "dayjs";

export async function GET() {
  try {
    const recentActivities = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
      },
      take: 10,
    });

    return NextResponse.json(recentActivities);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch recent activity" },
      { status: 500 }
    );
  }
}
