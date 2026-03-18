import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin' && user.role !== 'regulator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const [
      totalPilots,
      totalDrones,
      totalFlightLogs,
      openSafetyReports,
      pendingPermits,
      recentSafetyReports,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'pilot' } }),
      prisma.drone.count(),
      prisma.flightLog.count(),
      prisma.safetyReport.count({ where: { status: 'received' } }),
      prisma.permit.count({ where: { status: 'pending' } }),
      prisma.safetyReport.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          reporter: {
            select: { id: true, username: true, fullName: true, avatar: true },
          },
        },
      }),
    ])

    return NextResponse.json({
      counts: {
        totalPilots,
        totalDrones,
        totalFlightLogs,
        openSafetyReports,
        pendingPermits,
      },
      recentSafetyReports,
    })
  } catch (error) {
    console.error('Error fetching regulator overview:', error)
    return NextResponse.json({ error: 'Failed to fetch overview data' }, { status: 500 })
  }
}
