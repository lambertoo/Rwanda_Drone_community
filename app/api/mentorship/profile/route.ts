import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const profile = await prisma.mentorProfile.findUnique({
      where: { userId: user.id },
      include: {
        user: {
          select: { id: true, username: true, fullName: true, avatar: true, role: true }
        }
      }
    })
    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Mentor profile GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const body = await request.json()
    const existing = await prisma.mentorProfile.findUnique({ where: { userId: user.id } })
    if (existing) {
      const updated = await prisma.mentorProfile.update({
        where: { userId: user.id },
        data: {
          specialties: body.specialties,
          bio: body.bio,
          maxMentees: body.maxMentees || 3,
          isAccepting: body.isAccepting !== false,
          isFree: body.isFree !== false,
          languages: body.languages
        }
      })
      return NextResponse.json({ profile: updated })
    }
    const profile = await prisma.mentorProfile.create({
      data: {
        userId: user.id,
        specialties: body.specialties || [],
        bio: body.bio,
        maxMentees: body.maxMentees || 3,
        isAccepting: true,
        isFree: body.isFree !== false,
        languages: body.languages || ['English']
      }
    })
    return NextResponse.json({ profile }, { status: 201 })
  } catch (error) {
    console.error('Mentor profile POST error:', error)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}
