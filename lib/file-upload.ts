// Browser-compatible file upload utilities
// Note: File saving is handled server-side via API routes

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

export async function processFileUrl(url: string): Promise<{ fileSize: string; fileType: string }> {
  try {
    // For external URLs, we can't always determine the exact file size
    // But we can try to get headers or estimate based on URL patterns
    const response = await fetch(url, { method: 'HEAD' })
    
    if (!response.ok) {
      throw new Error('Failed to fetch file information')
    }
    
    const contentType = response.headers.get('content-type') || ''
    const contentLength = response.headers.get('content-length')
    
    // Determine file type from content type
    let fileType = 'Other'
    if (contentType.includes('pdf')) fileType = 'PDF'
    else if (contentType.includes('word') || contentType.includes('document')) fileType = 'Word'
    else if (contentType.includes('excel') || contentType.includes('spreadsheet')) fileType = 'Excel'
    else if (contentType.includes('powerpoint') || contentType.includes('presentation')) fileType = 'PowerPoint'
    else if (contentType.includes('video')) fileType = 'Video'
    else if (contentType.includes('audio')) fileType = 'Audio'
    else if (contentType.includes('image')) fileType = 'Image'
    else if (contentType.includes('text')) fileType = 'Text'
    else if (contentType.includes('zip') || contentType.includes('rar')) fileType = 'Archive'
    
    // Format file size if available
    const fileSize = contentLength ? formatFileSize(parseInt(contentLength)) : 'Unknown'
    
    return { fileSize, fileType }
  } catch (error) {
    console.error('Error processing file URL:', error)
    return { fileSize: 'Unknown', fileType: 'Other' }
  }
}

export function validateFile(file: File, maxSize: number = 100 * 1024 * 1024): { isValid: boolean; error?: string } {
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `File size exceeds maximum limit of ${formatFileSize(maxSize)}`
    }
  }
  
  return { isValid: true }
}

export function getFileExtension(fileName: string): string {
  return fileName.split('.').pop()?.toLowerCase() || ''
}

export function isImageFile(fileName: string): boolean {
  const extension = getFileExtension(fileName)
  return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(extension)
}

export function isVideoFile(fileName: string): boolean {
  const extension = getFileExtension(fileName)
  return ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension)
}

export function isAudioFile(fileName: string): boolean {
  const extension = getFileExtension(fileName)
  return ['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(extension)
}

export function isDocumentFile(fileName: string): boolean {
  const extension = getFileExtension(fileName)
  return ['pdf', 'doc', 'docx', 'txt', 'rtf'].includes(extension)
} 