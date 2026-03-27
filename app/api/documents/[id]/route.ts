import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"
import { unlink } from "fs/promises"
import { join } from "path"

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

    const document = await prisma.document.findFirst({
      where: {
        id: params.id,
        userId: user.id,
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

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json(document)
  } catch (error) {
    console.error("Get document error:", error)
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
    const { category, description } = body

    const existingDocument = await prisma.document.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    const updatedDocument = await prisma.document.update({
      where: { id: params.id },
      data: {
        category,
        description,
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

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: "UPDATE_DOCUMENT",
        description: `Updated document: ${updatedDocument.originalName}`,
        entityType: "DOCUMENT",
        entityId: updatedDocument.id,
        userId: user.id,
        caseId: updatedDocument.caseId,
      },
    })

    return NextResponse.json(updatedDocument)
  } catch (error) {
    console.error("Update document error:", error)
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

    const existingDocument = await prisma.document.findFirst({
      where: {
        id: params.id,
        userId: user.id,
      },
    })

    if (!existingDocument) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    // Delete file from filesystem
    try {
      const filePath = join(process.cwd(), "uploads", "documents", existingDocument.fileName)
      await unlink(filePath)
    } catch (error) {
      console.error("Failed to delete file:", error)
      // Continue with database deletion even if file deletion fails
    }

    await prisma.document.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Document deleted successfully" })
  } catch (error) {
    console.error("Delete document error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
