import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type')
    const province = searchParams.get('province')
    const search = searchParams.get('search')

    const where: any = { isApproved: true, isActive: true }
    if (type && type !== 'all') where.type = type
    if (province && province !== 'all') where.province = province
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const clubs = await prisma.club.findMany({
      where,
      include: {
        createdBy: { select: { id: true, fullName: true, avatar: true, username: true } },
        _count: { select: { memberships: { where: { status: 'active' } } } },
      },
      orderBy: [{ isFeatured: 'desc' }, { createdAt: 'desc' }],
    })

    return NextResponse.json({ clubs })
  } catch (error) {
    console.error('Error fetching clubs:', error)
    return NextResponse.json({ error: 'Failed to fetch clubs' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const data = await req.json()
    const { name, description, shortDescription, type, location, province, website, email, phone, socialLinks } = data

    if (!name || !description || !type) {
      return NextResponse.json({ error: 'Name, description, and type are required' }, { status: 400 })
    }

    const club = await prisma.club.create({
      data: {
        name,
        description,
        shortDescription,
        type,
        location,
        province,
        website,
        email,
        phone,
        socialLinks,
        createdById: user.id,
        isApproved: user.role === 'admin',
      },
      include: {
        createdBy: { select: { id: true, fullName: true, avatar: true, username: true } },
      },
    })

    // Auto-join as admin
    await prisma.clubMembership.create({
      data: { clubId: club.id, userId: user.id, role: 'admin', status: 'active' },
    })

    return NextResponse.json({ club }, { status: 201 })
  } catch (error) {
    console.error('Error creating club:', error)
    return NextResponse.json({ error: 'Failed to create club' }, { status: 500 })
  }
}
