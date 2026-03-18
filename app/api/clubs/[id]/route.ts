import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const club = await prisma.club.findUnique({
      where: { id: params.id },
      include: {
        createdBy: { select: { id: true, fullName: true, avatar: true, username: true, organization: true } },
        memberships: {
          where: { status: 'active' },
          include: {
            user: { select: { id: true, fullName: true, avatar: true, username: true, role: true } },
          },
          orderBy: [{ role: 'asc' }, { joinedAt: 'asc' }],
          take: 20,
        },
        _count: { select: { memberships: { where: { status: 'active' } } } },
      },
    })

    if (!club) return NextResponse.json({ error: 'Club not found' }, { status: 404 })

    return NextResponse.json({ club })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch club' }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const club = await prisma.club.findUnique({ where: { id: params.id } })
    if (!club) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const isClubAdmin = await prisma.clubMembership.findUnique({
      where: { clubId_userId: { clubId: params.id, userId: user.id } },
    })
    if (club.createdById !== user.id && user.role !== 'admin' && isClubAdmin?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const data = await req.json()
    const updated = await prisma.club.update({
      where: { id: params.id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription }),
        ...(data.type && { type: data.type }),
        ...(data.location !== undefined && { location: data.location }),
        ...(data.province !== undefined && { province: data.province }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.email !== undefined && { email: data.email }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.socialLinks !== undefined && { socialLinks: data.socialLinks }),
        ...(data.registrationFormId !== undefined && { registrationFormId: data.registrationFormId }),
        ...(user.role === 'admin' && data.isApproved !== undefined && { isApproved: data.isApproved }),
        ...(user.role === 'admin' && data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      },
    })

    return NextResponse.json({ club: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update club' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const club = await prisma.club.findUnique({ where: { id: params.id } })
    if (!club) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    if (club.createdById !== user.id && user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.club.delete({ where: { id: params.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete club' }, { status: 500 })
  }
}
