import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const log = await prisma.flightLog.findUnique({
      where: { id },
      include: {
        drone: { select: { id: true, name: true, brand: true, model: true } },
      },
    })

    if (!log) return NextResponse.json({ error: 'Flight log not found' }, { status: 404 })
    if (log.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ log })
  } catch (error) {
    console.error('Error fetching flight log:', error)
    return NextResponse.json({ error: 'Failed to fetch flight log' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await prisma.flightLog.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Flight log not found' }, { status: 404 })
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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

    const log = await prisma.flightLog.update({
      where: { id },
      data: {
        droneId: droneId !== undefined ? droneId || null : existing.droneId,
        date: date ? new Date(date) : existing.date,
        startTime: startTime !== undefined ? startTime : existing.startTime,
        endTime: endTime !== undefined ? endTime : existing.endTime,
        duration: duration !== undefined ? (duration ? parseInt(duration) : null) : existing.duration,
        location: location || existing.location,
        latitude: latitude !== undefined ? (latitude ? parseFloat(latitude) : null) : existing.latitude,
        longitude: longitude !== undefined ? (longitude ? parseFloat(longitude) : null) : existing.longitude,
        maxAltitude: maxAltitude !== undefined ? (maxAltitude ? parseFloat(maxAltitude) : null) : existing.maxAltitude,
        maxDistance: maxDistance !== undefined ? (maxDistance ? parseFloat(maxDistance) : null) : existing.maxDistance,
        distanceTraveled: distanceTraveled !== undefined ? (distanceTraveled ? parseFloat(distanceTraveled) : null) : existing.distanceTraveled,
        purpose: purpose || existing.purpose,
        notes: notes !== undefined ? notes : existing.notes,
        incidentOccurred: incidentOccurred !== undefined ? incidentOccurred === true : existing.incidentOccurred,
        incidentDescription: incidentDescription !== undefined ? incidentDescription : existing.incidentDescription,
        weather: weather !== undefined ? weather : existing.weather,
        isPublic: isPublic !== undefined ? isPublic === true : existing.isPublic,
      },
      include: {
        drone: { select: { id: true, name: true, brand: true, model: true } },
      },
    })

    return NextResponse.json({ log })
  } catch (error) {
    console.error('Error updating flight log:', error)
    return NextResponse.json({ error: 'Failed to update flight log' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const existing = await prisma.flightLog.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Flight log not found' }, { status: 404 })
    if (existing.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.flightLog.delete({ where: { id } })

    return NextResponse.json({ message: 'Flight log deleted successfully' })
  } catch (error) {
    console.error('Error deleting flight log:', error)
    return NextResponse.json({ error: 'Failed to delete flight log' }, { status: 500 })
  }
}
