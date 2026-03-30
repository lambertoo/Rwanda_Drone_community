import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

type Params = { params: Promise<{ id: string; logId: string }> }

async function verifyOwnership(droneId: string, userId: string) {
  const drone = await prisma.drone.findUnique({ where: { id: droneId }, select: { userId: true } })
  if (!drone) return 'Drone not found'
  if (drone.userId !== userId) return 'Forbidden'
  return null
}

// PUT — update maintenance log
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, logId } = await params

    const err = await verifyOwnership(id, user.id)
    if (err) return NextResponse.json({ error: err }, { status: err === 'Forbidden' ? 403 : 404 })

    const body = await request.json()
    const data: Record<string, any> = {}

    if (body.type !== undefined) data.type = body.type
    if (body.description !== undefined) data.description = body.description
    if (body.cost !== undefined) data.cost = body.cost ? parseFloat(body.cost) : null
    if (body.date !== undefined) data.date = new Date(body.date)
    if (body.performedBy !== undefined) data.performedBy = body.performedBy || null
    if (body.nextDueDate !== undefined) data.nextDueDate = body.nextDueDate ? new Date(body.nextDueDate) : null

    const log = await prisma.droneMaintenance.update({
      where: { id: logId },
      data,
    })

    return NextResponse.json({ log })
  } catch (error) {
    console.error('Error updating maintenance log:', error)
    return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
  }
}

// DELETE — remove maintenance log
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id, logId } = await params

    const err = await verifyOwnership(id, user.id)
    if (err) return NextResponse.json({ error: err }, { status: err === 'Forbidden' ? 403 : 404 })

    await prisma.droneMaintenance.delete({ where: { id: logId } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting maintenance log:', error)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
