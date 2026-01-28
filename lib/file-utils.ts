import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { 
  buildSecureUploadPath, 
  sanitizeFilename, 
  sanitizePathComponent 
} from './path-security'

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
 * Organize a single file upload into the proper directory structure
 */
export async function organizeFileUpload(
  file: UploadedFile,
  type: 'projects' | 'events' | 'forum' | 'opportunity' | 'general',
  entityId: string,
  subfolder: 'images' | 'resources' = 'images'
): Promise<OrganizedFile> {
  // Security: Sanitize entityId to prevent path traversal (CVE-2025-55130)
  const sanitizedEntityId = sanitizePathComponent(entityId)
  
  // Security: Build secure upload path with symlink protection
  const uploadDir = await buildSecureUploadPath(type, sanitizedEntityId, subfolder)
  await mkdir(uploadDir, { recursive: true })

  // Security: Sanitize filename to prevent path traversal
  const sanitizedOriginalName = sanitizeFilename(file.originalName)
  const extension = path.extname(sanitizedOriginalName)
  const baseName = path.basename(sanitizedOriginalName, extension)
  
  // Additional sanitization for base name
  const safeBaseName = baseName
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'file'
  
  const uniqueId = uuidv4().substring(0, 8)
  const filename = `${safeBaseName}_${uniqueId}${extension}`

  // Full file path (already validated by buildSecureUploadPath)
  const filePath = path.join(uploadDir, filename)

  // Write file
  await writeFile(filePath, file.buffer)

  // Return file info (using sanitized entityId)
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