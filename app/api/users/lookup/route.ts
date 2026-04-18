import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth-middleware'

/**
 * GET /api/users/lookup?email=someone@example.com
 *
 * Returns a thin user profile ({ id, username, fullName, avatar }) when that
 * email belongs to a registered user, or { user: null } otherwise. Used by the
 * collaborator-invite modal to preview whether the person already has an
 * account before the owner sends the invite. Auth required to avoid enabling
 * anonymous email enumeration.
 */
export async function GET(req: NextRequest) {
  const auth = await requireAuth(req)
  if (auth instanceof NextResponse) return auth

  const email = (req.nextUrl.searchParams.get('email') || '').toLowerCase().trim()
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ user: null })
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, username: true, fullName: true, avatar: true, isVerified: true },
  })
  if (!user) return NextResponse.json({ user: null })
  return NextResponse.json({
    user: {
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      avatar: user.avatar,
      isVerified: user.isVerified,
    },
  })
}
