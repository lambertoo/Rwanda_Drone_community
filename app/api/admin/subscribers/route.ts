import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth-middleware'

export const ALLOWED_TOPICS = ['events', 'opportunities', 'projects', 'resources', 'forum', 'news']

// GET /api/admin/subscribers — list subscribers with stats
export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req)
  if (authResult instanceof NextResponse) return authResult

  try {
    const { searchParams } = new URL(req.url)
    const active = searchParams.get('active')        // 'true' | 'false' | null (all)
    const topic = searchParams.get('topic')           // e.g. 'events'
    const search = searchParams.get('search')         // email substring

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = {}

    if (active === 'true') where.isActive = true
    else if (active === 'false') where.isActive = false

    if (topic && ALLOWED_TOPICS.includes(topic)) {
      where.topics = { has: topic }
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [subscribers, total, activeCount] = await Promise.all([
      prisma.subscriber.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          topics: true,
          isActive: true,
          confirmedAt: true,
          createdAt: true,
          token: true,
        },
      }),
      prisma.subscriber.count(),
      prisma.subscriber.count({ where: { isActive: true } }),
    ])

    // Build per-topic counts
    const byTopic: Record<string, number> = {}
    for (const t of ALLOWED_TOPICS) {
      byTopic[t] = await prisma.subscriber.count({
        where: { isActive: true, topics: { has: t } },
      })
    }

    return NextResponse.json({ subscribers, total, active: activeCount, byTopic })
  } catch (error) {
    console.error('GET /api/admin/subscribers error:', error)
    return NextResponse.json({ error: 'Failed to load subscribers.' }, { status: 500 })
  }
}
