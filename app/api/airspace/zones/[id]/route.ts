import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin' && user.role !== 'regulator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const zone = await prisma.airspaceZone.findUnique({ where: { id: params.id } })
    if (!zone) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const body = await req.json()
    const { name, description, type, lat, lon, radius, severity, province, startDate, endDate, isActive } = body

    const updated = await prisma.airspaceZone.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(type && { type }),
        ...(lat != null && { lat: parseFloat(lat) }),
        ...(lon != null && { lon: parseFloat(lon) }),
        ...(radius != null && { radius: parseFloat(radius) }),
        ...(severity && { severity }),
        ...(province !== undefined && { province: province || null }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
        ...(isActive !== undefined && { isActive }),
      },
      include: {
        createdBy: { select: { fullName: true, username: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Airspace zone PATCH error:', error)
    return NextResponse.json({ error: 'Failed to update zone' }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin' && user.role !== 'regulator') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.airspaceZone.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Airspace zone DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete zone' }, { status: 500 })
  }
}
