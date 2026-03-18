import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        instructor: { select: { id: true, username: true, fullName: true, avatar: true, bio: true } },
        lessons: { where: { isPublished: true }, orderBy: { order: 'asc' } },
        _count: { select: { enrollments: true } },
        ...(user ? {
          enrollments: { where: { userId: user.id } }
        } : {}),
      },
    })

    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    if (!course.isPublished && course.instructorId !== user?.id) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json({ course })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const existing = await prisma.course.findUnique({ where: { id } })
    if (!existing || existing.instructorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const allowed = ['title', 'description', 'category', 'level', 'thumbnail', 'price', 'isPublished', 'isFeatured']
    const data: any = {}
    for (const key of allowed) {
      if (key in body) data[key] = body[key]
    }

    const course = await prisma.course.update({ where: { id }, data })
    return NextResponse.json({ course })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update course' }, { status: 500 })
  }
}
