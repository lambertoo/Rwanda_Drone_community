// Simple authentication utilities without JWT
export interface AuthUser {
  id: string
  email: string
  username: string
  fullName: string
  avatar: string
  role: "admin" | "moderator" | "member"
  isVerified: boolean
}

// Simple session management (in production, use proper session storage)
const sessions = new Map<string, AuthUser>()

export function createSession(user: AuthUser): string {
  const sessionId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  sessions.set(sessionId, user)
  return sessionId
}

export function getSession(sessionId: string): AuthUser | null {
  return sessions.get(sessionId) || null
}

export function deleteSession(sessionId: string): void {
  sessions.delete(sessionId)
}

export function validatePassword(password: string): boolean {
  // Simple password validation for demo
  return password.length >= 6
}

export function hashPassword(password: string): string {
  // Simple hash for demo (use proper hashing in production)
  return Buffer.from(password).toString("base64")
}

export function verifyPassword(password: string, hash: string): boolean {
  // Simple verification for demo
  return Buffer.from(password).toString("base64") === hash
}
