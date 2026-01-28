import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireAuth } from "@/lib/auth-middleware"
import { parseLimit, parseOffset } from "@/lib/query-params"

// READ - Get all services
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const region = searchParams.get('region')
    const featured = searchParams.get('featured')
    const adminMode = searchParams.get('admin') === 'true'
    const limit = parseLimit(searchParams.get('limit'), 50)
    const offset = parseOffset(searchParams.get('offset'))

    const where: Record<string, unknown> = {
      ...(adminMode ? {} : { isApproved: true })
    }

    // Reject injection-like category (expect cuid-like ids)
    if (category && typeof category === 'string' && category.length <= 64 && /^[a-z0-9_-]+$/i.test(category)) {
      where.categoryId = category
    }

    if (region && typeof region === 'string' && region.length <= 64 && /^[A-Z0-9_]+$/i.test(region)) {
      where.region = region
    }

    if (featured === 'true') {
      where.isFeatured = true
    }

    const services = await prisma.service.findMany({
      where: where as any,
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
    const authResult = await requireAuth(request)
    if (authResult instanceof NextResponse) {
      return authResult
    }
    const user = authResult.user

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
        categoryId: category,
        region,
        contact,
        phone,
        email,
        website,
        services: services ? JSON.stringify(services) : null,
        providerId: user.userId,
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