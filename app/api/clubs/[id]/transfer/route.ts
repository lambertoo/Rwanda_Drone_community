import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// GET — list pending transfer requests for a club (current owner or target user)
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const requests = await prisma.clubTransferRequest.findMany({
      where: {
        clubId: id,
        OR: [{ fromUserId: currentUser.id }, { toUserId: currentUser.id }],
      },
      include: {
        fromUser: { select: { id: true, fullName: true, avatar: true, username: true } },
        toUser: { select: { id: true, fullName: true, avatar: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ requests })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch transfer requests' }, { status: 500 })
  }
}

// POST — initiate ownership transfer (current owner only)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const club = await prisma.club.findUnique({ where: { id } })
    if (!club) return NextResponse.json({ error: 'Club not found' }, { status: 404 })

    if (club.createdById !== currentUser.id && currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Only the club owner can transfer ownership' }, { status: 403 })
    }

    const { toUserId, message } = await req.json()
    if (!toUserId) return NextResponse.json({ error: 'Target user ID required' }, { status: 400 })
    if (toUserId === currentUser.id) return NextResponse.json({ error: 'Cannot transfer to yourself' }, { status: 400 })

    // Target must be an active member
    const targetMembership = await prisma.clubMembership.findUnique({
      where: { clubId_userId: { clubId: id, userId: toUserId } },
      include: { user: { select: { id: true, fullName: true, username: true } } },
    })
    if (!targetMembership || targetMembership.status !== 'active') {
      return NextResponse.json({ error: 'Target user must be an active club member' }, { status: 400 })
    }

    // Cancel any existing pending transfer for this club
    await prisma.clubTransferRequest.updateMany({
      where: { clubId: id, status: 'pending' },
      data: { status: 'cancelled', respondedAt: new Date() },
    })

    const request = await prisma.clubTransferRequest.create({
      data: {
        clubId: id,
        fromUserId: currentUser.id,
        toUserId,
        message: message || null,
      },
      include: {
        fromUser: { select: { id: true, fullName: true, avatar: true, username: true } },
        toUser: { select: { id: true, fullName: true, avatar: true, username: true } },
      },
    })

    return NextResponse.json({ request }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create transfer request' }, { status: 500 })
  }
}

// PATCH — respond to a transfer request (accept/reject by target, or cancel by sender)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { requestId, action } = await req.json()
    if (!requestId || !['accept', 'reject', 'cancel'].includes(action)) {
      return NextResponse.json({ error: 'requestId and action (accept/reject/cancel) required' }, { status: 400 })
    }

    const request = await prisma.clubTransferRequest.findUnique({
      where: { id: requestId },
    })
    if (!request || request.status !== 'pending') {
      return NextResponse.json({ error: 'Transfer request not found or already resolved' }, { status: 404 })
    }

    if (action === 'cancel' && request.fromUserId !== currentUser.id) {
      return NextResponse.json({ error: 'Only the sender can cancel' }, { status: 403 })
    }
    if ((action === 'accept' || action === 'reject') && request.toUserId !== currentUser.id) {
      return NextResponse.json({ error: 'Only the target user can accept or reject' }, { status: 403 })
    }

    const newStatus = action === 'accept' ? 'accepted' : action === 'reject' ? 'rejected' : 'cancelled'

    await prisma.clubTransferRequest.update({
      where: { id: requestId },
      data: { status: newStatus, respondedAt: new Date() },
    })

    if (action === 'accept') {
      // Transfer club ownership
      await prisma.club.update({
        where: { id },
        data: { createdById: request.toUserId },
      })

      // Promote new owner to admin role in memberships
      await prisma.clubMembership.upsert({
        where: { clubId_userId: { clubId: id, userId: request.toUserId } },
        update: { role: 'admin' },
        create: { clubId: id, userId: request.toUserId, role: 'admin', status: 'active' },
      })

      // Previous owner stays as admin member (they can step down themselves)
    }

    return NextResponse.json({ success: true, status: newStatus })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process transfer request' }, { status: 500 })
  }
}
