import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { cookies } from "next/headers"

// READ - Get all opportunities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tabCategory = searchParams.get('tabCategory')
    const opportunityType = searchParams.get('opportunityType')
    const category = searchParams.get('category')
    const location = searchParams.get('location')

    const where: any = {
      isActive: true
    }

    if (tabCategory && tabCategory !== 'all') {
      where.tabCategory = tabCategory
    }

    if (opportunityType && opportunityType !== 'all') {
      where.opportunityType = opportunityType
    }

    if (category && category !== 'all') {
      where.category = category
    }

    if (location && location !== 'all') {
      where.location = {
        contains: location,
        mode: 'insensitive'
      }
    }

    const opportunities = await prisma.opportunity.findMany({
      where,
      include: {
        poster: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            isVerified: true,
            organization: true
          }
        },
        applications: {
          select: {
            id: true
          }
        }
      },
      orderBy: [
        { isUrgent: 'desc' },
        { createdAt: 'desc' }
      ]
    })

    return NextResponse.json(opportunities)
  } catch (error) {
    console.error('Error fetching opportunities:', error)
    return NextResponse.json(
      { error: 'Failed to fetch opportunities' },
      { status: 500 }
    )
  }
}

// CREATE - Create a new opportunity
export async function POST(request: NextRequest) {
  try {
    const session = await getSession(cookies())
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      company,
      opportunityType,
      category,
      location,
      salary,
      requirements,
      isUrgent = false,
      isRemote = false
    } = body

    // Validate required fields
    if (!title || !description || !company || !opportunityType || !category || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const opportunity = await prisma.opportunity.create({
      data: {
        title,
        description,
        company,
        opportunityType,
        category,
        location,
        salary,
        requirements: requirements ? JSON.stringify(requirements) : null,
        isUrgent,
        isRemote,
        posterId: session.userId
      },
      include: {
        poster: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            isVerified: true,
            organization: true
          }
        }
      }
    })

    // Increment user's opportunity count
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        opportunitiesCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json(opportunity, { status: 201 })
  } catch (error) {
    console.error('Error creating opportunity:', error)
    return NextResponse.json(
      { error: 'Failed to create opportunity' },
      { status: 500 }
    )
  }
} 