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

    const drone = await prisma.drone.findUnique({
      where: { id },
      include: {
        flightLogs: { orderBy: { date: 'desc' } },
        maintenanceLogs: { orderBy: { date: 'desc' } },
        batteries: true,
      },
    })

    if (!drone) {
      return NextResponse.json({ error: 'Drone not found' }, { status: 404 })
    }

    if (drone.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ drone })
  } catch (error) {
    console.error('Error fetching drone:', error)
    return NextResponse.json({ error: 'Failed to fetch drone' }, { status: 500 })
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

    const existing = await prisma.drone.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Drone not found' }, { status: 404 })
    }
    if (existing.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      name,
      brand,
      model,
      serialNumber,
      caaRegistrationNumber,
      purchaseDate,
      weight,
      maxFlightTime,
      maxRange,
      notes,
      status,
    } = body

    const drone = await prisma.drone.update({
      where: { id },
      data: {
        name: name || existing.name,
        brand: brand || existing.brand,
        model: model || existing.model,
        serialNumber: serialNumber !== undefined ? serialNumber : existing.serialNumber,
        caaRegistrationNumber:
          caaRegistrationNumber !== undefined
            ? caaRegistrationNumber
            : existing.caaRegistrationNumber,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : existing.purchaseDate,
        weight: weight !== undefined ? (weight ? parseFloat(weight) : null) : existing.weight,
        maxFlightTime:
          maxFlightTime !== undefined
            ? maxFlightTime
              ? parseInt(maxFlightTime)
              : null
            : existing.maxFlightTime,
        maxRange:
          maxRange !== undefined ? (maxRange ? parseFloat(maxRange) : null) : existing.maxRange,
        notes: notes !== undefined ? notes : existing.notes,
        status: status || existing.status,
      },
      include: {
        flightLogs: { orderBy: { date: 'desc' } },
        maintenanceLogs: { orderBy: { date: 'desc' } },
        batteries: true,
      },
    })

    return NextResponse.json({ drone })
  } catch (error) {
    console.error('Error updating drone:', error)
    return NextResponse.json({ error: 'Failed to update drone' }, { status: 500 })
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

    const existing = await prisma.drone.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Drone not found' }, { status: 404 })
    }
    if (existing.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.drone.delete({ where: { id } })

    return NextResponse.json({ message: 'Drone deleted successfully' })
  } catch (error) {
    console.error('Error deleting drone:', error)
    return NextResponse.json({ error: 'Failed to delete drone' }, { status: 500 })
  }
}
