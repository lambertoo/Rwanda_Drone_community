import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const ALLOWED_TOPICS = ['events', 'opportunities', 'projects', 'resources', 'forum', 'news']

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function sanitizeTopics(topics: unknown): string[] {
  if (!Array.isArray(topics)) return []
  return topics.filter((t): t is string => typeof t === 'string' && ALLOWED_TOPICS.includes(t))
}

// POST /api/subscribe — subscribe or re-subscribe
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, name, topics } = body

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    const cleanTopics = sanitizeTopics(topics)

    const existing = await prisma.subscriber.findUnique({ where: { email } })

    if (existing) {
      // Re-activate and update preferences
      const updated = await prisma.subscriber.update({
        where: { email },
        data: {
          name: name || existing.name,
          topics: cleanTopics.length > 0 ? cleanTopics : existing.topics,
          isActive: true,
          confirmedAt: existing.confirmedAt ?? new Date(),
        },
      })
      return NextResponse.json({ success: true, token: updated.token, updated: true })
    }

    // New subscriber
    const subscriber = await prisma.subscriber.create({
      data: {
        email,
        name: name || null,
        topics: cleanTopics,
        isActive: true,
        confirmedAt: new Date(),
      },
    })

    return NextResponse.json({ success: true, token: subscriber.token, updated: false }, { status: 201 })
  } catch (error) {
    console.error('POST /api/subscribe error:', error)
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }
}

// PUT /api/subscribe — update topic preferences
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, topics } = body

    if (!email || typeof email !== 'string' || !isValidEmail(email)) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 })
    }

    const cleanTopics = sanitizeTopics(topics)

    const subscriber = await prisma.subscriber.findUnique({ where: { email } })
    if (!subscriber) {
      return NextResponse.json({ error: 'Subscriber not found.' }, { status: 404 })
    }

    const updated = await prisma.subscriber.update({
      where: { email },
      data: { topics: cleanTopics },
    })

    return NextResponse.json({ success: true, token: updated.token })
  } catch (error) {
    console.error('PUT /api/subscribe error:', error)
    return NextResponse.json({ error: 'Failed to update preferences. Please try again.' }, { status: 500 })
  }
}

// GET /api/subscribe?email=xxx — fetch existing subscriber preferences
export async function GET(req: NextRequest) {
  const email = req.nextUrl.searchParams.get('email')
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
  }
  try {
    const subscriber = await prisma.subscriber.findUnique({ where: { email } })
    if (!subscriber) return NextResponse.json({ topics: [], isActive: false })
    return NextResponse.json({ topics: subscriber.topics, isActive: subscriber.isActive, token: subscriber.token })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
