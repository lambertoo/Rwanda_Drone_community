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

    const logs = await prisma.droneMaintenance.findMany({
      where: { droneId: id },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json({ logs })
  } catch (error) {
    console.error('Error fetching maintenance logs:', error)
    return NextResponse.json({ error: 'Failed to fetch maintenance logs' }, { status: 500 })
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
    const { type, description, cost, date, performedBy, nextDueDate } = body

    if (!type || !description || !date) {
      return NextResponse.json(
        { error: 'Type, description, and date are required' },
        { status: 400 }
      )
    }

    const log = await prisma.droneMaintenance.create({
      data: {
        droneId: id,
        type,
        description,
        cost: cost ? parseFloat(cost) : null,
        date: new Date(date),
        performedBy: performedBy || null,
        nextDueDate: nextDueDate ? new Date(nextDueDate) : null,
      },
    })

    return NextResponse.json({ log }, { status: 201 })
  } catch (error) {
    console.error('Error creating maintenance log:', error)
    return NextResponse.json({ error: 'Failed to create maintenance log' }, { status: 500 })
  }
}
