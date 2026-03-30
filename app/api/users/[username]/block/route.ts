import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST — toggle block/unblock user
export async function POST(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { username } = await params

    const target = await prisma.user.findUnique({ where: { username }, select: { id: true } })
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (target.id === user.id) return NextResponse.json({ error: 'Cannot block yourself' }, { status: 400 })

    const existing = await prisma.userBlock.findUnique({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: target.id } },
    })

    if (existing) {
      await prisma.userBlock.delete({
        where: { blockerId_blockedId: { blockerId: user.id, blockedId: target.id } },
      })
      return NextResponse.json({ blocked: false })
    } else {
      await prisma.userBlock.create({ data: { blockerId: user.id, blockedId: target.id } })
      // Also unfollow if following
      await prisma.userFollow.deleteMany({
        where: {
          OR: [
            { followerId: user.id, followingId: target.id },
            { followerId: target.id, followingId: user.id },
          ],
        },
      })
      return NextResponse.json({ blocked: true })
    }
  } catch (error) {
    console.error('[Block] Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// GET — check if user is blocked
export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ blocked: false })
    const { username } = await params

    const target = await prisma.user.findUnique({ where: { username }, select: { id: true } })
    if (!target) return NextResponse.json({ blocked: false })

    const block = await prisma.userBlock.findUnique({
      where: { blockerId_blockedId: { blockerId: user.id, blockedId: target.id } },
    })
    return NextResponse.json({ blocked: !!block })
  } catch {
    return NextResponse.json({ blocked: false })
  }
}
