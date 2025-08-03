import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { cookies } from "next/headers"

// READ - Get a single service
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const service = await prisma.service.findUnique({
      where: { id: params.id },
      include: {
        provider: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            organization: true,
            isVerified: true,
            bio: true,
            location: true
          }
        }
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    // Note: viewsCount field doesn't exist in the current schema
    // await prisma.service.update({
    //   where: { id: params.id },
    //   data: { viewsCount: { increment: 1 } }
    // })

    return NextResponse.json({ service })
  } catch (error) {
    console.error('Error fetching service:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service' },
      { status: 500 }
    )
  }
}

// UPDATE - Update a service
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if service exists and user owns it
    const existingService = await prisma.service.findUnique({
      where: { id: params.id }
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    if (existingService.providerId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
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

    const updatedService = await prisma.service.update({
      where: { id: params.id },
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
        updatedAt: new Date(),
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

    return NextResponse.json({ service: updatedService })
  } catch (error) {
    console.error('Error updating service:', error)
    return NextResponse.json(
      { error: 'Failed to update service' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a service
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    // Check if service exists and user owns it
    const existingService = await prisma.service.findUnique({
      where: { id: params.id }
    })

    if (!existingService) {
      return NextResponse.json(
        { error: 'Service not found' },
        { status: 404 }
      )
    }

    if (existingService.providerId !== user.id && user.role !== "admin") {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete the service
    await prisma.service.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Service deleted successfully' })
  } catch (error) {
    console.error('Error deleting service:', error)
    return NextResponse.json(
      { error: 'Failed to delete service' },
      { status: 500 }
    )
  }
} 