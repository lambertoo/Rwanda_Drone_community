// Environment variable validation and configuration
export const env = {
  // Database
  DATABASE_URL: process.env.DATABASE_URL,
  
  // JWT
  JWT_SECRET: process.env.JWT_SECRET,
  
  // Node environment
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Security
  SESSION_SECRET: process.env.SESSION_SECRET,
  
  // File upload
  MAX_FILE_SIZE: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  ALLOWED_FILE_TYPES: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
  
  // Rate limiting
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
  RATE_LIMIT_MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5'), // 5 requests default
  
  // CORS
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Cookie settings
  COOKIE_SECURE: process.env.NODE_ENV === 'production',
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || 'strict',
  COOKIE_MAX_AGE: parseInt(process.env.COOKIE_MAX_AGE || '604800'), // 7 days default
} as const

// Validate required environment variables
export function validateEnv() {
  const requiredVars = [
    'DATABASE_URL',
    'JWT_SECRET',
  ]

  const missingVars = requiredVars.filter(varName => !process.env[varName])
  
  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(', ')}\n` +
      'Please check your .env file and ensure all required variables are set.'
    )
  }

  // Validate JWT secret strength
  if (env.JWT_SECRET && env.JWT_SECRET.length < 32) {
    throw new Error(
      'JWT_SECRET must be at least 32 characters long for security.\n' +
      'Please generate a strong random secret.'
    )
  }

  // Validate database URL format
  if (env.DATABASE_URL && !env.DATABASE_URL.startsWith('postgresql://')) {
    console.warn('Warning: DATABASE_URL should start with "postgresql://"')
  }

  console.log('✅ Environment variables validated successfully')
}

// Generate a secure random string for JWT secret
export function generateSecureSecret(length: number = 64): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
  let result = ''
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}

// Check if running in production
export const isProduction = env.NODE_ENV === 'production'
export const isDevelopment = env.NODE_ENV === 'development'
export const isTest = env.NODE_ENV === 'test' 