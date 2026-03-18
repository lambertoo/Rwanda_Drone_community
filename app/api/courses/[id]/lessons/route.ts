import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    const course = await prisma.course.findUnique({ where: { id } })
    if (!course) return NextResponse.json({ error: 'Course not found' }, { status: 404 })

    const isInstructor = course.instructorId === user?.id
    const lessons = await prisma.lesson.findMany({
      where: { courseId: id, ...(isInstructor ? {} : { isPublished: true }) },
      orderBy: { order: 'asc' },
    })

    return NextResponse.json({ lessons })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const course = await prisma.course.findUnique({ where: { id } })
    if (!course || course.instructorId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { title, content, videoUrl, duration, type, quiz } = body

    if (!title || !content) return NextResponse.json({ error: 'title and content required' }, { status: 400 })

    const lastLesson = await prisma.lesson.findFirst({ where: { courseId: id }, orderBy: { order: 'desc' } })
    const order = (lastLesson?.order || 0) + 1

    const lesson = await prisma.lesson.create({
      data: { courseId: id, title, content, videoUrl: videoUrl || null, duration: duration || null, order, type: type || 'reading', quiz: quiz || null },
    })

    await prisma.course.update({ where: { id }, data: { totalLessons: { increment: 1 } } })

    return NextResponse.json({ lesson }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 })
  }
}
