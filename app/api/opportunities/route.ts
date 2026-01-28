import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession, getCurrentUser } from "@/lib/auth"
import { cookies } from "next/headers"
import { verifyToken, extractTokenFromRequest } from "@/lib/jwt-utils"

// READ - Get all opportunities
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tabCategory = searchParams.get('tabCategory')
    const opportunityType = searchParams.get('opportunityType')
    const category = searchParams.get('category')
    const location = searchParams.get('location')
    const adminMode = searchParams.get('admin') === 'true'

    const where: any = {
      isActive: true,
      ...(adminMode ? {} : { isApproved: true }) // Only show approved opportunities to public
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

    // Sanitize location: alphanumeric, spaces, hyphens, commas only to avoid injection patterns
    if (location && location !== 'all' && typeof location === 'string' && location.length <= 200 && /^[\p{L}\p{N}\s,_.-]+$/u.test(location)) {
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
        category: {
          select: {
            id: true,
            name: true,
            description: true,
            icon: true,
            color: true
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
    // Extract token from Authorization header or Cookie
    const token = extractTokenFromRequest(request)
    let user = null
    
    if (token) {
      const payload = verifyToken(token)
      if (payload) {
        user = {
          id: payload.userId,
          email: payload.email,
          role: payload.role,
          isVerified: false
        }
      }
    }
    
    // If no token found, try getCurrentUser as fallback
    if (!user) {
      user = await getCurrentUser()
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Request body:', body)
    const {
      title,
      description,
      company,
      opportunityType,
      subType,
      categoryId,
      location,
      salary,
      requirements,
      isUrgent = false,
      isRemote = false
    } = body

    console.log('Extracted fields:', { title, description, company, opportunityType, categoryId, location })

    // Validate required fields
    if (!title || !description || !company || !opportunityType || !location) {
      console.log('Missing fields:', { title: !!title, description: !!description, company: !!company, opportunityType: !!opportunityType, location: !!location })
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
        subType,
        categoryId,
        location,
        salary,
        requirements: requirements ? JSON.stringify(requirements) : undefined,
        isUrgent,
        isRemote,
        posterId: user.id
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
      where: { id: user.id },
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