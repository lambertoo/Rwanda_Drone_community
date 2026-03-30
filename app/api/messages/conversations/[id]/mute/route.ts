import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST — toggle mute/unmute conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    // Verify participation
    const conversation = await prisma.conversation.findFirst({
      where: { id, OR: [{ participantA: user.id }, { participantB: user.id }] },
    })
    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

    const existing = await prisma.conversationMute.findUnique({
      where: { userId_conversationId: { userId: user.id, conversationId: id } },
    })

    if (existing) {
      await prisma.conversationMute.delete({
        where: { userId_conversationId: { userId: user.id, conversationId: id } },
      })
      return NextResponse.json({ muted: false })
    } else {
      await prisma.conversationMute.create({ data: { userId: user.id, conversationId: id } })
      return NextResponse.json({ muted: true })
    }
  } catch (error) {
    console.error('[Mute] Error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
