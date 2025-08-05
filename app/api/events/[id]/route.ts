import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

// READ - Get a single event
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: true,
        category: true,
        rsvps: {
          include: {
            user: true
          }
        }
      }
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    // Increment view count
    await prisma.event.update({
      where: { id },
      data: { viewsCount: { increment: 1 } }
    })

    return NextResponse.json({ event })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// UPDATE - Update an event
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = getSession(sessionId)
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Check if event exists and user owns it
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { organizer: true }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (existingEvent.organizerId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const {
      title,
      description,
      fullDescription,
      category,
      startDate,
      endDate,
      location,
      venue,
      price,
      currency,
      speakers,
      agenda,
      requirements,
      gallery,
      isPublished,
      isFeatured
    } = await request.json()

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        fullDescription: fullDescription || description,
        category,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        location,
        venue,
        price,
        currency,
        speakers: JSON.stringify(speakers || []),
        agenda: JSON.stringify(agenda || []),
        requirements: JSON.stringify(requirements || []),
        gallery: JSON.stringify(gallery || []),
        isPublished,
        isFeatured,
        updatedAt: new Date(),
      },
      include: {
        organizer: true,
      }
    })

    return NextResponse.json({ event: updatedEvent })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete an event
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) return NextResponse.json({ error: "Authentication required" }, { status: 401 })

    const user = getSession(sessionId)
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
    }

    // Check if event exists and user owns it
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { organizer: true }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (existingEvent.organizerId !== user.id && user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    // Delete the event
    await prisma.event.delete({
      where: { id }
    })

    // Update user's events count
    await prisma.user.update({
      where: { id: existingEvent.organizerId },
      data: { eventsCount: { decrement: 1 } }
    })

    return NextResponse.json({ message: "Event deleted successfully" })
  } catch (error) {
    console.error("Error deleting event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
