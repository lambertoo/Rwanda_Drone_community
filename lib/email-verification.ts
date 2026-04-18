import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import { emailVerificationEmail } from '@/lib/email-templates'

export const VERIFICATION_EXPIRY_HOURS = 4
const EXPIRY_MS = VERIFICATION_EXPIRY_HOURS * 60 * 60 * 1000

export async function createVerificationToken(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + EXPIRY_MS)
  // Invalidate any existing tokens for this user so only the latest link works
  await prisma.emailVerificationToken.deleteMany({ where: { userId } })
  await prisma.emailVerificationToken.create({ data: { userId, token, expiresAt } })
  return { token, expiresAt }
}

export async function sendVerificationEmail(user: { id: string; email: string; fullName: string }) {
  const { token } = await createVerificationToken(user.id)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://uav.rw'
  const verifyUrl = `${appUrl}/verify-email?token=${token}`
  const template = emailVerificationEmail({
    name: user.fullName || user.email,
    verifyUrl,
    expiryHours: VERIFICATION_EXPIRY_HOURS,
  })
  await sendEmail({ to: user.email, subject: template.subject, html: template.html })
  return { token, verifyUrl }
}

/**
 * Remove any unverified non-OAuth users whose verification token has expired.
 * Intended to run on a schedule (cron) or lazily on login / register attempts.
 */
export async function deleteExpiredUnverifiedUsers(): Promise<number> {
  const now = new Date()
  // Find expired tokens whose users are still unverified and have no googleId
  const expired = await prisma.emailVerificationToken.findMany({
    where: { expiresAt: { lt: now } },
    select: { userId: true },
  })
  const ids = [...new Set(expired.map(t => t.userId))]
  if (ids.length === 0) return 0
  const result = await prisma.user.deleteMany({
    where: {
      id: { in: ids },
      isVerified: false,
      googleId: null,
    },
  })
  // Any leftover expired tokens (belonging to already-verified users) get cleaned up
  await prisma.emailVerificationToken.deleteMany({ where: { expiresAt: { lt: now } } })
  return result.count
}

/**
 * Also covers users who were never issued a token (edge case): anyone
 * unverified, non-OAuth, created more than VERIFICATION_EXPIRY_HOURS ago.
 */
export async function sweepStrandedUnverifiedUsers(): Promise<number> {
  const cutoff = new Date(Date.now() - EXPIRY_MS)
  const result = await prisma.user.deleteMany({
    where: {
      isVerified: false,
      googleId: null,
      joinedAt: { lt: cutoff },
    },
  })
  return result.count
}
