import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export interface FileUploadInfo {
  originalName: string
  fileName: string
  filePath: string
  fileSize: string
  fileType: string
  fileUrl: string
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export function detectFileType(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  const typeMap: { [key: string]: string } = {
    'pdf': 'PDF',
    'doc': 'Word',
    'docx': 'Word',
    'xls': 'Excel',
    'xlsx': 'Excel',
    'ppt': 'PowerPoint',
    'pptx': 'PowerPoint',
    'mp4': 'Video',
    'avi': 'Video',
    'mov': 'Video',
    'wmv': 'Video',
    'mp3': 'Audio',
    'wav': 'Audio',
    'jpg': 'Image',
    'jpeg': 'Image',
    'png': 'Image',
    'gif': 'Image',
    'txt': 'Text',
    'zip': 'Archive',
    'rar': 'Archive'
  }
  
  return typeMap[extension || ''] || 'Other'
}

export async function saveUploadedFile(
  file: File,
  uploadDir: string = 'uploads/resources'
): Promise<FileUploadInfo> {
  try {
    // Create upload directory if it doesn't exist
    await mkdir(uploadDir, { recursive: true })
    
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Generate unique filename
    const timestamp = Date.now()
    const originalName = file.name
    const extension = originalName.split('.').pop()
    const fileName = `resource_${timestamp}.${extension}`
    const filePath = join(uploadDir, fileName)
    
    // Save file
    await writeFile(filePath, buffer)
    
    // Calculate file size
    const fileSize = formatFileSize(buffer.length)
    
    // Detect file type
    const fileType = detectFileType(originalName)
    
    // Generate file URL (in production, this would be your CDN or storage service URL)
    const fileUrl = `/uploads/resources/${fileName}`
    
    return {
      originalName,
      fileName,
      filePath,
      fileSize,
      fileType,
      fileUrl
    }
  } catch (error) {
    console.error('Error saving uploaded file:', error)
    throw new Error('Failed to save uploaded file')
  }
}

export async function processFileUrl(url: string): Promise<{ fileSize: string; fileType: string }> {
  try {
    // For external URLs, we can't always determine the exact file size
    // But we can try to get headers or estimate based on URL patterns
    const response = await fetch(url, { method: 'HEAD' })
    
    if (response.ok) {
      const contentLength = response.headers.get('content-length')
      const contentType = response.headers.get('content-type')
      
      let fileSize = 'Unknown'
      if (contentLength) {
        fileSize = formatFileSize(parseInt(contentLength))
      }
      
      let fileType = 'Other'
      if (contentType) {
        if (contentType.includes('pdf')) fileType = 'PDF'
        else if (contentType.includes('video')) fileType = 'Video'
        else if (contentType.includes('audio')) fileType = 'Audio'
        else if (contentType.includes('image')) fileType = 'Image'
        else if (contentType.includes('spreadsheet')) fileType = 'Excel'
        else if (contentType.includes('document')) fileType = 'Word'
        else if (contentType.includes('presentation')) fileType = 'PowerPoint'
      }
      
      return { fileSize, fileType }
    }
    
    // Fallback: try to detect from URL
    const urlParts = url.split('.')
    const extension = urlParts[urlParts.length - 1]?.toLowerCase()
    const fileType = detectFileType(`file.${extension}`)
    
    return { fileSize: 'Unknown', fileType }
  } catch (error) {
    console.error('Error processing file URL:', error)
    // Fallback: detect from URL extension
    const urlParts = url.split('.')
    const extension = urlParts[urlParts.length - 1]?.toLowerCase()
    const fileType = detectFileType(`file.${extension}`)
    
    return { fileSize: 'Unknown', fileType }
  }
} 