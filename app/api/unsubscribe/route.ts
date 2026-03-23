import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/unsubscribe?token=xxx — one-click unsubscribe
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Unsubscribe token is required.' }, { status: 400 })
    }

    const subscriber = await prisma.subscriber.findUnique({ where: { token } })
    if (!subscriber) {
      return NextResponse.json({ error: 'Invalid or expired unsubscribe token.' }, { status: 404 })
    }

    await prisma.subscriber.update({
      where: { token },
      data: { isActive: false },
    })

    return NextResponse.json({ success: true, email: subscriber.email })
  } catch (error) {
    console.error('GET /api/unsubscribe error:', error)
    return NextResponse.json({ error: 'Failed to unsubscribe. Please try again.' }, { status: 500 })
  }
}

// POST /api/unsubscribe — unsubscribe via POST body
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, email } = body

    if (token) {
      const subscriber = await prisma.subscriber.findUnique({ where: { token } })
      if (!subscriber) {
        return NextResponse.json({ error: 'Invalid or expired unsubscribe token.' }, { status: 404 })
      }

      await prisma.subscriber.update({
        where: { token },
        data: { isActive: false },
      })

      return NextResponse.json({ success: true, email: subscriber.email })
    }

    if (email) {
      const subscriber = await prisma.subscriber.findUnique({ where: { email } })
      if (!subscriber) {
        return NextResponse.json({ error: 'Email not found in our mailing list.' }, { status: 404 })
      }

      await prisma.subscriber.update({
        where: { email },
        data: { isActive: false },
      })

      return NextResponse.json({ success: true, email: subscriber.email, token: subscriber.token })
    }

    return NextResponse.json({ error: 'A token or email is required.' }, { status: 400 })
  } catch (error) {
    console.error('POST /api/unsubscribe error:', error)
    return NextResponse.json({ error: 'Failed to unsubscribe. Please try again.' }, { status: 500 })
  }
}
