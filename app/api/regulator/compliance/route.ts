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

    const pilots = await prisma.user.findMany({
      where: { role: { in: ['pilot', 'service_provider'] } },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        pilotLicense: true,
        pilotLicenseExpiry: true,
        pilotLicenseType: true,
        caaRegistrationNumber: true,
        insuranceProvider: true,
        insuranceExpiry: true,
        _count: { select: { drones: true, flightLogs: true } },
      },
      orderBy: { fullName: 'asc' },
    })

    return NextResponse.json({ pilots })
  } catch (error) {
    console.error('Error fetching compliance data:', error)
    return NextResponse.json({ error: 'Failed to fetch compliance data' }, { status: 500 })
  }
}
