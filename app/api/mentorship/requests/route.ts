import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    // Get the current user's mentor profile id (if they have one)
    const mentorProfile = await prisma.mentorProfile.findUnique({
      where: { userId: user.id }
    })

    // Get a mentee profile linked to the user (stored as a MentorProfile with menteeProfileId references)
    // The schema uses MentorProfile for both sides — find the profile acting as mentee
    const asReceiver = mentorProfile
      ? await prisma.mentorshipRequest.findMany({
          where: { mentorProfileId: mentorProfile.id },
          include: {
            menteeProfile: {
              include: {
                user: { select: { id: true, username: true, fullName: true, avatar: true, role: true } }
              }
            },
            mentorProfile: {
              include: {
                user: { select: { id: true, username: true, fullName: true, avatar: true, role: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      : []

    // Requests sent by this user (they had a mentor profile at the time or we need to find their profile)
    const asSender = mentorProfile
      ? await prisma.mentorshipRequest.findMany({
          where: { menteeProfileId: mentorProfile.id },
          include: {
            menteeProfile: {
              include: {
                user: { select: { id: true, username: true, fullName: true, avatar: true, role: true } }
              }
            },
            mentorProfile: {
              include: {
                user: { select: { id: true, username: true, fullName: true, avatar: true, role: true } }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })
      : []

    return NextResponse.json({ sent: asSender, received: asReceiver })
  } catch (error) {
    console.error('Requests GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { mentorProfileId, message, goals } = body

    if (!mentorProfileId || !message) {
      return NextResponse.json({ error: 'mentorProfileId and message are required' }, { status: 400 })
    }

    // Check mentor exists and is accepting
    const mentor = await prisma.mentorProfile.findUnique({
      where: { id: mentorProfileId }
    })
    if (!mentor) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 })
    }
    if (!mentor.isAccepting) {
      return NextResponse.json({ error: 'This mentor is not currently accepting requests' }, { status: 400 })
    }

    // Ensure the requesting user has a MentorProfile (used as mentee profile)
    let menteeProfile = await prisma.mentorProfile.findUnique({ where: { userId: user.id } })
    if (!menteeProfile) {
      // Auto-create a minimal profile so they can send requests
      menteeProfile = await prisma.mentorProfile.create({
        data: {
          userId: user.id,
          specialties: [],
          isAccepting: false,
          isFree: true,
          languages: ['English']
        }
      })
    }

    // Prevent duplicate requests
    const existing = await prisma.mentorshipRequest.findFirst({
      where: {
        menteeProfileId: menteeProfile.id,
        mentorProfileId,
        status: { in: ['pending', 'accepted'] }
      }
    })
    if (existing) {
      return NextResponse.json({ error: 'You already have an active request with this mentor' }, { status: 409 })
    }

    const mentorRequest = await prisma.mentorshipRequest.create({
      data: {
        menteeProfileId: menteeProfile.id,
        mentorProfileId,
        message,
        goals: goals || [],
        status: 'pending'
      },
      include: {
        mentorProfile: {
          include: {
            user: { select: { id: true, username: true, fullName: true, avatar: true } }
          }
        }
      }
    })

    return NextResponse.json({ request: mentorRequest }, { status: 201 })
  } catch (error) {
    console.error('Request POST error:', error)
    return NextResponse.json({ error: 'Failed to send request' }, { status: 500 })
  }
}
