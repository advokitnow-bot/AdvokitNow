import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

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
    const { isRead } = body

    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    const updatedNotification = await prisma.notification.update({
      where: { id: params.id },
      data: { isRead },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
      },
    })

    return NextResponse.json(updatedNotification)
  } catch (error) {
    console.error("Update notification error:", error)
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

    const existingNotification = await prisma.notification.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingNotification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 })
    }

    await prisma.notification.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Notification deleted successfully" })
  } catch (error) {
    console.error("Delete notification error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
