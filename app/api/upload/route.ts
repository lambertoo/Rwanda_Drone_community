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
import { uploadToB2, isB2Configured } from '@/lib/b2-storage'

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

    // Get entity ID and type from form data with security validation
    const rawEntityId = formData.get('entityId') as string || 'general'
    const rawType = formData.get('type') as string || 'general'
    
    // Security: Validate upload type
    let uploadType: typeof ALLOWED_UPLOAD_TYPES[number]
    try {
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
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Use Backblaze B2 if configured
    if (isB2Configured()) {
      const result = await uploadToB2(buffer, {
        originalName: file.name,
        mimeType: file.type || 'application/octet-stream',
        type: uploadType,
        entityId,
        subfolder,
      })

      return NextResponse.json({
        success: true,
        fileUrl: result.fileUrl,
        fileName: result.fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
        entityId: result.entityId,
        subfolder,
      })
    }

    // Fallback: local filesystem (for development / when B2 not configured)
    const uploadDir = await buildSecureUploadPath(uploadType, entityId, subfolder)
    
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    const sanitizedFilename = sanitizeFilename(file.name)
    const fileExtension = sanitizedFilename.split('.').pop() || 'bin'
    const baseName = sanitizedFilename.substring(0, sanitizedFilename.lastIndexOf('.')) || 'file'
    
    const sanitizedBaseName = baseName
      .replace(/\s+/g, '_')
      .replace(/[^a-zA-Z0-9_-]/g, '')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '') || 'file'
    
    const uniqueId = uuidv4().substring(0, 8)
    const fileName = `${sanitizedBaseName}_${uniqueId}.${fileExtension}`
    
    const filePath = `${uploadDir}/${fileName}`
    
    const baseUploadDir = `${process.cwd()}/public/uploads`
    if (!filePath.startsWith(baseUploadDir)) {
      return NextResponse.json(
        { error: 'Invalid file path detected' },
        { status: 400 }
      )
    }

    await writeFile(filePath, buffer)

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

  } catch (error: unknown) {
    console.error('File upload error:', error)
    
    const err = error as Error
    const errorMessage = err?.message?.includes('traversal') || 
                        err?.message?.includes('Invalid') ||
                        err?.message?.includes('symlink')
      ? err.message
      : 'Failed to upload file'
    
    return NextResponse.json(
      { error: errorMessage },
      { status: err?.message?.includes('traversal') || err?.message?.includes('Invalid') ? 400 : 500 }
    )
  }
}
