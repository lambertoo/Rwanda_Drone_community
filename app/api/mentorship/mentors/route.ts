import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const specialty = searchParams.get('specialty')
    const role = searchParams.get('role')

    const mentors = await prisma.mentorProfile.findMany({
      where: {
        isAccepting: true,
        ...(specialty
          ? {
              specialties: {
                array_contains: specialty
              }
            }
          : {}),
        ...(role
          ? {
              user: { role: role as any }
            }
          : {})
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            avatar: true,
            role: true,
            bio: true,
            location: true
          }
        },
        _count: {
          select: { sentRequests: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ mentors })
  } catch (error) {
    console.error('Mentors GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch mentors' }, { status: 500 })
  }
}
