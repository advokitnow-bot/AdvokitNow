import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const caseData = await prisma.case.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        client: true,
        documents: {
          orderBy: { createdAt: "desc" },
        },
        notifications: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
      },
    })

    if (!caseData) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    return NextResponse.json(caseData)
  } catch (error) {
    console.error("Get case error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, court, judge, caseType, status, filingDate, nextHearing, priority, clientId } = body

    const existingCase = await prisma.case.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const updatedCase = await prisma.case.update({
      where: { id: params.id },
      data: {
        title,
        description,
        court,
        judge,
        caseType,
        status,
        filingDate: filingDate ? new Date(filingDate) : null,
        nextHearing: nextHearing ? new Date(nextHearing) : null,
        priority,
        clientId,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            phoneNumber: true,
          },
        },
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "UPDATE_CASE",
        description: `Updated case: ${title}`,
        entityType: "CASE",
        entityId: updatedCase.id,
        userId: user.id,
        caseId: updatedCase.id,
      },
    })

    return NextResponse.json(updatedCase)
  } catch (error) {
    console.error("Update case error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const existingCase = await prisma.case.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingCase) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    await prisma.case.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Case deleted successfully" })
  } catch (error) {
    console.error("Delete case error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
