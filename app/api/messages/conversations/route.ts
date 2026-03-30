import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET — list user's conversations with last message + unread count
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [{ participantA: user.id }, { participantB: user.id }],
      },
      include: {
        userA: { select: { id: true, fullName: true, avatar: true, username: true } },
        userB: { select: { id: true, fullName: true, avatar: true, username: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          select: { content: true, createdAt: true, senderId: true },
        },
      },
      orderBy: { lastMessageAt: 'desc' },
    })

    // Get unread counts per conversation
    const unreadCounts = await prisma.message.groupBy({
      by: ['conversationId'],
      where: {
        senderId: { not: user.id },
        isRead: false,
        conversation: {
          OR: [{ participantA: user.id }, { participantB: user.id }],
        },
      },
      _count: true,
    })

    const unreadMap = new Map(unreadCounts.map(u => [u.conversationId, u._count]))

    const result = conversations.map(c => {
      const otherUser = c.participantA === user.id ? c.userB : c.userA
      const lastMessage = c.messages[0] || null
      return {
        id: c.id,
        otherUser,
        lastMessage: lastMessage ? {
          content: lastMessage.content,
          createdAt: lastMessage.createdAt,
          isOwn: lastMessage.senderId === user.id,
        } : null,
        unreadCount: unreadMap.get(c.id) || 0,
        lastMessageAt: c.lastMessageAt,
      }
    })

    return NextResponse.json({ conversations: result })
  } catch (error) {
    console.error('[Messages] List conversations error:', error)
    return NextResponse.json({ error: 'Failed to fetch conversations' }, { status: 500 })
  }
}

// POST — create or find existing conversation
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { recipientId } = await request.json()
    if (!recipientId) return NextResponse.json({ error: 'recipientId required' }, { status: 400 })
    if (recipientId === user.id) return NextResponse.json({ error: 'Cannot message yourself' }, { status: 400 })

    // Ensure recipient exists
    const recipient = await prisma.user.findUnique({ where: { id: recipientId }, select: { id: true } })
    if (!recipient) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Check if blocked
    const blocked = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: user.id, blockedId: recipientId },
          { blockerId: recipientId, blockedId: user.id },
        ],
      },
    })
    if (blocked) return NextResponse.json({ error: 'Cannot message this user' }, { status: 403 })

    // Always store IDs in sorted order for unique constraint
    const [a, b] = [user.id, recipientId].sort()

    // Find or create conversation
    let conversation = await prisma.conversation.findUnique({
      where: { participantA_participantB: { participantA: a, participantB: b } },
    })

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: { participantA: a, participantB: b },
      })
    }

    return NextResponse.json({ conversationId: conversation.id })
  } catch (error) {
    console.error('[Messages] Create conversation error:', error)
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 })
  }
}
