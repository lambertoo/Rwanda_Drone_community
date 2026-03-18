import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const droneId = searchParams.get('droneId')

    const where: any = { userId: user.id }
    if (droneId) where.droneId = droneId

    const logs = await prisma.flightLog.findMany({
      where,
      include: {
        drone: {
          select: { id: true, name: true, brand: true, model: true },
        },
      },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching flight logs:', error)
    return NextResponse.json({ error: 'Failed to fetch flight logs' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const {
      droneId,
      date,
      startTime,
      endTime,
      duration,
      location,
      latitude,
      longitude,
      maxAltitude,
      maxDistance,
      distanceTraveled,
      purpose,
      notes,
      incidentOccurred,
      incidentDescription,
      weather,
      isPublic,
    } = body

    if (!date || !location) {
      return NextResponse.json({ error: 'Date and location are required' }, { status: 400 })
    }

    // If droneId provided, verify ownership
    if (droneId) {
      const drone = await prisma.drone.findUnique({ where: { id: droneId } })
      if (!drone || drone.userId !== user.id) {
        return NextResponse.json({ error: 'Invalid drone' }, { status: 400 })
      }
    }

    const log = await prisma.flightLog.create({
      data: {
        userId: user.id,
        droneId: droneId || null,
        date: new Date(date),
        startTime: startTime || null,
        endTime: endTime || null,
        duration: duration ? parseInt(duration) : null,
        location,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        maxAltitude: maxAltitude ? parseFloat(maxAltitude) : null,
        maxDistance: maxDistance ? parseFloat(maxDistance) : null,
        distanceTraveled: distanceTraveled ? parseFloat(distanceTraveled) : null,
        purpose: purpose || 'hobby',
        notes: notes || null,
        incidentOccurred: incidentOccurred === true,
        incidentDescription: incidentOccurred ? incidentDescription || null : null,
        weather: weather || null,
        isPublic: isPublic === true,
      },
      include: {
        drone: {
          select: { id: true, name: true, brand: true, model: true },
        },
      },
    })

    return NextResponse.json({ log }, { status: 201 })
  } catch (error) {
    console.error('Error creating flight log:', error)
    return NextResponse.json({ error: 'Failed to create flight log' }, { status: 500 })
  }
}
