"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  User, 
  Mail, 
  MapPin, 
  Globe, 
  Phone, 
  Calendar, 
  Shield, 
  Star, 
  MessageSquare, 
  Briefcase, 
  Calendar as CalendarIcon,
  FileText,
  Users,
  Settings,
  Edit,
  Plus,
  Trash2,
  Eye,
  Heart,
  Share2,
  Bookmark,
  Award,
  Certificate,
  Plane,
  Building2
} from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

function ProfilePage() {
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

// Wrap the entire page with AuthGuard
export default function ProtectedProfilePage() {
  return (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  )
} 