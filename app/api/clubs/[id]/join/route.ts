import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ isMember: false })

    const membership = await prisma.clubMembership.findUnique({
      where: { clubId_userId: { clubId: id, userId: user.id } },
    })

    return NextResponse.json({ isMember: !!membership, membership })
  } catch (error) {
    return NextResponse.json({ isMember: false })
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const club = await prisma.club.findUnique({ where: { id } })
    if (!club) return NextResponse.json({ error: 'Club not found' }, { status: 404 })

    const existing = await prisma.clubMembership.findUnique({
      where: { clubId_userId: { clubId: id, userId: user.id } },
    })
    if (existing) return NextResponse.json({ error: 'Already a member' }, { status: 400 })

    const body = await req.json().catch(() => ({}))
    const membership = await prisma.clubMembership.create({
      data: {
        clubId: id,
        userId: user.id,
        role: 'member',
        status: club.registrationFormId ? 'pending' : 'active',
        formData: body.formData || null,
      },
    })

    // Update member count
    await prisma.club.update({
      where: { id },
      data: { memberCount: { increment: 1 } },
    })

    return NextResponse.json({ membership }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to join club' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    await prisma.clubMembership.delete({
      where: { clubId_userId: { clubId: id, userId: user.id } },
    })

    await prisma.club.update({
      where: { id },
      data: { memberCount: { decrement: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to leave club' }, { status: 500 })
  }
}
