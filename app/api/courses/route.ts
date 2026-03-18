import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const level = searchParams.get('level')
    const featured = searchParams.get('featured') === 'true'
    const mine = searchParams.get('mine') === 'true'

    const user = await getCurrentUser()

    const where: any = { isPublished: true }
    if (category) where.category = category
    if (level) where.level = level
    if (featured) where.isFeatured = true
    if (mine && user) {
      delete where.isPublished
      where.instructorId = user.id
    }

    const courses = await prisma.course.findMany({
      where,
      include: {
        instructor: { select: { id: true, username: true, fullName: true, avatar: true } },
        _count: { select: { lessons: true, enrollments: true } },
        ...(user ? {
          enrollments: { where: { userId: user.id }, select: { id: true, progress: true, completedAt: true } }
        } : {}),
      },
      orderBy: [{ isFeatured: 'desc' }, { enrollmentCount: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ courses })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { title, description, category, level, thumbnail, price } = body

    if (!title || !description || !category || !level) {
      return NextResponse.json({ error: 'title, description, category, level are required' }, { status: 400 })
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').substring(0, 60)
    let finalSlug = slug
    let counter = 1
    while (await prisma.course.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${slug}-${counter++}`
    }

    const course = await prisma.course.create({
      data: {
        instructorId: user.id,
        title,
        slug: finalSlug,
        description,
        category,
        level,
        thumbnail: thumbnail || null,
        price: price || 0,
      },
    })

    return NextResponse.json({ course }, { status: 201 })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}
