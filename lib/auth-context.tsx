'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { UserRole } from '@prisma/client'

// User interface matching our JWT payload and API response
export interface AuthenticatedUser {
  id: string
  email: string
  username: string
  fullName: string
  role: UserRole | null
  isVerified?: boolean
  isActive?: boolean
  avatar?: string
  organization?: string
  pilotLicense?: string
  experience?: string
  specializations?: any
  certifications?: any
}

// Authentication context interface
interface AuthContextType {
  user: AuthenticatedUser | null
  loading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: any }>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
  isAuthenticated: boolean
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user profile from secure API
  const fetchUserProfile = async () => {
    try {
      console.log('AuthContext - Starting profile fetch...')
      
      // Only run on client side
      if (typeof window === 'undefined') {
        console.log('AuthContext - Running on server side, skipping profile fetch')
        return
      }
      
      // Check if we have cookies first
      const cookies = document.cookie
      console.log('AuthContext - Available cookies:', cookies)
      
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      console.log('AuthContext - Profile response:', { 
        status: response.status, 
        ok: response.ok, 
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('AuthContext - User data received:', data.user)
        setUser(data.user)
        try {
          localStorage.setItem('user', JSON.stringify(data.user))
        } catch (e) {
          console.warn('AuthContext - Failed to persist user to localStorage')
        }
      } else if (response.status === 401) {
        console.log('AuthContext - User not authenticated (401)')
        setUser(null)
        try {
          localStorage.removeItem('user')
        } catch {}
      } else {
        console.error('AuthContext - Failed to fetch user profile:', response.status)
        setUser(null)
        try {
          localStorage.removeItem('user')
        } catch {}
      }
    } catch (error) {
      console.error('AuthContext - Error fetching user profile:', error)
      setUser(null)
      try {
        localStorage.removeItem('user')
      } catch {}
    } finally {
      setLoading(false)
    }
  }

  // Login function
  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include', // Include cookies
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Immediately update state so UI reflects login without refresh
        setUser(data.user)
        try {
          localStorage.setItem('user', JSON.stringify(data.user))
        } catch {}
        // Don't call fetchUserProfile() here to avoid double API call
        // The user data from login response is sufficient
        return { 
          success: true, 
          user: data.user
        }
      } else {
        const errorData = await response.json()
        return { success: false, error: errorData.error || 'Login failed' }
      }
    } catch (error) {
      console.error('Login error:', error)
      return { success: false, error: 'Network error' }
    }
  }

  // Logout function
  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
      try {
        localStorage.removeItem('user')
      } catch {}
    } catch (error) {
      console.error('Logout error:', error)
      // Even if logout fails, clear local state
      setUser(null)
      try {
        localStorage.removeItem('user')
      } catch {}
    }
  }

  // Refresh user function
  const refreshUser = async (): Promise<void> => {
    await fetchUserProfile()
  }

  // Check authentication status on mount
  useEffect(() => {
    // Automatically fetch profile to check if user is already authenticated
    fetchUserProfile()
  }, [])

  // Set up automatic token refresh
  useEffect(() => {
    if (!user) return

    // Refresh token every 10 minutes (before 15-minute expiry)
    const refreshInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
        })
        
        if (response.ok) {
          console.log('Token refreshed successfully')
        } else {
          console.log('Token refresh failed, user needs to login again')
          setUser(null)
        }
      } catch (error) {
        console.error('Token refresh error:', error)
        setUser(null)
      }
    }, 10 * 60 * 1000) // 10 minutes

    return () => clearInterval(refreshInterval)
  }, [user])

  const value: AuthContextType = {
    user,
    loading,
    login,
    logout,
    refreshUser,
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use the auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to check if user has specific role
export function useRole(requiredRole: UserRole): boolean {
  const { user } = useAuth()
  return user?.role === requiredRole
}

// Hook to check if user has admin role
export function useIsAdmin(): boolean {
  const { user } = useAuth()
  return user?.role === 'admin'
}

// Hook to check if user has pilot role
export function useIsPilot(): boolean {
  const { user } = useAuth()
  return user?.role === 'pilot' || user?.role === 'admin'
}

// Hook to check if user has service provider role
export function useIsServiceProvider(): boolean {
  const { user } = useAuth()
  return user?.role === 'service_provider' || user?.role === 'admin'
}

// Hook to check if user has regulator role
export function useIsRegulator(): boolean {
  const { user } = useAuth()
  return user?.role === 'regulator' || user?.role === 'admin'
} 