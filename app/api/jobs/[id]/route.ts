import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { cookies } from "next/headers"

// READ - Get a single job
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const job = await prisma.job.findUnique({
      where: { id: params.id },
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

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error fetching job:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job' },
      { status: 500 }
    )
  }
}

// UPDATE - Update a job
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(cookies())
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the job or is admin
    const existingJob = await prisma.job.findUnique({
      where: { id: params.id },
      select: { posterId: true }
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true }
    })

    if (existingJob.posterId !== session.userId && user?.role !== 'admin') {
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
      jobType,
      category,
      location,
      salary,
      requirements,
      isUrgent,
      isRemote,
      isActive
    } = body

    const job = await prisma.job.update({
      where: { id: params.id },
      data: {
        title,
        description,
        company,
        jobType,
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

    return NextResponse.json(job)
  } catch (error) {
    console.error('Error updating job:', error)
    return NextResponse.json(
      { error: 'Failed to update job' },
      { status: 500 }
    )
  }
}

// DELETE - Delete a job
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession(cookies())
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user owns the job or is admin
    const existingJob = await prisma.job.findUnique({
      where: { id: params.id },
      select: { posterId: true }
    })

    if (!existingJob) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { role: true }
    })

    if (existingJob.posterId !== session.userId && user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Delete the job
    await prisma.job.delete({
      where: { id: params.id }
    })

    // Decrement user's job count
    await prisma.user.update({
      where: { id: existingJob.posterId },
      data: {
        jobsCount: {
          decrement: 1
        }
      }
    })

    return NextResponse.json({ message: 'Job deleted successfully' })
  } catch (error) {
    console.error('Error deleting job:', error)
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    )
  }
} 