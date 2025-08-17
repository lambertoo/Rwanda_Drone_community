import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

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
  // Create the directory structure using actual entity ID
  const uploadDir = path.join(process.cwd(), 'public', 'uploads', type, entityId, subfolder)
  await mkdir(uploadDir, { recursive: true })

  // Generate unique filename while preserving extension
  const extension = path.extname(file.originalName)
  const baseName = path.basename(file.originalName, extension)
  const uniqueId = uuidv4().substring(0, 8)
  const filename = `${baseName}_${uniqueId}${extension}`

  // Full file path
  const filePath = path.join(uploadDir, filename)

  // Write file
  await writeFile(filePath, file.buffer)

  // Return file info
  return {
    filename,
    url: `/uploads/${type}/${entityId}/${subfolder}/${filename}`,
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
  return path.join(process.cwd(), 'public', 'uploads', type, entityId, subfolder)
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