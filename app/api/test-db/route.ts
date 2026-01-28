import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

/**
 * DB connectivity test. Disabled in production to avoid information disclosure.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not Found" }, { status: 404 })
  }

  try {
    await prisma.$queryRaw`SELECT 1 as test`
    const servicesCount = await prisma.service.count()
    const usersCount = await prisma.user.count()

    return NextResponse.json({
      success: true,
      servicesCount,
      usersCount,
      message: "Database connection successful!",
    })
  } catch (error) {
    console.error("Database connection failed:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
