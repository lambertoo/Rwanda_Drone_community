import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt-utils"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Fetch saved opportunities directly from database
    const savedOpportunities = await prisma.savedOpportunity.findMany({
      where: {
        userId: decoded.userId
      },
      include: {
        opportunity: {
          include: {
            poster: {
              select: {
                fullName: true
              }
            }
          }
        }
      },
      orderBy: {
        savedAt: "desc"
      }
    })

    const formattedSavedOpportunities = savedOpportunities.map(saved => ({
      id: saved.id,
      opportunity: {
        id: saved.opportunity.id,
        title: saved.opportunity.title,
        company: saved.opportunity.company,
        location: saved.opportunity.location,
        tabCategory: saved.opportunity.tabCategory,
        poster: saved.opportunity.poster,
        createdAt: saved.opportunity.createdAt.toISOString()
      },
      savedAt: saved.savedAt.toISOString()
    }))

    return NextResponse.json(formattedSavedOpportunities)
  } catch (error) {
    console.error("Error fetching saved opportunities:", error)
    return NextResponse.json(
      { error: "Failed to fetch saved opportunities" },
      { status: 500 }
    )
  }
} 