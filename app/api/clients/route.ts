import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"

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

    const skip = (page - 1) * limit

    const where = {
      userId: user.id,
      ...(search && {
        OR: [{ name: { contains: search } }, { phoneNumber: { contains: search } }, { email: { contains: search } }],
      }),
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        include: {
          _count: {
            select: {
              cases: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.client.count({ where }),
    ])

    return NextResponse.json({
      clients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get clients error:", error)
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
    const { name, phoneNumber, email, address, notes } = body

    // Check if client with same phone number already exists for this user
    if (phoneNumber) {
      const existingClient = await prisma.client.findFirst({
        where: {
          userId: user.id,
          phoneNumber,
        },
      })

      if (existingClient) {
        return NextResponse.json({ error: "Client with this phone number already exists" }, { status: 400 })
      }
    }

    // Check if client with same email already exists for this user
    if (email) {
      const existingClient = await prisma.client.findFirst({
        where: {
          userId: user.id,
          email,
        },
      })

      if (existingClient) {
        return NextResponse.json({ error: "Client with this email already exists" }, { status: 400 })
      }
    }

    const newClient = await prisma.client.create({
      data: {
        name,
        phoneNumber,
        email,
        address,
        notes,
        userId: user.id,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "CREATE_CLIENT",
        description: `Created new client: ${name}`,
        entityType: "CLIENT",
        entityId: newClient.id,
        userId: user.id,
      },
    })

    return NextResponse.json(newClient, { status: 201 })
  } catch (error) {
    console.error("Create client error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
