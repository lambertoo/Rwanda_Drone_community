/**
 * Path Security Utilities
 * 
 * Protects against CVE-2025-55130: Bypass File System Permissions using crafted symlinks
 * and other path traversal attacks.
 * 
 * Reference: https://nodejs.org/en/blog/vulnerability/december-2025-security-releases
 */

import path from 'path'
import { realpathSync, lstatSync } from 'fs'
import { realpath, lstat } from 'fs/promises'

/**
 * Allowed upload types - whitelist approach
 */
export const ALLOWED_UPLOAD_TYPES = ['projects', 'events', 'forum', 'opportunity', 'general'] as const
export const ALLOWED_SUBFOLDERS = ['images', 'resources'] as const

/**
 * Validates and sanitizes a path component to prevent directory traversal
 * @param component - Path component to validate
 * @returns Sanitized component or throws error if invalid
 */
export function sanitizePathComponent(component: string): string {
  if (!component || typeof component !== 'string') {
    throw new Error('Invalid path component: must be a non-empty string')
  }

  // Remove any path separators, null bytes, and control characters
  const sanitized = component
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .trim()

  // Validate it's not empty and doesn't contain dangerous patterns
  if (!sanitized || sanitized.length === 0) {
    throw new Error('Invalid path component: cannot be empty after sanitization')
  }

  if (sanitized.length > 255) {
    throw new Error('Invalid path component: exceeds maximum length')
  }

  // Check for dangerous patterns
  if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.includes('~')) {
    throw new Error('Invalid path component: contains dangerous patterns')
  }

  return sanitized
}

/**
 * Validates that a path is within the allowed base directory
 * and resolves symlinks to prevent CVE-2025-55130
 * @param filePath - Full file path to validate
 * @param baseDir - Base directory that the path must be within
 * @returns Resolved real path if valid, throws error if invalid
 */
export async function validateAndResolvePath(filePath: string, baseDir: string): Promise<string> {
  // Resolve both paths to absolute paths
  const resolvedBase = path.resolve(baseDir)
  const resolvedPath = path.resolve(filePath)

  // Check that the resolved path starts with the base directory
  if (!resolvedPath.startsWith(resolvedBase + path.sep) && resolvedPath !== resolvedBase) {
    throw new Error(`Path traversal detected: ${filePath} is outside allowed directory`)
  }

  // Resolve symlinks to prevent symlink-based attacks (CVE-2025-55130)
  let realPath: string
  try {
    realPath = await realpath(resolvedPath)
  } catch (error) {
    // If realpath fails, check if it's because the file doesn't exist yet
    // In that case, resolve the parent directory
    const parentDir = path.dirname(resolvedPath)
    try {
      const realParent = await realpath(parentDir)
      realPath = path.join(realParent, path.basename(resolvedPath))
    } catch {
      throw new Error(`Cannot resolve path: ${filePath}`)
    }
  }

  // Verify the resolved real path is still within the base directory
  const resolvedRealBase = await realpath(resolvedBase)
  if (!realPath.startsWith(resolvedRealBase + path.sep) && realPath !== resolvedRealBase) {
    throw new Error(`Symlink traversal detected: ${realPath} escapes allowed directory`)
  }

  return realPath
}

/**
 * Synchronous version of validateAndResolvePath
 */
export function validateAndResolvePathSync(filePath: string, baseDir: string): string {
  const resolvedBase = path.resolve(baseDir)
  const resolvedPath = path.resolve(filePath)

  if (!resolvedPath.startsWith(resolvedBase + path.sep) && resolvedPath !== resolvedBase) {
    throw new Error(`Path traversal detected: ${filePath} is outside allowed directory`)
  }

  let realPath: string
  try {
    realPath = realpathSync(resolvedPath)
  } catch (error) {
    const parentDir = path.dirname(resolvedPath)
    try {
      const realParent = realpathSync(parentDir)
      realPath = path.join(realParent, path.basename(resolvedPath))
    } catch {
      throw new Error(`Cannot resolve path: ${filePath}`)
    }
  }

  const resolvedRealBase = realpathSync(resolvedBase)
  if (!realPath.startsWith(resolvedRealBase + path.sep) && realPath !== resolvedRealBase) {
    throw new Error(`Symlink traversal detected: ${realPath} escapes allowed directory`)
  }

  return realPath
}

/**
 * Builds a secure upload path by validating all components
 * @param type - Upload type (must be in ALLOWED_UPLOAD_TYPES)
 * @param entityId - Entity ID (will be sanitized)
 * @param subfolder - Subfolder (must be in ALLOWED_SUBFOLDERS)
 * @param baseDir - Base directory for uploads
 * @returns Validated and resolved upload directory path
 */
export async function buildSecureUploadPath(
  type: string,
  entityId: string,
  subfolder: string,
  baseDir: string = path.join(process.cwd(), 'public', 'uploads')
): Promise<string> {
  // Validate type
  if (!ALLOWED_UPLOAD_TYPES.includes(type as typeof ALLOWED_UPLOAD_TYPES[number])) {
    throw new Error(`Invalid upload type: ${type}. Allowed types: ${ALLOWED_UPLOAD_TYPES.join(', ')}`)
  }

  // Validate subfolder
  if (!ALLOWED_SUBFOLDERS.includes(subfolder as typeof ALLOWED_SUBFOLDERS[number])) {
    throw new Error(`Invalid subfolder: ${subfolder}. Allowed subfolders: ${ALLOWED_SUBFOLDERS.join(', ')}`)
  }

  // Sanitize entityId
  const sanitizedEntityId = sanitizePathComponent(entityId)

  // Build path
  const uploadPath = path.join(baseDir, type, sanitizedEntityId, subfolder)

  // Validate the final path
  return await validateAndResolvePath(uploadPath, baseDir)
}

/**
 * Synchronous version of buildSecureUploadPath
 */
export function buildSecureUploadPathSync(
  type: string,
  entityId: string,
  subfolder: string,
  baseDir: string = path.join(process.cwd(), 'public', 'uploads')
): string {
  if (!ALLOWED_UPLOAD_TYPES.includes(type as typeof ALLOWED_UPLOAD_TYPES[number])) {
    throw new Error(`Invalid upload type: ${type}`)
  }

  if (!ALLOWED_SUBFOLDERS.includes(subfolder as typeof ALLOWED_SUBFOLDERS[number])) {
    throw new Error(`Invalid subfolder: ${subfolder}`)
  }

  const sanitizedEntityId = sanitizePathComponent(entityId)
  const uploadPath = path.join(baseDir, type, sanitizedEntityId, subfolder)

  return validateAndResolvePathSync(uploadPath, baseDir)
}

/**
 * Validates a filename to prevent path traversal and dangerous characters
 * @param filename - Filename to validate
 * @returns Sanitized filename
 */
export function sanitizeFilename(filename: string): string {
  if (!filename || typeof filename !== 'string') {
    throw new Error('Invalid filename: must be a non-empty string')
  }

  // Get just the basename (no directory components)
  const basename = path.basename(filename)

  // Remove dangerous characters
  const sanitized = basename
    .replace(/[\/\\]/g, '') // Remove path separators
    .replace(/\0/g, '') // Remove null bytes
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/^\.+/, '') // Remove leading dots
    .trim()

  if (!sanitized || sanitized.length === 0) {
    throw new Error('Invalid filename: cannot be empty after sanitization')
  }

  if (sanitized.length > 255) {
    throw new Error('Invalid filename: exceeds maximum length')
  }

  // Check for path traversal patterns
  if (sanitized.includes('..')) {
    throw new Error('Invalid filename: contains path traversal pattern')
  }

  return sanitized
}

/**
 * Checks if a file is a symlink (synchronous)
 */
export function isSymlink(filePath: string): boolean {
  try {
    const stats = lstatSync(filePath)
    return stats.isSymbolicLink()
  } catch {
    return false
  }
}

/**
 * Checks if a file is a symlink (async)
 */
export async function isSymlinkAsync(filePath: string): Promise<boolean> {
  try {
    const stats = await lstat(filePath)
    return stats.isSymbolicLink()
  } catch {
    return false
  }
}
