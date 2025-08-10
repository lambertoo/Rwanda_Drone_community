import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { cookies } from "next/headers"

// READ - Get a single opportunity
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const opportunity = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        poster: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            isVerified: true,
            organization: true,
            email: true
          }
        },
        applications: {
          include: {
            applicant: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
                email: true,
                isVerified: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (!opportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(opportunity)
  } catch (error) {
    console.error('Error fetching opportunity:', error)
    return NextResponse.json(
      { error: 'Failed to fetch opportunity' },
      { status: 500 }
    )
  }
}

// UPDATE - Update an opportunity
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession(cookies())
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the opportunity or is admin
    const existingOpportunity = await prisma.opportunity.findUnique({
      where: { id },
      select: { posterId: true }
    })

    if (!existingOpportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true }
    })

    if (existingOpportunity.posterId !== session.userId && user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
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
      isUrgent,
      isRemote,
      isActive
    } = body

    const opportunity = await prisma.opportunity.update({
      where: { id },
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
        isActive
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

    return NextResponse.json(opportunity)
  } catch (error) {
    console.error('Error updating opportunity:', error)
    return NextResponse.json(
      { error: 'Failed to update opportunity' },
      { status: 500 }
    )
  }
}

// DELETE - Delete an opportunity
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getSession(cookies())
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the opportunity or is admin
    const existingOpportunity = await prisma.opportunity.findUnique({
      where: { id },
      select: { posterId: true }
    })

    if (!existingOpportunity) {
      return NextResponse.json(
        { error: 'Opportunity not found' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true }
    })

    if (existingOpportunity.posterId !== session.userId && user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete the opportunity
    await prisma.opportunity.delete({
      where: { id }
    })

    // Decrement user's opportunity count
    await prisma.user.update({
      where: { id: existingOpportunity.posterId },
      data: {
        opportunitiesCount: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({ message: 'Opportunity deleted successfully' })
  } catch (error) {
    console.error('Error deleting opportunity:', error)
    return NextResponse.json(
      { error: 'Failed to delete opportunity' },
      { status: 500 }
    )
  }
} 