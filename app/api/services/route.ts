import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { cookies } from "next/headers"

// READ - Get all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const region = searchParams.get('region')
    const featured = searchParams.get('featured')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where: any = {
      isApproved: true
    }

    if (category) {
      where.category = category
    }

    if (region) {
      where.region = region
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    const services = await prisma.service.findMany({
      where,
      include: {
        provider: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            organization: true,
            isVerified: true
          }
        }
      },
      orderBy: [
        { isFeatured: 'desc' },
        { rating: 'desc' },
        { createdAt: 'desc' }
      ],
      take: limit,
      skip: offset
    })

    const total = await prisma.service.count({ where })

    return NextResponse.json({
      services,
      total,
      hasMore: offset + limit < total
    })
  } catch (error) {
    console.error('Error fetching services:', error)
    return NextResponse.json(
      { error: 'Failed to fetch services' },
      { status: 500 }
    )
  }
}

// CREATE - Create a new service
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get("session-id")?.value
    
    let user = null
    
    if (sessionId) {
      user = getSession(sessionId)
    }
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      title,
      description,
      category,
      region,
      contact,
      phone,
      email,
      website,
      services
    } = body

    if (!title || !description || !category || !region || !contact) {
      return NextResponse.json(
        { error: 'Title, description, category, region, and contact are required' },
        { status: 400 }
      )
    }

    const service = await prisma.service.create({
      data: {
        title,
        description,
        category,
        region,
        contact,
        phone,
        email,
        website,
        services: services ? JSON.stringify(services) : null,
        providerId: user.id,
      },
      include: {
        provider: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            organization: true,
            isVerified: true
          }
        }
      }
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('Error creating service:', error)
    return NextResponse.json(
      { error: 'Failed to create service' },
      { status: 500 }
    )
  }
} 