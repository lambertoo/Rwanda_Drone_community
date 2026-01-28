import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, canCreateEvents } from "@/lib/auth"
import { parseLimit, parseOffset } from "@/lib/query-params"

// READ - Get all events
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get("upcoming") === "true"
    const adminMode = searchParams.get("admin") === "true"
    const limit = parseLimit(searchParams.get("limit"), 50)
    const offset = parseOffset(searchParams.get("offset"))

    let events
    if (upcoming) {
      events = await prisma.event.findMany({
        where: {
          startDate: {
            gte: new Date()
          },
          ...(adminMode ? {} : { isApproved: true })
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
        where: {
          ...(adminMode ? {} : { isApproved: true })
        },
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
    // Authenticate user
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user can create events
    if (!canCreateEvents(currentUser)) {
      return NextResponse.json({ error: "Insufficient permissions to create events" }, { status: 403 })
    }

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



    if (!eventData.title || !eventData.description || !eventData.startDate || !eventData.location) {
      return NextResponse.json({ error: "Title, description, start date, and location are required" }, { status: 400 })
    }

    // Handle file upload if flyer is provided
    let flyerUrl: string | null = null
    if (flyerFile) {
      try {
        // Security: Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
        if (!allowedTypes.includes(flyerFile.type)) {
          return NextResponse.json({ 
            error: "Invalid file type. Only JPEG, PNG, GIF, and WebP images are allowed." 
          }, { status: 400 })
        }

        // Security: Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (flyerFile.size > maxSize) {
          return NextResponse.json({ 
            error: "File too large. Maximum size is 5MB." 
          }, { status: 400 })
        }

        // Security: Validate filename
        const filename = flyerFile.name.toLowerCase()
        if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
          return NextResponse.json({ 
            error: "Invalid filename." 
          }, { status: 400 })
        }

        // For now, we'll store the file in a simple way
        // In production, you'd want to use a proper file storage service like AWS S3, Cloudinary, etc.
        const bytes = await flyerFile.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generate a unique filename with timestamp and random string
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = flyerFile.name.split('.').pop()
        const safeFilename = `flyer_${timestamp}_${randomString}.${fileExtension}`
        
        // Save to public/uploads directory (you'll need to create this)
        const fs = require('fs')
        const path = require('path')
        
        // Ensure uploads directory exists
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true })
        }
        
        const filePath = path.join(uploadsDir, safeFilename)
        fs.writeFileSync(filePath, buffer)
        
        flyerUrl = `/uploads/${safeFilename}`
      } catch (error) {
        console.error('Error uploading file:', error)
        return NextResponse.json({ error: "Failed to upload flyer" }, { status: 500 })
      }
    }

    // Validate and parse dates
    const startDate = new Date(eventData.startDate)
    if (isNaN(startDate.getTime())) {
      return NextResponse.json({ error: "Invalid start date format" }, { status: 400 })
    }

    let endDate = startDate // Default to start date
    if (eventData.endDate && eventData.endDate !== '') {
      const parsedEndDate = new Date(eventData.endDate)
      if (!isNaN(parsedEndDate.getTime())) {
        endDate = parsedEndDate
      }
    }

    const event = await prisma.event.create({
      data: {
        title: eventData.title,
        description: eventData.description,
        fullDescription: eventData.fullDescription || eventData.description,
        categoryId: eventData.categoryId || null,
        startDate: startDate,
        endDate: endDate,
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
        organizerId: currentUser.id, // Use authenticated user's ID
      },
      include: {
        organizer: true,
        category: true,
      }
    })

    // Update user's events count
    await prisma.user.update({
      where: { id: currentUser.id },
      data: { eventsCount: { increment: 1 } }
    })

    return NextResponse.json({ event }, { status: 201 })
  } catch (error) {
    console.error("Error creating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
