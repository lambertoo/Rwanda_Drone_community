import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const now = new Date()
    const zones = await prisma.airspaceZone.findMany({
      where: {
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: now } },
        ],
        AND: [
          {
            OR: [
              { startDate: null },
              { startDate: { lte: now } },
            ],
          },
        ],
      },
      include: {
        createdBy: { select: { fullName: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json(zones)
  } catch (error) {
    console.error('Airspace zones GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch zones' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin' && user.role !== 'regulator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await req.json()
    const { name, description, type, lat, lon, radius, severity, province, startDate, endDate } = body

    if (!name || !description || !type || lat == null || lon == null || !radius || !severity) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
      return NextResponse.json({ error: 'Invalid coordinates' }, { status: 400 })
    }
    if (radius <= 0 || radius > 200) {
      return NextResponse.json({ error: 'Radius must be between 0 and 200 km' }, { status: 400 })
    }

    const zone = await prisma.airspaceZone.create({
      data: {
        name,
        description,
        type,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        radius: parseFloat(radius),
        severity,
        province: province || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        createdById: user.id,
      },
      include: {
        createdBy: { select: { fullName: true, username: true } },
      },
    })

    return NextResponse.json(zone, { status: 201 })
  } catch (error) {
    console.error('Airspace zones POST error:', error)
    return NextResponse.json({ error: 'Failed to create zone' }, { status: 500 })
  }
}
