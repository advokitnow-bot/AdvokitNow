import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"
import type { CaseType, CaseStatus, Priority } from "@prisma/client"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await getUserFromToken(token)
    if (!user) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""
    const status = searchParams.get("status") as CaseStatus | null
    const caseType = searchParams.get("caseType") as CaseType | null
    const priority = searchParams.get("priority") as Priority | null

    const skip = (page - 1) * limit

    const where = {
      userId: user.id,
      ...(search && {
        OR: [
          { caseNumber: { contains: search } },
          { title: { contains: search } },
          { court: { contains: search } },
          { judge: { contains: search } },
        ],
      }),
      ...(status && { status }),
      ...(caseType && { caseType }),
      ...(priority && { priority }),
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
            },
          },
          _count: {
            select: {
              documents: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.case.count({ where }),
    ])

    return NextResponse.json({
      cases,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get cases error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
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
    const {
      caseNumber,
      title,
      description,
      court,
      judge,
      caseType,
      status,
      filingDate,
      nextHearing,
      priority,
      clientId,
    } = body

    // Check if case number already exists
    const existingCase = await prisma.case.findUnique({
      where: { caseNumber },
    })

    if (existingCase) {
      return NextResponse.json({ error: "Case number already exists" }, { status: 400 })
    }

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        title,
        description,
        court,
        judge,
        caseType,
        status: status || "ACTIVE",
        filingDate: filingDate ? new Date(filingDate) : null,
        nextHearing: nextHearing ? new Date(nextHearing) : null,
        priority: priority || "MEDIUM",
        userId: user.id,
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
        action: "CREATE_CASE",
        description: `Created new case: ${title}`,
        entityType: "CASE",
        entityId: newCase.id,
        userId: user.id,
        caseId: newCase.id,
      },
    })

    const { createCaseUpdateNotification, createHearingReminder } = await import("@/lib/notifications")

    await createCaseUpdateNotification(newCase.id, user.id, "New case created")

    if (nextHearing) {
      await createHearingReminder(newCase.id, user.id, new Date(nextHearing))
    }

    return NextResponse.json(newCase, { status: 201 })
  } catch (error) {
    console.error("Create case error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
