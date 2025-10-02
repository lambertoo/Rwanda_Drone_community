"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from "lucide-react"

export default function SettingsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (loading) return

    if (!user) {
      router.push('/login')
      return
    }

    // Redirect based on user role
    switch (user.role) {
      case 'superadmin':
        router.push('/superadmin/settings')
        break
      case 'admin':
        router.push('/admin/settings')
        break
      case 'regulator':
        router.push('/regulator/settings')
        break
      case 'service_provider':
        router.push('/provider/settings')
        break
      case 'pilot':
        router.push('/pilot/settings')
        break
      case 'student':
        router.push('/student/settings')
        break
      default:
        router.push('/profile/edit')
        break
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex items-center gap-2">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span>Redirecting to your settings...</span>
      </div>
    </div>
  )
}
