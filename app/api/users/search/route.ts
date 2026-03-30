import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/users/search?q=name&limit=8 — search users by name/username
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const q = request.nextUrl.searchParams.get('q') || ''
    const limit = Math.min(Number(request.nextUrl.searchParams.get('limit')) || 8, 20)

    if (!q.trim()) return NextResponse.json({ users: [] })

    const users = await prisma.user.findMany({
      where: {
        id: { not: user.id },
        isActive: true,
        OR: [
          { fullName: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, fullName: true, avatar: true, username: true },
      take: limit,
      orderBy: { fullName: 'asc' },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('[Users] Search error:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
