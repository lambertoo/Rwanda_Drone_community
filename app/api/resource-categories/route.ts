import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.resourceCategory.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ categories })
  } catch (error) {
    console.error("Error fetching resource categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch resource categories" },
      { status: 500 }
    )
  }
}
