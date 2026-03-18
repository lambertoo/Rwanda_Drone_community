import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')?.trim()
    const type = searchParams.get('type') || 'all'

    if (!q || q.length < 2) {
      return NextResponse.json({ results: {}, query: q })
    }

    const contains = { contains: q, mode: 'insensitive' as const }
    const results: Record<string, any[]> = {}

    if (type === 'all' || type === 'forum') {
      results.forum = await prisma.forumPost.findMany({
        where: { isApproved: true, OR: [{ title: contains }, { content: contains }] },
        select: { id: true, title: true, content: true, createdAt: true, category: { select: { name: true } }, author: { select: { username: true, avatar: true } } },
        take: 8,
        orderBy: { createdAt: 'desc' },
      })
    }

    if (type === 'all' || type === 'projects') {
      results.projects = await prisma.project.findMany({
        where: { isApproved: true, OR: [{ title: contains }, { description: contains }] },
        select: { id: true, title: true, description: true, thumbnail: true, createdAt: true, author: { select: { username: true } } },
        take: 8,
        orderBy: { createdAt: 'desc' },
      })
    }

    if (type === 'all' || type === 'events') {
      results.events = await prisma.event.findMany({
        where: { isApproved: true, OR: [{ title: contains }, { description: contains }] },
        select: { id: true, title: true, description: true, date: true, location: true, thumbnail: true },
        take: 8,
        orderBy: { date: 'asc' },
      })
    }

    if (type === 'all' || type === 'services') {
      results.services = await prisma.service.findMany({
        where: { isApproved: true, OR: [{ title: contains }, { description: contains }] },
        select: { id: true, title: true, description: true, thumbnail: true, provider: { select: { username: true, fullName: true } } },
        take: 8,
      })
    }

    if (type === 'all' || type === 'resources') {
      results.resources = await prisma.resource.findMany({
        where: { isApproved: true, OR: [{ title: contains }, { description: contains }] },
        select: { id: true, title: true, description: true, fileType: true, createdAt: true },
        take: 8,
      })
    }

    if (type === 'all' || type === 'courses') {
      results.courses = await prisma.course.findMany({
        where: { isPublished: true, OR: [{ title: contains }, { description: contains }] },
        select: { id: true, title: true, description: true, thumbnail: true, category: true, level: true, instructor: { select: { username: true } } },
        take: 8,
      })
    }

    if (type === 'all' || type === 'users') {
      results.users = await prisma.user.findMany({
        where: { isActive: true, OR: [{ fullName: contains }, { username: contains }, { bio: contains }] },
        select: { id: true, username: true, fullName: true, avatar: true, role: true, location: true },
        take: 8,
      })
    }

    if (type === 'all' || type === 'opportunities') {
      results.opportunities = await prisma.opportunity.findMany({
        where: { isApproved: true, OR: [{ title: contains }, { description: contains }] },
        select: { id: true, title: true, description: true, type: true, createdAt: true },
        take: 8,
      })
    }

    const totalCount = Object.values(results).reduce((sum, arr) => sum + arr.length, 0)

    return NextResponse.json({ results, query: q, totalCount })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
