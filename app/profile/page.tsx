"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get current user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        // Redirect to the user's profile page
        router.push(`/profile/${user.username}`)
      } catch (error) {
        console.error("Error parsing user from localStorage:", error)
        router.push("/login")
      }
    } else {
      // No user found, redirect to login
      router.push("/login")
    }
    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Redirecting to profile...</p>
        </div>
      </div>
    )
  }

  return null
} 