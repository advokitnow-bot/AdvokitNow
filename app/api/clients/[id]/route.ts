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

    const client = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        cases: {
          orderBy: { createdAt: "desc" },
          include: {
            _count: {
              select: {
                documents: true,
              },
            },
          },
        },
      },
    })

    if (!client) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error("Get client error:", error)
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
    const { name, phoneNumber, email, address, notes } = body

    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Check if phone number is being changed and if it conflicts with another client
    if (phoneNumber && phoneNumber !== existingClient.phoneNumber) {
      const conflictingClient = await prisma.client.findFirst({
        where: {
          userId: user.id,
          phoneNumber,
          id: { not: params.id },
        },
      })

      if (conflictingClient) {
        return NextResponse.json({ error: "Another client with this phone number already exists" }, { status: 400 })
      }
    }

    // Check if email is being changed and if it conflicts with another client
    if (email && email !== existingClient.email) {
      const conflictingClient = await prisma.client.findFirst({
        where: {
          userId: user.id,
          email,
          id: { not: params.id },
        },
      })

      if (conflictingClient) {
        return NextResponse.json({ error: "Another client with this email already exists" }, { status: 400 })
      }
    }

    const updatedClient = await prisma.client.update({
      where: { id: params.id },
      data: {
        name,
        phoneNumber,
        email,
        address,
        notes,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "UPDATE_CLIENT",
        description: `Updated client: ${name}`,
        entityType: "CLIENT",
        entityId: updatedClient.id,
        userId: user.id,
      },
    })

    return NextResponse.json(updatedClient)
  } catch (error) {
    console.error("Update client error:", error)
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

    const existingClient = await prisma.client.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            cases: true,
          },
        },
      },
    })

    if (!existingClient) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    // Check if client has associated cases
    if (existingClient._count.cases > 0) {
      return NextResponse.json(
        { error: "Cannot delete client with associated cases. Please reassign or delete cases first." },
        { status: 400 },
      )
    }

    await prisma.client.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("Delete client error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
