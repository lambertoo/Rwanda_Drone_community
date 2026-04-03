import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { extractTokenFromRequest, verifyToken } from '@/lib/jwt-utils'

export async function GET(request: NextRequest) {
  try {
    const token = extractTokenFromRequest(request)
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const payload = await verifyToken(token)
    if (!payload) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const userId = payload.userId

    const [forms, posts, projects, events] = await Promise.all([
      prisma.universalForm.findMany({
        where: { userId },
        select: {
          id: true, title: true, slug: true, isActive: true, isPublic: true,
          createdAt: true, updatedAt: true,
          _count: { select: { entries: true } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.forumPost.findMany({
        where: { authorId: userId },
        select: {
          id: true, title: true, content: true, isApproved: true,
          createdAt: true, updatedAt: true, viewsCount: true, repliesCount: true, likesCount: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.project.findMany({
        where: { authorId: userId },
        select: {
          id: true, title: true, description: true, status: true,
          thumbnail: true, createdAt: true, updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.event.findMany({
        where: { organizerId: userId },
        select: {
          id: true, title: true, description: true, startDate: true, endDate: true,
          location: true, isPublic: true, createdAt: true,
          _count: { select: { participants: true } },
        },
        orderBy: { startDate: 'desc' },
      }),
    ])

    return NextResponse.json({ forms, posts, projects, events })
  } catch (error) {
    console.error('Error fetching my content:', error)
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}
