import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getCurrentUser, canCreateEvents } from "@/lib/auth"

// READ - Get a single event (PUBLIC - no authentication required)
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

    // Parse JSON fields before returning
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

    const parsedEvent = {
      ...event,
      speakers: parseJsonField(event.speakers),
      agenda: parseJsonField(event.agenda),
      requirements: parseJsonField(event.requirements),
      gallery: parseJsonField(event.gallery),
      tags: parseJsonField(event.tags)
    }

    return NextResponse.json({ event: parsedEvent })
  } catch (error) {
    console.error("Error fetching event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// UPDATE - Update an event (REQUIRES AUTHENTICATION)
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Authenticate user
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user can create events
    if (!canCreateEvents(currentUser)) {
      return NextResponse.json({ error: "Insufficient permissions to edit events" }, { status: 403 })
    }

    // Check if event exists and user owns it
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { organizer: true }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (existingEvent.organizerId !== currentUser.id && currentUser.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
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
        capacity: formData.get('capacity') as string,
        price: formData.get('price') as string,
        currency: formData.get('currency') as string,
        registrationDeadline: formData.get('registrationDeadline') as string,
        allowRegistration: formData.get('allowRegistration') as string,
        isPublished: formData.get('isPublished') as string,
        isFeatured: formData.get('isFeatured') as string,
        speakers: formData.get('speakers') as string,
        agenda: formData.get('agenda') as string,
        requirements: formData.get('requirements') as string,
        gallery: formData.get('gallery') as string,
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

        const bytes = await flyerFile.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate a unique filename with timestamp and random string
        const timestamp = Date.now()
        const randomString = Math.random().toString(36).substring(2, 15)
        const fileExtension = flyerFile.name.split('.').pop()
        const safeFilename = `flyer_${timestamp}_${randomString}.${fileExtension}`

        // Save to public/uploads directory
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

    const updateData: any = {
      title: eventData.title,
      description: eventData.description,
      fullDescription: eventData.fullDescription || eventData.description,
      categoryId: eventData.categoryId || null,
      startDate: new Date(eventData.startDate),
      endDate: eventData.endDate ? new Date(eventData.endDate) : new Date(eventData.startDate),
      location: eventData.location,
      venue: eventData.venue || eventData.location,
      capacity: eventData.capacity ? parseInt(eventData.capacity) : null,
      price: parseFloat(eventData.price) || 0,
      currency: eventData.currency || "RWF",
      registrationDeadline: eventData.registrationDeadline ? new Date(eventData.registrationDeadline) : null,
      allowRegistration: eventData.allowRegistration === 'true',
      isPublished: eventData.isPublished === 'true',
      isFeatured: eventData.isFeatured === 'true',
      speakers: eventData.speakers ? JSON.parse(eventData.speakers) : [],
      agenda: eventData.agenda ? JSON.parse(eventData.agenda) : [],
      requirements: eventData.requirements ? JSON.parse(eventData.requirements) : [],
      gallery: eventData.gallery ? JSON.parse(eventData.gallery) : [],
      updatedAt: new Date(),
    }

    // Only update flyer if a new one was uploaded
    if (flyerUrl) {
      updateData.flyer = flyerUrl
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: updateData,
      include: {
        organizer: true,
        category: true,
      }
    })

    // Parse JSON fields before returning
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

    const parsedEvent = {
      ...updatedEvent,
      speakers: parseJsonField(updatedEvent.speakers),
      agenda: parseJsonField(updatedEvent.agenda),
      requirements: parseJsonField(updatedEvent.requirements),
      gallery: parseJsonField(updatedEvent.gallery),
      tags: parseJsonField(updatedEvent.tags)
    }

    return NextResponse.json({ event: parsedEvent })
  } catch (error) {
    console.error("Error updating event:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete an event (REQUIRES AUTHENTICATION)
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    
    // Authenticate user
    const currentUser = await getCurrentUser()
    if (!currentUser) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Check if user can create events
    if (!canCreateEvents(currentUser)) {
      return NextResponse.json({ error: "Insufficient permissions to delete events" }, { status: 403 })
    }

    // Check if event exists and user owns it
    const existingEvent = await prisma.event.findUnique({
      where: { id },
      include: { organizer: true }
    })

    if (!existingEvent) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (existingEvent.organizerId !== currentUser.id && currentUser.role !== "admin") {
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
