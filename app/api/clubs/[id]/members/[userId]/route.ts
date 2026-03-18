import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

// PATCH /api/clubs/[id]/members/[userId] — appoint/change role
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Only club admin (or platform admin) can change roles
    const callerMembership = await prisma.clubMembership.findUnique({
      where: { clubId_userId: { clubId: params.id, userId: currentUser.id } },
    })
    const club = await prisma.club.findUnique({ where: { id: params.id } })

    const isAdmin =
      currentUser.role === 'admin' ||
      club?.createdById === currentUser.id ||
      callerMembership?.role === 'admin'

    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    const { role } = await req.json()
    if (!['member', 'moderator', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be member, moderator, or admin' }, { status: 400 })
    }

    // Cannot demote the original creator unless it's the creator themselves doing a transfer
    if (
      club?.createdById === params.userId &&
      role !== 'admin' &&
      currentUser.id !== params.userId
    ) {
      return NextResponse.json({ error: 'Cannot change the role of the club creator. Use transfer ownership instead.' }, { status: 400 })
    }

    const membership = await prisma.clubMembership.update({
      where: { clubId_userId: { clubId: params.id, userId: params.userId } },
      data: { role },
      include: { user: { select: { id: true, fullName: true, username: true, avatar: true } } },
    })

    return NextResponse.json({ membership })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update member role' }, { status: 500 })
  }
}

// DELETE /api/clubs/[id]/members/[userId] — remove a member (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; userId: string } }
) {
  try {
    const currentUser = await getCurrentUser()
    if (!currentUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const callerMembership = await prisma.clubMembership.findUnique({
      where: { clubId_userId: { clubId: params.id, userId: currentUser.id } },
    })
    const club = await prisma.club.findUnique({ where: { id: params.id } })

    const isAdmin =
      currentUser.role === 'admin' ||
      club?.createdById === currentUser.id ||
      callerMembership?.role === 'admin'

    if (!isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // Cannot remove the original creator
    if (club?.createdById === params.userId) {
      return NextResponse.json({ error: 'Cannot remove the club creator' }, { status: 400 })
    }

    await prisma.clubMembership.delete({
      where: { clubId_userId: { clubId: params.id, userId: params.userId } },
    })
    await prisma.club.update({ where: { id: params.id }, data: { memberCount: { decrement: 1 } } })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove member' }, { status: 500 })
  }
}
