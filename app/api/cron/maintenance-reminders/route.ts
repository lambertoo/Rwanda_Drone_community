import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'
import { deleteExpiredUnverifiedUsers, sweepStrandedUnverifiedUsers } from '@/lib/email-verification'

/**
 * GET /api/cron/maintenance-reminders
 * Runs daily via Vercel Cron. Sends notifications for:
 * - Maintenance due within 3 days
 * - Overdue maintenance
 */
export async function GET(request: NextRequest) {
  // Verify cron secret — REQUIRED, not optional
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error('[Cron] CRON_SECRET not configured')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()
    const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Find all maintenance logs with nextDueDate within 3 days or overdue
    const dueLogs = await prisma.droneMaintenance.findMany({
      where: {
        nextDueDate: {
          lte: threeDaysFromNow,
        },
      },
      include: {
        drone: {
          select: { id: true, name: true, userId: true },
        },
      },
    })

    let sent = 0

    for (const log of dueLogs) {
      const isOverdue = new Date(log.nextDueDate!) <= now
      const reminderType = isOverdue ? 'overdue' : 'upcoming'

      // Check if we already sent this reminder in the last 24h
      const recentNotification = await prisma.notification.findFirst({
        where: {
          userId: log.drone.userId,
          type: isOverdue ? 'safety' : 'event_reminder',
          createdAt: { gte: oneDayAgo },
          data: {
            path: ['droneId'],
            equals: log.drone.id,
          },
        },
      })

      if (recentNotification) continue

      const daysUntil = Math.ceil((new Date(log.nextDueDate!).getTime() - now.getTime()) / (24 * 60 * 60 * 1000))

      createNotification({
        userId: log.drone.userId,
        type: isOverdue ? 'safety' : 'event_reminder',
        title: isOverdue
          ? `Maintenance overdue: ${log.drone.name}`
          : `Maintenance due soon: ${log.drone.name}`,
        body: isOverdue
          ? `${log.type.replace('_', ' ')} maintenance is overdue for ${log.drone.name}. Schedule it as soon as possible.`
          : `${log.type.replace('_', ' ')} maintenance for ${log.drone.name} is due in ${daysUntil} day${daysUntil !== 1 ? 's' : ''}.`,
        link: `/equipment/${log.drone.id}`,
        data: { droneId: log.drone.id, maintenanceId: log.id, reminderType },
      })

      sent++
    }

    // Piggyback: sweep unverified accounts whose 4-hour verification window
    // has lapsed. Kept in the same daily cron so we stay on Vercel's free tier.
    const deletedByExpiredToken = await deleteExpiredUnverifiedUsers().catch(() => 0)
    const deletedStranded = await sweepStrandedUnverifiedUsers().catch(() => 0)

    return NextResponse.json({
      success: true,
      processed: dueLogs.length,
      notificationsSent: sent,
      unverifiedCleanup: {
        deletedByExpiredToken,
        deletedStranded,
      },
    })
  } catch (error) {
    console.error('[Cron] Maintenance reminders error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
