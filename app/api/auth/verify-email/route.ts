import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateTokens } from '@/lib/jwt-utils'
import { deleteExpiredUnverifiedUsers } from '@/lib/email-verification'

/**
 * GET /api/auth/verify-email?token=xxx
 *
 * Click target from the verification email. On success, sets isVerified=true,
 * issues JWT cookies, and returns the redirect URL. On expired token, the
 * unverified user is auto-deleted so they can re-register cleanly.
 */
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 })

  // Sweep expired unverified accounts before we look up the token
  await deleteExpiredUnverifiedUsers().catch(() => null)

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true },
  })
  if (!record) {
    return NextResponse.json(
      { error: 'This verification link is invalid or has already been used.' },
      { status: 400 },
    )
  }

  if (record.expiresAt.getTime() < Date.now()) {
    // Expired — delete the user (they can re-register)
    await prisma.user.delete({ where: { id: record.userId } }).catch(() => null)
    return NextResponse.json(
      { error: 'This verification link has expired. Please register again.', expired: true },
      { status: 410 },
    )
  }

  const updatedUser = await prisma.user.update({
    where: { id: record.userId },
    data: { isVerified: true, emailVerifiedAt: new Date() },
  })
  // Consume the token
  await prisma.emailVerificationToken.deleteMany({ where: { userId: record.userId } })

  const { accessToken, refreshToken } = generateTokens({
    userId: updatedUser.id,
    email: updatedUser.email,
    username: updatedUser.username,
    role: updatedUser.role,
  })

  const response = NextResponse.json({
    success: true,
    user: {
      id: updatedUser.id,
      email: updatedUser.email,
      username: updatedUser.username,
      fullName: updatedUser.fullName,
      isVerified: true,
      role: updatedUser.role,
    },
    redirectTo: '/complete-profile',
  })

  response.cookies.set('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60,
    path: '/',
  })
  response.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60,
    path: '/',
  })
  return response
}
