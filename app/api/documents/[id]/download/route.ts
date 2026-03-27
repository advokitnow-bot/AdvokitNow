import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserFromToken } from "@/lib/auth"
import { readFile } from "fs/promises"
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
    })

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    try {
      const filePath = join(process.cwd(), "uploads", "documents", document.fileName)
      const fileBuffer = await readFile(filePath)

      const response = new NextResponse(new Uint8Array(fileBuffer))
      response.headers.set("Content-Type", document.mimeType)
      response.headers.set("Content-Disposition", `attachment; filename="${document.originalName}"`)
      response.headers.set("Content-Length", document.fileSize.toString())

      return response
    } catch (error) {
      console.error("File read error:", error)
      return NextResponse.json({ error: "File not found" }, { status: 404 })
    }
  } catch (error) {
    console.error("Download document error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
