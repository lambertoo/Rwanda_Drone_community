import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// GET - Fetch all active opportunity categories (public)
export async function GET() {
  try {
    const categories = await prisma.opportunityCategory.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        name: "asc"
      },
      select: {
        id: true,
        name: true,
        description: true,
        color: true,
        icon: true
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Error fetching opportunity categories:", error)
    return NextResponse.json(
      { error: "Failed to fetch opportunity categories" },
      { status: 500 }
    )
  }
}
 
 
 
 
 