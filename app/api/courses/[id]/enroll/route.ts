import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const course = await prisma.course.findUnique({ where: { id } })
    if (!course || !course.isPublished) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    const existing = await prisma.enrollment.findUnique({ where: { userId_courseId: { userId: user.id, courseId: id } } })
    if (existing) return NextResponse.json({ enrollment: existing, alreadyEnrolled: true })

    const [enrollment] = await prisma.$transaction([
      prisma.enrollment.create({ data: { userId: user.id, courseId: id } }),
      prisma.course.update({ where: { id }, data: { enrollmentCount: { increment: 1 } } }),
    ])

    return NextResponse.json({ enrollment }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to enroll' }, { status: 500 })
  }
}
