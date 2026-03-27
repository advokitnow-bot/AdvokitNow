import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"
import { createDocumentUploadNotification } from "@/lib/notifications"
import { DocumentType } from "@prisma/client"

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
    const caseId = searchParams.get("caseId") || ""
    const categoryParam = searchParams.get("category")

    const skip = (page - 1) * limit

    const where: any = {
      userId: user.id,
    }

    if (search) {
      where.OR = [
        { fileName: { contains: search, mode: "insensitive" } },
        { originalName: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ]
    }

    if (caseId) {
      where.caseId = caseId
    }

    if (categoryParam && Object.values(DocumentType).includes(categoryParam as DocumentType)) {
      where.category = categoryParam as DocumentType
    }

    const [documents, total] = await Promise.all([
      prisma.document.findMany({
        where,
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.document.count({ where }),
    ])

    return NextResponse.json({
      documents,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get documents error:", error)
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

    const formData = await request.formData()
    const file = formData.get("file") as File
    const caseId = formData.get("caseId") as string
    const categoryParam = formData.get("category") as string
    const description = formData.get("description") as string

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!caseId) {
      return NextResponse.json({ error: "Case ID is required" }, { status: 400 })
    }

    const caseExists = await prisma.case.findFirst({
      where: {
        id: caseId,
        userId: user.id,
      },
    })

    if (!caseExists) {
      return NextResponse.json({ error: "Case not found" }, { status: 404 })
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size exceeds 10MB limit" }, { status: 400 })
    }

    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split(".").pop()
    const fileName = `${timestamp}-${Math.random().toString(36).substring(2)}.${extension}`

    const uploadDir = join(process.cwd(), "uploads", "documents")
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const filePath = join(uploadDir, fileName)
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    const category =
      categoryParam && Object.values(DocumentType).includes(categoryParam as DocumentType)
        ? (categoryParam as DocumentType)
        : DocumentType.OTHER

    const document = await prisma.document.create({
      data: {
        fileName,
        originalName,
        filePath: `/uploads/documents/${fileName}`,
        fileSize: file.size,
        mimeType: file.type,
        category,
        description,
        userId: user.id,
        caseId,
      },
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

    await prisma.activityLog.create({
      data: {
        action: "UPLOAD_DOCUMENT",
        description: `Uploaded document: ${originalName}`,
        entityType: "DOCUMENT",
        entityId: document.id,
        userId: user.id,
        caseId,
      },
    })

    await createDocumentUploadNotification(caseId, user.id, originalName)

    return NextResponse.json(document, { status: 201 })
  } catch (error) {
    console.error("Upload document error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}