import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'image', 'resource', etc.
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate file size (5MB for images, 10MB for resources)
    const maxSize = type === 'image' ? 5 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const allowedResourceTypes = [
      'application/pdf', 'application/zip', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv'
    ]
    
    if (type === 'image' && !allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid image type. Allowed: JPEG, PNG, GIF, WebP. Received: ${file.type}` },
        { status: 400 }
      )
    }
    
    if (type === 'resource' && !allowedResourceTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid resource type. Allowed: PDF, ZIP, Word, Excel, PowerPoint, TXT, CSV. Received: ${file.type}` },
        { status: 400 }
      )
    }

    // Get entity ID and subfolder from form data
    const entityId = formData.get('entityId') as string || 'general'
    const subfolder = formData.get('subfolder') as string || type
    
    // Create upload directory with new structure
    const uploadDir = join(process.cwd(), 'public', 'uploads', type, entityId, subfolder)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename while preserving original name
    const fileExtension = file.name.split('.').pop()
    const baseName = file.name.substring(0, file.name.lastIndexOf('.'))
    
    // Sanitize filename: replace spaces with underscores and remove special characters
    const sanitizedBaseName = baseName
      .replace(/\s+/g, '_')           // Replace spaces with underscores
      .replace(/[^a-zA-Z0-9_-]/g, '') // Remove special characters except underscore and dash
      .replace(/_+/g, '_')            // Replace multiple underscores with single
      .replace(/^_+|_+$/g, '')        // Remove leading/trailing underscores
    
    const uniqueId = uuidv4().substring(0, 8)
    const fileName = `${sanitizedBaseName}_${uniqueId}.${fileExtension}`
    const filePath = join(uploadDir, fileName)

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return the file URL with new structure
    const fileUrl = `/uploads/${type}/${entityId}/${subfolder}/${fileName}`
    
    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: fileName, // This should be the sanitized filename
      originalName: file.name,
      size: file.size,
      type: file.type,
      entityId: entityId,
      subfolder
    })

  } catch (error) {
    console.error('File upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
} 