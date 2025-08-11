import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/jwt"
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

    const applications = await prisma.jobApplication.findMany({
      where: {
        applicantId: decoded.userId
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
        createdAt: "desc"
      }
    })

    const appliedOpportunities = applications.map(app => ({
      id: app.id,
      opportunity: {
        id: app.opportunity.id,
        title: app.opportunity.title,
        company: app.opportunity.company,
        location: app.opportunity.location,
        tabCategory: app.opportunity.tabCategory,
        poster: app.opportunity.poster
      },
      status: "pending", // JobApplication doesn't have status, so we'll use pending as default
      submittedAt: app.createdAt.toISOString()
    }))

    return NextResponse.json(appliedOpportunities)
  } catch (error) {
    console.error("Error fetching applied opportunities:", error)
    return NextResponse.json(
      { error: "Failed to fetch applied opportunities" },
      { status: 500 }
    )
  }
} 