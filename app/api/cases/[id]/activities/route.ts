import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(req: Request, { params }: { params: { caseId: string } }) {
  const { caseId } = params

  try {
    const activities = await prisma.activity.findMany({
      where: { caseId },
      orderBy: { createdAt: "asc" }, // order by time
    })

    return NextResponse.json({ activities })
  } catch (error) {
    console.error("Error fetching activities:", error)
    return NextResponse.json({ activities: [], error: "Failed to fetch activities" }, { status: 500 })
  }
}
