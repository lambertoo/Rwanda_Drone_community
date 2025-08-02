import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { getSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get("upcoming") === "true"
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : undefined
    const offset = searchParams.get("offset") ? Number.parseInt(searchParams.get("offset")!) : undefined

    let events
    if (upcoming) {
      events = await db.events.findUpcoming(limit)
    } else {
      events = await db.events.findAll(limit, offset)
    }

    return NextResponse.json({ events })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    const { title, description, category, startDate, endDate, location, venue } = await request.json()

    if (!title || !description || !startDate || !location) {
      return NextResponse.json({ error: "Title, description, start date, and location are required" }, { status: 400 })
    }

    const userRecord = await db.users.findById(user.id)
    if (!userRecord) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const event = await db.events.create({
      title,
      description,
      fullDescription: description,
      category: category || "General",
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : new Date(startDate),
      location,
      venue: venue || location,
      price: 0,
      currency: "RWF",
      organizerId: user.id,
      organizer: userRecord,
      speakers: [],
      agenda: [],
      requirements: [],
      gallery: [],
      isPublished: true,
      isFeatured: false,
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
