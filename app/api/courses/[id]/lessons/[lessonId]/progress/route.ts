import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, lessonId } = await params

    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: user.id, courseId: id } },
    })
    if (!enrollment) return NextResponse.json({ error: 'Not enrolled' }, { status: 403 })

    const progress = (enrollment.progress as Record<string, string>) || {}
    progress[lessonId] = new Date().toISOString()

    // Check if all lessons completed
    const totalLessons = await prisma.lesson.count({ where: { courseId: id, isPublished: true } })
    const completedCount = Object.keys(progress).length
    const completedAt = completedCount >= totalLessons ? new Date() : enrollment.completedAt

    const updated = await prisma.enrollment.update({
      where: { userId_courseId: { userId: user.id, courseId: id } },
      data: { progress, completedAt },
    })

    return NextResponse.json({ enrollment: updated, completedCount, totalLessons })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update progress' }, { status: 500 })
  }
}
