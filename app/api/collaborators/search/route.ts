import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

/**
 * GET /api/collaborators/search?q=<query>&limit=10
 *
 * Returns users whose fullName, username or email match the query, ranked by
 * relationship to the requester:
 *   1. mutual     — I follow them AND they follow me
 *   2. iFollow    — I follow them only
 *   3. followsMe  — they follow me only
 *   4. none       — no relationship
 *
 * Used by the collaborator-invite modal to surface people you already
 * interact with first. If the query looks like an email and matches no row,
 * the caller can treat that as an external invite.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth
  const { userId: meId } = auth.user

  const q = (req.nextUrl.searchParams.get('q') || '').trim()
  const limit = Math.min(Number(req.nextUrl.searchParams.get('limit')) || 10, 20)

  if (q.length < 2) {
    return NextResponse.json({ users: [] })
  }

  // Fetch people I follow and people who follow me once, then we merge.
  const [iFollow, followsMe] = await Promise.all([
    prisma.userFollow.findMany({ where: { followerId: meId }, select: { followingId: true } }),
    prisma.userFollow.findMany({ where: { followingId: meId }, select: { followerId: true } }),
  ])
  const iFollowSet = new Set(iFollow.map(x => x.followingId))
  const followsMeSet = new Set(followsMe.map(x => x.followerId))

  const users = await prisma.user.findMany({
    where: {
      id: { not: meId },
      isActive: true,
      OR: [
        { fullName: { contains: q, mode: 'insensitive' } },
        { username: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ],
    },
    select: { id: true, fullName: true, username: true, email: true, avatar: true, isVerified: true },
    // Intentionally fetch more than `limit` so the relationship sort has room.
    take: limit * 3,
  })

  const ranked = users.map(u => {
    const mutual = iFollowSet.has(u.id) && followsMeSet.has(u.id)
    const mine = iFollowSet.has(u.id)
    const theirs = followsMeSet.has(u.id)
    const rel = mutual ? 'mutual' : mine ? 'iFollow' : theirs ? 'followsMe' : 'none'
    const rank = mutual ? 0 : mine ? 1 : theirs ? 2 : 3
    return { ...u, relationship: rel, _rank: rank }
  })

  ranked.sort((a, b) => a._rank - b._rank || (a.fullName || '').localeCompare(b.fullName || ''))

  return NextResponse.json({
    users: ranked.slice(0, limit).map(({ _rank, ...u }) => u),
  })
}
