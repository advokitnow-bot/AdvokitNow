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

    const upcomingHearings = await prisma.case.findMany({
      where: {
        nextHearing: {
          gte: new Date(),
        },
        userId,
      },
      orderBy: {
        nextHearing: "asc",
      },
      include: {
        client: true,
      },
      take: 10, // optional – limiting the results
    });

    return NextResponse.json(upcomingHearings);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch hearings" }, { status: 500 });
  }
}
