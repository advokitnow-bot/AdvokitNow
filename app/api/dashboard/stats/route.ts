import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("auth-token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const decoded = await verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userId = decoded.id;

    const totalCases = await prisma.case.count({
      where: { userId },
    });

    const clients = await prisma.client.count({
      where: { userId },
    });

    const upcomingHearings = await prisma.case.count({
      where: {
        userId,
        nextHearing: {
          gte: new Date(),
          lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      },
    });

    const urgentCases = await prisma.case.count({
      where: {
        userId,
        priority: {
          in: ["HIGH", "URGENT"],
        },
      },
    });

    return NextResponse.json({
      totalCases,
      clients,
      upcomingHearings,
      urgentCases,
      trend: {
        cases: { value: totalCases, isPositive: true },
        clients: { value: clients, isPositive: true },
      },
    });
  } catch (err) {
    console.error("Dashboard API error:", err);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
