/**
 * Backblaze B2 storage utilities
 * Uses B2 Native API (supports Master Application Key)
 */

import B2 from 'backblaze-b2'
import { sanitizePathComponent, sanitizeFilename, ALLOWED_UPLOAD_TYPES, ALLOWED_SUBFOLDERS } from './path-security'
import path from 'path'

// B2 client - initialized lazily
let b2Instance: B2 | null = null

function getB2Config() {
  const keyId = process.env.B2_APPLICATION_KEY_ID || process.env.keyID
  const appKey = process.env.B2_APPLICATION_KEY || process.env.applicationKey
  const bucketId = process.env.B2_BUCKET_ID
  const bucketName = process.env.B2_BUCKET_NAME

  return { keyId, appKey, bucketId, bucketName }
}

function isB2Configured(): boolean {
  const { keyId, appKey, bucketId, bucketName } = getB2Config()
  return !!(keyId && appKey && bucketId && bucketName)
}

async function getB2Client(): Promise<B2> {
  if (b2Instance) return b2Instance

  const { keyId, appKey } = getB2Config()
  if (!keyId || !appKey) {
    throw new Error('B2 storage not configured: B2_APPLICATION_KEY_ID and B2_APPLICATION_KEY are required')
  }

  b2Instance = new B2({
    applicationKeyId: keyId,
    applicationKey: appKey,
  })

  await b2Instance.authorize()
  return b2Instance
}

/**
 * Build the storage key (path) for a file in B2
 * Format: uploads/{type}/{entityId}/{subfolder}/{filename}
 */
function buildStorageKey(
  type: string,
  entityId: string,
  subfolder: string,
  filename: string
): string {
  const sanitizedType = ALLOWED_UPLOAD_TYPES.includes(type as typeof ALLOWED_UPLOAD_TYPES[number])
    ? type
    : 'general'
  const sanitizedEntityId = sanitizePathComponent(entityId)
  const sanitizedSubfolder = ALLOWED_SUBFOLDERS.includes(subfolder as typeof ALLOWED_SUBFOLDERS[number])
    ? subfolder
    : 'images'
  return `uploads/${sanitizedType}/${sanitizedEntityId}/${sanitizedSubfolder}/${filename}`
}

/**
 * Get the public URL for a file in B2
 * Requires bucket to be allPublic
 */
function getPublicUrl(storageKey: string): string {
  const bucketName = process.env.B2_BUCKET_NAME
  if (!bucketName) {
    throw new Error('B2_BUCKET_NAME is required for public URLs')
  }

  // B2 public URL format: https://f004.backblazeb2.com/file/{bucketName}/{fileName}
  const endpoint = process.env.B2_PUBLIC_URL || 'https://f004.backblazeb2.com'
  const baseUrl = endpoint.replace(/\/$/, '')
  return `${baseUrl}/file/${bucketName}/${storageKey}`
}

export interface B2UploadResult {
  fileUrl: string
  fileName: string
  storageKey: string
  originalName: string
  size: number
  type: string
  entityId: string
  subfolder: string
}

/**
 * Upload a file buffer to Backblaze B2
 */
export async function uploadToB2(
  buffer: Buffer,
  options: {
    originalName: string
    mimeType: string
    type: string
    entityId: string
    subfolder: 'images' | 'resources'
  }
): Promise<B2UploadResult> {
  const { keyId, appKey, bucketId, bucketName } = getB2Config()
  if (!keyId || !appKey || !bucketId || !bucketName) {
    throw new Error(
      'B2 storage not configured. Set B2_APPLICATION_KEY_ID, B2_APPLICATION_KEY, B2_BUCKET_ID, and B2_BUCKET_NAME in .env'
    )
  }

  const entityId = sanitizePathComponent(options.entityId)
  const sanitizedFilename = sanitizeFilename(options.originalName)
  const extension = path.extname(sanitizedFilename) || '.bin'
  const baseName = path.basename(sanitizedFilename, extension)
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '') || 'file'
  const uniqueId = Math.random().toString(36).substring(2, 10)
  const fileName = `${baseName}_${uniqueId}${extension}`

  const storageKey = buildStorageKey(options.type, entityId, options.subfolder, fileName)

  const b2 = await getB2Client()
  const uploadUrlResponse = await b2.getUploadUrl({ bucketId })

  const { uploadUrl, authorizationToken } = uploadUrlResponse.data

  await b2.uploadFile({
    uploadUrl,
    uploadAuthToken: authorizationToken,
    fileName: storageKey,
    data: buffer,
    mime: options.mimeType || 'application/octet-stream',
  })

  const fileUrl = getPublicUrl(storageKey)

  return {
    fileUrl,
    fileName,
    storageKey,
    originalName: options.originalName,
    size: buffer.length,
    type: options.mimeType,
    entityId,
    subfolder: options.subfolder,
  }
}

/**
 * Copy a file within B2 (e.g. from temp to project folder)
 * Uses download + upload since B2 Native API copy may not be in the library
 */
export async function copyInB2(
  sourceStorageKey: string,
  destStorageKey: string
): Promise<string> {
  const { bucketId, bucketName } = getB2Config()
  if (!bucketId || !bucketName) {
    throw new Error('B2_BUCKET_ID and B2_BUCKET_NAME are required')
  }

  const b2 = await getB2Client()
  const downloadResponse = await b2.downloadFileByName({
    bucketName,
    fileName: sourceStorageKey,
    responseType: 'arraybuffer',
  })

  const buffer = Buffer.from(downloadResponse.data as ArrayBuffer)
  const uploadUrlResponse = await b2.getUploadUrl({ bucketId })
  const { uploadUrl, authorizationToken } = uploadUrlResponse.data

  await b2.uploadFile({
    uploadUrl,
    uploadAuthToken: authorizationToken,
    fileName: destStorageKey,
    data: buffer,
    mime: 'application/octet-stream',
  })

  return getPublicUrl(destStorageKey)
}

/**
 * Check if a URL is a B2 URL (vs local /uploads/ path)
 */
export function isB2Url(url: string): boolean {
  return url.includes('backblazeb2.com') || url.startsWith('http')
}

/**
 * Extract storage key from B2 URL, or null if not a B2 URL
 */
export function getStorageKeyFromB2Url(url: string): string | null {
  if (!url.includes('backblazeb2.com')) return null
  try {
    const match = url.match(/\/file\/[^/]+\/(.+)$/)
    return match ? decodeURIComponent(match[1]) : null
  } catch {
    return null
  }
}

export { isB2Configured, getPublicUrl, buildStorageKey }
