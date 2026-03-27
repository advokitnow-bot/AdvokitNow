import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { caseId, type, description, status } = body

    // Validate required fields
    if (!caseId || !type || !description) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Validate enums
    const validTypes = ["FILED", "IN_COURT", "HEARING", "JUDGMENT", "CLOSED"]
    const validStatus = ["COMPLETED", "PENDING"]

    if (!validTypes.includes(type)) {
      return NextResponse.json({ error: "Invalid activity type" }, { status: 400 })
    }

    if (!validStatus.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        caseId,
        type,
        description,
        status,
      },
    })

    return NextResponse.json({ success: true, activity }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
