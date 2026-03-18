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

    const drone = await prisma.drone.findUnique({ where: { id } })
    if (!drone) return NextResponse.json({ error: 'Drone not found' }, { status: 404 })
    if (drone.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const batteries = await prisma.battery.findMany({
      where: { droneId: id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ batteries })
  } catch (error) {
    console.error('Error fetching batteries:', error)
    return NextResponse.json({ error: 'Failed to fetch batteries' }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    const drone = await prisma.drone.findUnique({ where: { id } })
    if (!drone) return NextResponse.json({ error: 'Drone not found' }, { status: 404 })
    if (drone.userId !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { serialNumber, capacity, cycleCount, purchaseDate, lastChargeDate, health, notes } = body

    const battery = await prisma.battery.create({
      data: {
        droneId: id,
        serialNumber: serialNumber || null,
        capacity: capacity ? parseInt(capacity) : null,
        cycleCount: cycleCount ? parseInt(cycleCount) : 0,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        lastChargeDate: lastChargeDate ? new Date(lastChargeDate) : null,
        health: health ? parseInt(health) : null,
        notes: notes || null,
      },
    })

    return NextResponse.json({ battery }, { status: 201 })
  } catch (error) {
    console.error('Error creating battery:', error)
    return NextResponse.json({ error: 'Failed to create battery' }, { status: 500 })
  }
}
