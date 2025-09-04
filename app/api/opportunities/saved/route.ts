import { NextRequest, NextResponse } from "next/server"
import { verifyToken, extractTokenFromRequest } from "@/lib/jwt-utils"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    // Try Authorization header or accessToken cookie
    const token = extractTokenFromRequest(request)
    let userId: string | null = null

    if (token) {
      const decoded = verifyToken(token)
      if (decoded?.userId) {
        userId = decoded.userId
      }
    }

    // Fallback to cookie-based auth helper
    if (!userId) {
      const user = await getCurrentUser()
      if (user?.id) {
        userId = user.id
      }
    }

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch saved opportunities directly from database
    const savedOpportunities = await prisma.savedOpportunity.findMany({
      where: { userId },
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