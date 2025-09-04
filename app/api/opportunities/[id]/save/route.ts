import { NextRequest, NextResponse } from "next/server"
import { verifyToken, extractTokenFromRequest } from "@/lib/jwt-utils"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id: opportunityId } = params

    // Check if opportunity exists
    const opportunity = await prisma.opportunity.findUnique({
      where: { id: opportunityId }
    })

    if (!opportunity) {
      return NextResponse.json({ error: "Opportunity not found" }, { status: 404 })
    }

    // Check if already saved
    const existingSave = await prisma.savedOpportunity.findUnique({
      where: {
        userId_opportunityId: {
          userId: userId,
          opportunityId: opportunityId
        }
      }
    })

    if (existingSave) {
      // Already saved, remove it (unsave)
      await prisma.savedOpportunity.delete({
        where: {
          userId_opportunityId: {
            userId: userId,
            opportunityId: opportunityId
          }
        }
      })

      return NextResponse.json({ 
        message: "Opportunity unsaved successfully",
        saved: false 
      })
    } else {
      // Not saved, save it
      await prisma.savedOpportunity.create({
        data: {
          userId: userId,
          opportunityId: opportunityId
        }
      })

      return NextResponse.json({ 
        message: "Opportunity saved successfully",
        saved: true 
      })
    }
  } catch (error) {
    console.error("Error saving/unsaving opportunity:", error)
    return NextResponse.json(
      { error: "Failed to save/unsave opportunity" },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { id: opportunityId } = params

    // Check if opportunity is saved by this user
    const savedOpportunity = await prisma.savedOpportunity.findUnique({
      where: {
        userId_opportunityId: {
          userId: userId,
          opportunityId: opportunityId
        }
      }
    })

    return NextResponse.json({ 
      saved: !!savedOpportunity 
    })
  } catch (error) {
    console.error("Error checking saved status:", error)
    return NextResponse.json(
      { error: "Failed to check saved status" },
      { status: 500 }
    )
  }
} 