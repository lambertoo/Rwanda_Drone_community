import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, canRSVPEvents } from "@/lib/auth"

// POST - RSVP for an event
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    // Check if user can RSVP for events
    if (!canRSVPEvents(currentUser)) {
      return NextResponse.json(
        { error: "Insufficient permissions to RSVP for events" },
        { status: 403 }
      )
    }

    const eventId = params.id

    // Check if event exists and allows registration
    const event = await prisma.event.findUnique({
      where: { id: eventId }
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    if (!event.allowRegistration) {
      return NextResponse.json(
        { error: "This event does not allow registration" },
        { status: 400 }
      )
    }

    // Check if user has already RSVP'd
    const existingRSVP = await prisma.rsvp.findFirst({
      where: {
        userId: currentUser.id,
        eventId: eventId
      }
    })

    if (existingRSVP) {
      return NextResponse.json(
        { error: "You have already RSVP'd for this event" },
        { status: 400 }
      )
    }

    // Check if event is at capacity
    if (event.capacity && event.registeredCount >= event.capacity) {
      return NextResponse.json(
        { error: "This event is at capacity" },
        { status: 400 }
      )
    }

    // Create RSVP
    const rsvp = await prisma.rsvp.create({
      data: {
        userId: currentUser.id,
        eventId: eventId
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            avatar: true
          }
        },
        event: {
          select: {
            id: true,
            title: true,
            startDate: true,
            endDate: true,
            location: true
          }
        }
      }
    })

    // Update event registered count
    await prisma.event.update({
      where: { id: eventId },
      data: { registeredCount: { increment: 1 } }
    })

    return NextResponse.json({ rsvp }, { status: 201 })

  } catch (error) {
    console.error("Error creating RSVP:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Cancel RSVP for an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const eventId = params.id

    // Check if RSVP exists
    const existingRSVP = await prisma.rsvp.findFirst({
      where: {
        userId: currentUser.id,
        eventId: eventId
      }
    })

    if (!existingRSVP) {
      return NextResponse.json(
        { error: "RSVP not found" },
        { status: 404 }
      )
    }

    // Delete RSVP
    await prisma.rsvp.delete({
      where: { id: existingRSVP.id }
    })

    // Update event registered count
    await prisma.event.update({
      where: { id: eventId },
      data: { registeredCount: { decrement: 1 } }
    })

    return NextResponse.json({ message: "RSVP cancelled successfully" })

  } catch (error) {
    console.error("Error cancelling RSVP:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

// GET - Get RSVPs for an event (REQUIRES AUTHENTICATION)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Authenticate user
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      )
    }

    const eventId = params.id

    // Check if event exists
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { organizer: true }
    })

    if (!event) {
      return NextResponse.json(
        { error: "Event not found" },
        { status: 404 }
      )
    }

    // Only event organizer and admin can view RSVPs
    if (event.organizerId !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Insufficient permissions to view RSVPs" },
        { status: 403 }
      )
    }

    // Get RSVPs for this event
    const rsvps = await prisma.rsvp.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            fullName: true,
            avatar: true,
            role: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ rsvps })

  } catch (error) {
    console.error("Error fetching RSVPs:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}