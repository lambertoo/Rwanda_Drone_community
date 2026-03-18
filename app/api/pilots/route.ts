import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const location = searchParams.get('location')
    const specialty = searchParams.get('specialty')
    const search = searchParams.get('search')
    const role = searchParams.get('role')

    const users = await prisma.user.findMany({
      where: {
        isActive: true,
        role: role
          ? (role as any)
          : { in: ['pilot', 'service_provider', 'hobbyist', 'student'] as any },
        ...(location ? { location: location as any } : {}),
        ...(search
          ? {
              OR: [
                { fullName: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                { bio: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        avatar: true,
        role: true,
        location: true,
        bio: true,
        pilotLicense: true,
        organization: true,
        experience: true,
        specializations: true,
        reputation: true,
        joinedAt: true,
        _count: {
          select: {
            projects: true,
            posts: true,
            events: true,
          },
        },
      },
      orderBy: { reputation: 'desc' },
      take: 100,
    })

    return NextResponse.json({ pilots: users })
  } catch (error) {
    console.error('Error fetching pilots:', error)
    return NextResponse.json({ error: 'Failed to fetch pilots' }, { status: 500 })
  }
}
