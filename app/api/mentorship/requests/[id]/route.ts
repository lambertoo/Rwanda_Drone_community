import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'status is required' }, { status: 400 })
    }

    // Fetch the request with profile info
    const mentorshipRequest = await prisma.mentorshipRequest.findUnique({
      where: { id },
      include: {
        mentorProfile: true,
        menteeProfile: true
      }
    })

    if (!mentorshipRequest) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 })
    }

    const userProfile = await prisma.mentorProfile.findUnique({ where: { userId: user.id } })

    const isMentor = userProfile?.id === mentorshipRequest.mentorProfileId
    const isMentee = userProfile?.id === mentorshipRequest.menteeProfileId

    if (!isMentor && !isMentee) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Mentors can accept or decline; mentees can withdraw
    const allowedByMentor = ['accepted', 'declined']
    const allowedByMentee = ['withdrawn']

    if (isMentor && !allowedByMentor.includes(status)) {
      return NextResponse.json(
        { error: `Mentors can only set status to: ${allowedByMentor.join(', ')}` },
        { status: 400 }
      )
    }

    if (isMentee && !allowedByMentee.includes(status)) {
      return NextResponse.json(
        { error: `Mentees can only set status to: ${allowedByMentee.join(', ')}` },
        { status: 400 }
      )
    }

    const updated = await prisma.mentorshipRequest.update({
      where: { id },
      data: { status },
      include: {
        mentorProfile: {
          include: {
            user: { select: { id: true, username: true, fullName: true, avatar: true, role: true } }
          }
        },
        menteeProfile: {
          include: {
            user: { select: { id: true, username: true, fullName: true, avatar: true, role: true } }
          }
        }
      }
    })

    return NextResponse.json({ request: updated })
  } catch (error) {
    console.error('Request PUT error:', error)
    return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })
  }
}
