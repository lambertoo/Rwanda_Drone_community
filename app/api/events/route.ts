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
          category: true,
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
          category: true,
        },
        orderBy: {
          startDate: 'desc'
        },
        take: limit,
        skip: offset
      })
    }

    // Parse JSON fields for all events
    const parseJsonField = (field: any) => {
      if (!field) return []
      if (typeof field === 'string') {
        try {
          const parsed = JSON.parse(field)
          return Array.isArray(parsed) ? parsed : []
        } catch (e) {
          console.error('Error parsing JSON field:', e)
          return []
        }
      }
      return Array.isArray(field) ? field : []
    }

    const parsedEvents = events.map(event => ({
      ...event,
      speakers: parseJsonField(event.speakers),
      agenda: parseJsonField(event.agenda),
      requirements: parseJsonField(event.requirements),
      gallery: parseJsonField(event.gallery),
      tags: parseJsonField(event.tags)
    }))

    return NextResponse.json({ events: parsedEvents })
  } catch (error) {
    console.error("Error fetching events:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// CREATE - Create a new event
export async function POST(request: NextRequest) {
  try {
    // Check if the request is multipart/form-data (file upload)
    const contentType = request.headers.get('content-type') || ''
    
    let eventData: any = {}
    let flyerFile: File | null = null

    if (contentType.includes('multipart/form-data')) {
      // Handle FormData for file uploads
      const formData = await request.formData()
      
      // Extract text fields
      eventData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        fullDescription: formData.get('fullDescription') as string,
        categoryId: formData.get('categoryId') as string,
        startDate: formData.get('startDate') as string,
        endDate: formData.get('endDate') as string,
        location: formData.get('location') as string,
        venue: formData.get('venue') as string,
        price: formData.get('price') as string,
        currency: formData.get('currency') as string,
        speakers: formData.get('speakers') as string,
        agenda: formData.get('agenda') as string,
        requirements: formData.get('requirements') as string,
        gallery: formData.get('gallery') as string,
        isPublished: formData.get('isPublished') as string,
        isFeatured: formData.get('isFeatured') as string,
        userId: formData.get('userId') as string,
      }

      // Extract file
      const flyer = formData.get('flyer') as File
      if (flyer && flyer.size > 0) {
        flyerFile = flyer
      }
    } else {
      // Handle JSON data (fallback)
      eventData = await request.json()
    }

    if (!eventData.userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: eventData.userId }
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (!eventData.title || !eventData.description || !eventData.startDate || !eventData.location) {
      return NextResponse.json({ error: "Title, description, start date, and location are required" }, { status: 400 })
    }

    // Handle file upload if flyer is provided
    let flyerUrl: string | null = null
    if (flyerFile) {
      try {
        // For now, we'll store the file in a simple way
        // In production, you'd want to use a proper file storage service like AWS S3, Cloudinary, etc.
        const bytes = await flyerFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generate a unique filename
        const timestamp = Date.now()
        const filename = `flyer_${timestamp}_${flyerFile.name}`
        
        // Save to public/uploads directory (you'll need to create this)
        const fs = require('fs')
        const path = require('path')
        
        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }
        
        const filePath = path.join(uploadsDir, filename)
        fs.writeFileSync(filePath, buffer)
        
        flyerUrl = `/uploads/${filename}`
      } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json({ error: "Failed to upload flyer" }, { status: 500 })
      }
    }

    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        fullDescription: eventData.fullDescription || eventData.description,
        categoryId: eventData.categoryId || null,
        startDate: new Date(eventData.startDate),
        endDate: eventData.endDate ? new Date(eventData.endDate) : new Date(eventData.startDate),
        location: eventData.location,
        venue: eventData.venue || eventData.location,
        price: parseFloat(eventData.price) || 0,
        currency: eventData.currency || "RWF",
        speakers: eventData.speakers ? JSON.parse(eventData.speakers) : [],
        agenda: eventData.agenda ? JSON.parse(eventData.agenda) : [],
        requirements: eventData.requirements ? JSON.parse(eventData.requirements) : [],
        gallery: eventData.gallery ? JSON.parse(eventData.gallery) : [],
        flyer: flyerUrl,
        isPublished: eventData.isPublished === 'true',
        isFeatured: eventData.isFeatured === 'true',
        organizerId: user.id,
      },
      include: {
        organizer: true,
        category: true,
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
