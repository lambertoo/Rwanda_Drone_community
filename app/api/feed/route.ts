import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const cursor = searchParams.get('cursor')
    const limit = 20

    // Get IDs of users this person follows
    const following = await prisma.userFollow.findMany({
      where: { followerId: user.id },
      select: { followingId: true },
    })
    const followingIds = following.map(f => f.followingId)

    if (followingIds.length === 0) {
      return NextResponse.json({ items: [], nextCursor: null, followingCount: 0 })
    }

    const items = await prisma.activityFeed.findMany({
      where: { actorId: { in: followingIds } },
      include: {
        actor: { select: { id: true, username: true, fullName: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    })

    const hasMore = items.length > limit
    const page = hasMore ? items.slice(0, limit) : items
    const nextCursor = hasMore ? page[page.length - 1].id : null

    return NextResponse.json({ items: page, nextCursor, followingCount: followingIds.length })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feed' }, { status: 500 })
  }
}
