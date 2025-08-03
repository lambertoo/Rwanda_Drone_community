import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"
import { cookies } from "next/headers"

// READ - Get all jobs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const jobType = searchParams.get('jobType')
    const category = searchParams.get('category')
    const location = searchParams.get('location')

    const where: any = {
      isActive: true
    }

    if (jobType && jobType !== 'all') {
      where.jobType = jobType
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

    const jobs = await prisma.job.findMany({
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

    return NextResponse.json(jobs)
  } catch (error) {
    console.error('Error fetching jobs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch jobs' },
      { status: 500 }
    )
  }
}

// CREATE - Create a new job
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
      jobType,
      category,
      location,
      salary,
      requirements,
      isUrgent = false,
      isRemote = false
    } = body

    // Validate required fields
    if (!title || !description || !company || !jobType || !category || !location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const job = await prisma.job.create({
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

    // Increment user's job count
    await prisma.user.update({
      where: { id: session.userId },
      data: {
        jobsCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json(job, { status: 201 })
  } catch (error) {
    console.error('Error creating job:', error)
    return NextResponse.json(
      { error: 'Failed to create job' },
      { status: 500 }
    )
  }
} 