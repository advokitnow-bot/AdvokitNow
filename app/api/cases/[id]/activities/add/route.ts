import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { activity_status, activity_type } from "@prisma/client"

export async function POST(
  req: Request,
  { params }: { params: { caseId: string } }
) {
  const { caseId } = params

  try {
    const body = await req.json()
    const { activity, description, status, dueDate } = body

    console.log("Incoming body:", body)
    console.log("Route caseId:", caseId)

    if (!activity || !description || !status) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const newActivity = await prisma.activity.create({
      data: {
        caseId,
        type: activity.toUpperCase() as activity_type,
        description,
        status: status.toUpperCase() as activity_status,
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    })

    return NextResponse.json({ activity: newActivity })
  } catch (error) {
    console.error("FULL PRISMA ERROR:", error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
  
}
