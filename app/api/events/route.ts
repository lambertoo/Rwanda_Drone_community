import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/auth"

// READ - Get all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get("upcoming") === "true"
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined

    let events
    if (upcoming) {
      events = await prisma.event.findMany({
        where: {
          startDate: {
            gte: new Date()
          }
        },
        include: {
          organizer: true,
        },
        orderBy: {
          startDate: 'asc'
        },
        take: limit
      })
    } else {
      events = await prisma.event.findMany({
        include: {
          organizer: true,
        },
        orderBy: {
          startDate: 'desc'
        },
        take: limit,
        skip: offset
      })
    }

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// CREATE - Create a new event
export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value
    if (!sessionId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const user = getSession(sessionId)
    if (!user) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 })
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

    if (!title || !description || !startDate || !location) {
      return NextResponse.json({ error: "Title, description, start date, and location are required" }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        fullDescription: fullDescription || description,
        category: category || "General",
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : new Date(startDate),
        location,
        venue: venue || location,
        price: price || 0,
        currency: currency || "RWF",
        speakers: JSON.stringify(speakers || []),
        agenda: JSON.stringify(agenda || []),
        requirements: JSON.stringify(requirements || []),
        gallery: JSON.stringify(gallery || []),
        isPublished: isPublished !== undefined ? isPublished : true,
        isFeatured: isFeatured || false,
        organizerId: user.id,
      },
      include: {
        organizer: true,
      }
    })

    // Update user's events count
    await prisma.user.update({
      where: { id: user.id },
      data: { eventsCount: { increment: 1 } }
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
