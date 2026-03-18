import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: 'asc' }
    })

    return NextResponse.json({ flags })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch feature flags' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    if (user.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const body = await request.json()
    const { key, isEnabled, config } = body

    if (!key) {
      return NextResponse.json({ error: 'Feature flag key is required' }, { status: 400 })
    }

    const flag = await prisma.featureFlag.update({
      where: { key },
      data: {
        isEnabled: typeof isEnabled === 'boolean' ? isEnabled : undefined,
        config: config !== undefined ? config : undefined,
        updatedBy: user.id
      }
    })

    return NextResponse.json({ flag })
  } catch (error: any) {
    if (error?.code === 'P2025') {
      return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Failed to update feature flag' }, { status: 500 })
  }
}
