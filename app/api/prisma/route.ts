// app/api/prisma-check/route.ts
export const runtime = "nodejs";

export async function GET() {
  try {
    const { PrismaClient } = await import("@prisma/client");
    return Response.json({
      prismaInstalled: true,
      hasClient: !!PrismaClient,
    });
  } catch (e: any) {
    return Response.json({
      prismaInstalled: false,
      error: e.message,
    });
  }
}
