import jwt from 'jsonwebtoken'
import { env } from './env'

const JWT_EXPIRES_IN = '7d' // 7 days

export interface JWTPayload {
  userId: string
  email: string
  username: string
  role: string
  iat?: number
  exp?: number
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  if (!env.JWT_SECRET) {
    throw new Error('JWT_SECRET environment variable is required. Please set it in your .env file.')
  }
  
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JWTPayload | null {
  if (!env.JWT_SECRET) {
    console.error('JWT_SECRET not configured')
    return null
  }
  
  try {
    return jwt.verify(token, env.JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function decodeToken(token: string): JWTPayload | null {
  try {
    return jwt.decode(token) as JWTPayload
  } catch (error) {
    console.error('JWT decode failed:', error)
    return null
  }
} 