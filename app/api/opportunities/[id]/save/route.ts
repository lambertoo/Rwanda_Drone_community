import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt-utils"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
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
          userId: decoded.userId,
          opportunityId: opportunityId
        }
      }
    })

    if (existingSave) {
      // Already saved, remove it (unsave)
      await prisma.savedOpportunity.delete({
        where: {
          userId_opportunityId: {
            userId: decoded.userId,
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
          userId: decoded.userId,
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
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded || !decoded.userId) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const { id: opportunityId } = params

    // Check if opportunity is saved by this user
    const savedOpportunity = await prisma.savedOpportunity.findUnique({
      where: {
        userId_opportunityId: {
          userId: decoded.userId,
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