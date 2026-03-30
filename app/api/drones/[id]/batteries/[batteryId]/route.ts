import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

type Params = { params: Promise<{ id: string; batteryId: string }> }

async function verifyOwnership(droneId: string, userId: string) {
  const drone = await prisma.drone.findUnique({ where: { id: droneId }, select: { userId: true } })
  if (!drone) return 'Drone not found'
  if (drone.userId !== userId) return 'Forbidden'
  return null
}

// GET — single battery details
export async function GET(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, batteryId } = await params

    const err = await verifyOwnership(id, user.id)
    if (err) return NextResponse.json({ error: err }, { status: err === 'Forbidden' ? 403 : 404 })

    const battery = await prisma.battery.findFirst({
      where: { id: batteryId, droneId: id },
    })
    if (!battery) return NextResponse.json({ error: 'Battery not found' }, { status: 404 })

    return NextResponse.json({ battery })
  } catch (error) {
    console.error('Error fetching battery:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// PUT — update battery (health, cycle count, last charge, notes, etc.)
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, batteryId } = await params

    const err = await verifyOwnership(id, user.id)
    if (err) return NextResponse.json({ error: err }, { status: err === 'Forbidden' ? 403 : 404 })

    const body = await request.json()
    const data: Record<string, any> = {}

    if (body.serialNumber !== undefined) data.serialNumber = body.serialNumber || null
    if (body.capacity !== undefined) data.capacity = body.capacity ? parseInt(body.capacity) : null
    if (body.cycleCount !== undefined) data.cycleCount = parseInt(body.cycleCount) || 0
    if (body.health !== undefined) data.health = body.health !== null ? parseInt(body.health) : null
    if (body.notes !== undefined) data.notes = body.notes || null
    if (body.purchaseDate !== undefined) data.purchaseDate = body.purchaseDate ? new Date(body.purchaseDate) : null
    if (body.lastChargeDate !== undefined) data.lastChargeDate = body.lastChargeDate ? new Date(body.lastChargeDate) : null

    // Special action: record a charge cycle
    if (body.action === 'charge') {
      data.cycleCount = { increment: 1 }
      data.lastChargeDate = new Date()
      // Degrade health slightly per cycle (simple model: lose ~0.1% per cycle after 100 cycles)
      const battery = await prisma.battery.findFirst({ where: { id: batteryId, droneId: id }, select: { cycleCount: true, health: true } })
      if (battery && battery.health && battery.cycleCount >= 100) {
        const newHealth = Math.max(0, battery.health - 1)
        data.health = newHealth
      }
    }

    const battery = await prisma.battery.update({
      where: { id: batteryId },
      data,
    })

    return NextResponse.json({ battery })
  } catch (error) {
    console.error('Error updating battery:', error)
    return NextResponse.json({ error: 'Failed to update battery' }, { status: 500 })
  }
}

// DELETE — remove battery
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, batteryId } = await params

    const err = await verifyOwnership(id, user.id)
    if (err) return NextResponse.json({ error: err }, { status: err === 'Forbidden' ? 403 : 404 })

    await prisma.battery.delete({ where: { id: batteryId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting battery:', error)
    return NextResponse.json({ error: 'Failed to delete battery' }, { status: 500 })
  }
}
