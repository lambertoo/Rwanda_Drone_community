import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authRateLimit } from '@/lib/rate-limit'
import { sendVerificationEmail, VERIFICATION_EXPIRY_HOURS } from '@/lib/email-verification'

export async function POST(request: NextRequest) {
  const rateLimitResult = authRateLimit(request)
  if (rateLimitResult) return rateLimitResult

  const body = await request.json().catch(() => ({}))
  const email = String(body.email || '').toLowerCase().trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  // Don't leak whether the account exists — always respond success.
  if (!user || user.isVerified || user.googleId) {
    return NextResponse.json({
      message: 'If that email is waiting for verification, a new link has been sent.',
      expiresInHours: VERIFICATION_EXPIRY_HOURS,
    })
  }

  await sendVerificationEmail({ id: user.id, email: user.email, fullName: user.fullName })
    .catch((err) => console.error('[Resend verification] email failed:', err))

  return NextResponse.json({
    message: 'A new verification link has been sent. Please check your inbox.',
    expiresInHours: VERIFICATION_EXPIRY_HOURS,
  })
}
