import jwt from 'jsonwebtoken'
import { NextRequest, NextResponse } from 'next/server'

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
const ACCESS_TOKEN_EXPIRY = '1h' // 1 hour
const REFRESH_TOKEN_EXPIRY = '7d' // 7 days

// Token Types
export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export interface TokenPair {
  accessToken: string
  refreshToken: string
}

// Generate JWT Tokens
export function generateTokens(payload: Omit<JWTPayload, 'iat' | 'exp'>): TokenPair {
  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: ACCESS_TOKEN_EXPIRY,
    issuer: 'rwanda-drone-platform',
    audience: 'rwanda-drone-users'
  })
  
  const refreshToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: REFRESH_TOKEN_EXPIRY,
    issuer: 'rwanda-drone-platform',
    audience: 'rwanda-drone-users'
  })
  
  return { accessToken, refreshToken }
}

// Verify JWT Token
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'rwanda-drone-platform',
      audience: 'rwanda-drone-users'
    }) as JWTPayload
    
    return decoded
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

// Extract token from request headers or cookies
export function extractTokenFromRequest(req: NextRequest): string | null {
  // First try to get from Authorization header
  const authHeader = req.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }
  
  // Then try to get from cookies
  const token = req.cookies.get('accessToken')?.value
  return token || null
}

// Set secure cookies
export function setSecureCookies(response: NextResponse, tokens: TokenPair): NextResponse {
  // Set access token as http-only cookie
  response.cookies.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60, // 1 hour
    path: '/'
  })
  
  // Set refresh token as http-only cookie
  response.cookies.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  })
  
  return response
}

// Clear secure cookies
export function clearSecureCookies(response: NextResponse): NextResponse {
  response.cookies.set('accessToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
  
  response.cookies.set('refreshToken', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/'
  })
  
  return response
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as JWTPayload
    if (!decoded.exp) return true
    
    const currentTime = Math.floor(Date.now() / 1000)
    return decoded.exp < currentTime
  } catch {
    return true
  }
}

// Refresh access token using refresh token
export function refreshAccessToken(refreshToken: string): string | null {
  try {
    const decoded = verifyToken(refreshToken)
    if (!decoded) return null
    
    // Generate new access token
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, email: decoded.email, role: decoded.role },
      JWT_SECRET,
      { 
        expiresIn: ACCESS_TOKEN_EXPIRY,
        issuer: 'rwanda-drone-platform',
        audience: 'rwanda-drone-users'
      }
    )
    
    return newAccessToken
  } catch (error) {
    console.error('Token refresh failed:', error)
    return null
  }
} 