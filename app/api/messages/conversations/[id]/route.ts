import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { createNotification } from '@/lib/notifications'

// GET — get messages for a conversation (marks unread as read)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params

    // Verify user is a participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [{ participantA: user.id }, { participantB: user.id }],
      },
      include: {
        userA: { select: { id: true, fullName: true, avatar: true, username: true } },
        userB: { select: { id: true, fullName: true, avatar: true, username: true } },
      },
    })

    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

    const otherUser = conversation.participantA === user.id ? conversation.userB : conversation.userA

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: 'asc' },
      take: 100,
      select: {
        id: true,
        content: true,
        senderId: true,
        isRead: true,
        createdAt: true,
      },
    })

    // Mark unread messages from the other user as read
    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: user.id },
        isRead: false,
      },
      data: { isRead: true },
    })

    return NextResponse.json({
      otherUser,
      messages: messages.map(m => ({
        ...m,
        isOwn: m.senderId === user.id,
      })),
    })
  } catch (error) {
    console.error('[Messages] Get messages error:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// POST — send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { id } = await params
    const { content } = await request.json()

    if (!content?.trim()) return NextResponse.json({ error: 'Content required' }, { status: 400 })
    if (content.length > 5000) return NextResponse.json({ error: 'Message too long (max 5000 characters)' }, { status: 400 })

    // Simple per-user rate limit: max 30 messages per minute
    const recentCount = await prisma.message.count({
      where: { senderId: user.id, createdAt: { gte: new Date(Date.now() - 60_000) } },
    })
    if (recentCount >= 30) {
      return NextResponse.json({ error: 'Too many messages. Please slow down.' }, { status: 429 })
    }

    // Verify user is a participant
    const conversation = await prisma.conversation.findFirst({
      where: {
        id,
        OR: [{ participantA: user.id }, { participantB: user.id }],
      },
    })

    if (!conversation) return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })

    const recipientId = conversation.participantA === user.id
      ? conversation.participantB
      : conversation.participantA

    // Check if blocked
    const blocked = await prisma.userBlock.findFirst({
      where: {
        OR: [
          { blockerId: user.id, blockedId: recipientId },
          { blockerId: recipientId, blockedId: user.id },
        ],
      },
    })
    if (blocked) {
      return NextResponse.json({ error: 'Cannot send message to this user' }, { status: 403 })
    }

    // Create message + update lastMessageAt
    const [message] = await prisma.$transaction([
      prisma.message.create({
        data: {
          conversationId: id,
          senderId: user.id,
          content: content.trim(),
        },
        select: { id: true, content: true, senderId: true, isRead: true, createdAt: true },
      }),
      prisma.conversation.update({
        where: { id },
        data: { lastMessageAt: new Date() },
      }),
    ])

    // Notify recipient (skip if conversation is muted)
    const isMuted = await prisma.conversationMute.findUnique({
      where: { userId_conversationId: { userId: recipientId, conversationId: id } },
    })
    if (!isMuted) {
      createNotification({
        userId: recipientId,
        type: 'message',
        title: 'New message',
        body: `${user.fullName}: ${content.trim().slice(0, 80)}${content.length > 80 ? '...' : ''}`,
        link: '/messages',
        data: { actorId: user.id, conversationId: id },
      })
    }

    return NextResponse.json({
      message: { ...message, isOwn: true },
    })
  } catch (error) {
    console.error('[Messages] Send message error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}
