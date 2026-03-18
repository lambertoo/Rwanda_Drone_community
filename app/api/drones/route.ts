import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const drones = await prisma.drone.findMany({
      where: { userId: user.id },
      include: {
        flightLogs: { take: 1, orderBy: { createdAt: 'desc' } },
        maintenanceLogs: { take: 1, orderBy: { createdAt: 'desc' } },
        batteries: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ drones })
  } catch (error) {
    console.error('Error fetching drones:', error)
    return NextResponse.json({ error: 'Failed to fetch drones' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

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
    } = body

    if (!name || !brand || !model) {
      return NextResponse.json({ error: 'Name, brand, and model are required' }, { status: 400 })
    }

    const drone = await prisma.drone.create({
      data: {
        userId: user.id,
        name,
        brand,
        model,
        serialNumber: serialNumber || null,
        caaRegistrationNumber: caaRegistrationNumber || null,
        purchaseDate: purchaseDate ? new Date(purchaseDate) : null,
        weight: weight ? parseFloat(weight) : null,
        maxFlightTime: maxFlightTime ? parseInt(maxFlightTime) : null,
        maxRange: maxRange ? parseFloat(maxRange) : null,
        notes: notes || null,
      },
    })

    return NextResponse.json({ drone }, { status: 201 })
  } catch (error) {
    console.error('Error creating drone:', error)
    return NextResponse.json({ error: 'Failed to create drone' }, { status: 500 })
  }
}
