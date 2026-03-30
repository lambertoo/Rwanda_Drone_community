import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

const VALID_REASONS = ['harassment', 'spam', 'inappropriate', 'impersonation', 'other']

// POST — report a user
export async function POST(request: NextRequest, { params }: { params: Promise<{ username: string }> }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { username } = await params
    const { reason, details } = await request.json()

    if (!reason || !VALID_REASONS.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason. Must be one of: ' + VALID_REASONS.join(', ') }, { status: 400 })
    }

    const target = await prisma.user.findUnique({ where: { username }, select: { id: true, fullName: true } })
    if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 })
    if (target.id === user.id) return NextResponse.json({ error: 'Cannot report yourself' }, { status: 400 })

    // Prevent duplicate/spam reports: max 1 report per user per target per 24h
    const recentReport = await prisma.userReport.findFirst({
      where: {
        reporterId: user.id,
        targetId: target.id,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    })
    if (recentReport) {
      return NextResponse.json({ error: 'You already reported this user recently. Our team is reviewing it.' }, { status: 429 })
    }

    // Global rate limit: max 10 reports per user per day
    const dailyReportCount = await prisma.userReport.count({
      where: { reporterId: user.id, createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
    })
    if (dailyReportCount >= 10) {
      return NextResponse.json({ error: 'Too many reports today. Please try again tomorrow.' }, { status: 429 })
    }

    const report = await prisma.userReport.create({
      data: {
        reporterId: user.id,
        targetId: target.id,
        reason,
        details: details?.trim() || null,
      },
    })

    // Notify admins about the report
    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: { id: true },
    })
    for (const admin of admins) {
      createNotification({
        userId: admin.id,
        type: 'safety',
        title: 'User report filed',
        body: `${user.fullName} reported ${target.fullName} for ${reason}`,
        link: '/admin',
        data: { reportId: report.id, reason },
      })
    }

    return NextResponse.json({ success: true, message: 'Report submitted. Our team will review it.' })
  } catch (error) {
    console.error('[Report] Error:', error)
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 })
  }
}
