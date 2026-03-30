import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET — total unread message count for the header badge
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ unreadCount: 0 })

    const unreadCount = await prisma.message.count({
      where: {
        senderId: { not: user.id },
        isRead: false,
        conversation: {
          OR: [{ participantA: user.id }, { participantB: user.id }],
        },
      },
    })

    return NextResponse.json({ unreadCount })
  } catch (error) {
    console.error('[Messages] Unread count error:', error)
    return NextResponse.json({ unreadCount: 0 })
  }
}
