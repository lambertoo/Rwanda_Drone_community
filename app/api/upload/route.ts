import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { 
  buildSecureUploadPath, 
  sanitizeFilename, 
  sanitizePathComponent,
  ALLOWED_UPLOAD_TYPES 
} from '@/lib/path-security'

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

    // Validate file type first
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const allowedResourceTypes = [
      'application/pdf', 'application/zip', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/plain', 'text/csv'
    ]
    
    // Check if it's an image file (regardless of type parameter)
    const isImageFile = allowedImageTypes.includes(file.type)
    const isResourceFile = allowedResourceTypes.includes(file.type)
    
    if (isImageFile && !isResourceFile) {
      // This is an image file, allow it regardless of type parameter
    } else if (isResourceFile) {
      // This is a resource file, allow it regardless of type parameter
    } else {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: Images (JPEG, PNG, GIF, WebP) or Resources (PDF, ZIP, Word, Excel, PowerPoint, TXT, CSV). Received: ${file.type}` },
        { status: 400 }
      )
    }

    // Validate file size (5MB for images, 10MB for resources)
    const maxSize = isImageFile ? 5 * 1024 * 1024 : 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: `File size must be less than ${maxSize / (1024 * 1024)}MB` },
        { status: 400 }
      )
    }

    // Get entity ID and subfolder from form data with security validation
    const rawEntityId = formData.get('entityId') as string || 'general'
    const rawType = formData.get('type') as string || 'general'
    const rawSubfolder = formData.get('subfolder') as string || (isImageFile ? 'images' : 'resources')
    
    // Security: Validate and sanitize all path components to prevent CVE-2025-55130 (symlink attacks)
    let uploadType: typeof ALLOWED_UPLOAD_TYPES[number]
    try {
      // Map 'image'/'resource' to 'general' if needed, or use provided type
      if (ALLOWED_UPLOAD_TYPES.includes(rawType as typeof ALLOWED_UPLOAD_TYPES[number])) {
        uploadType = rawType as typeof ALLOWED_UPLOAD_TYPES[number]
      } else {
        uploadType = 'general'
      }
    } catch {
      uploadType = 'general'
    }
    
    const entityId = sanitizePathComponent(rawEntityId)
    const subfolder = isImageFile ? 'images' : 'resources'
    
    // Build secure upload path with symlink protection
    const uploadDir = await buildSecureUploadPath(uploadType, entityId, subfolder)
    
    // Create directory if it doesn't exist
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Security: Sanitize filename to prevent path traversal
    const sanitizedFilename = sanitizeFilename(file.name)
    const fileExtension = sanitizedFilename.split('.').pop() || 'bin'
    const baseName = sanitizedFilename.substring(0, sanitizedFilename.lastIndexOf('.')) || 'file'
    
    // Additional sanitization for base name
    const sanitizedBaseName = baseName
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '') || 'file'
    
    const uniqueId = uuidv4().substring(0, 8)
    const fileName = `${sanitizedBaseName}_${uniqueId}.${fileExtension}`
    
    // Build final file path and validate it's within the upload directory
    const filePath = `${uploadDir}/${fileName}`
    
    // Final security check: ensure the file path is still within the upload directory
    const baseUploadDir = `${process.cwd()}/public/uploads`
    if (!filePath.startsWith(baseUploadDir)) {
      return NextResponse.json(
        { error: 'Invalid file path detected' },
        { status: 400 }
      )
    }

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Return the file URL with new structure (using sanitized values)
    const fileUrl = `/uploads/${uploadType}/${entityId}/${subfolder}/${fileName}`
    
    return NextResponse.json({
      success: true,
      fileUrl,
      fileName: fileName,
      originalName: file.name,
      size: file.size,
      type: file.type,
      entityId: entityId,
      subfolder
    })

  } catch (error: any) {
    console.error('File upload error:', error)
    
    // Don't expose internal error details to clients
    const errorMessage = error?.message?.includes('traversal') || 
                        error?.message?.includes('Invalid') ||
                        error?.message?.includes('symlink')
      ? error.message
      : 'Failed to upload file'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: error?.message?.includes('traversal') || error?.message?.includes('Invalid') ? 400 : 500 }
    )
  }
} 