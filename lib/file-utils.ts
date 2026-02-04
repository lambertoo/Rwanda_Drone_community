import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { 
  buildSecureUploadPath, 
  sanitizeFilename, 
  sanitizePathComponent 
} from './path-security'
import { uploadToB2, isB2Configured } from './b2-storage'

export interface UploadedFile {
  originalName: string
  buffer: Buffer
  mimetype: string
  size: number
}

export interface OrganizedFile {
  filename: string
  url: string
  originalName: string
  fileType: string
  size: number
}

/**
 * Organize a single file upload - uses B2 if configured, otherwise local filesystem
 */
export async function organizeFileUpload(
  file: UploadedFile,
  type: 'projects' | 'events' | 'forum' | 'opportunity' | 'general',
  entityId: string,
  subfolder: 'images' | 'resources' = 'images'
): Promise<OrganizedFile> {
  const sanitizedEntityId = sanitizePathComponent(entityId)

  if (isB2Configured()) {
    const result = await uploadToB2(file.buffer, {
      originalName: file.originalName,
      mimeType: file.mimetype,
      type,
      entityId: sanitizedEntityId,
      subfolder,
    })
    return {
      filename: result.fileName,
      url: result.fileUrl,
      originalName: file.originalName,
      fileType: file.mimetype,
      size: file.size,
    }
  }

  const uploadDir = await buildSecureUploadPath(type, sanitizedEntityId, subfolder)
  await mkdir(uploadDir, { recursive: true })

  const sanitizedOriginalName = sanitizeFilename(file.originalName)
  const extension = path.extname(sanitizedOriginalName)
  const baseName = path.basename(sanitizedOriginalName, extension)
  
  const safeBaseName = baseName
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'file'
  
  const uniqueId = uuidv4().substring(0, 8)
  const filename = `${safeBaseName}_${uniqueId}${extension}`

  const filePath = path.join(uploadDir, filename)
  await writeFile(filePath, file.buffer)

  return {
    filename,
    url: `/uploads/${type}/${sanitizedEntityId}/${subfolder}/${filename}`,
    originalName: file.originalName,
    fileType: file.mimetype,
    size: file.size
  }
}

/**
 * Organize multiple file uploads
 */
export async function organizeMultipleFiles(
  files: UploadedFile[],
  type: 'projects' | 'events' | 'forum' | 'opportunity' | 'general',
  entityId: string,
  subfolder: 'images' | 'resources' = 'images'
): Promise<OrganizedFile[]> {
  const organizedFiles: OrganizedFile[] = []
  
  for (const file of files) {
    try {
      const organizedFile = await organizeFileUpload(file, type, entityId, subfolder)
      organizedFiles.push(organizedFile)
    } catch (error) {
      console.error(`Failed to organize file ${file.originalName}:`, error)
    }
  }
  
  return organizedFiles
}

/**
 * Get the upload path for a specific entity and file type
 */
export function getUploadPath(
  type: 'projects' | 'events' | 'forum' | 'opportunity' | 'general',
  entityId: string,
  subfolder: 'images' | 'resources' = 'images'
): string {
  // Security: Sanitize entityId before building path
  const sanitizedEntityId = sanitizePathComponent(entityId)
  return path.join(process.cwd(), 'public', 'uploads', type, sanitizedEntityId, subfolder)
}

/**
 * Clean up temporary files
 */
export async function cleanupTempFiles(filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    try {
      await writeFile(filePath, '') // Clear file content
    } catch (error) {
      console.error(`Failed to cleanup temp file ${filePath}:`, error)
    }
  }
} 