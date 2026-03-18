import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { username } = await params

    const target = await prisma.user.findUnique({ where: { username } })
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (target.id === user.id) return NextResponse.json({ error: 'Cannot follow yourself' }, { status: 400 })

    const existing = await prisma.userFollow.findUnique({
      where: { followerId_followingId: { followerId: user.id, followingId: target.id } },
    })

    if (existing) {
      // Unfollow
      await prisma.userFollow.delete({
        where: { followerId_followingId: { followerId: user.id, followingId: target.id } },
      })
      return NextResponse.json({ following: false })
    } else {
      // Follow
      await prisma.userFollow.create({ data: { followerId: user.id, followingId: target.id } })
      return NextResponse.json({ following: true })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Failed to toggle follow' }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const user = await getCurrentUser()
    const { username } = await params

    const target = await prisma.user.findUnique({ where: { username } })
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    const [followerCount, followingCount, isFollowing] = await Promise.all([
      prisma.userFollow.count({ where: { followingId: target.id } }),
      prisma.userFollow.count({ where: { followerId: target.id } }),
      user ? prisma.userFollow.findUnique({
        where: { followerId_followingId: { followerId: user.id, followingId: target.id } },
      }) : null,
    ])

    return NextResponse.json({ followerCount, followingCount, isFollowing: !!isFollowing })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch follow status' }, { status: 500 })
  }
}
