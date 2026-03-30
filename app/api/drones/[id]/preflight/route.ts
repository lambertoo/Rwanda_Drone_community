import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

const CHECKLIST_ITEMS = [
  'Weather conditions checked (wind < 20 knots, visibility > 500m)',
  'Airspace clearance verified (NOTAMs, no-fly zones)',
  'Drone physical inspection (propellers, motors, landing gear, body)',
  'Battery check (charged above 80%, no swelling)',
  'Remote controller check (charged, paired, sticks responsive)',
  'GPS lock test (minimum 10 satellites)',
  'Memory card check (sufficient space, properly seated)',
  'Return-to-home altitude set (appropriate for area)',
  'Observer briefed (if applicable)',
  'Flight logged in logbook',
]

// GET — get recent preflight checks for this drone
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const drone = await prisma.drone.findUnique({ where: { id }, select: { userId: true } })
    if (!drone) return NextResponse.json({ error: 'Drone not found' }, { status: 404 })
    if (drone.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const checks = await prisma.preFlightCheck.findMany({
      where: { droneId: id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Get battery health status for auto-check hint
    const batteries = await prisma.battery.findMany({
      where: { droneId: id },
      select: { health: true },
    })
    const allBatteriesGood = batteries.length > 0 && batteries.every(b => (b.health || 0) >= 80)

    return NextResponse.json({
      checks,
      checklistItems: CHECKLIST_ITEMS,
      allBatteriesGood,
      lastCheck: checks[0] || null,
    })
  } catch (error) {
    console.error('Error fetching preflight checks:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

// POST — submit a preflight check
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    const drone = await prisma.drone.findUnique({ where: { id }, select: { userId: true } })
    if (!drone) return NextResponse.json({ error: 'Drone not found' }, { status: 404 })
    if (drone.userId !== user.id) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { items, notes } = await request.json()

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Checklist items required' }, { status: 400 })
    }

    const allPassed = items.every((item: { checked: boolean }) => item.checked)

    const check = await prisma.preFlightCheck.create({
      data: {
        droneId: id,
        userId: user.id,
        items,
        allPassed,
        notes: notes || null,
      },
    })

    return NextResponse.json({ check }, { status: 201 })
  } catch (error) {
    console.error('Error creating preflight check:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
